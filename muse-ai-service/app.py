import os
import numpy as np
import joblib
import shap
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- LOAD MODEL ARTIFACT ON STARTUP ---
MODEL_PATH = 'ml_service/models/risk_model_v3.pkl'
try:
    artifact = joblib.load(MODEL_PATH)
    loaded_model = artifact['model']
    MODEL_VERSION = artifact['version']
    # Create the SHAP explainer once globally
    explainer = shap.TreeExplainer(loaded_model)
    print(f"[*] Successfully loaded ML Model & SHAP Explainer: {MODEL_VERSION}")
except Exception as e:
    loaded_model = None
    explainer = None
    MODEL_VERSION = 'v1.0-rulebased-fallback'
    print(f"[!] Warning: Could not load .pkl model. Error: {e}. Falling back to rule-based engine.")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    students = data.get('students', [])
    results = []

    for s in students:
        att = float(s.get('attendance', 100))
        ia1_val = s.get('ia1')
        ia1 = float(ia1_val) if (ia1_val is not None and ia1_val != '') else 20.0
        ia2_val = s.get('ia2')
        ia2 = float(ia2_val) if (ia2_val is not None and ia2_val != '') else 20.0
        ia3_val = s.get('ia3')
        ia3 = float(ia3_val) if (ia3_val is not None and ia3_val != '') else 20.0
        prac_val = s.get('practical')
        practical = float(prac_val) if (prac_val is not None and prac_val != '') else 20.0
        cgpa_val = s.get('cgpa')
        cgpa = float(cgpa_val) if (cgpa_val is not None and cgpa_val != '') else 8.0
        
        explanations = []

        if loaded_model is not None and explainer is not None:
            # --- USE LOCAL TRAINED ML MODEL ---
            features = np.array([[att, ia1, ia2, ia3, practical, cgpa]])
            
            probs = loaded_model.predict_proba(features)[0]
            pred_class = loaded_model.predict(features)[0]
            
            risk_map = {0: "Low", 1: "Medium", 2: "High"}
            risk = risk_map[pred_class]
            risk_score = float(probs[pred_class])

            # SHAP EXPLANATION LOGIC
            shap_values = explainer.shap_values(features)
            
            if isinstance(shap_values, list):
                class_shap_values = shap_values[pred_class][0]
            else:
                if len(shap_values.shape) == 3:
                    class_shap_values = shap_values[0, :, pred_class]
                else:
                    class_shap_values = shap_values[0]

            feature_names = ['Attendance', 'IA-1', 'IA-2', 'IA-3', 'Practical', 'SGPA']
            feature_vals = [att, ia1, ia2, ia3, practical, cgpa]
            
            # Map features to their SHAP impacts
            for idx, (f_name, f_val, s_val) in enumerate(zip(feature_names, feature_vals, class_shap_values)):
                if abs(s_val) > 0.001: 
                    impact_text = f"Impacted prediction by {'increasing' if s_val > 0 else 'decreasing'} likelihood."
                    
                    if pred_class > 0: # Medium/High risk
                        if f_name == 'Attendance' and f_val < 75:
                            impact_text = f"Low attendance ({f_val}%) strongly increased risk."
                        elif 'IA' in f_name and f_val < 10:
                            impact_text = f"Poor {f_name} score ({f_val}) contributed to risk."
                        elif s_val > 0:
                            impact_text = f"Metric {f_name} ({f_val}) increased risk profile."
                        else:
                            impact_text = f"Metric {f_name} ({f_val}) slightly mitigated risk."
                    else: # Low risk
                        if f_name == 'Attendance' and f_val >= 85:
                            impact_text = f"High attendance ({f_val}%) secured low risk standing."
                        elif 'IA' in f_name and f_val >= 18:
                            impact_text = f"Strong {f_name} score ({f_val}) ensured low risk."
                        elif s_val > 0:
                            impact_text = f"Metric {f_name} ({f_val}) secured low risk."
                        else:
                            impact_text = f"Metric {f_name} ({f_val}) slightly deviated from ideal."

                    explanations.append({
                        "feature": f_name, 
                        "value": float(f_val), 
                        "shap": float(s_val), 
                        "impact": impact_text
                    })
                    
            # Sort explanations by absolute magnitude of SHAP value to show most important first
            explanations.sort(key=lambda x: abs(x["shap"]), reverse=True)

        else:
            # --- FALLBACK RULE-BASED ENGINE ---
            score = 0.1
            if att < 75:
                score += 0.5
                explanations.append({"feature": "Attendance", "value": att, "shap": 0.5, "impact": "Critical: Attendance below 75%."})
            if (ia1 + ia2) < 25:
                score += 0.3
                explanations.append({"feature": "Marks", "value": (ia1+ia2), "shap": 0.3, "impact": "Critical: Low internal marks."})
            
            if score >= 0.7: risk = "High"
            elif score >= 0.4: risk = "Medium"
            else: 
                risk = "Low"
                explanations.append({"feature": "Overall", "value": 100, "shap": -0.1, "impact": "Student is performing well."})
            risk_score = min(score, 0.99)

        if not explanations:
            explanations.append({"feature": "General", "value": 0, "shap": 0, "impact": "Model identified subtle risk patterns."})

        results.append({
            "usn": s['usn'],
            "risk_level": risk,
            "risk_score": round(risk_score, 3),
            "explanation_text": explanations[0]['impact'], 
            "factors": explanations
        })

    return jsonify({
        "model_version": MODEL_VERSION,
        "predictions": results
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[*] Starting MUSE ML Service on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)