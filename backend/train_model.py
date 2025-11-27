import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

print("Loading dataset...")
try:
    df = pd.read_csv('yield_df.csv') 
except FileNotFoundError:
    print("Error: yield_df.csv not found. Please ensure the file is in the same directory.")
    exit()


print("Preprocessing data...")
if 'Unnamed: 0' in df.columns:
    df = df.drop('Unnamed: 0', axis=1)
X = df.drop(['hg/ha_yield', 'Year'], axis=1)
y = df['hg/ha_yield']

categorical_features = ['Area', 'Item']
numerical_features = ['average_rain_fall_mm_per_year', 'pesticides_tonnes', 'avg_temp']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training the model (this might take a moment)...")
model.fit(X_train, y_train)

print("Evaluating model performance...")
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Mean Absolute Error: {mae:.2f}")
print(f"R² Score (Accuracy): {r2:.4f}") 

print("Saving the model to 'crop_yield_model.pkl'...")
joblib.dump(model, 'crop_yield_model.pkl')
print("Model saved successfully!")

print("\n--- Example Prediction ---")
sample_data = pd.DataFrame({
    'Area': ['India'],
    'Item': ['Potatoes'],
    'average_rain_fall_mm_per_year': [1083],
    'pesticides_tonnes': [50000],
    'avg_temp': [24.5]
})
prediction = model.predict(sample_data)
print(f"Predicted Yield for sample inputs: {prediction[0]:.2f} hg/ha")