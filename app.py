# app.py
# -----------------------------------------------------------------------
# This turns gradcam.py into a small web server (API) that Person 1/2's
# frontend can call over the network - they send an X-ray image, and
# get back the classification + a heatmap image, without touching Python.
#
# SETUP:
#   pip install flask flask-cors tensorflow numpy pillow matplotlib
#
# RUN:
#   python app.py
#   (it starts a local server at http://localhost:5000)
#
# HOW THE FRONTEND CALLS THIS (example using JavaScript fetch):
#
#   const formData = new FormData();
#   formData.append("xray", fileFromUploadInput);
#   const response = await fetch("http://localhost:5000/classify", {
#     method: "POST",
#     body: formData
#   });
#   const result = await response.json();
#   // result.className -> "Silicosis"
#   // result.confidence -> 94.2
#   // result.heatmapImageBase64 -> can be shown directly in an <img> tag
# -----------------------------------------------------------------------

import base64
import io
import os

import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow import keras

from gradcam import (
    load_and_preprocess_image,
    make_gradcam_heatmap,
    overlay_heatmap_on_image,
)

app = Flask(__name__)
CORS(app)  # allows the frontend (running on a different port) to call this API

MODEL_PATH = "xray_classifier.keras"   # Person 4's actual model filename
IMAGE_SIZE = (300, 300)                # CONFIRMED: EfficientNetB3 real model, 300x300 input
# Confirmed with Person 4: order comes from train_ds.class_names
# (alphabetical folder order), NOT the original 6-class plan:
CLASS_NAMES = ["silicotuberculosis", "tuberculosis", "normal", "silicosis"]  # CONFIRMED order from Person 4's actual folder names (folder_STB, folder_TB, folder_normal, folder_silicosis, sorted alphabetically)

# ---------------------------------------------------------------------
# SERVER-SIDE "IS THIS EVEN AN X-RAY" CHECK - added after Person 1 found
# that the confidence threshold alone doesn't catch non-X-ray uploads
# (confirmed: a completely unrelated colorful photo still got confidently
# classified). This is a Python port of the SAME grayscale check already
# calibrated and tested in document_validation's JS code - real X-rays
# are grayscale (R ≈ G ≈ B), colorful photos aren't.
#
# NOTE: this is a SECOND, independent copy of that check, running here
# server-side - not a replacement for the frontend check. The frontend
# check (document_validation) should still run BEFORE upload, for fast
# user feedback without wasting a network request. This server-side copy
# is a backup safety net for anyone calling this API directly, bypassing
# the frontend entirely - verified against the same real test images
# used to calibrate the original JS threshold.
# ---------------------------------------------------------------------
COLOR_SATURATION_THRESHOLD = 8  # same calibrated value as document_validation's JS code

def compute_color_saturation(image_path):
    img = Image.open(image_path).convert('RGB')
    w = 200
    h = round(Image.open(image_path).height / Image.open(image_path).width * w)
    img_small = img.resize((w, h))
    arr = np.array(img_small).astype(float)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    diff = (np.abs(r - g) + np.abs(g - b) + np.abs(r - b)) / 3
    return float(diff.mean())

# ---------------------------------------------------------------------
# CONFIDENCE THRESHOLD - catches inputs the model has no real basis to
# classify (e.g. a random photo that isn't an X-ray at all), by checking
# whether the model's top prediction is actually confident, rather than
# spread thinly across all 4 classes.
#
# ⚠️ NOT YET CALIBRATED - this is a placeholder value (0.5), not tested
# against Person 4's real model. Her model's overall accuracy is
# currently 64%, which makes this check MORE important (a meaningfully
# error-prone model benefits more from a safety net), but accuracy and
# confidence calibration are different things - a 64%-accurate model can
# still be very confident when it's wrong. This threshold needs to be
# set using real evidence once her actual model file is available:
# feed it a real X-ray (should be confident) and a random non-X-ray
# photo (should NOT be confident), see the real numbers, then set this
# properly - same approach used for every other threshold in this project.
# ---------------------------------------------------------------------
MIN_CONFIDENCE_THRESHOLD = 0.5

print("Loading model, please wait...")
model = keras.models.load_model(MODEL_PATH)
print("Model loaded. Server ready.")


@app.route("/classify", methods=["POST"])
def classify():
    if "xray" not in request.files:
        return jsonify({"error": "No file uploaded under field name 'xray'"}), 400

    uploaded_file = request.files["xray"]
    temp_path = "temp_upload.jpg"
    uploaded_file.save(temp_path)

    try:
        # NEW: reject obviously-not-an-X-ray uploads BEFORE running the
        # AI model at all - saves compute time and avoids a confidently
        # wrong classification on something that was never a chest X-ray.
        saturation_score = compute_color_saturation(temp_path)
        if saturation_score > COLOR_SATURATION_THRESHOLD:
            return jsonify({
                "error": "not_grayscale",
                "message": "This doesn't look like a chest X-ray (too colorful). "
                           "Please check the image and re-upload.",
                "colorSaturationScore": round(saturation_score, 1)
            }), 400

        img_array = load_and_preprocess_image(temp_path, IMAGE_SIZE)
        heatmap, predicted_index, all_scores = make_gradcam_heatmap(img_array, model)

        heatmap_path = "temp_heatmap.jpg"
        overlay_heatmap_on_image(temp_path, heatmap, heatmap_path)

        with open(heatmap_path, "rb") as f:
            heatmap_base64 = base64.b64encode(f.read()).decode("utf-8")

        top_confidence = float(all_scores[predicted_index])
        is_confident = top_confidence >= MIN_CONFIDENCE_THRESHOLD

        result = {
            "className": CLASS_NAMES[predicted_index],
            "confidence": round(top_confidence * 100, 1),
            "allScores": {
                CLASS_NAMES[i]: round(float(score) * 100, 1)
                for i, score in enumerate(all_scores)
            },
            "heatmapImageBase64": f"data:image/jpeg;base64,{heatmap_base64}",
            # NEW: tells the frontend whether this result is trustworthy
            # enough to show as a real classification, or whether it
            # should show an "uncertain, please check the image" message
            # instead. See MIN_CONFIDENCE_THRESHOLD note above - this
            # flag is only as good as that threshold, which isn't
            # calibrated against the real model yet.
            "isConfident": is_confident,
            "warningMessage": None if is_confident else
                "The AI isn't confident this is a clear chest X-ray. "
                "Please check the image and re-upload, or have a doctor "
                "review manually."
        }
        return jsonify(result)

    finally:
        # clean up temp files regardless of success or failure
        if os.path.exists(temp_path):
            os.remove(temp_path)
        if os.path.exists("temp_heatmap.jpg"):
            os.remove("temp_heatmap.jpg")


if __name__ == "__main__":
    app.run(debug=True, port=5000)
