# 🏥 Healthcare AI – Diagnosis, Medicine Recommendation, Diet Planner & Daily Routine Generator

A comprehensive healthcare AI application that provides disease prediction, medicine recommendations, personalized diet plans, and daily routine generation using machine learning.

## 🌟 Features

### 🔍 1. Disease Prediction
- **ML Models**: Logistic Regression, Decision Tree, Random Forest
- **Multi-factor Analysis**: Considers symptoms, age, BMI, temperature, and comorbidities
- **Confidence Scores**: Provides probability scores for predictions
- **Risk Assessment**: Calculates overall health risk based on multiple factors

### 💊 2. Medicine Recommendation Engine
- **OTC Medicines**: Over-the-counter recommendations
- **Prescription Drugs**: Prescription medication guidance
- **Natural Remedies**: Alternative treatment options
- **Dosage Guidance**: Symptom-aware timing and age-specific information
- **Contraindications**: Safety warnings and considerations
- **Community Insights**: drugsComTest_raw.csv-powered high-rated medicines
- **When to See Doctor**: Guidance on seeking medical attention

### 🥗 3. Personalized Diet Planning
- **Custom Meal Plans**: Breakfast, lunch, dinner, and time-of-day snacks
- **Foods to Eat**: Recommended foods for the condition
- **Foods to Avoid**: Foods that may worsen symptoms
- **Simple Recipes**: Multiple symptom-aware recipe ideas
- **Multi-day Plans**: Generate plans for 1-7 days

### 📅 4. Daily Routine Generator
- **Wake-up Time**: Personalized wake-up schedule
- **Exercise Recommendations**: Activity suggestions based on condition
- **Hydration Reminders**: Fluid intake guidelines
- **Sleep Plan**: Optimal sleep schedule
- **Medication Timing**: When to take medications with symptom-aware tips
- **Rest Periods**: Scheduled rest breaks
- **Variation Ideas**: Alternative routine suggestions for variety

### 📊 5. Analytics Dashboard
- **BMI Calculator**: Calculate and track BMI
- **Temperature Tracking**: Monitor body temperature trends
- **Symptom Frequency**: Analyze most common symptoms
- **Disease Risk Graph**: Visualize risk scores
- **Trend Analysis**: Track health metrics over time
- **Interactive Visualizations**: Plotly charts and graphs (tabbed to avoid overlap)

## 🛠️ Technology Stack

- **Frontend**: Streamlit
- **Backend**: Python 3.8+
- **ML Libraries**: Scikit-learn
- **Data Handling**: Pandas, NumPy
- **Visualizations**: Plotly, Matplotlib
- **Model Training**: Logistic Regression, Decision Tree, Random Forest

## 📂 Dataset Roles

- **Testing.csv** – Core disease prediction engine (primary training data)
- **Final_Augmented_dataset_Diseases_and_Symptoms.csv** – Supplemental symptoms & severity
- **Symptom-severity.csv** – Symptom weighting for risk scores
- **medical data.csv + drugsComTest_raw.csv** – Medicine mapping, dosage guidance, and categorisation

## 📦 Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd disease_reccomendation
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Prepare Data
Ensure your CSV datasets are in the `data/` folder:
- `Final_Augmented_dataset_Diseases_and_Symptoms.csv`
- `health_dataset.csv`
- `medical data.csv`
- `symbipredict_2022.csv`
- `Symptom-severity.csv`

### Step 4: Train Models
```bash
python train_models.py
```

This will:
- Load and preprocess the datasets
- Train Logistic Regression, Decision Tree, and Random Forest models
- Select the best performing model
- Save the model and preprocessing artifacts to `models/` folder

### Step 5: Run the Application
```bash
streamlit run app.py
```

The application will open in your default web browser at `http://localhost:8501`

## 📁 Project Structure

