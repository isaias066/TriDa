from flask import Flask, jsonify, request
from risk_engine import TridaHybridEngine

app = Flask(__name__)
engine = TridaHybridEngine()


@app.get("/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "service": "trida-modulo-ia",
            "modelo_cargado": engine.model is not None,
        }
    )


@app.post("/predict")
@app.post("/api/ia/evaluar-riesgo")
def evaluar_riesgo():
    payload = request.get_json(silent=True) or {}
    resultado = engine.evaluar_transaccion(payload)
    return jsonify(resultado)


@app.post("/api/ia/analizar-enlace")
def analizar_enlace():
    payload = request.get_json(silent=True) or {}
    texto = payload.get("texto") or payload.get("url") or ""
    if not texto.strip():
        return jsonify({"error": "Debes enviar el campo 'texto' o 'url'"}), 400
    return jsonify(engine.analizar_url_o_mensaje(texto))


@app.post("/api/ia/consejos-guias")
def consejos_guias():
    payload = request.get_json(silent=True) or {}
    return jsonify(engine.generar_consejos_y_guias(payload))


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
