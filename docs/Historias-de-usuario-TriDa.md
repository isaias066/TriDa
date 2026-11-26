# Historias de usuario TriDa

## Alcance y formato

Las historias describen objetivos de usuarios; los servicios externos que inician o colaboran en un flujo se documentan como actores secundarios en los casos de uso, no como perfiles del producto. Cada historia incluye precondiciones, criterios verificables, reglas, resultado e implementación. Todos los criterios usan **Dado / Cuando / Entonces**. Los endpoints y detalles de transporte se limitan a la sección de implementación. Las historias reflejan el comportamiento observado en el código; los requisitos de producto están documentados en [RF01-24](./RF01-24.md), [RNF01-14](./RNF01-14.md) y [Restricciones](./Restricciones.md).

## Descomposición para estimación

Estos cinco identificadores agrupan más de un objetivo y deben planificarse como historias hijas independientes, no estimarse como una sola unidad INVEST. Se conservan sus IDs para no romper la trazabilidad; cada subhistoria hereda las reglas de propiedad, validación y autorización de su agrupador.

| Subhistoria | Criterio de aceptación |
| --- | --- |
| HU-12.1 Consultar cuentas propias | Dadas cuentas registradas, cuando consulto la lista o un detalle, entonces solo recibo cuentas propias. |
| HU-12.2 Crear cuenta | Dados datos válidos, cuando creo una cuenta, entonces queda asociada a mi usuario. |
| HU-12.3 Editar cuenta | Dada una cuenta propia, cuando guardo cambios válidos, entonces se actualizan sus datos. |
| HU-12.4 Desactivar cuenta | Dada una cuenta propia, cuando la desactivo, entonces deja de estar activa y conserva su historial. |
| HU-13.1 Consultar categorías | Dado que estoy autenticado, cuando consulto categorías, entonces veo las del sistema y las propias. |
| HU-13.2 Crear categoría | Dados datos válidos, cuando creo una categoría personal, entonces queda disponible para clasificar movimientos. |
| HU-13.3 Editar categoría | Dada una categoría personal, cuando guardo cambios válidos, entonces se actualizan sus datos. |
| HU-13.4 Desactivar categoría personal | Dada una categoría personal, cuando la desactivo, entonces se preserva el historial y deja de estar disponible. |
| HU-20.1 Consultar alertas propias | Dado que estoy autenticado, cuando consulto alertas, entonces solo recibo mis resultados y conteos. |
| HU-20.2 Resolver alerta propia | Dada una alerta propia pendiente, cuando registro una decisión permitida, entonces queda resuelta con la acción correspondiente. |
| HU-22.1 Crear meta | Dados un nombre y un objetivo válidos, cuando creo una meta, entonces queda activa. |
| HU-22.2 Actualizar meta | Dada una meta propia, cuando envío cambios permitidos, entonces se guardan y la actualización no queda vacía. |
| HU-22.3 Eliminar meta | Dada una meta propia, cuando la elimino, entonces deja de estar disponible. |
| HU-31.1 Consultar dispositivos | Dado que estoy autenticado, cuando consulto mis dispositivos, entonces recibo únicamente los registros propios. |
| HU-31.2 Registrar dispositivo | Dado un identificador nuevo o ya registrado para mí, cuando registro el dispositivo, entonces se asocia o actualiza sin duplicarlo. |
| HU-31.3 Actualizar confianza | Dado un dispositivo propio, cuando actualizo su confianza, entonces solo cambia ese registro. |
| HU-31.4 Eliminar dispositivo | Dado un dispositivo propio, cuando lo elimino, entonces deja de estar disponible en mi cuenta. |

Las rutas de implementación para cada subhistoria se heredan de su HU agrupadora y se detallan en la matriz HU↔CU↔endpoint del índice.

## HU-01 — Registrar usuario

- **Actor:** Usuario nuevo.
- **Historia:** Como usuario nuevo, quiero crear una cuenta con mis datos para acceder a las funciones de TriDa.
- **Precondiciones:** No requiere sesión. En producción, SMTP debe estar configurado.
- **Criterios de aceptación:**
  - Dado un registro válido, cuando lo envío, entonces TriDa crea el usuario y el perfil financiero.
  - Dado un registro en producción, cuando se crea el usuario, entonces queda pendiente de verificación y se envía un enlace.
- **Reglas y errores:** En producción, la falta de SMTP impide el registro. Si falla el envío después de insertar al usuario, puede quedar pendiente de verificación. Para correos existentes se usa una respuesta genérica; en producción se reenvía verificación si la cuenta sigue pendiente. Fuera de producción no se envía correo y la cuenta se crea verificada; en desarrollo, la respuesta aún puede indicar que se requiere verificación.
- **Resultado:** El usuario queda creado; en producción debe completar HU-02 antes de iniciar sesión.
- **Implementación:** `POST /api/v2/auth/register`; `backend/src/modules/auth/`.

