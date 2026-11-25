export const RISK_THRESHOLDS = {
  MEDIUM: 30,
  HIGH: 70,
  CRITICAL: 95,
} as const;

export type RiskLevel = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";

export function getRiskLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.CRITICAL) return "CRITICO";
  if (score >= RISK_THRESHOLDS.HIGH) return "ALTO";
  if (score >= RISK_THRESHOLDS.MEDIUM) return "MEDIO";
  return "BAJO";
}

export function riskLevelSql(scoreExpression: string): string {
  return `CASE
    WHEN ${scoreExpression} >= ${RISK_THRESHOLDS.CRITICAL} THEN 'CRITICO'
    WHEN ${scoreExpression} >= ${RISK_THRESHOLDS.HIGH} THEN 'ALTO'
    WHEN ${scoreExpression} >= ${RISK_THRESHOLDS.MEDIUM} THEN 'MEDIO'
    ELSE 'BAJO'
  END`;
}

export function riskRankSql(scoreExpression: string): string {
  return `CASE
    WHEN ${scoreExpression} >= ${RISK_THRESHOLDS.CRITICAL} THEN 4
    WHEN ${scoreExpression} >= ${RISK_THRESHOLDS.HIGH} THEN 3
    WHEN ${scoreExpression} >= ${RISK_THRESHOLDS.MEDIUM} THEN 2
    ELSE 1
  END`;
}

export function getUnifiedRiskLevel(
  score: number,
  alertSeverity?: "BAJA" | "MEDIA" | "ALTA" | "CRITICA" | null,
): RiskLevel {
  const scoreLevel = getRiskLevel(score);
  const severityLevel: Record<"BAJA" | "MEDIA" | "ALTA" | "CRITICA", RiskLevel> = {
    BAJA: "BAJO",
    MEDIA: "MEDIO",
    ALTA: "ALTO",
    CRITICA: "CRITICO",
  };
  const rank: Record<RiskLevel, number> = {
    BAJO: 1,
    MEDIO: 2,
    ALTO: 3,
    CRITICO: 4,
  };
  const alertLevel = alertSeverity ? severityLevel[alertSeverity] : "BAJO";
  return rank[scoreLevel] >= rank[alertLevel] ? scoreLevel : alertLevel;
}

export function unifiedRiskLevelSql(
  scoreExpression: string,
  alertSeverityExpression: string,
): string {
  return `CASE GREATEST(
    ${riskRankSql(scoreExpression)},
    CASE
      WHEN ${alertSeverityExpression} = 'CRITICA' THEN 4
      WHEN ${alertSeverityExpression} = 'ALTA' THEN 3
      WHEN ${alertSeverityExpression} = 'MEDIA' THEN 2
      WHEN ${alertSeverityExpression} = 'BAJA' THEN 1
      ELSE 1
    END
  )
    WHEN 4 THEN 'CRITICO'
    WHEN 3 THEN 'ALTO'
    WHEN 2 THEN 'MEDIO'
    ELSE 'BAJO'
  END`;
}
