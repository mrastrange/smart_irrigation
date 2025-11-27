import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# 1. Load the Dataset
print("Loading dataset...")
try:
    # Using the specific file you uploaded
    df = pd.read_csv('Smart_Farming_Crop_Yield_2024.csv')
except FileNotFoundError:
    print("Error: Dataset not found. Please ensure 'Smart_Farming_Crop_Yield_2024.csv' is in the same directory.")
    exit()

# 2. Data Preprocessing
print("Preprocessing data...")

# These are the exact column names from your uploaded file
feature_cols = [
    'region', 'crop_type', 'soil_moisture_%', 'soil_pH', 'temperature_C', 
    'rainfall_mm', 'humidity_%', 'sunlight_hours', 'irrigation_type', 
    'fertilizer_type', 'pesticide_usage_ml'
]
target_col = 'yield_kg_per_hectare'

X = df[feature_cols]
y = df[target_col]

# Define which features are categories (text) and which are numbers
categorical_features = ['region', 'crop_type', 'irrigation_type', 'fertilizer_type']
numerical_features = ['soil_moisture_%', 'soil_pH', 'temperature_C', 'rainfall_mm', 'humidity_%', 'sunlight_hours', 'pesticide_usage_ml']

# Create a processor that:
# 1. Scales numbers (so rainfall 1000 doesn't overpower temp 30)
# 2. Encodes categories (turns "Wheat" into numbers the AI understands)
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

# 3. Define the Pipeline
# We use Random Forest because it handles complex agricultural data very well
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

# 4. Split Data (80% for training, 20% for testing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. Train
print("Training the model...")
model.fit(X_train, y_train)

# 6. Evaluate
print("Evaluating model accuracy...")
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Mean Absolute Error: {mae:.2f}")
print(f"R² Score (Accuracy): {r2:.4f}") 

# 7. Save
print("Saving model to 'smart_farm_model.pkl'...")
joblib.dump(model, 'smart_farm_model.pkl')
print("Done! Move this file to your backend folder.")