## HU-02 — Verificar correo

- **Actor:** Usuario con cuenta pendiente.
- **Historia:** Como usuario registrado, quiero verificar mi correo para habilitar el inicio de sesión.
- **Precondiciones:** Cuenta pendiente y token recibido por correo, vigente por 15 minutos.
- **Criterios de aceptación:**
  - Dado un token vigente, cuando solicito verificar mi correo, entonces TriDa marca el correo como verificado.
  - Dado un token inválido o expirado, cuando intento verificarlo, entonces TriDa rechaza la operación.
- **Reglas y errores:** El token debe corresponder al usuario y al correo; un token no válido no verifica la cuenta.
- **Resultado:** La cuenta queda verificada si el token se acepta.
- **Implementación:** `POST /api/v2/auth/verify-email`; módulo `auth`.

## HU-03 — Iniciar sesión

- **Actor:** Usuario.
- **Historia:** Como usuario, quiero iniciar sesión para acceder a mis datos y operaciones protegidas.
- **Precondiciones:** Cuenta activa, contraseña correcta y correo verificado en producción.
- **Criterios de aceptación:**
  - Dado que mis credenciales son válidas, cuando inicio sesión, entonces recibo un JWT para las rutas protegidas.
  - Dado un correo existente con contraseña incorrecta, cuando fallo tres veces, entonces la cuenta se bloquea por una hora.
- **Reglas y errores:** Las credenciales incorrectas o una cuenta bloqueada impiden iniciar sesión. Un correo sin cuenta no registra un intento asociado a un usuario.
- **Resultado:** Se crea una sesión autenticada; por defecto, el JWT vence a las ocho horas.
- **Implementación:** `POST /api/v2/auth/login`; módulos `auth` y limitadores de autenticación.

## HU-04 — Cerrar sesión

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero cerrar mi sesión para impedir que se sigan usando mis tokens actuales.
- **Precondiciones:** JWT válido.
- **Criterios de aceptación:**
  - Dado un JWT válido, cuando cierro sesión, entonces las solicitudes posteriores con ese token dejan de estar autenticadas.
- **Reglas y errores:** Si la solicitud no está autenticada, se rechaza; el cliente elimina sus credenciales locales al terminar el flujo. La invalidación se implementa en el servidor mediante la versión de sesión del usuario.
- **Resultado:** Los tokens anteriores dejan de ser válidos al comprobarse la versión del usuario.
- **Implementación:** `POST /api/v2/auth/logout`; módulo `auth`.

## HU-05 — Solicitar recuperación de contraseña

- **Actor:** Usuario que no puede iniciar sesión.
- **Historia:** Como usuario, quiero solicitar un enlace de recuperación para restablecer mi contraseña.
- **Precondiciones:** SMTP habilitado y configurado; correo con formato válido.
- **Criterios de aceptación:**
  - Dado un correo, cuando solicito la recuperación, entonces recibo el mismo mensaje genérico exista o no la cuenta.
  - Dado que la cuenta existe, cuando proceso la solicitud, entonces TriDa genera un enlace y solicita el envío del correo.
- **Reglas y errores:** Si SMTP está deshabilitado o incompleto, la solicitud se rechaza; el envío del mensaje es asíncrono y sus fallos posteriores se registran en el backend. Se aplica límite de solicitudes.
- **Resultado:** Si existe la cuenta y el correo se entrega, el usuario recibe el enlace; la contraseña no cambia todavía.
- **Implementación:** `POST /api/v2/auth/forgot-password`; módulo `auth`.

## HU-06 — Validar token de recuperación

- **Actor:** Usuario con enlace de recuperación.
- **Historia:** Como usuario, quiero comprobar que mi enlace sigue vigente antes de cambiar la contraseña.
- **Precondiciones:** Disponer del token incluido en el enlace.
- **Criterios de aceptación:**
  - Dado un token válido, cuando lo envío, entonces TriDa confirma que puede continuar el flujo sin cambiar la contraseña.
  - Dado un token inválido, expirado o utilizado, cuando intento validar el enlace, entonces TriDa rechaza la solicitud.
- **Reglas y errores:** El cuerpo debe incluir un token no vacío; una solicitud inválida se rechaza.
- **Resultado:** Solo se valida la posibilidad de restablecer; no se modifican las credenciales.
- **Implementación:** `POST /api/v2/auth/verify-reset-token`; módulo `auth`.

## HU-07 — Restablecer contraseña

