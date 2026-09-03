import pandas as pd
import joblib
import psycopg2

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score


# ============================================
# CONFIGURACIÓN DE POSTGRESQL
# ============================================

DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "database": "TriDa",
    "user": "postgres",
    "password": "trida_secure_2026"
}


# ============================================
# CONECTAR A POSTGRESQL
# ============================================

print("=" * 60)
print("CONECTANDO A POSTGRESQL...")
print("=" * 60)

connection = psycopg2.connect(**DB_CONFIG)

print("✓ Conexión exitosa")


# ============================================
# OBTENER TRANSACCIONES
# ============================================

query = """
SELECT
    id_transaccion,
    id_cliente,
    id_dispositivo,
    id_ubicacion,
    id_banco,
    tipo_transaccion,
    monto,
    cuenta_origen,
    cuenta_destino,
    fecha_transaccion,
    score_riesgo,
    estado_transaccion,
    es_fraude_real,
    tiempo_de_procesamiento,
    moneda,
    canal
FROM trida.transacciones
ORDER BY id_transaccion;
"""

df = pd.read_sql(query, connection)

connection.close()


print("\n✓ Datos obtenidos desde PostgreSQL")
print(f"✓ Transacciones: {len(df)}")
print(f"✓ Columnas: {len(df.columns)}")


# ============================================
# DISTRIBUCIÓN DEL OBJETIVO
# ============================================

print("\nDistribución de fraude:")

print(
    df["es_fraude_real"]
    .value_counts()
)


# ============================================
# CREAR VARIABLES DE FECHA
# ============================================

df["fecha_transaccion"] = pd.to_datetime(
    df["fecha_transaccion"],
    errors="coerce"
)

df["hora"] = df["fecha_transaccion"].dt.hour

df["dia_semana"] = (
    df["fecha_transaccion"]
    .dt.dayofweek
)

df["es_fin_de_semana"] = (
    df["dia_semana"] >= 5
).astype(int)

df["es_madrugada"] = (
    (df["hora"] >= 0) &
    (df["hora"] < 6)
).astype(int)


# ============================================
# VARIABLES QUE USARÁ LA IA
# ============================================

features = [
    "monto",
    "tipo_transaccion",
    "hora",
    "dia_semana",
    "es_fin_de_semana",
    "es_madrugada",
    "tiempo_de_procesamiento",
    "moneda",
    "canal"
]

X = df[features]

y = df["es_fraude_real"].astype(int)


# ============================================
# PREPROCESAMIENTO
# ============================================

categorical_features = [
    "tipo_transaccion",
    "moneda",
    "canal"
]

numeric_features = [
    "monto",
    "hora",
    "dia_semana",
    "es_fin_de_semana",
    "es_madrugada",
    "tiempo_de_procesamiento"
]


preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        ),
        (
            "numeric",
            "passthrough",
            numeric_features
        )
    ]
)


# ============================================
# RANDOM FOREST
# ============================================

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=10,
    min_samples_leaf=2,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)


pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


# ============================================
# ENTRENAMIENTO / PRUEBA
# ============================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    stratify=y,
    random_state=42
)


print("\nDatos de entrenamiento:", len(X_train))
print("Datos de prueba:", len(X_test))

print("Fraudes entrenamiento:", y_train.sum())
print("Fraudes prueba:", y_test.sum())


# ============================================
# ENTRENAR
# ============================================

print("\n" + "=" * 60)
print("ENTRENANDO RANDOM FOREST...")
print("=" * 60)

pipeline.fit(X_train, y_train)

print("✓ Entrenamiento terminado")


# ============================================
# EVALUAR
# ============================================

y_pred = pipeline.predict(X_test)

y_probability = pipeline.predict_proba(X_test)[:, 1]


print("\n" + "=" * 60)
print("RESULTADOS")
print("=" * 60)

print("\nMATRIZ DE CONFUSIÓN:")
print(
    confusion_matrix(
        y_test,
        y_pred
    )
)

print("\nREPORTE:")
print(
    classification_report(
        y_test,
        y_pred,
        target_names=[
            "Legítima",
            "Fraude"
        ],
        zero_division=0
    )
)

print(
    f"\nROC-AUC: "
    f"{roc_auc_score(y_test, y_probability):.4f}"
)


# ============================================
# GUARDAR MODELO
# ============================================

joblib.dump(
    pipeline,
    "models/random_forest_trida.joblib"
)

print("\n✓ MODELO GUARDADO")
print(
    "models/random_forest_trida.joblib"
)

