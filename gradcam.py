# gradcam.py
# -----------------------------------------------------------------------
# This generates the "heatmap" - a colored overlay on an X-ray showing
# which regions the AI model focused on to make its classification.
#
# HOW THIS FITS IN: Person 4 trains the main classifier model and saves
# it as a file (e.g. "silicosis_model.h5"). This script LOADS that saved
# model and adds the explainability layer on top - you don't need to
# understand how the model itself was trained, just how to read from it.
#
# SETUP (do this once):
#   pip install tensorflow numpy pillow matplotlib
#
# Ask Person 4 for their saved model file and the exact image size they
# trained on (e.g. 224x224) - you need both to run this correctly.
# -----------------------------------------------------------------------

import numpy as np
import cv2
import tensorflow as tf
from tensorflow import keras
import matplotlib.cm as cm
from PIL import Image


def apply_clahe(image_np):
    """
    Applies CLAHE (Contrast Limited Adaptive Histogram Equalization) to
    enhance lung texture contrast - MUST match Person 4's training
    preprocessing exactly, or the model sees images very differently
    than it was trained on.
    """
    lab = cv2.cvtColor(image_np, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l)
    lab_enhanced = cv2.merge([l_enhanced, a, b])
    return cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2RGB)


def load_and_preprocess_image(img_path, target_size):
    """
    Loads an X-ray image from disk and prepares it EXACTLY the way
    Person 4's model expects. This was a real bug, found and fixed:
    the original version of this function just resized and divided by
    255 - it did NOT apply CLAHE (Person 4's training does), and it DID
    divide by 255 (her training does NOT, since EfficientNet's
    preprocess_input is a no-op in this TensorFlow version - the model
    expects raw 0-255 values). Verified: feeding the same real X-ray
    through the old (wrong) version and this corrected version produced
    different classifications and confidence scores, confirming this
    mismatch was real and meaningful, not a minor detail.

    target_size should match whatever Person 4 trained on. Confirmed
    with her: (300, 300) for the EfficientNetB3 model.
    """
    img = cv2.imread(img_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, target_size)
    img = apply_clahe(img).astype(np.float32)
    array = np.expand_dims(img, axis=0)  # model expects a "batch" of images
    # NOTE: deliberately NOT dividing by 255 here - see docstring above
    return array


def find_last_conv_layer(model):
    """
    Grad-CAM needs to know the name of the LAST convolutional layer
    in the model (this is where the spatial/location information still
    exists, before it gets flattened into a final prediction).
    This function finds it automatically so you don't need to guess.

    IMPORTANT: many real models (including transfer-learning setups like
    Person 4's, which wraps a pretrained backbone as `base_model(inputs,
    training=False)`) have their conv layers NESTED INSIDE a sub-model,
    not sitting directly in the outer model's layer list. This function
    checks the outer model first, then recurses into any nested Model
    layers if nothing was found directly - this is what makes it work
    on Person 4's actual architecture, not just simple flat models.

    Returns a tuple: (layer_name, the_model_that_actually_contains_it)
    - for a flat model, that second value is just `model` itself
    - for a nested model, it's the inner sub-model (e.g. base_model)
    """
    conv_layer_types = (
        keras.layers.Conv2D,
        keras.layers.SeparableConv2D,
        keras.layers.DepthwiseConv2D,
    )

    # Check this model's own direct layers first
    for layer in reversed(model.layers):
        if isinstance(layer, conv_layer_types):
            return layer.name, model

    # Nothing found directly - recurse into any nested Model layers
    # (e.g. a pretrained base_model wrapped inside the outer model)
    for layer in reversed(model.layers):
        if isinstance(layer, keras.Model):
            try:
                return find_last_conv_layer(layer)
            except ValueError:
                continue

    raise ValueError("Could not find a convolutional layer in this model, "
                      "including inside any nested sub-models.")


def _build_head_model(outer_model, nested_layer_name, base_output_shape):
    """
    Helper for the nested-model case. Rebuilds "everything that happens
    AFTER the nested base_model" (e.g. GlobalAveragePooling2D -> Dropout ->
    Dense) as its own small standalone model, so we can run gradients
    through it starting from the base_model's output.

    This assumes a simple, single-path architecture after the nested layer
    (true for Person 4's described model, and for most transfer-learning
    setups) - it will not correctly handle complex branching architectures,
    but that's a reasonable scope limit for this project.
    """
    head_input = keras.Input(shape=base_output_shape[1:])
    x = head_input
    started = False
    for layer in outer_model.layers:
        if layer.name == nested_layer_name:
            started = True
            continue
        if started:
            x = layer(x)
    return keras.Model(head_input, x)


