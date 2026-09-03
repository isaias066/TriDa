import joblib
import pandas as pd

# Cargar modelo
model = joblib.load("models/random_forest_trida.joblib")

# Transacción de prueba
transaccion = pd.DataFrame([{
    "monto": 850000,
    "tipo_transaccion": "transferencia",
    "hora": 3,
    "dia_semana": 2,
    "es_fin_de_semana": 0,
    "es_madrugada": 1,
    "tiempo_de_procesamiento": 8,
    "moneda": "COP",
    "canal": "web"
}])

# Predicción
probabilidad = model.predict_proba(transaccion)[0][1]
prediccion = model.predict(transaccion)[0]

score = round(probabilidad * 100, 1)

print("=" * 50)
print("PREDICCIÓN TRIDA")
print("=" * 50)
print(f"Fraude: {'SI' if prediccion else 'NO'}")
print(f"Score de riesgo: {score}%")

if score < 30:
    nivel = "BAJO"
elif score < 50:
    nivel = "MEDIO"
elif score < 80:
    nivel = "ALTO"
else:
    nivel = "CRÍTICO"

print(f"Nivel de riesgo: {nivel}")
print("=" * 50)

