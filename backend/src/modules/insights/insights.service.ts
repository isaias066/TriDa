import { Prisma } from "@prisma/client";
import { queryRaw } from "../../db/queryRaw.js";
import {
  calculateNetBalance,
  calculatePercentage,
} from "../../utils/decimal-money.js";
import { RISK_THRESHOLDS } from "../../utils/risk.js";

const IA_SERVICE_URL = process.env.IA_SERVICE_URL || "http://127.0.0.1:5000";

export const insightsService = {
  async getInsights(userId: number, periodoDias = 30, accountId?: number) {
    const desde = new Date();
    desde.setDate(desde.getDate() - periodoDias);

    const resumenRows = await queryRaw<
      {
        ingresos: string | number;
        gastos: string | number;
        ahorros: string | number;
        total_tx: string | number;
        score_promedio: string | number;
      }[]
    >(
      `
      SELECT
        COALESCE(SUM(CASE WHEN tipo_movimiento = 'INGRESO' THEN monto ELSE 0 END), 0)::numeric AS ingresos,
        COALESCE(SUM(CASE WHEN tipo_movimiento = 'GASTO' THEN monto ELSE 0 END), 0)::numeric AS gastos,
        COALESCE(SUM(CASE WHEN tipo_movimiento = 'AHORRO' THEN monto ELSE 0 END), 0)::numeric AS ahorros,
        COUNT(*)::bigint AS total_tx,
        COALESCE(AVG(score_anomalia), 0)::numeric AS score_promedio
      FROM trida.transacciones
      WHERE id_usuario = $1
        AND fecha_transaccion >= $2
        AND estado IN ('CONFIRMADA', 'APROBADA')
        AND ($3::int IS NULL OR id_cuenta = $3 OR id_cuenta_destino = $3)
      `,
      userId,
      desde,
      accountId ?? null,
    );

    const topCategorias = await queryRaw<
      Array<{
        nombre: string;
        icono: string | null;
        color: string | null;
        total: string | number;
        cantidad: bigint | number;
      }>
    >(
      `
      SELECT
        c.nombre,
        c.icono,
        c.color,
        COALESCE(SUM(t.monto), 0)::numeric AS total,
        COUNT(*)::bigint AS cantidad
      FROM trida.transacciones t
      JOIN trida.categorias c ON c.id_categoria = t.id_categoria
      WHERE t.id_usuario = $1
        AND t.tipo_movimiento = 'GASTO'
        AND t.fecha_transaccion >= $2
        AND t.estado IN ('CONFIRMADA', 'APROBADA')
        AND ($3::int IS NULL OR t.id_cuenta = $3 OR t.id_cuenta_destino = $3)
      GROUP BY c.id_categoria, c.nombre, c.icono, c.color
      ORDER BY total DESC
      LIMIT 5
      `,
      userId,
      desde,
      accountId ?? null,
    );

    const topComercios = await queryRaw<
      Array<{
        comercio: string;
        total: string | number;
        cantidad: bigint | number;
      }>
    >(
      `
      SELECT
        COALESCE(comercio, 'Sin comercio') AS comercio,
        COALESCE(SUM(monto), 0)::numeric AS total,
        COUNT(*)::bigint AS cantidad
      FROM trida.transacciones
      WHERE id_usuario = $1
        AND tipo_movimiento = 'GASTO'
        AND fecha_transaccion >= $2
        AND estado IN ('CONFIRMADA', 'APROBADA')
        AND ($3::int IS NULL OR id_cuenta = $3 OR id_cuenta_destino = $3)
      GROUP BY comercio
      ORDER BY total DESC
      LIMIT 5
      `,
      userId,
      desde,
      accountId ?? null,
    );

    const alertasRows = await queryRaw<
      {
        total_alertas: string | number;
        criticas: string | number;
      }[]
    >(
      `
      SELECT
        COUNT(*)::bigint AS total_alertas,
        COUNT(*) FILTER (WHERE a.severidad IN ('ALTA', 'CRITICA'))::bigint AS criticas
      FROM trida.alertas_fraude a
      LEFT JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
      WHERE a.id_usuario = $1
        AND a.fecha_detectada >= $2
        AND ($3::int IS NULL OR t.id_cuenta = $3 OR t.id_cuenta_destino = $3)
      `,
      userId,
      desde,
      accountId ?? null,
    );

    const metasAhorro = await queryRaw<
      Array<{
        nombre: string;
        monto_objetivo: string | number;
        monto_actual: string | number;
        estado: string;
      }>
    >(
      `
      SELECT nombre, monto_objetivo::numeric, monto_actual::numeric, estado
      FROM trida.metas_ahorro
      WHERE id_usuario = $1 AND estado = 'ACTIVA'
      ORDER BY fecha_limite ASC NULLS LAST
      LIMIT 5
      `,
      userId,
    );

    const resumen = resumenRows[0] ?? {
      ingresos: 0,
      gastos: 0,
      ahorros: 0,
      total_tx: 0,
      score_promedio: 0,
    };

    const aportesMeta =
      accountId === undefined
        ? await (async () => {
            const aporteRows = await queryRaw<{ aportes: string | number }[]>(
              `
              SELECT COALESCE(SUM(am.monto), 0)::numeric AS aportes
              FROM trida.aportes_meta am
              JOIN trida.metas_ahorro ma ON ma.id_meta = am.id_meta
              WHERE ma.id_usuario = $1
                AND am.fecha_aporte >= $2
              `,
              userId,
              desde,
            );
            return new Prisma.Decimal(aporteRows[0]?.aportes ?? 0);
          })()
        : new Prisma.Decimal(0);

    const ingresos = new Prisma.Decimal(resumen.ingresos);
    const gastos = new Prisma.Decimal(resumen.gastos);
    const ahorrosMovimiento = new Prisma.Decimal(resumen.ahorros);
    const ahorros = ahorrosMovimiento.plus(aportesMeta);
    const balance = calculateNetBalance(ingresos, gastos, ahorros);
    const tasaAhorro = calculatePercentage(ahorros, ingresos);
    const scorePromedio = Number(resumen.score_promedio);
    const totalAlertas = Number(alertasRows[0]?.total_alertas ?? 0);
    const alertasCriticas = Number(alertasRows[0]?.criticas ?? 0);

    const resumenPayload = {
      ingresos: Number(ingresos),
      gastos: Number(gastos),
      ahorros: Number(ahorros),
      balance: balance.toNumber(),
      tasa_ahorro: tasaAhorro
        .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)
        .toNumber(),
      total_transacciones: Number(resumen.total_tx),
      score_riesgo_promedio: Math.round(scorePromedio * 100) / 100,
      total_alertas: totalAlertas,
      alertas_criticas: alertasCriticas,
    };

    const categoriasPayload = topCategorias.map((c) => ({
      nombre: c.nombre,
      icono: c.icono ?? null,
      color: c.color ?? null,
      total: Number(c.total),
      cantidad: Number(c.cantidad),
    }));

    // Consultar motor híbrido IA local para consejos financieros, guías de seguridad y reporte de estafa
    let consejos: string[] = [];
    let guias_seguridad: string[] = [];
    let reporte_riesgo_estafa: Record<string, unknown> | null = null;

    try {
      const resp = await fetch(`${IA_SERVICE_URL}/api/ia/consejos-guias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(1200),
        body: JSON.stringify({
          resumen: resumenPayload,
          top_categorias: categoriasPayload,
          metas_ahorro: metasAhorro.map((m) => ({
            nombre: m.nombre,
            monto_objetivo: Number(m.monto_objetivo),
            monto_actual: Number(m.monto_actual),
            estado: m.estado,
          })),
        }),
      });

      if (resp.ok) {
        const iaData = (await resp.json()) as {
          consejos_finanzas: string[];
          guias_seguridad: string[];
          reporte_riesgo_estafa: Record<string, unknown>;
        };
        consejos = iaData.consejos_finanzas ?? [];
        guias_seguridad = iaData.guias_seguridad ?? [];
        reporte_riesgo_estafa = iaData.reporte_riesgo_estafa ?? null;
      }
    } catch {
      // Respaldo local si el microservicio Python no está encendido
    }

    if (consejos.length === 0) {
      if (gastos.greaterThan(ingresos) && ingresos.greaterThan(0)) {
        consejos.push(
          "Tus gastos superan tus ingresos en este periodo. Revisa categorías no esenciales para equilibrar tu balance.",
        );
      }
      if (scorePromedio >= RISK_THRESHOLDS.HIGH || alertasCriticas > 0) {
        consejos.push(
          "Se detectaron alertas relevantes. Revisa tus dispositivos activos y el Centro de Alertas.",
        );
      }
      if (consejos.length === 0) {
        consejos.push(
          "Tu actividad financiera se ve estable en este periodo. Sigue registrando movimientos para mejores recomendaciones.",
        );
      }
    }

    return {
      periodo_dias: periodoDias,
      resumen: resumenPayload,
      top_categorias: categoriasPayload,
      top_comercios: topComercios.map((c) => ({
        comercio: c.comercio,
        total: Number(c.total),
        cantidad: Number(c.cantidad),
      })),
      consejos,
      guias_seguridad,
      reporte_riesgo_estafa,
    };
  },

  async chat(userId: number, mensaje: string, periodoDias = 30, accountId?: number) {
    const overview = await this.getInsights(userId, periodoDias, accountId);

    const cuentasRows = await queryRaw<Array<{ data: Record<string, unknown> }>>(
      `SELECT to_jsonb(c) AS data FROM trida.cuentas c WHERE c.id_usuario = $1`,
      userId,
    );
    const cuentas = cuentasRows
      .map((r) => r.data)
      .filter((c) => c.activa !== false && c.estado !== "INACTIVA");

    const alertasRows = await queryRaw<Array<{ data: Record<string, unknown> }>>(
      `SELECT to_jsonb(a) AS data FROM trida.alertas_fraude a WHERE a.id_usuario = $1 ORDER BY a.fecha_detectada DESC LIMIT 5`,
      userId,
    );
    const alertas = alertasRows.map((r) => r.data);
    const alertasPendientes = alertas.filter(
      (a) => String(a.estado ?? "").toUpperCase() === "PENDIENTE",
    );

    const presupuestosRows = await queryRaw<
      Array<{ data: Record<string, unknown>; categoria_nombre: string | null }>
    >(
      `
      SELECT to_jsonb(p) AS data, c.nombre AS categoria_nombre
      FROM trida.presupuestos p
      LEFT JOIN trida.categorias c ON c.id_categoria = p.id_categoria
      WHERE p.id_usuario = $1
      LIMIT 6
      `,
      userId,
    );

    const fmtCop = (val: number) =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(Number.isFinite(val) ? val : 0);

    const q = mensaje
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const { resumen, top_categorias, top_comercios, consejos, guias_seguridad } = overview;
    const saldoTotal = cuentas.reduce(
      (acc, c) => acc + Number(c.saldo_actual ?? c.saldo ?? 0),
      0,
    );

    // Detección multi-intención (soporta preguntas compuestas en un mismo mensaje)
    const isUnrecognizedTx =
      /(no fui yo|no reconozco|desvio|robaron|hacke|clon|desconocid|que hago si|no hice ese)/.test(q);
    const isNegativeOrDebt =
      /(negativ|endeud|deuda|en rojo|porque esta menos|por que esta menos|saldo bajo|sobregir)/.test(q);
    const isAdvice =
      /(consejo|tip|recomend|mejorar|proteger|como ahorro|ahorrar mas|reducir gasto)/.test(q);
    const isAlerts =
      /(alerta|fraude|seguridad|sospechos|riesgo|estafa|phishing)/.test(q);
    const isCategories =
      /(categoria|comercio|donde gasto|mas gasto|top)/.test(q);
    const isBudgetsOrGoals =
      /(presupuesto|meta|ahorr)/.test(q) && !isAdvice;
    const isSystemInfo =
      /(ampliar|como funciona|informacion|random forest|pasiv|factor|que puedes hacer)/.test(q);
    const isReport =
      /(reporte|informe|resumen|balance|cuanto he gastado|movimiento)/.test(q) ||
      (/\bgasto/.test(q) && !isAdvice && !isCategories && !isUnrecognizedTx && !isNegativeOrDebt);

    const sections: string[] = [];
    let primaryCategory = "GENERAL";
    let quickChips: string[] = [
      "📊 Informe de gastos",
      "🛡️ Revisar alertas",
      "💡 Consejos directos",
      "🤖 Ampliar info de TriDa",
    ];

    // Bloque A: Movimiento no reconocido ("¿Y si no fui yo?")
    if (isUnrecognizedTx) {
      primaryCategory = "EMERGENCIA_SEGURIDAD";
      const topCat = top_categorias[0];
      const refGasto = topCat
        ? ` (como el movimiento registrado en **${topCat.nombre}** por ${fmtCop(topCat.total)})`
        : "";
      sections.push(
        [
          `🚨 **Si no reconoces un gasto${refGasto}, sigue estos 3 pasos de inmediato:**`,
          "1. **En TriDa (Seguridad / Movimientos):** Abre la alerta o el movimiento pendiente y márcalo como **«No fui yo» / Rechazar**. Si sigue en `PENDIENTE`, TriDa lo anula sin descontarlo; si ya quedó `CONFIRMADA`, déjalo reportado como no reconocido.",
          "2. **Blinda tu acceso:** Entra a **Dispositivos** para cerrar sesiones desconocidas y cambia tu contraseña en **Configuración**.",
          "3. **Contacta a tu banco real:** TriDa es un copiloto pasivo (no bloquea tarjetas externas). Reporta el movimiento en tu banco o bloquea temporalmente tu tarjeta/clave dinámica.",
        ].join("\n"),
      );
      quickChips = [
        "🛡️ Revisar alertas",
        "🔒 Consejos contra estafas",
        "📊 Informe de gastos",
      ];
    }

    // Bloque B: Saldo negativo / ¿Estoy endeudado?
    if (isNegativeOrDebt) {
      if (primaryCategory === "GENERAL") primaryCategory = "DIAGNOSTICO_SALDO";
      const topCat = top_categorias[0];
      const causa = topCat
        ? ` impulsado principalmente por **${topCat.nombre}** (${fmtCop(topCat.total)})`
        : "";
      const estadoSaldo =
        saldoTotal < 0
          ? `Tu saldo consolidado aparece en **${fmtCop(saldoTotal)}** porque los gastos confirmados (**${fmtCop(resumen.gastos)}**)${causa} superan tus ingresos registrados (**${fmtCop(resumen.ingresos)}**).`
          : `Tu saldo consolidado actual es positivo (**${fmtCop(saldoTotal)}**), aunque el balance neto de los últimos ${periodoDias} días es de **${fmtCop(resumen.balance)}**.`;

      sections.push(
        [
          "📉 **¿Por qué se ve negativo y qué significa?**",
          `• **Diagnóstico:** ${estadoSaldo}`,
          "• **¿Estás endeudado?:** Si ese movimiento fue una prueba o un error de digitación, **no es una deuda real** (puedes corregirlo o registrar tus ingresos base en **Movimientos**). En cambio, si corresponde a gastos reales pagados con crédito o sobregiro, sí refleja un déficit que conviene cubrir antes de asumir nuevos gastos.",
        ].join("\n"),
      );
      quickChips = [
        "💸 ¿En qué categoría gasto más?",
        "💡 Consejos para ahorrar",
        "📊 Informe de gastos",
      ];
    }

    // Bloque C: Consejos directos (prioridad sobre reporte para evitar colisión con "reducir gastos")
    if (isAdvice && sections.length < 2) {
      if (primaryCategory === "GENERAL") primaryCategory = "CONSEJOS";
      const customTips: string[] = [];
      if (top_categorias.length > 0) {
        const top = top_categorias[0];
        customTips.push(
          `• **Recorta tu foco principal (${top.nombre}):** Concentra ${fmtCop(top.total)}. Reducir un **15%** ahí liberaría **${fmtCop(top.total * 0.15)}** directo para ahorro.`,
        );
      }
      if (resumen.ingresos === 0) {
        customTips.push(
          "• **Registra tus ingresos base:** Actualmente tienes $ 0 en ingresos registrados en el periodo; añadirlos permitirá calcular tu tasa real de ahorro.",
        );
      }
      for (const c of consejos.slice(0, 2)) {
        customTips.push(`• ${c}`);
      }

      const tipsSeg = (
        guias_seguridad && guias_seguridad.length > 0
          ? guias_seguridad.slice(0, 2)
          : [
              "Verifica siempre el dominio oficial antes de abrir enlaces bancarios por SMS o correo.",
              "Revisa tus alertas en Seguridad antes de confirmar transferencias de monto alto.",
            ]
      )
        .map((g) => `• ${g}`)
        .join("\n");

      sections.push(
        [
          "💡 **Recomendaciones directas para ti**",
          `**Finanzas y ahorro:**\n${customTips.slice(0, 3).join("\n")}`,
          "",
          `**Protección y ciberseguridad:**\n${tipsSeg}`,
        ].join("\n"),
      );
      quickChips = [
        "💸 ¿En qué categoría gasto más?",
        "📊 Informe de gastos",
        "🛡️ Revisar alertas",
      ];
    }

    // Bloque D: Alertas de fraude
    if (isAlerts && sections.length < 2) {
      if (primaryCategory === "GENERAL") primaryCategory = "SEGURIDAD_ALERTAS";
      const detalleAlertas =
        alertasPendientes.length > 0
          ? alertasPendientes
              .slice(0, 3)
              .map((a, i) => {
                const sev = String(a.severidad ?? "MEDIA");
                const mot = String(a.motivo ?? a.descripcion ?? "Patrón inusual detectado");
                return `${i + 1}. **[${sev}]** ${mot}`;
              })
              .join("\n")
          : "• No tienes alertas pendientes por resolver en este momento.";

      sections.push(
        [
          "🛡️ **Estado de seguridad y alertas pasivas**",
          `• **Pendientes de tu revisión:** ${alertasPendientes.length}`,
          `• **Detectadas en ${periodoDias} días:** ${resumen.total_alertas} (críticas/altas: ${resumen.alertas_criticas})`,
          `• **Score de riesgo promedio:** ${resumen.score_riesgo_promedio.toFixed(1)} / 100`,
          "",
          `**Detalle reciente:**\n${detalleAlertas}`,
        ].join("\n"),
      );
      quickChips = [
        "🚨 ¿Y si no fui yo?",
        "🤖 Ampliar info de TriDa",
        "📊 Informe de gastos",
      ];
    }

    // Bloque E: Categorías y comercios
    if (isCategories && sections.length < 2) {
      if (primaryCategory === "GENERAL") primaryCategory = "CATEGORIAS_GASTO";
      if (top_categorias.length === 0) {
        sections.push(
          `Aún no tienes gastos confirmados en los últimos ${periodoDias} días para desglosar por categoría.`,
        );
      } else {
        const totalGastos = resumen.gastos > 0 ? resumen.gastos : 1;
        const detalleCats = top_categorias
          .map((c, i) => {
            const pct = ((c.total / totalGastos) * 100).toFixed(1);
            return `${i + 1}. **${c.nombre}**: ${fmtCop(c.total)} (${pct}% del gasto · ${c.cantidad} mov.)`;
          })
          .join("\n");
        sections.push(
          [
            `💸 **Desglose de gastos por categoría (${periodoDias} días)**`,
            detalleCats,
          ].join("\n"),
        );
      }
      quickChips = [
        "💡 Consejos para ahorrar",
        "📊 Informe de gastos",
        "🛡️ Revisar alertas",
      ];
    }

    // Bloque F: Presupuestos y metas
    if (isBudgetsOrGoals && sections.length < 2) {
      if (primaryCategory === "GENERAL") primaryCategory = "METAS_PRESUPUESTOS";
      const presLines =
        presupuestosRows.length > 0
          ? presupuestosRows
              .map((r) => {
                const nombre = r.categoria_nombre ?? String(r.data.nombre ?? "General");
                const limite = Number(r.data.monto_limite ?? r.data.limite ?? r.data.monto ?? 0);
                return `• **${nombre}**: límite de ${fmtCop(limite)}`;
              })
              .join("\n")
          : "• Aún no has configurado presupuestos por categoría.";

      sections.push(
        [
          "🎯 **Estado de ahorro y presupuestos**",
          `• **Ahorro acumulado:** ${fmtCop(resumen.ahorros)} (${resumen.tasa_ahorro.toFixed(1)}% de tus ingresos)`,
          `**Presupuestos:**\n${presLines}`,
        ].join("\n"),
      );
      quickChips = [
        "💡 Consejos para ahorrar",
        "📊 Informe de gastos",
        "💸 ¿En qué categoría gasto más?",
      ];
    }

    // Bloque G: Información sobre el sistema / IA híbrida
    if (isSystemInfo && sections.length < 2) {
      if (primaryCategory === "GENERAL") primaryCategory = "INFO_SISTEMA";
      sections.push(
        [
          "🤖 **¿Cómo funciona TriDa y su IA pasiva híbrida?**",
          "1. **7 factores conductuales:** Evalúa monto atípico vs. historial, horario de madrugada, frecuencia en 10 minutos, comercio nuevo, dispositivo no habitual, geolocalización imposible y canal remoto.",
          "2. **Modelo híbrido resiliente:** Combina reglas deterministas con **Random Forest** en Python, manteniendo respaldo local si el microservicio IA se desconecta.",
          "3. **Copiloto no bloqueante:** Nunca congela cuentas unilateralmente; deja movimientos sospechosos en `PENDIENTE` para que tú decidas.",
        ].join("\n"),
      );
      quickChips = [
        "📊 Informe de gastos",
        "🛡️ Revisar alertas",
        "💡 Consejos directos",
      ];
    }

    // Bloque H: Informe financiero general
    if (isReport && sections.length === 0) {
      primaryCategory = "REPORTE_GASTOS";
      const catLines =
        top_categorias.length > 0
          ? top_categorias
              .slice(0, 3)
              .map((c, i) => `${i + 1}. **${c.nombre}**: ${fmtCop(c.total)} (${c.cantidad} mov.)`)
              .join("\n")
          : "• Aún no hay gastos categorizados en este periodo.";

      const comercioLines =
        top_comercios.length > 0
          ? top_comercios
              .slice(0, 2)
              .map((m) => `• **${m.comercio}**: ${fmtCop(m.total)} (${m.cantidad} mov.)`)
              .join("\n")
          : "• Sin comercios destacados registrados.";

      sections.push(
        [
          `📊 **Informe financiero (últimos ${periodoDias} días)**`,
          `• **Ingresos:** ${fmtCop(resumen.ingresos)}`,
          `• **Gastos:** ${fmtCop(resumen.gastos)}`,
          `• **Ahorros:** ${fmtCop(resumen.ahorros)} (tasa: **${resumen.tasa_ahorro.toFixed(1)}%**)`,
          `• **Balance neto:** ${fmtCop(resumen.balance)}`,
          `• **Saldo disponible en cuentas:** ${fmtCop(saldoTotal)}`,
          "",
          `**Top categorías:**\n${catLines}`,
          "",
          `**Comercios principales:**\n${comercioLines}`,
        ].join("\n"),
      );
      quickChips = [
        "💸 ¿En qué categoría gasto más?",
        "💡 Consejos directos",
        "🛡️ Revisar alertas",
      ];
    }

    // Saludo directo ("hola??", "buenas", etc.)
    const cleanGreeting = q.replace(/[?!.,¡¿]+/g, "").trim();
    if (
      sections.length === 0 &&
      /^(hola+|holi+|buenas|buenos dias|buenas tardes|buenas noches|hey+)$/.test(cleanGreeting)
    ) {
      return {
        categoria: "SALUDO",
        respuesta: [
          `¡Hola! 👋 Soy **TriDa IA**, tu copiloto financiero y de seguridad pasiva.`,
          `Ahora mismo tu saldo consolidado es de **${fmtCop(saldoTotal)}** y tienes **${alertasPendientes.length}** alerta(s) pendiente(s).`,
          "",
          "¿En qué te ayudo hoy? Puedes tocar una opción rápida de abajo o preguntarme sobre tus **gastos**, **alertas**, **saldos** o **consejos**.",
        ].join("\n"),
        sugerencias_rapidas: [
          "📊 Informe de gastos",
          "🛡️ Revisar alertas",
          "💡 Consejos directos",
          "🤖 Ampliar info de TriDa",
        ],
      };
    }

    // Fallback inteligente y con personalidad si la pregunta es fuera de dominio
    if (sections.length === 0) {
      return {
        categoria: "FUERA_DE_DOMINIO",
        respuesta: [
          `😅 ¡Buena pregunta, pero mi radar solo está entrenado para cuidar tus **finanzas y seguridad en TriDa**!`,
          "",
          `Por si te sirve el dato real ahora mismo: tu saldo consolidado es de **${fmtCop(saldoTotal)}** y tienes **${alertasPendientes.length}** alerta(s) pendiente(s). Prueba con una de las opciones rápidas de abajo o pregúntame por tus gastos, alertas o consejos.`,
        ].join("\n"),
        sugerencias_rapidas: [
          "📊 Informe de gastos",
          "🛡️ Revisar alertas",
          "💡 Consejos directos",
          "🤖 Ampliar info de TriDa",
        ],
      };
    }

    return {
      categoria: primaryCategory,
      respuesta: sections.join("\n\n"),
      sugerencias_rapidas: quickChips,
    };
  },
};
