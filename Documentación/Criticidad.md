# Fórmula de Criticidad de TriDa

## Fórmula general

```
        7
Score = Σ (Wᵢ × Fᵢ) × 100
       i=1
```

## Fórmula completa

```
Score_Riesgo = (W₁ × F_Monto) + (W₂ × F_Dispositivo) + (W₃ × F_Ubicación)
             + (W₄ × F_Velocidad) + (W₅ × F_Horario) + (W₆ × F_Comportamiento)
             + (W₇ × F_País)
```

## Los 7 factores de TriDa

| Factor | Nombre | Variable |
|---|---|---|
| 1 | Desviación del Monto | `F_Monto` |
| 2 | Dispositivo Desconocido | `F_Dispositivo` |
| 3 | Ubicación Inusual | `F_Ubicación` |
| 4 | Velocidad Transaccional | `F_Velocidad` |
| 5 | Horario Inusual | `F_Horario` |
| 6 | Desviación del Comportamiento | `F_Comportamiento` |
| 7 | País de Alto Riesgo | `F_País` |

Cada factor tiene un valor entre 0.0 y 1.0 que representa un porcentaje de 0 a 100%.

**¿Cómo lo califica?**

- 🟢 **0.0 = 0%**: Nada sospechoso (completamente normal).
- 🟡 **0.3 = 30%**: Un poco sospechoso (merece atención).
- 🟠 **0.7 = 70%**: Muy sospechoso (alerta seria).
- 🔴 **1.0 = 100%**: Extremadamente sospechoso (máxima alerta).

---

## 1. El Monto

**¿Qué analiza?**
- Monto de la transacción.
- Promedio histórico del cliente.
- Cuánto varía normalmente.

**Pregunta clave que el sistema hará:** "¿Este monto es normal para este cliente?"

**Fórmula:**

```
F_Monto = min(1, |Monto_Actual - Monto_Promedio| / Desviación_Estándar)
```

Donde:
- `Monto_Actual` = Monto de esta transacción.
- `Monto_Promedio` = Promedio histórico del cliente.
- `Desviación_Estándar` = Variabilidad normal del cliente.

---

## 2. Dispositivo Desconocido

**¿Qué analiza?**
- Si el dispositivo usado es conocido/confiable o completamente nuevo.
- Identificador único del dispositivo.
- Lista de dispositivos conocidos del cliente.
- ¿Es confiable? (ha sido usado antes).

**Pregunta clave que el sistema hará:** "¿Reconozco este dispositivo?"

**Fórmula:**

```
F_Dispositivo = {
  0.0  si dispositivo_conocido = TRUE  y es_confiable = TRUE
  0.3  si dispositivo_conocido = TRUE  y es_confiable = FALSE
  0.7  si dispositivo_conocido = FALSE y edad < 7 días
  1.0  si dispositivo_conocido = FALSE y edad = 0 (nunca visto)
}
```

**Traducido:**
- `0.0` → Es su celular de siempre.
- `0.3` → Es un dispositivo conocido pero no tan usado.
- `0.7` → Es nuevo (menos de 7 días de uso).
- `1.0` → Nunca ha sido visto antes.

**Ejemplo:** María tiene un iPhone 13 que fue usado 234 veces → 0.0 puntos. Un atacante con un Samsung Galaxy S24 (nunca visto) → 1.0 puntos.

---

## 3. Ubicación Inusual

**¿Qué analiza?**
- Qué tan lejos está la transacción de las ubicaciones habituales del cliente.
- Ubicación actual.
- Ubicación habitual.
- Distancia entre ambas.

**Pregunta clave que el sistema hará:** "¿Está muy lejos de donde normalmente opera?"

**Fórmula:**

```
F_Ubicación = min(1, Distancia_km / 1000)
```

(Puntaje = Distancia en km ÷ 1,000)

Donde:
- `Distancia_km` = Distancia desde la ubicación habitual del cliente.
- Se normaliza dividiendo entre 1000 km.

**Ejemplo:** 9,247 km ÷ 1,000 = 9.2 → se toma como 1.0 puntos (terriblemente lejos).

---

## 4. Velocidad Transaccional

**¿Qué analiza?**
- Si es físicamente posible que el cliente esté en esa ubicación basándose en su última transacción.
- Última transacción.
- Transacción actual.
- Distancia.

**Pregunta clave que el sistema hará:** "¿Podría haber llegado hasta allá en ese tiempo?"

**Fórmula:**

```
Velocidad_Requerida = Distancia_km / Tiempo_Transcurrido_horas

F_Velocidad = {
  0.0  si Velocidad_Requerida ≤ 100 km/h (es posible en carro/avión)
  0.5  si 100 < Velocidad_Requerida ≤ 500 km/h (requiere vuelo)
  1.0  si Velocidad_Requerida > 500 km/h (físicamente imposible)
}
```

**Ejemplo:** 9,247 km ÷ 2 horas = 4,623 km/h → 1.0 puntos (es imposible).

---

## 5. Horario Inusual