```
disease_reccomendation/
│
├── app.py                          # Main Streamlit application
├── train_models.py                 # Model training script
├── requirements.txt                # Python dependencies
├── README.md                       # This file
│
├── data/                           # Dataset folder
│   ├── Final_Augmented_dataset_Diseases_and_Symptoms.csv
│   ├── health_dataset.csv
│   ├── medical data.csv
│   ├── symbipredict_2022.csv
│   └── Symptom-severity.csv
│
├── models/                         # Trained models (generated)
│   ├── best_model.pkl
│   ├── label_encoder.pkl
│   └── symptom_list.pkl
│
└── utils/                           # Utility modules
    ├── preprocessing.py            # Data preprocessing
    ├── prediction.py               # Disease prediction
    ├── medicine_recommender.py     # Medicine recommendations
    ├── diet_planner.py             # Diet planning
    ├── routine_generator.py        # Routine generation
    └── analytics.py                # Analytics and visualizations
```

## 🚀 Usage Guide

### 1. Disease Prediction
1. Navigate to **"🔍 Disease Prediction"** page
2. Enter personal information (age, gender, weight, height, temperature)
3. Select symptoms you're experiencing
4. Click **"🔍 Predict Disease"**
5. View predictions with confidence scores and risk analysis

### 2. Medicine Recommendations
1. Navigate to **"💊 Medicine Recommendation"** page
2. Enter disease name (or use predicted disease)
3. Enter age for dosage considerations
4. Click **"💊 Get Medicine Recommendations"**
5. Review OTC, prescription, and natural remedies
6. Check dosage guidelines and contraindications

### 3. Diet Planning
1. Navigate to **"🥗 Diet Planner"** page
2. Enter disease name
3. Select number of days (1-7)
4. Click **"🥗 Generate Diet Plan"**
5. View foods to eat/avoid and daily meal plans
6. Get simple recipe suggestions

### 4. Daily Routine
1. Navigate to **"📅 Daily Routine"** page
2. Enter disease name and health metrics
3. Set preferred wake time
4. Click **"📅 Generate Daily Routine"**
5. View detailed schedule with exercise, medication, and rest periods

### 5. Analytics Dashboard
1. Navigate to **"📊 Analytics Dashboard"** page
2. Use BMI calculator
3. View health metrics overview
4. Analyze trends over time
5. Check symptom frequency
6. Review disease risk analysis

## 🧠 Model Training Details

The application uses three ML algorithms and selects the best one:

1. **Logistic Regression**: Multinomial classifier with probability scores for multi-class disease prediction
2. **Decision Tree**: Tree-based classifier with max depth 20 for learning symptom-to-disease rules
3. **Random Forest**: Ensemble method with 100 trees and max depth 20 for stronger generalization

The model with the highest accuracy is saved and used for predictions.

## 📊 Data Processing

- **Symptom Encoding**: Binary encoding (0/1) for symptom presence
- **Label Encoding**: Disease names encoded for ML models
- **Feature Engineering**: Symptom severity weighting
- **Data Imputation**: Missing values handled appropriately
- **Multi-dataset Integration**: Combines information from multiple CSV files

## ⚠️ Important Disclaimers

1. **Not a Replacement for Medical Care**: This application is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment.

2. **Consult Healthcare Providers**: Always consult with qualified healthcare providers for medical concerns, especially for:
   - Severe symptoms
   - Persistent conditions
   - Medication decisions
   - Emergency situations

3. **Data Accuracy**: Predictions are based on training data and may not cover all medical conditions or edge cases.

4. **Medicine Recommendations**: Dosage and medication recommendations are general guidelines. Always follow your doctor's prescriptions.

## 🔧 Troubleshooting

### Model Not Found Error
If you see "Model not found" error:
1. Run `python train_models.py` to train the models
2. Ensure the `models/` folder contains the trained model files

### Dataset Issues
If datasets are not loading:
1. Check that CSV files are in the `data/` folder
2. Verify file names match exactly
3. Ensure CSV files are not corrupted

### Import Errors
If you encounter import errors:
1. Verify all dependencies are installed: `pip install -r requirements.txt`
2. Check Python version (3.8+ required)

## 📈 Performance

- **Model Accuracy**: Varies by dataset, typically 85-95%+
- **Prediction Speed**: < 1 second for most predictions
- **Supported Diseases**: Depends on training data (hundreds of diseases)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## 📝 License

This project is provided as-is for educational and informational purposes.

## 👨‍💻 Author

Healthcare AI System - Built with Streamlit and Machine Learning

## 📞 Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Remember**: This tool is designed to assist, not replace, professional medical care. Always consult healthcare professionals for medical decisions.

#   H e a l t h C a r e A I _ u p d a t e d  
 