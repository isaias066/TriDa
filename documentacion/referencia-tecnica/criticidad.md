# Fórmula de Criticidad — TriDa

<!--
  ¿Qué? Documento que describe el sistema de scoring de riesgo de fraude de TriDa.
  ¿Para qué? Definir la lógica exacta con la que el sistema calcula el score
  de riesgo de cada transacción a partir de 7 factores ponderados.
  ¿Impacto? Este documento es la base del módulo de detección: sin entender
  la fórmula no es posible implementar, validar ni ajustar el motor de scoring.
-->

Sistema de scoring de riesgo de fraude basado en 7 factores ponderados.

---

## 1. Fórmula General

```
        7
Score = Σ (Wᵢ × Fᵢ) × 100
       i=1
```

Se suma el producto de cada **peso (Wᵢ)** por su **factor (Fᵢ)**
correspondiente para los 7 factores, y el resultado se multiplica
por 100 para expresarlo como porcentaje.

### Forma expandida

```
Score_Riesgo = (W₁ × F_Monto) + (W₂ × F_Dispositivo) + (W₃ × F_Ubicación)
             + (W₄ × F_Velocidad) + (W₅ × F_Horario) + (W₆ × F_Comportamiento)
             + (W₇ × F_País)
```

---

## 2. Los 7 Factores

| # | Factor | Variable |
|---|--------|----------|
| 1 | Desviación del Monto | `F_Monto` |
| 2 | Dispositivo Desconocido | `F_Dispositivo` |
| 3 | Ubicación Inusual | `F_Ubicación` |
| 4 | Velocidad Transaccional | `F_Velocidad` |
| 5 | Horario Inusual | `F_Horario` |
| 6 | Desviación del Comportamiento | `F_Comportamiento` |
| 7 | País de Alto Riesgo | `F_País` |

Cada factor toma un valor entre **0.0 y 1.0** (0 % a 100 % de sospecha):

| Valor | % | Nivel |
|-------|---|-------|
| 0.0 | 0 % | 🟢 Nada sospechoso (completamente normal) |
| 0.3 | 30 % | 🟡 Un poco sospechoso (merece atención) |
| 0.7 | 70 % | 🟠 Muy sospechoso (alerta seria) |
| 1.0 | 100 % | 🔴 Extremadamente sospechoso (máxima alerta) |

---

## 3. Detalle de Cada Factor

### Factor 1 — Desviación del Monto (`F_Monto`)

**Qué analiza:** el monto de la transacción vs. el promedio histórico
del cliente y cuánto varía normalmente.

**Pregunta clave:** *¿Este monto es normal para este cliente?*

**Fórmula:**
```
F_Monto = min(1, |Monto_Actual - Monto_Promedio| / Desviación_Estándar)
```

| Variable | Descripción |
|----------|-------------|
| `Monto_Actual` | Monto de esta transacción |
| `Monto_Promedio` | Promedio histórico del cliente |
| `Desviación_Estándar` | Variabilidad normal del cliente |

---

### Factor 2 — Dispositivo Desconocido (`F_Dispositivo`)

**Qué analiza:** si el dispositivo usado es conocido o completamente
nuevo (identificador único, lista de dispositivos conocidos del cliente,
si ha sido usado antes).

**Pregunta clave:** *¿Reconozco este dispositivo?*

**Fórmula:**
```
F_Dispositivo =
    0.0  si dispositivo_conocido = TRUE  y es_confiable = TRUE
    0.3  si dispositivo_conocido = TRUE  y es_confiable = FALSE
    0.7  si dispositivo_conocido = FALSE y edad < 7 días
    1.0  si dispositivo_conocido = FALSE y edad = 0 (nunca visto)
```

| Valor | Interpretación |
|-------|---------------|
| 0.0 | Es su dispositivo de siempre |
| 0.3 | Es un dispositivo conocido pero no tan usado |
| 0.7 | Es nuevo (menos de 7 días de uso) |
| 1.0 | Nunca ha sido visto antes |

**Ejemplos:**
- María tiene un iPhone 13 usado 234 veces → `0.0` puntos
- Atacante con Samsung Galaxy S24 nunca visto → `1.0` puntos

---

### Factor 3 — Ubicación Inusual (`F_Ubicación`)

**Qué analiza:** qué tan lejos está la transacción de las ubicaciones
habituales del cliente (ubicación actual, ubicación habitual, distancia
entre ambas).

**Pregunta clave:** *¿Está muy lejos de donde normalmente opera?*

**Fórmula:**
```
F_Ubicación = min(1, Distancia_km / 1000)
```

Donde `Distancia_km` es la distancia desde la ubicación habitual del
cliente, normalizada dividiendo entre 1000 km.

**Ejemplo:** 9 247 km ÷ 1 000 = 9.2 → se capa en `1.0` puntos.

---

### Factor 4 — Velocidad Transaccional (`F_Velocidad`)

**Qué analiza:** si es físicamente posible que el cliente esté en esa
ubicación basándose en su última transacción (última transacción,
transacción actual, distancia).

**Pregunta clave:** *¿Podría haber llegado hasta allá en ese tiempo?*