- **Actor:** Usuario con token de recuperación.
- **Historia:** Como usuario, quiero establecer una contraseña nueva usando un token vigente para recuperar el acceso.
- **Precondiciones:** Token válido y contraseña nueva de 12 a 72 caracteres, con mayúscula, minúscula y carácter especial.
- **Criterios de aceptación:**
  - Dado un token vigente y una contraseña válida, cuando envío el cambio, entonces TriDa almacena el hash nuevo.
  - Dado un token inválido o expirado, cuando intento cambiar la contraseña, entonces TriDa rechaza la operación.
- **Reglas y errores:** La contraseña nueva se valida nuevamente en el servidor y las sesiones anteriores se invalidan.
- **Resultado:** El token de recuperación deja de ser utilizable y los JWT de sesiones anteriores quedan invalidados.
- **Implementación:** `POST /api/v2/auth/reset-password`; módulo `auth`.

## HU-08 — Cambiar contraseña autenticado

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario con sesión, quiero cambiar mi contraseña para proteger mi cuenta.
- **Precondiciones:** JWT válido y conocimiento de la contraseña actual.
- **Criterios de aceptación:**
  - Dado que la contraseña actual es correcta y la nueva cumple la política, cuando envío el cambio, entonces TriDa actualiza su hash.
  - Dado que la contraseña actual no coincide, cuando intento cambiarla, entonces TriDa rechaza el cambio.
- **Reglas y errores:** La contraseña actual debe coincidir; al cambiarla, las sesiones anteriores se invalidan.
- **Resultado:** La contraseña nueva queda activa y los tokens de sesiones anteriores dejan de ser válidos.
- **Implementación:** `POST /api/v2/auth/change-password`; módulo `auth`.

## HU-09 — Consultar perfil propio

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero consultar mis datos de perfil para revisar la información asociada a mi cuenta.
- **Precondiciones:** JWT válido.
- **Criterios de aceptación:**
  - Dado que estoy autenticado, cuando solicito mi perfil, entonces TriDa devuelve únicamente los datos de mi usuario.
- **Reglas y errores:** El acceso sin JWT válido se rechaza.
- **Resultado:** La consulta no modifica el perfil.
- **Implementación:** `GET /api/v2/profile` y `GET /api/v2/auth/me`.

## HU-10 — Actualizar perfil propio

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero actualizar mi nombre o teléfono para mantener mi perfil al día.
- **Precondiciones:** JWT válido y al menos un campo permitido para actualizar.
- **Criterios de aceptación:**
  - Dado un nombre o teléfono válido, cuando envío la actualización, entonces TriDa persiste los campos admitidos.
  - Dado un cuerpo vacío o con campos no permitidos, cuando intento actualizar mi perfil, entonces la solicitud se rechaza.
- **Reglas y errores:** Solo se actualizan los campos permitidos por el esquema; no se cambian correo ni rol mediante esta operación.
- **Resultado:** El perfil devuelve los nuevos datos guardados.
- **Implementación:** `PATCH /api/v2/profile` y `PATCH /api/v2/auth/me`.

## HU-11 — Consultar patrón financiero

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero consultar estadísticas de mi comportamiento financiero para entender mis hábitos.
- **Precondiciones:** JWT válido; el historial puede estar vacío.
- **Criterios de aceptación:**
  - Dado que solicito mi patrón, cuando TriDa procesa la consulta, entonces calcula las estadísticas con mis transacciones confirmadas o aprobadas.
  - Dado que no tengo transacciones confirmadas o aprobadas, cuando consulto mi patrón, entonces recibo métricas en cero y una lista vacía de categorías frecuentes.
- **Reglas y errores:** La consulta solo usa transacciones del usuario autenticado y no modifica datos.
- **Resultado:** Se presenta un resumen calculado en el momento a partir del historial propio; no depende de que exista un registro previo de patrón.
- **Reglas y errores:** `APROBADA` es un estado admitido por el esquema y por las consultas, pero la creación actual no lo asigna. Si una alerta se resuelve sobre un movimiento preexistente `APROBADA`, el servicio lo normaliza a `CONFIRMADA`; la evaluación de riesgo aprobada crea directamente movimientos `CONFIRMADA`.
- **Implementación:** `GET /api/v2/profile/behavior-pattern`; módulo `profile`.

## HU-12 — Gestionar cuentas financieras

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero consultar, crear, editar y desactivar mis cuentas financieras para organizar mis saldos.
- **Precondiciones:** JWT válido; una cuenta que se edita o desactiva debe pertenecer al usuario.
- **Criterios de aceptación:**
  - Dado que tengo cuentas registradas, cuando consulto la lista o un detalle, entonces TriDa devuelve solo mis cuentas.
  - Dado un formulario válido, cuando creo o actualizo una cuenta, entonces el cambio queda asociado a mi usuario.
  - Dado que una cuenta me pertenece, cuando la elimino, entonces deja de estar activa y conserva su historial.
