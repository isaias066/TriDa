<!--
  ¿Qué? Requisito funcional que describe la gestión de usuarios 
  y el control de acceso basado en roles.
  ¿Para qué? Definir cómo el administrador gestiona el ciclo de 
  vida de las cuentas de usuario y asigna roles con permisos 
  diferenciados que limitan el acceso a funciones y datos.
  ¿Impacto? Sin gestión de roles cualquier usuario accede a todas 
  las funciones del sistema, comprometiendo la seguridad, la 
  trazabilidad y el cumplimiento normativo.
-->

# RF-022 — Gestión de Usuarios y Control de Acceso por Roles

**Historias de usuario relacionadas:** HU-AD-01, HU-AU-06

## Descripción

El administrador del sistema debe poder crear, modificar, desactivar 
y eliminar cuentas de usuarios, asignando roles específicos con 
permisos diferenciados. Los roles definidos son: «Administrador del 
Sistema» (acceso total, configuración y gestión), «Analista de 
Seguridad» (revisar, validar y gestionar alertas), «Operador de 
Monitoreo» (solo visualización y escalado) y «Auditor» (acceso de 
solo lectura a registros e informes). Cada rol tiene un conjunto 
de permisos predefinido que limita el acceso a funciones y datos 
según la necesidad del cargo.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El administrador accede al módulo de gestión de usuarios. |
| 2 | El administrador selecciona la acción deseada: crear, modificar, desactivar o eliminar cuenta. |
| 3 | Si es creación, se ingresan los datos del usuario y se asigna el rol correspondiente. |
| 4 | Si es modificación, se actualizan los datos o el rol del usuario existente. |
| 5 | Si es desactivación, la cuenta queda inactiva pero se conservan los registros históricos. |
| 6 | Si es eliminación, se verifica que no existan dependencias activas antes de proceder. |
| 7 | El sistema aplica los permisos correspondientes al rol asignado. |
| 8 | La acción se registra en el módulo de auditoría (RF-015). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-127 | Solo el administrador del sistema puede gestionar cuentas de usuario. |
| RN-128 | Los roles definidos son: Administrador del Sistema, Analista de Seguridad, Operador de Monitoreo y Auditor. |
| RN-129 | Cada rol tiene un conjunto de permisos predefinido que no puede ser modificado por el usuario. |
| RN-130 | El Administrador tiene acceso total a configuración y gestión del sistema. |
| RN-131 | El Analista de Seguridad puede revisar, validar, clasificar y gestionar alertas. |
| RN-132 | El Operador de Monitoreo tiene acceso de solo visualización con capacidad de escalado. |
| RN-133 | El Auditor tiene acceso de solo lectura a registros, informes y auditoría. |
| RN-134 | Las cuentas desactivadas conservan sus registros históricos para trazabilidad. |
| RN-135 | Toda acción de gestión de usuarios debe registrarse en el módulo de auditoría. |
