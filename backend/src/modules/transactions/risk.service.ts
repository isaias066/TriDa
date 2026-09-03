// ¿Qué? Motor determinista de scoring de riesgo basado en la Fórmula de Criticidad de TriDa (7 factores ponderados).
// ¿Para qué? Calcular el score de riesgo (0-100) de cada transacción en tiempo real y decidir su estado.
// ¿Impacto? Núcleo matemático del sistema antifraude. Define la tabla de decisiones de criticidad (30/50/80/95).

// ── INTERFACES ──────────────────────────────────────────────

export interface RiskInput {
  montoActual: number;
  montoPromedio: number;
  desviacionEstandar: number;
  dispositivoConocido: boolean;
  dispositivoConfiable: boolean;
  diasUsoDispositivo: number;
  distanciaKm: number;
  tiempoTranscurridoHoras: number;
  horaTransaccion: number;
  anomaliasComportamiento: number;
  paisDestino: string;
  paisHabitual: string;
  esPaisVecino: boolean;
  esPaisRiesgoMedio: boolean;
  esPaisAltoRiesgo: boolean;
}

export interface RiskEvaluation {
  score: number;
  estadoTransaccion: "APROBADA" | "ALERTADA" | "BLOQUEADA";
  nivel: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
  factoresSospechosos: string[];
  detalleFactores: {
    fMonto: number;
    fDispositivo: number;
    fUbicacion: number;
    fVelocidad: number;
    fHorario: number;
    fComportamiento: number;
    fPais: number;
  };
}

// ── PESOS (Wᵢ) — Suma exactitud = 1.0 ───────────────────────

const WEIGHTS = {
  monto: 0.25, // W₁ — 25%
  dispositivo: 0.2, // W₂ — 20%
  ubicacion: 0.18, // W₃ — 18%
  velocidad: 0.15, // W₄ — 15%
  horario: 0.1, // W₅ — 10%
  comportamiento: 0.07, // W₆ — 7%
  pais: 0.05, // W₇ — 5%
} as const;

// ── FACTORES (Fᵢ) — Retornan valor normalizado entre 0.0 y 1.0 ──────

function calcFMonto(input: RiskInput): number {
  if (input.desviacionEstandar === 0) return 0;
  const desviacion =
    Math.abs(input.montoActual - input.montoPromedio) /
    input.desviacionEstandar;
  return Math.min(1, desviacion);
}

function calcFDispositivo(input: RiskInput): number {
  if (input.dispositivoConocido && input.dispositivoConfiable) return 0.0;
  if (input.dispositivoConocido && !input.dispositivoConfiable) return 0.3;
  if (
    !input.dispositivoConocido &&
    input.diasUsoDispositivo < 7 &&
    input.diasUsoDispositivo > 0
  )
    return 0.7;
  if (!input.dispositivoConocido && input.diasUsoDispositivo === 0) return 1.0;
  return 0.7;
}

function calcFUbicacion(input: RiskInput): number {
  return Math.min(1, input.distanciaKm / 1000);
}

function calcFVelocidad(input: RiskInput): number {
  if (input.tiempoTranscurridoHoras === 0)
    return input.distanciaKm > 100 ? 1.0 : 0.0;
  const velocidadRequerida = input.distanciaKm / input.tiempoTranscurridoHoras;
  if (velocidadRequerida <= 100) return 0.0;
  if (velocidadRequerida <= 500) return 0.5;
  return 1.0;
}

function calcFHorario(input: RiskInput): number {
  const hora = input.horaTransaccion;
  const esMadrugada = hora >= 23 || hora < 6;
  const esRazonable = hora >= 6 && hora <= 23;

  if (!esMadrugada && esRazonable) return 0.0;
  if (esMadrugada) return 0.7;
  return 0.3;
}

function calcFComportamiento(input: RiskInput): number {
  const anomalias = Math.min(4, Math.max(0, input.anomaliasComportamiento));
  return anomalias / 4;
}

function calcFPais(input: RiskInput): number {
  if (input.paisDestino === input.paisHabitual) return 0.0;
  if (input.esPaisAltoRiesgo) return 1.0;
  if (input.esPaisRiesgoMedio) return 0.8;
  if (input.esPaisVecino) return 0.2;
  return 0.5;
}

// ── EVALUADOR ──────────────────────────────────────────────

function evaluate(input: RiskInput): RiskEvaluation {
  const fMonto = calcFMonto(input);
  const fDispositivo = calcFDispositivo(input);
  const fUbicacion = calcFUbicacion(input);
  const fVelocidad = calcFVelocidad(input);
  const fHorario = calcFHorario(input);
  const fComportamiento = calcFComportamiento(input);
  const fPais = calcFPais(input);

  const scoreRaw =
    WEIGHTS.monto * fMonto +
    WEIGHTS.dispositivo * fDispositivo +
    WEIGHTS.ubicacion * fUbicacion +
    WEIGHTS.velocidad * fVelocidad +
    WEIGHTS.horario * fHorario +
    WEIGHTS.comportamiento * fComportamiento +
    WEIGHTS.pais * fPais;

  const score = Math.round(scoreRaw * 100 * 10) / 10; // Redondeo a 1 decimal

  let estadoTransaccion: "APROBADA" | "ALERTADA" | "BLOQUEADA";
  let nivel: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";

  if (score >= 95) {
    estadoTransaccion = "BLOQUEADA";
    nivel = "CRITICA";
  } else if (score >= 80) {
    estadoTransaccion = "ALERTADA";
    nivel = "ALTA";
  } else if (score >= 50) {
    estadoTransaccion = "ALERTADA";
    nivel = "MEDIA";
  } else if (score >= 30) {
    estadoTransaccion = "ALERTADA";
    nivel = "BAJA";
  } else {
    estadoTransaccion = "APROBADA";
    nivel = "BAJA";
  }

  const factoresSospechosos: string[] = [];
  if (fMonto >= 0.3)
    factoresSospechosos.push(`Monto inusual (F=${fMonto.toFixed(2)})`);
  if (fDispositivo >= 0.3)
    factoresSospechosos.push(
      `Dispositivo sospechoso (F=${fDispositivo.toFixed(2)})`,
    );
  if (fUbicacion >= 0.3)
    factoresSospechosos.push(
      `Ubicación inusual a ${input.distanciaKm.toFixed(0)} km (F=${fUbicacion.toFixed(2)})`,
    );
  if (fVelocidad >= 0.5)
    factoresSospechosos.push(
      `Velocidad físicamente imposible (F=${fVelocidad.toFixed(2)})`,
    );
  if (fHorario >= 0.3)
    factoresSospechosos.push(
      `Horario atípico ${input.horaTransaccion}:00 (F=${fHorario.toFixed(2)})`,
    );
  if (fComportamiento >= 0.3)
    factoresSospechosos.push(
      `Comportamiento anómalo (F=${fComportamiento.toFixed(2)})`,
    );
  if (fPais >= 0.2)
    factoresSospechosos.push(
      `País de riesgo: ${input.paisDestino} (F=${fPais.toFixed(2)})`,
    );

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