- **Reglas y errores:** Se validan tipo, nombre y datos permitidos; los errores de propiedad o validación rechazan la operación.
- **Resultado:** La cuenta creada/editada queda guardada; una desactivada deja de estar activa.
- **Implementación:** `GET/POST/PATCH/DELETE /api/v2/accounts`; módulo `account` (cuentas).

## HU-13 — Gestionar categorías

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero consultar y mantener mis categorías para clasificar ingresos, gastos y ahorros.
- **Precondiciones:** JWT válido; solo se modifican categorías personales disponibles.
- **Criterios de aceptación:**
  - Dado que estoy autenticado, cuando consulto las categorías, entonces veo las del sistema y las propias.
  - Dado datos válidos para una categoría personal, cuando la creo o edito, entonces TriDa guarda el cambio.
  - Dado que una categoría pertenece al sistema, cuando intento eliminarla, entonces TriDa conserva la categoría.
- **Reglas y errores:** Los tipos son `INGRESO`, `GASTO` y `AHORRO`; eliminar una categoría personal la desactiva, preservando el historial.
- **Resultado:** Las categorías personales quedan actualizadas y las predeterminadas protegidas.
- **Implementación:** `GET/POST/PATCH/DELETE /api/v2/categories`; módulo `categories`.

## HU-14 — Consultar transacciones

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero consultar y filtrar mis movimientos para revisar mi actividad financiera.
- **Precondiciones:** JWT válido.
- **Criterios de aceptación:**
  - Dado que estoy autenticado, cuando consulto la lista con filtros admitidos, entonces TriDa devuelve solo mis movimientos coincidentes.
  - Dado un identificador de un movimiento propio, cuando consulto su detalle, entonces TriDa devuelve la información de ese movimiento.
  - Dado que ningún movimiento coincide con la consulta, cuando solicito la lista, entonces recibo una lista vacía.
- **Reglas y errores:** Se validan filtros e identificadores; no se muestran movimientos de otros usuarios.
- **Resultado:** La consulta no altera transacciones.
- **Implementación:** `GET /api/v2/transactions` y `GET /api/v2/transactions/{id}`.

## HU-15 — Registrar transacción manual

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero registrar un movimiento manual para mantener actualizado mi historial financiero.
- **Precondiciones:** JWT válido; cuenta propia, activa y de tipo `EFECTIVO`.
- **Criterios de aceptación:**
  - Dado un monto y tipo válidos, cuando registro el movimiento, entonces TriDa evalúa su riesgo y lo guarda.
  - Dado que indico una categoría, cuando envío el movimiento, entonces TriDa acepta la categoría solo si está activa, disponible para mí y coincide con el tipo.
  - Dado que la evaluación de riesgo determina que se requiere revisión, cuando TriDa guarda el movimiento, entonces crea una alerta asociada.
- **Reglas y errores:** El microservicio Python evalúa el riesgo; si no responde, se usa respaldo heurístico local. No se aceptan fechas manuales futuras.
- **Resultado:** El movimiento y, si aplica, la alerta quedan persistidos; el saldo cambia únicamente cuando el movimiento queda confirmado.
- **Implementación:** `POST /api/v2/transactions`; `transactions.service.ts` y `alerts/risk.service.ts`.

## HU-16 — Resolver movimiento pendiente

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero confirmar o rechazar un movimiento pendiente para indicar si lo reconozco.
- **Precondiciones:** JWT válido; el movimiento existe, me pertenece y sigue pendiente.
- **Criterios de aceptación:**
  - Dado un movimiento pendiente que no sea un gasto automático de webhook, cuando lo confirmo o rechazo, entonces TriDa guarda la decisión.
  - Dado que confirmo un movimiento pendiente, cuando la decisión se guarda, entonces TriDa actualiza el saldo de las cuentas afectadas y resuelve las alertas pendientes asociadas.
- **Reglas y errores:** Solo se aceptan estados `CONFIRMADA` y `RECHAZADA`; resolver un movimiento ya resuelto genera conflicto.
- **Resultado:** El movimiento queda resuelto; no puede volver a resolverse como pendiente.
- **Implementación:** `PATCH /api/v2/transactions/{id}/status`.

## HU-17 — Categorizar transacción

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero asignar, cambiar o quitar la categoría de un movimiento para mantener clasificados mis registros.
- **Precondiciones:** JWT válido; movimiento propio y categoría disponible cuando se asigna.
- **Criterios de aceptación:**
  - Dado un movimiento categorizable, cuando asigno una categoría compatible, entonces TriDa la guarda.
  - Dado que un movimiento tiene una categoría, cuando solicito quitarla, entonces TriDa deja el movimiento sin categoría.
