import os
import joblib
import numpy as np
import pandas as pd
import psycopg2

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "TriDa",
    "user": "postgres",
    "password": "trida_secure_2026",
}

FEATURES = [
    "monto",
    "ratio_monto_promedio",
    "hora",
    "es_madrugada",
    "es_fin_de_semana",
    "velocidad_kmh",
    "comercio_nuevo",
    "dispositivo_confiable",
    "tx_ultimos_10_min",
    "tipo_movimiento",
    "canal",
]

CATEGORICAL_FEATURES = ["tipo_movimiento", "canal"]
NUMERIC_FEATURES = [
    "monto",
    "ratio_monto_promedio",
    "hora",
    "es_madrugada",
    "es_fin_de_semana",
    "velocidad_kmh",
    "comercio_nuevo",
    "dispositivo_confiable",
    "tx_ultimos_10_min",
]


def cargar_datos_reales() -> pd.DataFrame:
    query = """
    SELECT
        t.monto::float AS monto,
        t.tipo_movimiento,
        t.canal,
        t.comercio,
        t.estado,
        COALESCE(t.score_anomalia, 0)::float AS score_anomalia,
        t.fecha_transaccion AT TIME ZONE 'America/Bogota' AS fecha_local,
        COALESCE(p.gasto_diario_promedio, 80000)::float AS gasto_promedio,
        COALESCE(p.comercios_frecuentes, '[]'::jsonb) AS comercios_frecuentes,
        COALESCE(d.confiable, TRUE) AS dispositivo_confiable
    FROM trida.transacciones t
    LEFT JOIN trida.patron_comportamiento p ON p.id_usuario = t.id_usuario
    LEFT JOIN trida.dispositivos d ON d.id_dispositivo = t.id_dispositivo
    ORDER BY t.id_transaccion;
    """
    conn = psycopg2.connect(**DB_CONFIG)
    df = pd.read_sql(query, conn)
    conn.close()

    if df.empty:
        return pd.DataFrame(columns=FEATURES + ["es_fraude"])

    df["fecha_local"] = pd.to_datetime(df["fecha_local"])
    df["hora"] = df["fecha_local"].dt.hour
    df["es_madrugada"] = ((df["hora"] >= 0) & (df["hora"] < 6)).astype(int)
    df["es_fin_de_semana"] = (df["fecha_local"].dt.dayofweek >= 5).astype(int)
    df["ratio_monto_promedio"] = (df["monto"] / df["gasto_promedio"].clip(lower=10000)).clip(0.05, 25.0)
    df["dispositivo_confiable"] = df["dispositivo_confiable"].astype(int)
    df["comercio_nuevo"] = df.apply(
        lambda r: 0
        if (r["comercio"] and r["comercio"] in (r["comercios_frecuentes"] or []))
        else 1,
        axis=1,
    )
    df["velocidad_kmh"] = np.where(df["score_anomalia"] >= 70, 320.0, 12.0)
    df["tx_ultimos_10_min"] = np.where(df["score_anomalia"] >= 70, 3, 0)
    df["es_fraude"] = (
        (df["estado"].isin(["SOSPECHOSA", "RECHAZADA"])) | (df["score_anomalia"] >= 70)
    ).astype(int)

    return df[FEATURES + ["es_fraude"]]


