# Healthcare AI

A comprehensive web application that uses Machine Learning (Random Forest Classifier) to predict diseases based on a user's symptoms, providing medical, dietary, and workout recommendations.

## 🚀 Features & Recent Upgrades

1. **🧠 Improved ML Engine & Probabilities**: 
   - Switched to a **Random Forest Classifier** trained on the full ~4900 row dataset for better generalization.
   - Now outputs the **Top 3 Predictions** with percentage confidence scores (`predict_proba()`), mapped perfectly to disease names via a custom dictionary.
   - Dynamically loads all 132 valid symptoms directly from the dataset.

2. **📝 Rich Medical Data & Recommendations**:
   - Expanded the AI response to include descriptive summaries of the disease and how the medications work.
   - Merged and significantly expanded Dietary and Workout plans for a comprehensive treatment overview.

3. **🌙 UI/UX Overhaul & Polish**: 
   - Fully implemented a sleek **Dark Mode** toggle with persistent local storage.
   - Added loading spinners and overlays during API calls, preventing double-submissions.
   - Enforced strict 10-digit validation on phone numbers (Registration/Profile).
   - Perfected modal scrolling and responsive grid layouts for mobile/tablet.

4. **🔍 History Pagination, Search & Export**:
   - The Patient History API (`/history`) now natively supports backend pagination and live text searching (disease/symptoms).
   - Designed a new History Toolbar on the frontend with search inputs and pagination buttons.
   - **PDF & CSV Export:** Export single diagnostic records directly from the browser! The PDF generation is fully handled client-side using `jsPDF` for zero backend load.

## 📂 Project Structure

```
Healthcare_AI/
├── backend/          # FastAPI server, ML logic (logic.py), DB schema
├── frontend/         # Vanilla JS, HTML, CSS (dashboard, login)
├── data/             # Training.csv, Testing.csv, medical data.csv, diet/workout CSVs
├── trained_model.pkl # Pickled RandomForest model + LabelEncoder
└── Healthcare_Model_Training.ipynb # Jupyter notebook for training
```

## 🧠 Confidence Score Logic

The ML model is wrapped in a REST API (`backend/logic.py`). When the user submits a list of symptoms, the backend one-hot encodes them into a feature vector matching the model's expected 132 features.
Instead of calling `model.predict()`, we call `model.predict_proba()`, which outputs an array of probabilities for each of the 41 possible diseases. We sort these probabilities in descending order, grab the top 3 indices, and use the Label Encoder to reverse-map them back to disease names. These probabilities are then converted to percentages and sent to the frontend to render the Confidence Meter.