- **Reglas y errores:** La categoría debe estar activa, ser propia o del sistema y coincidir con el tipo de movimiento; las transferencias no se categorizan.
- **Resultado:** La categoría queda actualizada o eliminada sin alterar otros datos del movimiento.
- **Implementación:** `PATCH /api/v2/transactions/{id}/category`.

## HU-18 — Registrar movimientos recibidos automáticamente

- **Actor:** Usuario beneficiario del registro automático; la fuente externa inicia técnicamente el flujo.
- **Historia:** Como usuario, quiero que TriDa registre automáticamente los movimientos recibidos de una fuente autorizada para mantener actualizado mi historial financiero.
- **Precondiciones:** Secreto de webhook configurado; firma HMAC del cuerpo y timestamp dentro de la ventana permitida. Una transferencia requiere dos cuentas activas y distintas del mismo usuario.
- **Criterios de aceptación:**
  - Dado un evento válido de una fuente autorizada, cuando TriDa recibe el evento, entonces lo evalúa y registra.
  - Dado un evento ya procesado con los mismos datos, cuando la fuente lo reintenta, entonces TriDa devuelve el movimiento existente sin crear otro.
  - Dado que el evento representa un gasto, cuando TriDa lo registra, entonces queda pendiente hasta que el usuario responda al enlace de confirmación.
- **Reglas y errores:** Un identificador externo repetido con otros datos se rechaza. Si SMTP no está configurado, el gasto se rechaza antes de crear el movimiento; si falla el envío después de guardarlo, el movimiento permanece pendiente y el fallo se informa. La evaluación de riesgo usa IA y, si no está disponible, respaldo heurístico local.
- **Resultado:** El evento queda asociado al usuario de la cuenta y protegido contra duplicados.
- **Implementación:** `POST /api/v2/integrations/transactions/webhook`; módulo `transactions`, ruta de integración y middleware HMAC.

## HU-19 — Confirmar gasto desde correo

- **Actor:** Usuario que recibió el correo de confirmación.
- **Historia:** Como usuario, quiero indicar si reconozco un gasto externo para que TriDa aplique mi decisión.
- **Precondiciones:** Gasto externo pendiente y token válido, con vigencia de 15 minutos.
- **Criterios de aceptación:**
  - Dado un token vigente, cuando consulto el enlace, entonces veo el gasto sin consumir la oportunidad de responder.
  - Dado un gasto pendiente, cuando elijo “Fui yo”, entonces el gasto queda confirmado y el saldo se actualiza.
  - Dado un gasto pendiente, cuando elijo “No fui yo”, entonces el gasto queda rechazado y se crea o eleva una alerta crítica.
- **Reglas y errores:** Solo se admite una decisión; repetir la resolución del gasto se rechaza, incluso si se repite la misma decisión. Si falla el correo de alerta crítica, el rechazo y la alerta quedan registrados y el fallo de notificación se informa.
- **Resultado:** La decisión queda guardada y el token no vuelve a resolver el movimiento.
- **Implementación:** `GET/POST /api/v2/transactions/email-confirmation`.

## HU-20 — Consultar y resolver alertas

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero revisar y resolver mis alertas para atender movimientos de riesgo.
- **Precondiciones:** JWT válido; la alerta que se resuelve debe pertenecer al usuario y estar pendiente.
- **Criterios de aceptación:**
  - Dado que estoy autenticado, cuando consulto alertas, entonces puedo listar, filtrar, ver detalle y consultar conteos por severidad de mis alertas.
  - Dado que una alerta propia está pendiente, cuando la resuelvo con una acción permitida, entonces TriDa guarda el estado y la acción correspondientes.
  - Dado que una alerta ya fue resuelta con la misma decisión, cuando repito esa decisión, entonces TriDa devuelve el resultado existente sin repetir sus efectos.
- **Reglas y errores:** “Fui yo” corresponde a descartar la alerta; “No fui yo” o “Bloquear tarjeta” la confirma. La resolución puede actualizar transacción, saldos y auditoría; una decisión distinta sobre una alerta resuelta se rechaza. Esta repetición idempotente corresponde a alertas, no a la confirmación de transacciones de HU-16/HU-19.
- **Resultado:** La alerta queda registrada con la acción del usuario; consultas no modifican datos.
- **Implementación:** `GET /api/v2/alerts`, `GET /api/v2/alerts/{id}`, `GET /api/v2/alerts/counts-by-level`, `PATCH /api/v2/alerts/{id}/status`.

