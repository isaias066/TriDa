from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# Cargar el modelo una sola vez al iniciar la API
model = joblib.load("models/random_forest_trida.joblib")

FEATURES = [
    "monto",
    "tipo_transaccion",
    "hora",
    "dia_semana",
    "es_fin_de_semana",
    "es_madrugada",
    "tiempo_de_procesamiento",
    "moneda",
    "canal"
]


@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "modelo": "random_forest_trida"
    })


@app.post("/predict")
def predict():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "JSON inválido"
        }), 400

    # Verificar campos faltantes
    missing = [feature for feature in FEATURES if feature not in data]

    if missing:
        return jsonify({
            "error": "Faltan campos",
            "campos": missing
        }), 400

    # Crear DataFrame con las variables esperadas por el modelo
    transaccion = pd.DataFrame([
        {feature: data[feature] for feature in FEATURES}
    ])

    # Predicción
    probabilidad = float(
        model.predict_proba(transaccion)[0][1]
    )

    prediccion = int(
        model.predict(transaccion)[0]
    )

    score = round(probabilidad * 100, 1)

    # Nivel de riesgo
    if score < 30:
        nivel = "BAJO"
    elif score < 50:
        nivel = "MEDIO"
    elif score < 80:
        nivel = "ALTO"
    else:
        nivel = "CRÍTICO"

    return jsonify({
        "fraude": bool(prediccion),
        "score_riesgo": score,
        "nivel_riesgo": nivel
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )
    
    