def make_gradcam_heatmap(img_array, model, last_conv_layer_name=None, pred_index=None):
    """
    The core Grad-CAM algorithm. Returns a 2D heatmap (values 0-1)
    showing which pixels mattered most for the model's prediction.

    img_array: preprocessed image (from load_and_preprocess_image)
    model: Person 4's loaded Keras model
    last_conv_layer_name: auto-detected if not provided
    pred_index: which class to explain (defaults to the model's top prediction)

    Handles BOTH flat models (conv layers directly in `model`) AND nested
    models (conv layers inside a wrapped sub-model like `base_model`) -
    the nested case needs a slightly different graph-building approach,
    handled automatically below.
    """
    if last_conv_layer_name is None:
        last_conv_layer_name, containing_model = find_last_conv_layer(model)
    else:
        containing_model = model  # assume flat if a name was given manually

    if containing_model is model:
        # --- Simple case: conv layer is directly in the outer model ---
        grad_model = keras.models.Model(
            inputs=model.inputs,
            outputs=[model.get_layer(last_conv_layer_name).output, model.outputs[0]]
        )
        with tf.GradientTape() as tape:
            conv_output, predictions = grad_model(img_array)
            if pred_index is None:
                pred_index = tf.argmax(predictions[0])
            class_channel = predictions[:, pred_index]
        grads = tape.gradient(class_channel, conv_output)

    else:
        # --- Nested case: conv layer is inside a sub-model (e.g. base_model) ---
        # Find which top-level layer of the outer model IS that sub-model
        nested_layer_name = containing_model.name

        # Stage 1: outer model's input -> [target conv layer output, base_model's own output]
        conv_and_base_output_model = keras.models.Model(
            inputs=containing_model.inputs,
            outputs=[
                containing_model.get_layer(last_conv_layer_name).output,
                containing_model.outputs[0]
            ]
        )

        # Stage 2: rebuild "everything after base_model" as its own model
        base_output_shape = containing_model.outputs[0].shape
        head_model = _build_head_model(model, nested_layer_name, base_output_shape)

        with tf.GradientTape() as tape:
            conv_output, base_output = conv_and_base_output_model(img_array)
            tape.watch(conv_output)
            predictions = head_model(base_output)
            if pred_index is None:
                pred_index = tf.argmax(predictions[0])
            class_channel = predictions[:, pred_index]

        grads = tape.gradient(class_channel, conv_output)

    # This is the key Grad-CAM step: how much does each region of the
    # conv layer's output influence the final class prediction?
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_output = conv_output[0]
    heatmap = conv_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    # Normalize between 0 and 1 for display
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy(), int(pred_index), predictions[0].numpy()


def overlay_heatmap_on_image(img_path, heatmap, output_path, alpha=0.4):
    """
    Takes the raw heatmap (small grid of numbers) and overlays it as a
    red/yellow color layer on top of the ORIGINAL full-size X-ray image,
    then saves the result - this is the actual image you show the doctor.
    """
    img = keras.utils.load_img(img_path)
    img = keras.utils.img_to_array(img)

    heatmap = np.uint8(255 * heatmap)

    # "jet" colormap: blue = low attention, red = high attention
    # Using matplotlib.colormaps[] instead of the older cm.get_cmap() -
    # get_cmap() was deprecated in Matplotlib 3.7 and fully removed in 3.11.
    import matplotlib
    jet = matplotlib.colormaps["jet"]
    jet_colors = jet(np.arange(256))[:, :3]
    jet_heatmap = jet_colors[heatmap]

    jet_heatmap = keras.utils.array_to_img(jet_heatmap)
    jet_heatmap = jet_heatmap.resize((img.shape[1], img.shape[0]))
    jet_heatmap = keras.utils.img_to_array(jet_heatmap)

    overlaid = jet_heatmap * alpha + img
    overlaid = keras.utils.array_to_img(overlaid)
    overlaid.save(output_path)
    return output_path


# -----------------------------------------------------------------------
# EXAMPLE USAGE - run this file directly to test on one sample image
# -----------------------------------------------------------------------
if __name__ == "__main__":
    MODEL_PATH = "xray_classifier.keras"   # Person 4's actual model filename
    IMAGE_PATH = "sample_xray.jpg"         # <- any test X-ray image
    IMAGE_SIZE = (300, 300)                # CONFIRMED: EfficientNetB3 real model, 300x300 input
    # Confirmed with Person 4: class_names come from train_ds.class_names,
    # which reads folder names in ALPHABETICAL order - this exact order:
    CLASS_NAMES = ["normal", "silicosis", "silicotuberculosis", "tuberculosis"]

    print("Loading model...")
    model = keras.models.load_model(MODEL_PATH)

    print("Preparing image...")
    img_array = load_and_preprocess_image(IMAGE_PATH, IMAGE_SIZE)

    print("Running Grad-CAM...")
    heatmap, predicted_index, all_scores = make_gradcam_heatmap(img_array, model)

    print(f"Predicted class: {CLASS_NAMES[predicted_index]}")
    print(f"Confidence: {all_scores[predicted_index] * 100:.1f}%")

    output_path = overlay_heatmap_on_image(IMAGE_PATH, heatmap, "heatmap_result.jpg")
    print(f"Heatmap saved to: {output_path}")
