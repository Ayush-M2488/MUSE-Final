import os
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

print("1. Generating synthetic academic training data...")
np.random.seed(42)
n_samples = 2000

# Generate realistic academic student data
attendance = np.random.normal(82, 12, n_samples).clip(0, 100)
cgpa = np.random.normal(7.5, 1.2, n_samples).clip(0, 10)

# IA Marks (out of 30 typically)
ia1 = np.random.normal(24, 4, n_samples).clip(0, 30)
ia2 = np.random.normal(22, 5, n_samples).clip(0, 30)
ia3 = np.random.normal(25, 4, n_samples).clip(0, 30)

# Practical Marks (out of 20 typically)
practical = np.random.normal(16, 3, n_samples).clip(0, 20)

# Introduce correlation: lower CGPA/attendance tends to have lower IA marks
for i in range(n_samples):
    if attendance[i] < 60 or cgpa[i] < 5.0:
        ia1[i] *= np.random.uniform(0.5, 0.8)
        ia2[i] *= np.random.uniform(0.5, 0.8)
        ia3[i] *= np.random.uniform(0.5, 0.8)
        practical[i] *= np.random.uniform(0.6, 0.9)

# Labeling function mimicking strict academic risk assessment
def assign_risk(att, i1, i2, i3, prac, c):
    total_ia = i1 + i2 + i3
    # High Risk: Critical attendance OR failing multiple components OR terrible CGPA
    if att < 65 or total_ia < 35 or prac < 8 or c < 4.0:
        return 2 
    # Medium Risk: Warning attendance OR struggling academically
    elif att < 75 or total_ia < 50 or prac < 12 or c < 6.0:
        return 1
    # Low Risk: Doing fine
    else:
        return 0

labels = [assign_risk(attendance[i], ia1[i], ia2[i], ia3[i], practical[i], cgpa[i]) for i in range(n_samples)]

df = pd.DataFrame({
    'attendance': attendance,
    'ia1': ia1,
    'ia2': ia2,
    'ia3': ia3,
    'practical': practical,
    'cgpa': cgpa,
    'risk_label': labels
})

# Add some noise to labels to make the model generalize instead of memorizing
noise_indices = np.random.choice(n_samples, size=int(n_samples * 0.05), replace=False)
for idx in noise_indices:
    df.loc[idx, 'risk_label'] = np.random.choice([0, 1, 2])

X = df[['attendance', 'ia1', 'ia2', 'ia3', 'practical', 'cgpa']]
y = df['risk_label']

print("2. Splitting dataset into training and testing sets...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("3. Training XGBoost Model...")
clf = xgb.XGBClassifier(
    n_estimators=150, 
    max_depth=5, 
    learning_rate=0.1, 
    objective='multi:softprob',
    random_state=42
)
clf.fit(X_train, y_train)

print("4. Evaluating Model...")
y_pred = clf.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")
print(classification_report(y_test, y_pred, target_names=['Low', 'Medium', 'High']))

print("5. Exporting trained model artifact...")
os.makedirs('ml_service/models', exist_ok=True)

artifact = {
    'model': clf,
    'features': ['attendance', 'ia1', 'ia2', 'ia3', 'practical', 'cgpa'],
    'version': 'v3.0-xgboost-academic'
}

model_path = 'ml_service/models/risk_model_v3.pkl'
joblib.dump(artifact, model_path)
print(f"Success! Model exported to {model_path}")