import os
import re
from urllib.parse import urlparse
import joblib
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "random_forest_trida.joblib")


class TridaHybridEngine:
    def __init__(self):
        self.model = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None

    def reload_model(self):
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)

    def _nivel_y_estado(self, score: float):
        # TriDa nunca bloquea automáticamente: clasifica el riesgo y lo deja en revisión para el usuario
        if score >= 95:
            return "CRITICO", "REVISAR"
        if score >= 70:
            return "ALTO", "REVISAR"
        if score >= 30:
            return "MEDIO", "REVISAR"
        return "BAJO", "APROBADA"

    def evaluar_transaccion(self, data: dict) -> dict:
        tipo = str(data.get("tipo_movimiento", "GASTO")).upper()
        if tipo in ("INGRESO", "AHORRO"):
            return {
                "score_riesgo": 0.0,
                "probabilidad_fraude": 0.0,
                "nivel_riesgo": "BAJO",
                "estado_evaluacion": "APROBADA",
                "bloqueo_automatico": False,
                "razones": [],
                "recomendacion_accion": "Movimiento habitual sin señales de riesgo.",
                "motor": "random_forest_hibrido",
            }

        monto = float(data.get("monto", 0))
        ratio = float(data.get("ratio_monto_promedio", 1.0))
        hora = int(data.get("hora", 12))
        es_madrugada = 1 if (0 <= hora < 6) else 0
        es_fin_de_semana = int(data.get("es_fin_de_semana", 0))
        velocidad_kmh = float(data.get("velocidad_kmh", 0.0))
        comercio_nuevo = int(data.get("comercio_nuevo", 0))
        dispositivo_confiable = int(data.get("dispositivo_confiable", 1))
        tx_10_min = int(data.get("tx_ultimos_10_min", 0))
        canal = str(data.get("canal", "web")).lower()

        razones = []
        if ratio >= 5.0:
            razones.append(f"Factor 1 (Monto): supera {ratio:.1f} veces el promedio habitual del usuario")
        elif ratio >= 3.0:
            razones.append(f"Factor 1 (Monto): supera {ratio:.1f} veces el gasto promedio")

        if es_madrugada == 1:
            razones.append(f"Factor 2 (Horario): operación en madrugada ({hora:02d}:00 h)")

        if velocidad_kmh > 800:
            razones.append(f"Factor 3 (Ubicación): desplazamiento imposible ({round(velocidad_kmh)} km/h)")
        elif velocidad_kmh > 200:
            razones.append(f"Factor 3 (Ubicación): cambio de ciudad inusualmente rápido ({round(velocidad_kmh)} km/h)")

        if comercio_nuevo == 1 and monto >= 250000:
            razones.append("Factor 4 (Comercio): establecimiento o destino nuevo para monto elevado")

        if dispositivo_confiable == 0:
            razones.append("Factor 5 (Dispositivo): equipo nuevo o marcado como no confiable")

        if tx_10_min >= 2:
            razones.append(f"Factor 6 (Velocidad): ráfaga de {tx_10_min + 1} movimientos en menos de 10 minutos")

        if canal in ("webhook", "web", "transferencia") and monto >= 600000 and es_madrugada == 1:
            razones.append(f"Factor 7 (Canal): transferencia/pago remoto de alto valor por canal {canal}")

        rf_score = 0.0
        prob = 0.0
        if self.model is not None:
            row = pd.DataFrame(
                [
                    {
                        "monto": monto,
                        "ratio_monto_promedio": ratio,
                        "hora": hora,
                        "es_madrugada": es_madrugada,
                        "es_fin_de_semana": es_fin_de_semana,
                        "velocidad_kmh": velocidad_kmh,
                        "comercio_nuevo": comercio_nuevo,
                        "dispositivo_confiable": dispositivo_confiable,
                        "tx_ultimos_10_min": tx_10_min,
                        "tipo_movimiento": tipo,
                        "canal": canal,
                    }
                ]
            )
            prob = float(self.model.predict_proba(row)[0][1])
            rf_score = round(prob * 100, 2)

        guardrail = 0.0
        if velocidad_kmh > 800:
            guardrail = max(guardrail, 96.0)
        elif velocidad_kmh > 200:
            guardrail = max(guardrail, 72.0)
        if tx_10_min >= 2:
            guardrail = max(guardrail, 70.0)
        if dispositivo_confiable == 0 and ratio >= 4.0:
            guardrail = max(guardrail, 82.0)

        score_final = round(min(max(rf_score, guardrail), 100.0), 2)
        nivel, estado = self._nivel_y_estado(score_final)

        if score_final >= 30 and not razones:
            razones.append(
                f"Patrón multidimensional atípico detectado por Random Forest (probabilidad {prob * 100:.1f}%)"
            )

        if nivel in ("ALTO", "CRITICO"):
            recomendacion = (
                "TriDa no bloquea tu cuenta automáticamente. Si no reconoces este movimiento, "
                "congela tu tarjeta desde la app de tu banco de inmediato y márcalo como 'No fui yo'."
            )
        elif nivel == "MEDIO":
            recomendacion = "Movimiento en observación: confirma si fuiste tú para actualizar tu patrón habitual."
        else:
            recomendacion = "Movimiento coherente con tu comportamiento habitual."

        return {
            "score_riesgo": score_final,
            "probabilidad_fraude": round(prob, 4),
            "nivel_riesgo": nivel,
            "estado_evaluacion": estado,
            "bloqueo_automatico": False,
            "razones": razones,
            "recomendacion_accion": recomendacion,
            "motor": "random_forest_hibrido",
        }

    def analizar_url_o_mensaje(self, texto: str) -> dict:
        contenido = (texto or "").strip().lower()
        score = 0
        hallazgos = []

        urls = re.findall(r"https?://[^\s]+", contenido)
        for u in urls:
            parsed = urlparse(u)
            host = parsed.netloc
            if parsed.scheme == "http":
                score += 25
                hallazgos.append("El enlace usa HTTP sin cifrado TLS")
            if re.match(r"^\d{1,3}(\.\d{1,3}){3}", host):
                score += 45
                hallazgos.append("El enlace apunta directamente a una dirección IP en lugar de un dominio oficial")
            if any(tld in host for tld in [".xyz", ".top", ".click", ".tk", ".ml", ".buzz", ".icu"]):
                score += 30
                hallazgos.append("Dominio de alto riesgo frecuentemente usado en campañas de phishing")
            if any(short in host for short in ["bit.ly", "tinyurl", "cutt.ly", "t.co", "rb.gy"]):
                score += 20
                hallazgos.append("Enlace acortado que oculta el destino real")

        entidades = ["bancolombia", "nequi", "daviplata", "davivienda", "bbva", "dian", "4-72", "servientrega"]
        dominios_oficiales = [
            "bancolombia.com",
            "nequi.com.co",
            "daviplata.com",
            "davivienda.com",
            "bbva.com.co",
            "dian.gov.co",
        ]
        menciona_entidad = any(e in contenido for e in entidades)
        es_dominio_legitimo = any(
            any(urlparse(u).netloc.endswith(dom) for dom in dominios_oficiales) for u in urls
        )
        if menciona_entidad and urls and not es_dominio_legitimo:
            score += 45
            hallazgos.append("Posible suplantación de identidad (menciona entidad colombiana pero el dominio no es oficial)")

        palabras_urgencia = [
            "cuenta bloqueada",
            "suspendida",
            "actualice sus datos",
            "premio",
            "bono",
            "último aviso",
            "clave dinámica",
            "código otp",
            "multa pendiente",
        ]
        for palabra in palabras_urgencia:
            if palabra in contenido:
                score += 18
                hallazgos.append(f"Lenguaje de ingeniería social / urgencia detectado: '{palabra}'")

        montos_detectados = re.findall(r"\$?\s?\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?", texto or "")

        score_final = min(score, 100)
        nivel, _ = self._nivel_y_estado(score_final)

        guia = [
            "No hagas clic en enlaces recibidos por SMS, WhatsApp o correos inesperados.",
            "Nunca compartas tu clave dinámica, PIN ni códigos OTP enviados a tu celular.",
            "Ingresa siempre escribiendo manualmente la dirección oficial de tu banco en el navegador o usando su app verificada.",
        ]
        if score_final >= 70:
            guia.insert(
                0,
                "ALERTA DE ESTAFA: Si ya ingresaste datos en este enlace, comunícate con tu banco o bloquea tus productos desde su app oficial de inmediato.",
            )

        return {
            "score_riesgo": score_final,
            "nivel_riesgo": nivel,
            "es_sospechoso": score_final >= 30,
            "bloqueo_automatico": False,
            "montos_detectados": montos_detectados,
            "urls_detectadas": urls,
            "hallazgos": hallazgos or ["No se detectaron indicadores maliciosos evidentes en el mensaje/enlace"],
            "guia_proteccion": guia,
        }

    def generar_consejos_y_guias(self, payload: dict) -> dict:
        resumen = payload.get("resumen", {})
        top_categorias = payload.get("top_categorias", [])
        metas = payload.get("metas_ahorro", [])
        presupuestos = payload.get("presupuestos", [])

        ingresos = float(resumen.get("ingresos", 0))
        gastos = float(resumen.get("gastos", 0))
        ahorros = float(resumen.get("ahorros", 0))
        tasa_ahorro = float(resumen.get("tasa_ahorro", 0))
        score_prom = float(resumen.get("score_riesgo_promedio", 0))
        alertas_criticas = int(resumen.get("alertas_criticas", 0))
        total_alertas = int(resumen.get("total_alertas", 0))

        consejos_finanzas = []
        guias_seguridad = []

        if ingresos > 0 and gastos > ingresos:
            deficit = gastos - ingresos
            consejos_finanzas.append(
                f"Tus gastos superan tus ingresos por ${deficit:,.0f} COP. Recorta gastos hormiga o no esenciales esta semana para volver a saldo positivo."
            )
        elif ingresos > 0 and tasa_ahorro < 10:
            sugerido = max(round(ingresos * 0.12, -3), 50000)
            consejos_finanzas.append(
                f"Tu tasa de ahorro actual es del {tasa_ahorro:.1f}%. Automatizar un ahorro quincenal de ${sugerido:,.0f} COP te llevaría por encima del 12% recomendado."
            )
        elif tasa_ahorro >= 20:
            consejos_finanzas.append(
                f"Excelente salud financiera: estás ahorrando el {tasa_ahorro:.1f}% de tus ingresos (${ahorros:,.0f} COP)."
            )

        if top_categorias:
            cat_top = top_categorias[0]
            consejos_finanzas.append(
                f"Tu mayor fuga de dinero está en '{cat_top.get('nombre')}' (${float(cat_top.get('total', 0)):,.0f} COP). Reducirla un 15% liberaría flujo directo para tus metas."
            )

        for p in presupuestos:
            limite = float(p.get("limite_mensual", 0))
            gastado = float(p.get("gastado", 0))
            if limite > 0 and gastado >= limite * 0.85:
                pct = (gastado / limite) * 100
                consejos_finanzas.append(
                    f"Presupuesto de '{p.get('categoria')}' al {pct:.0f}% (${gastado:,.0f} de ${limite:,.0f} COP): modera compras en esta categoría lo que resta del mes."
                )

        for m in metas:
            if m.get("estado") == "ACTIVA":
                obj = float(m.get("monto_objetivo", 0))
                act = float(m.get("monto_actual", 0))
                faltante = max(obj - act, 0)
                if faltante > 0:
                    consejos_finanzas.append(
                        f"Meta '{m.get('nombre')}': te faltan ${faltante:,.0f} COP. Con 4 aportes quincenales de ${faltante / 4:,.0f} COP cubrirías el objetivo."
                    )
                    break

        if not consejos_finanzas:
            consejos_finanzas.append(
                "Tus movimientos se mantienen estables. Registra tus gastos diarios para que la IA detecte oportunidades de ahorro."
            )

        if alertas_criticas > 0 or score_prom >= 70:
            nivel_estafa = "ALTO"
            resumen_estafa = (
                f"Riesgo elevado: tienes {alertas_criticas} alerta(s) crítica(s) y un score promedio de {score_prom:.1f}/100. "
                "Recuerda que TriDa solo monitorea y alerta; si no reconoces algún cargo, bloquéalo directamente en tu banco."
            )
            guias_seguridad.extend(
                [
                    "Guía 1 — Acción en tu banco: Si ves un movimiento que no hiciste, congela tu tarjeta desde la app de tu entidad financiera y márcalo en TriDa como 'No fui yo'.",
                    "Guía 2 — Higiene de dispositivos: Revisa la sección Dispositivos y elimina equipos antiguos o sesiones abiertas en navegadores desconocidos.",
                    "Guía 3 — Protección de credenciales: Activa autenticación en dos pasos (2FA) en tu correo y billeteras digitales, y nunca uses la misma clave en varios bancos.",
                ]
            )
        elif total_alertas > 0 or score_prom >= 30:
            nivel_estafa = "MODERADO"
            resumen_estafa = (
                f"Vigilancia preventiva: se registraron {total_alertas} alerta(s) de revisión con un score promedio de {score_prom:.1f}/100."
            )
            guias_seguridad.extend(
                [
                    "Guía 1 — Confirmación de gastos: Valida los movimientos pendientes desde tu correo oficial de TriDa antes de que afecten tus reportes.",
                    "Guía 2 — Prevención de phishing: Usa el escáner de mensajes de TriDa antes de abrir enlaces sobre premios, bloqueos bancarios o paquetes.",
                ]
            )
        else:
            nivel_estafa = "BAJO"
            resumen_estafa = (
                f"Entorno seguro: sin alertas activas relevantes y score de anomalía bajo ({score_prom:.1f}/100). Tus transacciones coinciden con tus horarios y comercios habituales."
            )
            guias_seguridad.extend(
                [
                    "Guía preventiva: Mantén tus dispositivos de confianza actualizados y activa el reenvío de notificaciones bancarias para análisis continuo.",
                    "Buenas prácticas: Evita realizar transferencias bancarias conectado a redes Wi-Fi públicas sin VPN.",
                ]
            )

        return {
            "reporte_riesgo_estafa": {
                "nivel": nivel_estafa,
                "score_promedio": round(score_prom, 2),
                "total_alertas": total_alertas,
                "alertas_criticas": alertas_criticas,
                "bloqueo_automatico": False,
                "diagnostico": resumen_estafa,
            },
            "consejos_finanzas": consejos_finanzas,
            "guias_seguridad": guias_seguridad,
        }