## HU-21 — Gestionar presupuestos

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero crear y mantener límites mensuales de gasto por categoría para controlar mis finanzas.
- **Precondiciones:** JWT válido; categoría activa propia o del sistema de tipo `GASTO` para crear.
- **Criterios de aceptación:**
  - Dado un límite positivo, un mes válido, un año admitido y una categoría válida, cuando creo un presupuesto, entonces queda asociado a esa categoría y periodo.
  - Dado un presupuesto propio, cuando actualizo su límite, entonces TriDa guarda el nuevo valor.
  - Dado un presupuesto propio, cuando lo elimino, entonces deja de estar disponible.
- **Reglas y errores:** La consulta puede filtrar por cuenta, mes y año; no se acepta una categoría no válida o de otro usuario.
- **Resultado:** La lista presenta los presupuestos propios con su gasto calculado.
- **Implementación:** `GET/POST /api/v2/budgets` y `PATCH/DELETE /api/v2/budgets/{id}`.

## HU-22 — Gestionar metas de ahorro

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero crear y mantener metas de ahorro para visualizar objetivos y progreso.
- **Precondiciones:** JWT válido; para editar o eliminar, la meta debe pertenecer al usuario.
- **Criterios de aceptación:**
  - Dado un nombre y un objetivo positivo, cuando creo una meta, entonces queda activa.
  - Dado que incluyo un aporte inicial no negativo, cuando creo la meta, entonces TriDa registra el aporte si es mayor que cero.
  - Dado que incluyo una fecha límite, cuando creo o actualizo la meta, entonces TriDa la acepta solo si no es anterior a hoy.
  - Dado que una meta me pertenece, cuando actualizo nombre, objetivo, fecha límite o estado, entonces TriDa guarda los campos válidos y rechaza una actualización vacía.
- **Reglas y errores:** No existe campo de categoría en este flujo. Si el saldo inicial alcanza el objetivo, la meta se marca completada.
- **Resultado:** La meta queda creada, actualizada o eliminada y muestra su progreso.
- **Implementación:** `GET/POST /api/v2/savings`, `PATCH/DELETE /api/v2/savings/{id}`.

## HU-23 — Aportar a una meta

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero registrar aportes a una meta activa para aumentar su progreso.
- **Precondiciones:** JWT válido; meta propia y activa; aporte de al menos `1000`.
- **Criterios de aceptación:**
  - Dado un aporte válido a una meta activa propia, cuando lo registro, entonces queda asociado a la meta.
  - Dado que el nuevo acumulado alcanza el objetivo, cuando TriDa registra el aporte, entonces la meta pasa a completada.
- **Reglas y errores:** No se permiten aportes a metas pausadas, canceladas o completadas; la operación se ejecuta transaccionalmente.
- **Resultado:** El monto acumulado y el porcentaje de progreso reflejan el aporte.
- **Implementación:** `POST /api/v2/savings/{id}/funds`.

## HU-24 — Consultar dashboard

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero ver un resumen financiero para revisar rápidamente mi actividad.
- **Precondiciones:** JWT válido.
- **Criterios de aceptación:**
  - Dado que estoy autenticado, cuando abro el dashboard, entonces puedo consultar estadísticas, alertas recientes, movimientos recientes y consejos.
  - Dado que elijo un periodo admitido o una cuenta propia, cuando solicito las estadísticas, entonces TriDa aplica esos filtros.
- **Reglas y errores:** Los periodos admitidos son 30, 90, 180 o 365 días. Sin datos, las estadísticas muestran totales numéricos en cero y las colecciones sin elementos; un fallo del servicio se informa como error y no como una consulta exitosa vacía.
- **Resultado:** La consulta no modifica movimientos.
- **Implementación:** Endpoints `GET /api/v2/dashboard/stats`, `/recent-alerts`, `/recent-transactions` y `/advice`.

## HU-25 — Marcar consejo como leído

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero marcar un consejo como leído para mantener actualizado mi panel.
- **Precondiciones:** JWT válido y consejo perteneciente al usuario.
- **Criterios de aceptación:**
  - Dado un consejo propio, cuando lo marco como leído, entonces TriDa actualiza su estado.
  - Dado que el consejo ya estaba leído, cuando vuelvo a marcarlo, entonces conserva ese estado.
- **Reglas y errores:** Un consejo inexistente o ajeno al usuario no se modifica.
- **Resultado:** El consejo queda registrado como leído para su propietario.
- **Implementación:** `PATCH /api/v2/dashboard/advice/{id}/read`.

