// ¿Qué? Motor determinista de scoring de riesgo basado en la Fórmula de Criticidad de TriDa (7 factores ponderados)
// ¿Para qué? Calcular el score de riesgo (0-100) de cada transacción en tiempo real y decidir si se aprueba, alerta o bloquea
// ¿Impacto? Núcleo del sistema antifraude. Cuando se integre la IA, este motor será reemplazado por el modelo ML entrenado
// ── PESOS (Wᵢ) — Deben sumar 1.0 ──────────────────────────
const WEIGHTS = {
    monto: 0.25, // W₁ — 25%
    dispositivo: 0.20, // W₂ — 20%
    ubicacion: 0.18, // W₃ — 18%
    velocidad: 0.15, // W₄ — 15%
    horario: 0.10, // W₅ — 10%
    comportamiento: 0.07, // W₆ — 7%
    pais: 0.05, // W₇ — 5%
};
// ── FACTORES (Fᵢ) — Cada uno retorna 0.0 a 1.0 ────────────
function calcFMonto(input) {
    // F_Monto = min(1, |Monto_Actual - Monto_Promedio| / Desviación_Estándar)
    if (input.desviacionEstandar === 0)
        return 0;
    const desviacion = Math.abs(input.montoActual - input.montoPromedio) / input.desviacionEstandar;
    return Math.min(1, desviacion);
}
function calcFDispositivo(input) {
    if (input.dispositivoConocido && input.dispositivoConfiable)
        return 0.0;
    if (input.dispositivoConocido && !input.dispositivoConfiable)
        return 0.3;
    if (!input.dispositivoConocido && input.diasUsoDispositivo < 7 && input.diasUsoDispositivo > 0)
        return 0.7;
    if (!input.dispositivoConocido && input.diasUsoDispositivo === 0)
        return 1.0;
    return 0.7;
}
function calcFUbicacion(input) {
    // F_Ubicación = min(1, Distancia_km / 1000)
    return Math.min(1, input.distanciaKm / 1000);
}
function calcFVelocidad(input) {
    // Velocidad_Requerida = Distancia_km / Tiempo_Transcurrido_horas
    if (input.tiempoTranscurridoHoras === 0)
        return input.distanciaKm > 100 ? 1.0 : 0.0;
    const velocidadRequerida = input.distanciaKm / input.tiempoTranscurridoHoras;
    if (velocidadRequerida <= 100)
        return 0.0;
    if (velocidadRequerida <= 500)
        return 0.5;
    return 1.0;
}
function calcFHorario(input) {
    const hora = input.horaTransaccion;
    const esMadrugada = hora >= 23 || hora < 6;
    const esRazonable = hora >= 6 && hora <= 23;
    if (!esMadrugada && esRazonable)
        return 0.0;
    if (esMadrugada)
        return 0.7;
    return 0.3;
}
function calcFComportamiento(input) {
    // F_Comportamiento = Anomalías / 4 (máximo 4 anomalías)
    const anomalias = Math.min(4, Math.max(0, input.anomaliasComportamiento));
    return anomalias / 4;
}
function calcFPais(input) {
    if (input.paisDestino === input.paisHabitual)
        return 0.0;
    if (input.esPaisAltoRiesgo)
        return 1.0;
    if (input.esPaisRiesgoMedio)
        return 0.8;
    if (input.esPaisVecino)
        return 0.2;
    return 0.5;
}
// ── MOTOR PRINCIPAL ────────────────────────────────────────
function evaluate(input) {
    // Calcular cada factor (0.0 a 1.0)
    const fMonto = calcFMonto(input);
    const fDispositivo = calcFDispositivo(input);
    const fUbicacion = calcFUbicacion(input);
    const fVelocidad = calcFVelocidad(input);
    const fHorario = calcFHorario(input);
    const fComportamiento = calcFComportamiento(input);
    const fPais = calcFPais(input);
    // Score = Σ (Wᵢ × Fᵢ) × 100
    const scoreRaw = WEIGHTS.monto * fMonto +
        WEIGHTS.dispositivo * fDispositivo +
        WEIGHTS.ubicacion * fUbicacion +
        WEIGHTS.velocidad * fVelocidad +
        WEIGHTS.horario * fHorario +
        WEIGHTS.comportamiento * fComportamiento +
        WEIGHTS.pais * fPais;
    const score = Math.round(scoreRaw * 100 * 10) / 10; // 1 decimal
    // Tabla de decisiones
    let estadoTransaccion;
    let nivel;
    if (score >= 95) {
        estadoTransaccion = 'BLOQUEADA';
        nivel = 'CRITICA';
    }
    else if (score >= 80) {
        estadoTransaccion = 'ALERTADA';
        nivel = 'ALTA';
    }
    else if (score >= 50) {
        estadoTransaccion = 'ALERTADA';
        nivel = 'MEDIA';
    }
    else if (score >= 30) {
        estadoTransaccion = 'ALERTADA';
        nivel = 'BAJA';
    }
    else {
        estadoTransaccion = 'APROBADA';
        nivel = 'BAJA';
    }
    // Factores sospechosos (solo los que aportan riesgo significativo)
    const factoresSospechosos = [];
    if (fMonto >= 0.3)
        factoresSospechosos.push(`Monto inusual (F=${fMonto.toFixed(2)})`);
    if (fDispositivo >= 0.3)
        factoresSospechosos.push(`Dispositivo sospechoso (F=${fDispositivo.toFixed(2)})`);
    if (fUbicacion >= 0.3)
        factoresSospechosos.push(`Ubicación inusual a ${input.distanciaKm.toFixed(0)} km (F=${fUbicacion.toFixed(2)})`);
    if (fVelocidad >= 0.5)
        factoresSospechosos.push(`Velocidad físicamente imposible (F=${fVelocidad.toFixed(2)})`);
    if (fHorario >= 0.3)
        factoresSospechosos.push(`Horario atípico ${input.horaTransaccion}:00 (F=${fHorario.toFixed(2)})`);
    if (fComportamiento >= 0.3)
        factoresSospechosos.push(`Comportamiento anómalo (F=${fComportamiento.toFixed(2)})`);
    if (fPais >= 0.2)
        factoresSospechosos.push(`País de riesgo: ${input.paisDestino} (F=${fPais.toFixed(2)})`);
    return {
        score,
        estadoTransaccion,
        nivel,
        factoresSospechosos,
        detalleFactores: {
            fMonto,
            fDispositivo,
            fUbicacion,
            fVelocidad,
            fHorario,
            fComportamiento,
            fPais,
        },
    };
}
export const riskScoringEngine = { evaluate };
//# sourceMappingURL=risk.service.js.map