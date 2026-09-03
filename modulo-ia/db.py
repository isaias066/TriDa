import psycopg2


def obtener_conexion():
    return psycopg2.connect(
        host="localhost",
        port=5433,
        database="TriDa",
        user="postgres",
        password="trida_secure_2026"
    )


if __name__ == "__main__":
    try:
        conexion = obtener_conexion()
        print("✅ Conexión exitosa con PostgreSQL")
        conexion.close()
    except Exception as e:
        print("❌ Error de conexión:")
        print(e)
        