## HU-26 — Consultar insights

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero obtener insights de mis movimientos para entender tendencias y recibir recomendaciones.
- **Precondiciones:** JWT válido; puede no haber movimientos en el periodo.
- **Criterios de aceptación:**
  - Dado un periodo válido, cuando consulto insights, entonces recibo indicadores, categorías/comercios y recomendaciones disponibles.
  - Dado que la solicitud al servicio de IA falla o vence, cuando TriDa genera las recomendaciones, entonces utiliza las reglas locales de respaldo y conserva los indicadores calculados por el backend.
- **Reglas y errores:** `periodo_dias` está entre 7 y 365 (por defecto 30); puede filtrarse por cuenta. Los errores de consulta no deben presentarse como un resumen exitoso inventado.
- **Resultado:** Se devuelve un resumen calculado sin modificar transacciones.
- **Implementación:** `GET /api/v2/insights`; módulo `insights`.

## HU-27 — Analizar mensaje o enlace

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero analizar un mensaje o enlace para identificar señales de riesgo.
- **Precondiciones:** JWT válido y microservicio Python disponible.
- **Criterios de aceptación:**
  - Dado un texto de 3 a 2000 caracteres, cuando solicito el análisis, entonces TriDa lo envía al microservicio y devuelve su resultado.
  - Dado que el servicio no responde correctamente, cuando solicito el análisis, entonces TriDa informa el fallo en vez de fabricar un resultado.
- **Reglas y errores:** El análisis tiene un timeout de 1.5 segundos; si el servicio falla o devuelve una respuesta no exitosa, TriDa informa el fallo. No se guarda un registro persistente de análisis.
- **Resultado:** Se devuelve el análisis del texto, hallazgos y guía recibidos del microservicio.
- **Implementación:** `POST /api/v2/insights/scan-message`; backend `insights.controller.ts`, servicio `modulo-ia`.

## HU-28 — Consultar resumen y desglose financiero

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero consultar totales y desglose por categoría para analizar mis finanzas en un periodo.
- **Precondiciones:** JWT válido; filtros temporales opcionales válidos.
- **Criterios de aceptación:**
  - Dado un periodo, cuando solicito el resumen, entonces recibo indicadores financieros de mis movimientos.
  - Dado filtros admitidos, cuando solicito el desglose por categoría, entonces recibo los totales agrupados según esos filtros.
- **Reglas y errores:** Se puede filtrar por fechas y cuenta; el desglose acepta tipo de movimiento. La respuesta se usa para visualización, no implica generar un archivo.
- **Resultado:** Los reportes se calculan sobre datos del usuario autenticado y no los modifican.
- **Implementación:** `GET /api/v2/reports/summary` y `GET /api/v2/reports/by-category`.

## HU-29 — Consultar reporte de movimientos

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero obtener los movimientos de un periodo para revisarlos o usarlos en un reporte.
- **Precondiciones:** JWT válido; filtros opcionales válidos.
- **Criterios de aceptación:**
  - Dado un periodo o cuenta, cuando solicito el reporte, entonces recibo movimientos propios y el total indicado por el servicio.
  - Dado que la consulta alcanza el límite de resultados, cuando recibo el reporte, entonces la respuesta indica si los elementos fueron truncados.
- **Reglas y errores:** Admite filtros de fecha, cuenta y tipo; es una respuesta JSON y no genera por sí misma un CSV descargable.
- **Resultado:** La consulta no modifica los movimientos.
- **Implementación:** `GET /api/v2/reports/transactions`.

## HU-30 — Consultar mapa de movimientos

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero consultar estadísticas y ubicaciones de mis movimientos para explorarlos en un mapa.
- **Precondiciones:** JWT válido; puede no haber movimientos geolocalizados.
- **Criterios de aceptación:**
  - Dado que estoy autenticado, cuando abro el mapa, entonces puedo consultar estadísticas geográficas y ubicaciones disponibles.
  - Dado filtros admitidos, cuando consulto las ubicaciones, entonces los resultados corresponden únicamente a mis transacciones.
  - Dado que la consulta no encuentra ubicaciones, cuando se muestra el mapa, entonces no aparecen marcadores de movimientos.
- **Reglas y errores:** Las ubicaciones admiten filtros de cuenta, fecha, riesgo, estado y límite; el navegador obtiene los tiles del proveedor de mapas.
- **Resultado:** La consulta no altera transacciones ni ubicaciones.
- **Implementación:** `GET /api/v2/map/stats`, `/locations`; interfaz de mapa y proveedor de tiles configurado.