**Fórmula:**
```
Velocidad_Requerida = Distancia_km / Tiempo_Transcurrido_horas

F_Velocidad =
    0.0  si Velocidad_Requerida ≤ 100 km/h   (posible en carro)
    0.5  si 100 < Velocidad_Requerida ≤ 500   (requiere vuelo)
    1.0  si Velocidad_Requerida > 500 km/h    (físicamente imposible)
```

**Ejemplo:** 9 247 km ÷ 2 horas = 4 623 km/h → `1.0` puntos (imposible).

---

### Factor 5 — Horario Inusual (`F_Horario`)

**Qué analiza:** si la hora de la transacción es típica o atípica para
el cliente (hora de la transacción, horario habitual, historial de
horarios).

**Pregunta clave:** *¿El cliente hace transacciones a esta hora?*

**Fórmula:**
```
F_Horario =
    0.0  si la hora está en el rango habitual del cliente
    0.3  si está fuera de rango pero es razonable (6 AM - 11 PM)
    0.7  si es madrugada (11 PM - 6 AM) pero el cliente opera ocasionalmente ahí
    1.0  si es madrugada Y el cliente nunca opera a esa hora
```

---

### Factor 6 — Desviación del Comportamiento (`F_Comportamiento`)

**Qué analiza:** cuántos factores anómalos tiene esta transacción
comparada con el perfil del cliente:

- ¿Monto fuera de lo normal?
- ¿Tipo de transacción inusual?
- ¿Cuenta destino desconocida?
- ¿Muchas transacciones en poco tiempo?

**Pregunta clave:** *¿Cuántas banderas rojas hay?*

**Fórmula (contador de anomalías, máximo 4):**
```
+1 si hay un Monto extraño
+1 si es del Tipo inusual
+1 si el Destino es desconocido
+1 si la Frecuencia es rara

F_Comportamiento = Anomalías / 4
```

| Anomalías | Resultado |
|-----------|-----------|
| 0 | 0 ÷ 4 = `0.0` puntos |
| 2 | 2 ÷ 4 = `0.5` puntos |
| 4 | 4 ÷ 4 = `1.0` puntos |

---

### Factor 7 — País de Alto Riesgo (`F_País`)

**Qué analiza:** si la transacción viene de un país con alta incidencia
de fraude cibernético (país de origen, lista de países de alto riesgo).

**Pregunta clave:** *¿Este país es conocido por fraudes?*

**Fórmula:**
```
F_País =
    0.0  si país = país habitual del cliente
    0.2  si país vecino
    0.5  si país lejano pero de bajo riesgo
    0.8  si país está en lista de alerta
    1.0  si país es de muy alto riesgo
```

---

## 4. Pesos de los Factores (Wᵢ)

Los pesos determinan qué tan importante es cada factor.
**Deben sumar 1.0 (100 %).**

| Peso | Factor | Valor | % | Justificación |
|------|--------|-------|---|---------------|
| W₁ | Monto | 0.25 | 25 % | Importantísimo |
| W₂ | Dispositivo | 0.20 | 20 % | Crítico para seguridad |
| W₃ | Ubicación | 0.18 | 18 % | Indicador fuerte |
| W₄ | Velocidad | 0.15 | 15 % | Detecta imposibilidades físicas |
| W₅ | Horario | 0.10 | 10 % | Moderadamente importante |
| W₆ | Comportamiento | 0.07 | 7 % | Detección de discrepancias |
| W₇ | País | 0.05 | 5 % | Factor de contexto |
| **Total** | | **1.00** | **100 %** | |

---

## 5. Ejemplo Aplicado

**Datos de la transacción:**

| # | Factor | Cálculo | Resultado |
|---|--------|---------|-----------|
| 1 | `F_Monto` | \|65 000 − 55 000\| / 18 000 | **0.56** |
| 2 | `F_Dispositivo` | Dispositivo conocido y confiable | **0.0** |
| 3 | `F_Ubicación` | 3.2 / 1 000 = 0.0032 | **0.0** |
| 4 | `F_Velocidad` | 3.2 km / 4 h = 0.8 km/h | **0.0** |
| 5 | `F_Horario` | Dentro de su rango habitual | **0.0** |
| 6 | `F_Comportamiento` | 0 anomalías / 4 | **0.0** |
| 7 | `F_País` | Colombia, su país habitual | **0.0** |

**Aplicando la fórmula:**

```
Score_Riesgo = (0.25 × 0.56) + (0.20 × 0.0) + (0.18 × 0.0) + (0.15 × 0.0)
             + (0.10 × 0.0) + (0.07 × 0.0) + (0.05 × 0.0)

Score_Riesgo = 0.14 + 0 + 0 + 0 + 0 + 0 + 0 = 0.14

Score_Riesgo = 0.14 × 100 = 14 %
```

---

## 6. Tabla de Decisiones

| Score de riesgo | Clasificación | Acción automática |
|-----------------|--------------|-------------------|
| 0–29 % | Bajo riesgo | Aprobar automáticamente |
| 30–49 % | Riesgo medio bajo | Generar alerta baja + aprobar |
| 50–79 % | Riesgo medio | Generar alerta media + aprobar + notificar al analista |
| 80–94 % | Riesgo alto | Generar alerta alta + aprobar + revisión urgente |
| 95–100 % | Riesgo crítico | Bloquear + alerta máxima + notificar al cliente |