def generar_dataset_calibrado(n_samples: int = 3000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    tipos = rng.choice(
        ["GASTO", "TRANSFERENCIA", "INGRESO", "AHORRO"],
        size=n_samples,
        p=[0.62, 0.18, 0.12, 0.08],
    )
    canales = rng.choice(
        ["mobile", "web", "pos", "transferencia", "webhook", "atm"],
        size=n_samples,
        p=[0.32, 0.24, 0.20, 0.10, 0.08, 0.06],
    )

    # 80% comportamiento legítimo, 20% patrones de fraude/anomalía
    es_fraude = rng.choice([0, 1], size=n_samples, p=[0.80, 0.20])

    monto = np.where(
        es_fraude == 0,
        rng.lognormal(mean=10.9, sigma=0.75, size=n_samples),  # ~15k - 250k COP
        rng.lognormal(mean=13.4, sigma=0.65, size=n_samples),  # ~350k - 3.5M COP
    ).round(2)

    ratio_monto = np.where(
        es_fraude == 0,
        rng.uniform(0.2, 2.4, size=n_samples),
        rng.uniform(2.8, 12.0, size=n_samples),
    ).round(2)

    hora = np.where(
        es_fraude == 0,
        rng.integers(7, 22, size=n_samples),
        rng.choice([0, 1, 2, 3, 4, 5, 14, 23], size=n_samples, p=[0.16, 0.18, 0.18, 0.16, 0.12, 0.08, 0.06, 0.06]),
    )
    es_madrugada = ((hora >= 0) & (hora < 6)).astype(int)
    es_fin_de_semana = rng.choice([0, 1], size=n_samples, p=[0.71, 0.29])

    velocidad_kmh = np.where(
        es_fraude == 0,
        rng.uniform(0, 65, size=n_samples),
        rng.choice([15.0, 260.0, 890.0], size=n_samples, p=[0.45, 0.30, 0.25]),
    ).round(1)

    comercio_nuevo = np.where(
        es_fraude == 0,
        rng.choice([0, 1], size=n_samples, p=[0.78, 0.22]),
        rng.choice([0, 1], size=n_samples, p=[0.15, 0.85]),
    )

    dispositivo_confiable = np.where(
        es_fraude == 0,
        rng.choice([1, 0], size=n_samples, p=[0.93, 0.07]),
        rng.choice([1, 0], size=n_samples, p=[0.28, 0.72]),
    )

    tx_ultimos_10_min = np.where(
        es_fraude == 0,
        rng.choice([0, 1], size=n_samples, p=[0.88, 0.12]),
        rng.choice([0, 1, 2, 3, 4], size=n_samples, p=[0.25, 0.20, 0.25, 0.20, 0.10]),
    )

    # Limpiar ingresos/ahorros para que no sean marcados como estafa por monto alto
    mask_no_riesgo = np.isin(tipos, ["INGRESO", "AHORRO"])
    es_fraude[mask_no_riesgo] = 0
    velocidad_kmh[mask_no_riesgo] = 0.0
    tx_ultimos_10_min[mask_no_riesgo] = 0

    return pd.DataFrame(
        {
            "monto": monto,
            "ratio_monto_promedio": ratio_monto,
            "hora": hora,
            "es_madrugada": es_madrugada,
            "es_fin_de_semana": es_fin_de_semana,
            "velocidad_kmh": velocidad_kmh,
            "comercio_nuevo": comercio_nuevo,
            "dispositivo_confiable": dispositivo_confiable,
            "tx_ultimos_10_min": tx_ultimos_10_min,
            "tipo_movimiento": tipos,
            "canal": canales,
            "es_fraude": es_fraude,
        }
    )


def main():
    print("=" * 60)
    print("ENTRENAMIENTO IA HÍBRIDA TRIDA (RANDOM FOREST + 7 FACTORES)")
    print("=" * 60)

    df_real = cargar_datos_reales()
    df_sint = generar_dataset_calibrado(n_samples=3000)
    df = pd.concat([df_real, df_sint], ignore_index=True)

    print(f"✓ Registros reales cargados desde PostgreSQL: {len(df_real)}")
    print(f"✓ Registros totales de entrenamiento: {len(df)}")
    print("Distribución de clases (0=Legítima, 1=Fraude):")
    print(df["es_fraude"].value_counts().to_string())

    X = df[FEATURES]
    y = df["es_fraude"].astype(int)

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
            ("num", "passthrough", NUMERIC_FEATURES),
        ]
    )

    rf = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )

    pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("model", rf)])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=42
    )

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    print("\nMATRIZ DE CONFUSIÓN:")
    print(confusion_matrix(y_test, y_pred))
    print("\nREPORTE DE CLASIFICACIÓN:")
    print(classification_report(y_test, y_pred, target_names=["Legítima", "Fraude"], zero_division=0))
    print(f"ROC-AUC Score: {roc_auc_score(y_test, y_prob):.4f}")

    os.makedirs("models", exist_ok=True)
    model_path = "models/random_forest_trida.joblib"
    joblib.dump(pipeline, model_path)
    print(f"\n✓ Modelo guardado exitosamente en: modulo-ia/{model_path}")


if __name__ == "__main__":
    main()