## HU-31 — Gestionar dispositivos

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero registrar y administrar mis dispositivos para reconocer los equipos asociados a mi cuenta.
- **Precondiciones:** JWT válido; un dispositivo modificado o eliminado debe pertenecer al usuario.
- **Criterios de aceptación:**
  - Dado un identificador nuevo, cuando registro el dispositivo, entonces queda asociado a mi cuenta.
  - Dado que ya existe un dispositivo propio con ese identificador, cuando vuelvo a registrarlo, entonces TriDa actualiza el registro existente sin duplicarlo.
  - Dado que un dispositivo me pertenece, cuando actualizo su confianza o lo elimino, entonces solo se afecta ese registro.
- **Reglas y errores:** Se validan los datos y la unicidad del identificador por usuario.
- **Resultado:** El dispositivo queda registrado, actualizado, confiable o eliminado según la operación.
- **Implementación:** `GET/POST /api/v2/devices`, `GET/DELETE /api/v2/devices/{id}` y `PATCH /api/v2/devices/{id}/trust`.

## HU-32 — Consultar auditoría propia

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero consultar el historial de acciones de mi cuenta para revisar actividad registrada.
- **Precondiciones:** JWT válido.
- **Criterios de aceptación:**
  - Dado que estoy autenticado, cuando consulto el historial, entonces recibo mis eventos en orden descendente.
  - Dado valores válidos de paginación, cuando solicito la página siguiente, entonces recibo los eventos anteriores a la última página.
- **Reglas y errores:** `limit` va de 1 a 50, por defecto 20; no se exponen direcciones IP y no se permiten modificaciones ni eliminaciones.
- **Resultado:** El historial solo se consulta; la paginación indica si hay más eventos.
- **Implementación:** `GET /api/v2/audit`; módulo `audit`.

## HU-33 — Preparar exportación anual

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero preparar una exportación de movimientos antiguos para revisar qué datos podrían purgarse.
- **Precondiciones:** JWT válido.
- **Criterios de aceptación:**
  - Dado que estoy autenticado, cuando preparo la exportación, entonces TriDa selecciona movimientos anteriores al corte anual, en estado final y sin alertas pendientes.
  - Dado que hay movimientos elegibles, cuando preparo la exportación, entonces se crea una exportación temporal con vencimiento.
  - Dado que no hay movimientos elegibles, cuando preparo la exportación, entonces recibo un total de cero y no se crea una exportación descargable.
- **Reglas y errores:** Se consideran elegibles movimientos `CONFIRMADA`, `APROBADA` o `RECHAZADA`, sin alertas pendientes. La creación actual no asigna `APROBADA`, aunque el servicio de alertas reconoce registros preexistentes y puede normalizarlos a `CONFIRMADA`. Preparar la exportación no elimina movimientos.
- **Resultado:** Se genera una exportación temporal propiedad del usuario.
- **Implementación:** `POST /api/v2/transactions/archive/prepare`.

## HU-34 — Descargar CSV anual

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero descargar en CSV los movimientos incluidos en una exportación para conservar una copia antes de purgarlos.
- **Precondiciones:** Exportación propia, vigente y no purgada.
- **Criterios de aceptación:**
  - Dado un identificador de exportación válido, cuando solicito la descarga, entonces recibo el CSV UTF-8 de los movimientos preparados.
  - Dado que la exportación expiró o ya fue purgada, cuando solicito la descarga, entonces TriDa la rechaza.
- **Reglas y errores:** La descarga no borra movimientos; la exportación vence a los 30 minutos y puede descargarse mientras siga vigente y no haya sido purgada.
- **Resultado:** Se registra la descarga para permitir la purga posterior.
- **Implementación:** `POST /api/v2/transactions/archive/{exportId}/download`.

## HU-35 — Purgar movimientos exportados

- **Actor:** Usuario autenticado.
- **Historia:** Como usuario, quiero purgar los movimientos exportados después de descargar el CSV para mantener el historial operativo depurado.
- **Precondiciones:** Exportación propia y vigente; CSV descargado.
- **Criterios de aceptación:**
  - Dado que descargué el CSV, cuando confirmo la purga, entonces TriDa elimina únicamente los movimientos incluidos que todavía cumplen las condiciones de elegibilidad e informa cuántos omitió.
  - Dado que un movimiento cambia mientras se ejecuta la purga y ya no puede eliminarse de forma consistente, cuando TriDa detecta la condición, entonces revierte la operación y debo preparar una nueva exportación.
- **Reglas y errores:** Sin descarga previa o con la exportación vencida, la operación entra en conflicto. Los movimientos que ya no son elegibles se omiten, no obligan por sí solos a cancelar toda la purga. La purga no cambia los saldos actuales.
- **Resultado:** La eliminación y el registro de auditoría se realizan en la operación correspondiente.
- **Implementación:** `POST /api/v2/transactions/archive/{exportId}/purge`; módulo `transactions`.
