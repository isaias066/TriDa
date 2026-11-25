# Cuentas de ejemplo para probar TriDa

`database/seed_trida_bogota.sql` crea cuatro cuentas de usuario con perfiles y
movimientos financieros de ejemplo para recorrer las funciones de TriDa. Los
perfiles y las operaciones representan escenarios ficticios de Bogotá; no son
cuentas bancarias conectadas ni movimientos obtenidos de entidades financieras.

## Perfiles incluidos

| Usuario | Perfil | Correo de acceso | Ingreso mensual | Cuentas | Transacciones |
| --- | --- | --- | ---: | ---: | ---: |
| Valentina Camila Ortiz | Estudiante del SENA, con gastos de transporte y estudio | `valentina.cortiz@gmail.com` | $1.150.000 COP | 4 | 29 |
| Andrés Felipe Gutiérrez | Oficinista, con recorridos entre Chapinero y el Centro | `andresfelipe.gutierrez@outlook.com` | $5.200.000 COP | 4 | 30 |
| Jorge Eliécer Peña | Tendero de abarrotes, con compras mayoristas y ventas de mostrador | `jorgeeliecerramirez@hotmail.com` | $6.800.000 COP | 5 | 29 |
| Mariana Lucía Fernández | Usuario con perfil mixto de ingresos y gastos | `marianafernandez@gmail.com` | $3.400.000 COP | 4 | 27 |

Las contraseñas asociadas son credenciales de prueba. No se deben reutilizar en
otros entornos ni usar en producción.

## Datos disponibles en la aplicación

En conjunto, la semilla incluye 17 cuentas financieras, 115 transacciones, 57
categorías propias, 6 presupuestos, 3 metas de ahorro con aportes, 3 consejos y
2 alertas (una pendiente y otra resuelta). Las transacciones tienen fechas
relativas al momento de carga e incluyen ingresos, gastos, ahorros y
transferencias. También se incluyen patrones financieros, análisis, reportes
y registros de auditoría. Algunos movimientos tienen comercios y ubicaciones
de Bogotá.

Estos datos permiten probar, entre otras funciones:

- el resumen financiero y la actividad de cada cuenta;
- filtros y categorías de transacciones;
- presupuestos y metas de ahorro;
- alertas y niveles de riesgo;
- análisis, reportes y visualización de movimientos en el mapa.

## Carga de la semilla

Ejecuta los comandos desde la raíz del repositorio y solo contra una base local
o de pruebas aislada:

```powershell
psql -d TriDa -v ON_ERROR_STOP=1 -f database/schema.sql
psql -d TriDa -v ON_ERROR_STOP=1 -f database/seed_trida_bogota.sql
```

Si el esquema ya está instalado, ejecuta únicamente el segundo comando. La
semilla no es idempotente: ejecútala una sola vez por base de datos. No la
ejecutes en producción ni en una base con datos reales. Para volver a cargarla,
usa una base de pruebas nueva en lugar de mezclar estos registros con datos
existentes.

La aplicación no se conecta directamente a los bancos. Los nombres de entidades
y cuentas de esta semilla son datos ilustrativos para probar las pantallas.
