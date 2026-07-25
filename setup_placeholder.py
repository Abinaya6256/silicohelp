# Builds a small model with RANDOM weights (no training, no internet needed) -
# purely to test that the Grad-CAM CODE PIPELINE works correctly end to end.
#
# UPDATED to match Person 4's REAL confirmed architecture pattern: a nested
# "base_model" (standing in for her pretrained backbone) wrapped inside an
# outer model, exactly like her actual code:
#   x = base_model(inputs, training=False)
#   x = GlobalAveragePooling2D()(x)
#   x = Dropout(0.3)(x)
#   outputs = Dense(len(class_names), activation="softmax")(x)
#
# This model's predictions will be meaningless (random weights) - that's
# expected. The goal is proving the NESTED architecture pattern works with
# Grad-CAM, since that's what her real model actually uses.

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# Confirmed with Person 4 - alphabetical folder order:
CLASS_NAMES = ["silicotuberculosis", "tuberculosis", "normal", "silicosis"]  # CONFIRMED order from Person 4's actual folder names (folder_STB, folder_TB, folder_normal, folder_silicosis, sorted alphabetically)
IMAGE_SIZE = (300, 300)

# Stand-in for Person 4's pretrained backbone (e.g. MobileNet/ResNet/etc.)
base_input = keras.Input(shape=(224, 224, 3))
x = layers.Conv2D(16, 3, activation="relu", padding="same", name="base_conv1")(base_input)
x = layers.MaxPooling2D()(x)
x = layers.Conv2D(32, 3, activation="relu", padding="same", name="base_conv2")(x)
x = layers.MaxPooling2D()(x)
base_output = layers.Conv2D(64, 3, activation="relu", padding="same", name="base_last_conv")(x)
base_model = keras.Model(base_input, base_output, name="base_model")

# Outer model - matches Person 4's exact described pattern
inputs = keras.Input(shape=(224, 224, 3))
x = base_model(inputs, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.3)(x)
outputs = layers.Dense(len(CLASS_NAMES), activation="softmax")(x)
model = keras.Model(inputs, outputs)

model.save("placeholder_model.keras")
print("Saved placeholder_model.keras (nested base_model, matches Person 4's real architecture)")
print("Classes (in order):", CLASS_NAMES)
print("Input size:", IMAGE_SIZE)
