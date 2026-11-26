# Diagramas de casos de uso TriDa

El catálogo contiene 30 casos de uso: 11 diagramas PlantUML para flujos con relaciones o sistemas externos y 19 casos simples resumidos en tabla porque un óvalo aislado no aporta más información. Los bloques PlantUML incluyen el tema común de [plantuml-theme.puml](./plantuml-theme.puml); para verlos como diagramas, usa una extensión/visor PlantUML. Los actores humanos se muestran como figuras; los servicios externos se representan con rectángulos `<<system>>`, fuera del límite azul de TriDa. En casos de uso, un emisor externo puede iniciar el flujo; en historias, el usuario beneficiario sigue siendo el actor de producto. `<<include>>` representa comportamiento obligatorio y su flecha va del caso principal al incluido. `<<extend>>` representa comportamiento opcional o condicionado y su flecha va del caso que extiende hacia el caso base. Las validaciones y actualizaciones internas se describen en el flujo, no como objetivos autónomos del usuario.

| ID | Caso simple | Actor principal |
| --- | --- | --- |
| CU-02 | Verificar correo | Usuario |
| CU-03 | Iniciar sesión | Usuario |
| CU-04 | Cerrar sesión | Usuario autenticado |
| CU-06 | Validar token de recuperación | Usuario |
| CU-07 | Restablecer contraseña | Usuario |
| CU-08 | Cambiar contraseña | Usuario autenticado |
| CU-09 | Consultar o actualizar perfil | Usuario autenticado |
| CU-10 | Consultar patrón de comportamiento | Usuario autenticado |
| CU-11 | Gestionar cuentas | Usuario autenticado |
| CU-12 | Gestionar categorías | Usuario autenticado |
| CU-15 | Resolver o categorizar transacción | Usuario autenticado |
| CU-18 | Consultar y gestionar alertas | Usuario autenticado |
| CU-19 | Gestionar presupuestos | Usuario autenticado |
| CU-20 | Gestionar metas de ahorro | Usuario autenticado |
| CU-21 | Registrar aporte a meta | Usuario autenticado |
| CU-23 | Marcar consejo como leído | Usuario autenticado |
| CU-26 | Consultar reportes | Usuario autenticado |
| CU-28 | Gestionar dispositivos | Usuario autenticado |
| CU-29 | Consultar auditoría propia | Usuario autenticado |

## CU-01 — Registrar usuario

```plantuml
@startuml CU01_Crear_Cuenta
left to right direction
!include ./plantuml-theme.puml
actor "Usuario" as U
rectangle "Servicio SMTP\n<<system>>" as SMTP
rectangle "TriDa" {
  usecase "Registrar usuario" as CU01
  usecase "Enviar correo de verificación" as Enviar
}
U --> CU01
Enviar ..> CU01 : <<extend>> [solo en producción]
SMTP --> Enviar
@enduml
```

## CU-05 — Solicitar recuperación

```plantuml
@startuml CU05_Solicitar_Recuperacion
left to right direction
!include ./plantuml-theme.puml
actor "Usuario" as U
rectangle "Servicio SMTP\n<<system>>" as SMTP
rectangle "TriDa" {
  usecase "Solicitar recuperación" as CU05
  usecase "Enviar enlace de recuperación" as Enviar
}
U --> CU05
Enviar ..> CU05 : <<extend>> [la cuenta existe]
SMTP --> Enviar
@enduml
```

## CU-13 — Consultar transacciones

```plantuml
@startuml CU13_Consultar_Transacciones
left to right direction
!include ./plantuml-theme.puml
actor "Usuario autenticado" as U
rectangle "TriDa" {
  usecase "Consultar transacciones" as CU13
  usecase "Filtrar transacciones" as Filtrar
}
U --> CU13
Filtrar ..> CU13 : <<extend>> [el usuario envía filtros]
@enduml
```

## CU-14 — Registrar transacción manual

```plantuml
@startuml CU14_Registrar_Transaccion_Manual
left to right direction
!include ./plantuml-theme.puml
actor "Usuario autenticado" as U
rectangle "Microservicio IA Python\n<<system>>" as IA
rectangle "TriDa" {
  usecase "Registrar transacción manual" as CU14
  usecase "Evaluar riesgo" as EvaluarRiesgo
  usecase "Crear alerta" as CrearAlerta
  usecase "Usar evaluación heurística local" as Respaldo
}
U --> CU14
CU14 ..> EvaluarRiesgo : <<include>>
IA --> EvaluarRiesgo
CrearAlerta ..> EvaluarRiesgo : <<extend>> [requiere revisión]
Respaldo ..> EvaluarRiesgo : <<extend>> [IA no disponible]
@enduml
```

## CU-16 — Ingresar transacción por webhook