**¿Qué analiza?**
- Si la hora de la transacción es típica o atípica para el cliente.
- Hora de la transacción.
- Horario habitual del cliente.
- Historial de horarios.

**Pregunta clave que el sistema hará:** "¿El cliente hace transacciones a esta hora?"

**Fórmula:**

```
F_Horario = {
  0.0  si la hora está en el rango habitual del cliente
  0.3  si la hora está fuera de rango pero es razonable (6 AM - 11 PM)
  0.7  si la hora es madrugada (11 PM - 6 AM) pero el cliente ocasionalmente opera ahí
  1.0  si la hora es madrugada Y el cliente nunca opera a esa hora
}
```

---

## 6. Desviación del Comportamiento

**¿Qué analiza?**
- Cuántos factores anómalos tiene esta transacción comparada con el perfil del cliente.
- ¿Monto fuera de lo normal?
- ¿Tipo de transacción inusual?
- ¿Cuenta destino desconocida?
- ¿Muchas transacciones en poco tiempo?

**Pregunta clave que el sistema hará:** "¿Cuántas banderas rojas hay?"

**Fórmula:**

Contador de anomalías (máximo 4):
- Si hay un monto extraño = +1
- Si es del tipo inusual = +1
- Si el destino es desconocido = +1
- Si la frecuencia es rara = +1

```
Puntaje = Anomalías ÷ 4
```

**Ejemplos:**
- 0 anomalías ÷ 4 = 0.0 puntos.
- 4 anomalías ÷ 4 = 1.0 puntos.

---

## 7. País de Alto Riesgo

**¿Qué analiza?**
- Si la transacción viene de un país con alta incidencia de fraude cibernético.
- País de origen de la transacción.
- Lista de países de alto riesgo.

**Pregunta clave que el sistema hará:** "¿Este país es conocido por fraudes?"

**Fórmula:**

```
F_País = {
  0.0  si país = país habitual del cliente
  0.2  si país vecino
  0.5  si país lejano pero de bajo riesgo
  0.8  si país está en lista de alerta (ej. China, Rusia, etc.)
  1.0  si país es de muy alto riesgo (ej. Nigeria)
}
```

- `0.0`: Su país habitual.
- `0.2`: País vecino.
- `0.5`: País lejano seguro.
- `0.8`: País en alerta (China, Rusia, etc.).
- `1.0`: País de muy alto riesgo (Nigeria).

---

## ¿Cómo se combinan los 7 factores?

Los pesos determinan qué tan importante es cada factor. Deben sumar 1.0 (100%) haciendo uso de la fórmula general:

```
        7
Score = Σ (Wᵢ × Fᵢ) × 100
       i=1
```

### Cómo se clasifica el peso

| Peso | Factor | Valor | Importancia |
|---|---|---|---|
| W₁ | Monto | 0.25 → 25% | Importantísimo |
| W₂ | Dispositivo | 0.20 → 20% | Crítico para seguridad |
| W₃ | Ubicación | 0.18 → 18% | Indicador fuerte |
| W₄ | Velocidad | 0.15 → 15% | Detecta imposibilidades físicas |
| W₅ | Horario | 0.10 → 10% | Moderadamente importante |
| W₆ | Comportamiento | 0.07 → 7% | Detección de discrepancias |
| W₇ | País | 0.05 → 5% | Factor de contexto |
| **Total** | | **1.00 = 100%** | |

---

## Ejemplo aplicado

1. `F_Monto` = \|65,000 - 55,000\| / 18,000 = **0.56**
2. `F_Dispositivo` = **0.0** (dispositivo conocido y confiable)
3. `F_Ubicación` = 3.2 / 1000 = 0.0032 ≈ **0.0**
4. Velocidad = 3.2 km / 4 h = 0.8 km/h → `F_Velocidad` = **0.0** (totalmente posible)
5. `F_Horario` = **0.0** (dentro de su rango habitual)
6. `F_Comportamiento` = 0 / 4 = **0.0** (sin anomalías)
7. `F_País` = **0.0** (Colombia, su país habitual)

**¡Aplicamos la fórmula!**

```
Score_Riesgo = (0.25 × 0.56) + (0.20 × 0.0) + (0.18 × 0.0) + (0.15 × 0.0)
             + (0.10 × 0.0) + (0.07 × 0.0) + (0.05 × 0.0)

Score_Riesgo = 0.14 + 0 + 0 + 0 + 0 + 0 + 0 = 0.14

Score_Riesgo = 0.14 × 100 = 14%
```

---

## Tabla de decisiones

| Score de riesgo | Clasificación | Acción automática |
|---|---|---|
| 0-29% | Bajo riesgo | Aprobar automáticamente, sin problemas |
| 30-49% | Riesgo medio bajo | Generar alerta baja + aprobar |
| 50-79% | Riesgo medio | Generar alerta media + aprobar + notificar al analista |
| 80-94% | Riesgo alto | Generar alerta alta + aprobar + revisión urgente |
| 95-100% | Riesgo crítico | Bloquear y entrar en pánico + alerta máxima + notificar al cliente |
