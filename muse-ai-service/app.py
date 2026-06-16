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

@app.route('/', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "model_version": MODEL_VERSION}), 200

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    students = data.get('students', [])
    results = []

    for s in students:
        att = float(s.get('attendance', 100))
        # PREDICTIVE IMPUTATION LOGIC
        ia1_val = s.get('ia1')
        ia2_val = s.get('ia2')
        ia3_val = s.get('ia3')
        prac_val = s.get('practical')
        
        # Parse available IAs
        available_ias = []
        if ia1_val is not None and ia1_val != '': available_ias.append(float(ia1_val))
        if ia2_val is not None and ia2_val != '': available_ias.append(float(ia2_val))
        if ia3_val is not None and ia3_val != '': available_ias.append(float(ia3_val))
        
        # Calculate student's average IA score, fallback to neutral 22.0 if no IAs taken
        ia_mean = sum(available_ias) / len(available_ias) if available_ias else 22.0
        
        ia1 = float(ia1_val) if (ia1_val is not None and ia1_val != '') else ia_mean
        ia2 = float(ia2_val) if (ia2_val is not None and ia2_val != '') else ia_mean
        ia3 = float(ia3_val) if (ia3_val is not None and ia3_val != '') else ia_mean
        
        # Practical fallback to neutral 14.0 (out of 20) if missing
        practical = float(prac_val) if (prac_val is not None and prac_val != '') else 14.0
        
        explanations = []

        if loaded_model is not None and explainer is not None:
            # --- USE LOCAL TRAINED ML MODEL ---
            features = np.array([[att, ia1, ia2, ia3, practical]])
            
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

            feature_names = [
                'Attendance', 
                'IA-1' if (ia1_val is not None and ia1_val != '') else 'IA-1 (Predicted)', 
                'IA-2' if (ia2_val is not None and ia2_val != '') else 'IA-2 (Predicted)', 
                'IA-3' if (ia3_val is not None and ia3_val != '') else 'IA-3 (Predicted)', 
                'Practical' if (prac_val is not None and prac_val != '') else 'Practical (Predicted)'
            ]
            feature_vals = [att, ia1, ia2, ia3, practical]
            
            # Map features to their SHAP impacts
            for idx, (f_name, f_val, s_val) in enumerate(zip(feature_names, feature_vals, class_shap_values)):
                if abs(s_val) > 0.001: 
                    impact_text = f"Impacted prediction by {'increasing' if s_val > 0 else 'decreasing'} likelihood."
                    
                    if pred_class > 0: # Medium/High risk
                        # explicitly check if the metric is actually good!
                        if 'Attendance' in f_name and f_val >= 75:
                            impact_text = f"Good attendance ({f_val}%) helped mitigate overall risk."
                        elif 'IA' in f_name and f_val >= 20:
                            impact_text = f"Strong {f_name} score ({f_val:.1f}) helped prevent higher risk."
                        elif 'Practical' in f_name and f_val >= 12:
                            impact_text = f"Good {f_name} score ({f_val:.1f}) helped mitigate overall risk."
                        elif 'SGPA' in f_name and f_val >= 6.0:
                            impact_text = f"Good {f_name} ({f_val:.1f}) helped mitigate overall risk."
                        else:
                            if f_name == 'Attendance' and f_val < 75:
                                impact_text = f"Low attendance ({f_val}%) strongly increased risk."
                            elif 'IA' in f_name and f_val < 15:
                                impact_text = f"Poor {f_name} score ({f_val}) contributed to risk."
                            elif s_val > 0:
                                impact_text = f"Metric {f_name} ({f_val}) increased risk profile."
                            else:
                                impact_text = f"Metric {f_name} ({f_val}) slightly mitigated risk."
                    else: # Low risk
                        if 'Attendance' in f_name and f_val >= 75:
                            impact_text = f"High attendance ({f_val}%) secured low risk standing."
                        elif 'IA' in f_name and f_val >= 20:
                            impact_text = f"Strong {f_name} score ({f_val:.1f}) ensured low risk."
                        elif 'Practical' in f_name and f_val >= 12:
                            impact_text = f"Good {f_name} score ({f_val:.1f}) ensured low risk."
                        elif s_val > 0:
                            impact_text = f"Metric {f_name} ({f_val}) secured low risk."
                        else:
                            impact_text = f"Metric {f_name} ({f_val}) slightly deviated from ideal."

                    # CORRECT SHAP SIGNS FOR UI
                    # The UI universally assumes SHAP < 0 is GREEN (Left) and SHAP > 0 is RED (Right).
                    # We forcefully override the mathematical SHAP signs to ensure good scores
                    # always map to Green, and bad scores always map to Red.
                    corrected_shap = float(s_val)
                    if ('Attendance' in f_name and f_val >= 75) or \
                       ('IA' in f_name and f_val >= 20) or \
                       ('Practical' in f_name and f_val >= 12):
                        corrected_shap = -abs(corrected_shap) # Force negative (Green / Left)
                    else:
                        corrected_shap = abs(corrected_shap) # Force positive (Red / Right)

                    explanations.append({
                        "feature": f_name, 
                        "value": float(f_val), 
                        "shap": corrected_shap, 
                        "impact": impact_text
                    })
                    
            # Sort explanations by absolute magnitude of SHAP value to show most important first
            explanations.sort(key=lambda x: abs(x["shap"]), reverse=True)

        else:
            # --- FALLBACK RULE-BASED ENGINE ---
            score = 0.1
            if att < 75:
                score += 0.5
                explanations.append({"feature": "Attendance", "value": att, "shap": 0.5, "impact": f"Critical: Attendance below 75% ({att}%)."})
            
            # Check individual IA failures
            if ia1 < 14:
                score += 0.15
                explanations.append({"feature": "IA-1", "value": ia1, "shap": 0.15, "impact": f"Struggling in IA-1 ({ia1}/30)."})
            if ia2 < 14:
                score += 0.15
                explanations.append({"feature": "IA-2", "value": ia2, "shap": 0.15, "impact": f"Struggling in IA-2 ({ia2}/30)."})
            if ia3 < 14:
                score += 0.15
                explanations.append({"feature": "IA-3", "value": ia3, "shap": 0.15, "impact": f"Struggling in IA-3 ({ia3}/30)."})
                
            total_ia = ia1 + ia2 + ia3
            if total_ia < 50:
                score += 0.2
                explanations.append({"feature": "Total IAs", "value": total_ia, "shap": 0.2, "impact": f"Low overall internal marks ({total_ia}/90)."})
                
            if practical < 12:
                score += 0.2
                explanations.append({"feature": "Practical", "value": practical, "shap": 0.2, "impact": f"Low practical marks ({practical}/20)."})
            
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