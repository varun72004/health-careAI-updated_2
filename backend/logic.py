# backend/logic.py
# ---------------------------------------------------------
# Core ML logic module. Maps user symptoms to disease predictions
# and retrieves treatment recommendations from datasets.
# ---------------------------------------------------------

import pandas as pd
import numpy as np
import joblib
from pathlib import Path

# Resolve path to locate datasets and the trained model relative to this file
ROOT_DIR = Path(__file__).resolve().parent.parent

# --- 1. Load Medical Datasets ---
try:
    # Load prescription and routine recommendations
    med_df = pd.read_csv(ROOT_DIR / 'data' / 'medical data.csv')
    routine_df = pd.read_csv(ROOT_DIR / 'data' / 'disease_diet_workout_dataset.csv')
except Exception as e:
    print(f"Error loading datasets: {e}")
    med_df = None
    routine_df = None

# --- 2. Load the Pre-trained ML Model ---
try:
    # Load trained MultinomialNB model, label encoder, and feature list
    model_data = joblib.load(ROOT_DIR / 'trained_model.pkl')
    model = model_data['model']
    le = model_data['label_encoder']
    features_list = model_data['features']
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    le = None
    features_list = []

# --- 3. Frontend Symptom Schema ---
# Curated list of all symptoms available in the model
valid_symptoms = features_list

# Resolves naming inconsistencies between ML output and CSV datasets
DISEASE_MAPPING = {
    "GERD": "GERD (Acid Reflux)",
    "Peptic ulcer diseae": "Peptic Ulcer",
    "Diabetes ": "Type 2 Diabetes",
    "Bronchial Asthma": "Asthma",
    "Hypertension ": "Hypertension",
    "Tuberculosis": "Tuberculosis (Recovery Phase)",
    "Pneumonia": "Bronchial Pneumonia (Recovery)",
    "Heart attack": "Coronary Artery Disease",
    "Varicose veins": "Varicose Veins",
    "Osteoarthristis": "Osteoarthritis",
    "Arthritis": "Rheumatoid Arthritis"
}

# --- 4. Prediction Logic ---
def predict_disease_and_recommend(symptoms_input):
    """Accept a list of symptom strings, return a prediction dict with
    disease name, confidence, medications, diet, and workout."""
    if model is None:
        return {"error": "Model not loaded."}

    # Step A: One-Hot Encode symptoms into a binary array
    input_vector = np.zeros(len(features_list))
    for symptom in symptoms_input:
        if symptom in features_list:
            idx = features_list.index(symptom)
            input_vector[idx] = 1

    # Step B: Run prediction via ML Model
    # Wrap in DataFrame to prevent sklearn feature-name warnings
    input_df = pd.DataFrame([input_vector], columns=features_list)

    # Get probabilities to calculate confidence scores
    probabilities = model.predict_proba(input_df)[0]

    # Get top 3 predictions sorted by descending probability
    top_indices = np.argsort(probabilities)[::-1][:3]
    top_predictions = []

    for i in top_indices:
        pred_encoded = i
        pred_prob = float(probabilities[i])
        predicted_disease = le.inverse_transform([pred_encoded])[0]
        mapped_disease = DISEASE_MAPPING.get(predicted_disease, predicted_disease)
        top_predictions.append({
            "disease": mapped_disease,
            "confidence": round(pred_prob * 100, 2)
        })

    # Top prediction is the first one
    best_prediction = top_predictions[0]
    mapped_disease = best_prediction["disease"]
    confidence = best_prediction["confidence"]

    # Step C: Look up medication using partial string matching
    medicines = "Consult a doctor for appropriate medication."
    disease_desc = "Description not available."
    medicine_desc = "Description not available."
    if med_df is not None:
        match = med_df[med_df['Disease'].astype(str).str.contains(mapped_disease, case=False, na=False, regex=False)]
        if not match.empty:
            medicines = match.iloc[0]['Medicine']
            disease_desc = match.iloc[0].get('Disease_Description', disease_desc)
            medicine_desc = match.iloc[0].get('Medicine_Description', medicine_desc)

    # Step D: Look up diet & workout using exact case-insensitive match
    diet = "Maintain a balanced diet and stay hydrated."
    workout = "Engage in light physical activity as tolerated."
    if routine_df is not None:
        match_routine = routine_df[routine_df['Disease'].str.lower() == mapped_disease.lower()]
        if not match_routine.empty:
            diet = match_routine.iloc[0]['Diet_Recommendation']
            workout = match_routine.iloc[0]['Workout_Recommendation']

    return {
        "predicted_disease": mapped_disease,
        "confidence": confidence,
        "top_predictions": top_predictions,
        "disease_description": disease_desc,
        "medicines": medicines,
        "medicine_description": medicine_desc,
        "diet": diet,
        "workout": workout
    }