```plantuml
@startuml CU16_Ingresar_Transaccion_Webhook
left to right direction
!include ./plantuml-theme.puml
rectangle "Emisor externo\n<<system>>" as Emisor
rectangle "Microservicio IA Python\n<<system>>" as IA
rectangle "Servicio SMTP\n<<system>>" as SMTP
rectangle "TriDa" {
  usecase "Ingresar transacción por webhook" as CU16
  usecase "Evaluar riesgo" as Riesgo
  usecase "Usar evaluación heurística local" as Respaldo
  usecase "Enviar confirmación de gasto" as Confirmar
}
Emisor --> CU16
CU16 ..> Riesgo : <<include>>
IA --> Riesgo
Respaldo ..> Riesgo : <<extend>> [IA no disponible]
Confirmar ..> CU16 : <<extend>> [el movimiento es un gasto]
SMTP --> Confirmar
note right of CU16
El middleware valida HMAC antes del servicio
y el servicio devuelve duplicados sin recrearlos.
Para un gasto, SMTP debe estar configurado
antes de crear el movimiento.
end note
@enduml
```

## CU-17 — Confirmar gasto por correo

```plantuml
@startuml CU17_Confirmar_Gasto_Correo
left to right direction
!include ./plantuml-theme.puml
actor "Usuario" as U
rectangle "Servicio SMTP\n<<system>>" as SMTP
rectangle "TriDa" {
  usecase "Confirmar gasto por correo" as CU17
  usecase "Notificar alerta crítica" as Notificar
}
U --> CU17
Notificar ..> CU17 : <<extend>> [el usuario no reconoce el gasto]
SMTP --> Notificar
@enduml
```

## CU-22 — Consultar dashboard

```plantuml
@startuml CU22_Consultar_Dashboard
left to right direction
!include ./plantuml-theme.puml
actor "Usuario autenticado" as U
rectangle "TriDa" {
  usecase "Consultar dashboard" as CU22
  usecase "Consultar estadísticas" as Estadisticas
  usecase "Consultar alertas recientes" as Alertas
  usecase "Consultar transacciones recientes" as Transacciones
  usecase "Consultar consejos" as Consejos
}
U --> CU22
CU22 ..> Estadisticas : <<include>>
CU22 ..> Alertas : <<include>>
CU22 ..> Transacciones : <<include>>
CU22 ..> Consejos : <<include>>
@enduml
```

## CU-24 — Consultar insights

```plantuml
@startuml CU24_Consultar_Insights
left to right direction
!include ./plantuml-theme.puml
actor "Usuario autenticado" as U
rectangle "Microservicio IA Python\n<<system>>" as IA
rectangle "TriDa" {
  usecase "Consultar insights" as CU24
  usecase "Calcular resumen financiero" as Resumen
  usecase "Obtener consejos del microservicio" as ConsejosIA
  usecase "Generar consejos locales de respaldo" as ConsejosLocal
}
U --> CU24
CU24 ..> Resumen : <<include>>
ConsejosIA ..> CU24 : <<extend>> [microservicio disponible]
ConsejosLocal ..> CU24 : <<extend>> [sin respuesta del microservicio]
IA --> ConsejosIA
@enduml
```

## CU-25 — Analizar mensaje

```plantuml
@startuml CU25_Analizar_Mensaje
left to right direction
!include ./plantuml-theme.puml
actor "Usuario autenticado" as U
rectangle "Microservicio IA Python\n<<system>>" as IA
rectangle "TriDa" {
  usecase "Analizar mensaje" as CU25
}
U --> CU25
IA --> CU25
@enduml
```

## CU-27 — Consultar mapa de movimientos

```plantuml
@startuml CU27_Consultar_Mapa
left to right direction
!include ./plantuml-theme.puml
actor "Usuario autenticado" as U
rectangle "TriDa" {
  usecase "Consultar mapa de movimientos" as CU27
  usecase "Consultar estadísticas del mapa" as Estadisticas
  usecase "Consultar ubicaciones" as Ubicaciones
}
U --> CU27
CU27 ..> Estadisticas : <<include>>
CU27 ..> Ubicaciones : <<include>>
note right of CU27
El navegador solicita los tiles directamente
a OpenFreeMap; TriDa no los intermedia.
end note
@enduml
```

## CU-30 — Exportar y purgar transacciones antiguas

```plantuml
@startuml CU30_Exportar_Purgar_Transacciones
left to right direction
!include ./plantuml-theme.puml
actor "Usuario autenticado" as U
rectangle "TriDa" {
  usecase "Exportar y purgar transacciones antiguas" as CU30
  usecase "Preparar exportación anual" as Preparar
  usecase "Descargar CSV" as Descargar
  usecase "Purgar movimientos exportados" as Purgar
}
U --> CU30
CU30 ..> Preparar : <<include>>
Descargar ..> CU30 : <<extend>> [solicita descarga]
Purgar ..> Descargar : <<extend>> [CSV descargado y purga confirmada]
@enduml
```
