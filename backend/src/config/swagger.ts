// ¿Qué? Especificación OpenAPI 3 de TriDa Backend v2.
// ¿Para qué? Documentar y probar todos los endpoints en /api/docs.

import swaggerJsdoc from "swagger-jsdoc";

const errorContentByStatus = {
  "400": {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
      examples: {
        validation: { $ref: "#/components/examples/ValidationError" },
        relation: { $ref: "#/components/examples/InvalidRelationError" },
        databaseRecord: { $ref: "#/components/examples/DatabaseRecordError" },
      },
    },
  },
  "401": {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
      examples: { unauthorized: { $ref: "#/components/examples/UnauthorizedError" } },
    },
  },
  "403": {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
      examples: { forbidden: { $ref: "#/components/examples/ForbiddenError" } },
    },
  },
  "404": {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
      examples: { notFound: { $ref: "#/components/examples/NotFoundError" } },
    },
  },
  "409": {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
      examples: { conflict: { $ref: "#/components/examples/ConflictError" } },
    },
  },
  "423": {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
      examples: { accountLocked: { $ref: "#/components/examples/AccountLockedError" } },
    },
  },
  "429": {
    "application/json": {
      schema: { $ref: "#/components/schemas/RateLimitErrorResponse" },
      examples: { rateLimit: { $ref: "#/components/examples/RateLimitError" } },
    },
  },
  "503": {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
      examples: { unavailable: { $ref: "#/components/examples/ServiceUnavailableError" } },
    },
  },
  "500": {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
      examples: { internal: { $ref: "#/components/examples/InternalServerError" } },
    },
  },
};

const errorResponses = {
  BadRequestError: {
    description:
      "Solicitud inválida, validación fallida o referencia inexistente (incluye Prisma P2003).",
    content: errorContentByStatus["400"],
  },
  UnauthorizedError: {
    description: "Falta el token, no es válido o las credenciales no son correctas.",
    content: errorContentByStatus["401"],
  },
  ForbiddenError: {
    description: "El usuario no tiene permiso o su cuenta está desactivada.",
    content: errorContentByStatus["403"],
  },
  NotFoundError: {
    description: "No existe el recurso solicitado o no pertenece al usuario autenticado.",
    content: errorContentByStatus["404"],
  },
  ConflictError: {
    description:
      "La operación entra en conflicto con el estado/datos existentes (incluye Prisma P2002).",
    content: errorContentByStatus["409"],
  },
  AccountLockedError: {
    description: "La cuenta está bloqueada temporalmente después de varios intentos fallidos.",
    content: errorContentByStatus["423"],
  },
  TooManyRequestsError: {
    description: "Se excedió el límite de peticiones por ventana de tiempo.",
    content: errorContentByStatus["429"],
  },
  ServiceUnavailableError: {
    description: "El servicio externo requerido no está disponible.",
    content: errorContentByStatus["503"],
  },
  InternalServerError: {
    description: "Error interno no esperado. El detalle técnico se registra en el servidor.",
    content: errorContentByStatus["500"],
  },
};

const errorResponseComponentByStatus: Record<string, string> = {
  "400": "BadRequestError",
  "401": "UnauthorizedError",
  "403": "ForbiddenError",
  "404": "NotFoundError",
  "409": "ConflictError",
  "423": "AccountLockedError",
  "429": "TooManyRequestsError",
  "503": "ServiceUnavailableError",
  "500": "InternalServerError",
};

type OpenApiSchema = Record<string, unknown>;

const objectSchema = (
  properties: Record<string, OpenApiSchema>,
  example?: Record<string, unknown>,
): OpenApiSchema => ({
  type: "object",
  required: Object.keys(properties),
  properties,
  ...(example ? { example } : {}),
});

const stringSchema = (example?: string, nullable = false): OpenApiSchema => ({
  type: "string",
  ...(example === undefined ? {} : { example }),
  ...(nullable ? { nullable: true } : {}),
});

const numberSchema = (example?: number, nullable = false): OpenApiSchema => ({
  type: "number",
  ...(example === undefined ? {} : { example }),
  ...(nullable ? { nullable: true } : {}),
});

const integerSchema = (example?: number, nullable = false): OpenApiSchema => ({
  type: "integer",
  ...(example === undefined ? {} : { example }),
  ...(nullable ? { nullable: true } : {}),
});

const booleanSchema = (example?: boolean): OpenApiSchema => ({
  type: "boolean",
  ...(example === undefined ? {} : { example }),
});

const dateTimeSchema = (example: string, nullable = false): OpenApiSchema => ({
  type: "string",
  format: "date-time",
  example,
  ...(nullable ? { nullable: true } : {}),
});

const arraySchema = (items: OpenApiSchema, example?: unknown[]): OpenApiSchema => ({
  type: "array",
  items,
  ...(example ? { example } : {}),
});

const schemaRef = (name: string): OpenApiSchema => ({
  $ref: `#/components/schemas/${name}`,
});

const responseDataSchemas: Record<string, OpenApiSchema> = {
  AuditEntryData: objectSchema({
    id_log: integerSchema(21),
    tipo_accion: stringSchema("INICIO_SESION_EXITOSO"),
    entidad_afectada: stringSchema("usuarios"),
    id_entidad: integerSchema(7, true),
    descripcion: stringSchema("Inicio de sesión exitoso.", true),
    fecha_accion: dateTimeSchema("2026-11-19T10:00:00.000Z"),
  }),
  AuditHistoryData: objectSchema(
    {
      items: arraySchema(schemaRef("AuditEntryData")),
      has_more: booleanSchema(false),
      next_cursor: integerSchema(20, true),
    },
    {
      items: [
        {
          id_log: 21,
          tipo_accion: "INICIO_SESION_EXITOSO",
          entidad_afectada: "usuarios",
          id_entidad: 7,
          descripcion: "Inicio de sesión exitoso.",
          fecha_accion: "2026-11-19T10:00:00.000Z",
        },
      ],
      has_more: false,
      next_cursor: null,
    },
  ),
  MessageData: objectSchema(
    { message: stringSchema("Operación completada") },
    { message: "Operación completada" },
  ),
  RegistrationData: objectSchema(
    {
      message: stringSchema("Si el correo puede registrarse, ya puedes intentar iniciar sesión"),
      emailVerificationRequired: booleanSchema(false),
    },
    {
      message: "Si el correo puede registrarse, ya puedes intentar iniciar sesión",
      emailVerificationRequired: false,
    },
  ),
  ResetTokenData: objectSchema({ valid: { type: "boolean", enum: [true] } }, { valid: true }),
  LoginData: objectSchema(
    {
      token: stringSchema("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."),
      usuario: schemaRef("LoginUser"),
    },
    {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      usuario: {
        id_usuario: 7,
        email: "ana@example.com",
        nombre_completo: "Ana Pérez",
        rol: "USER",
      },
    },
  ),
  LoginUser: objectSchema({
    id_usuario: integerSchema(7),
    email: stringSchema("ana@example.com"),
    nombre_completo: stringSchema("Ana Pérez"),
    rol: stringSchema("USER"),
  }),
  UserProfileData: objectSchema(
    {
      id_usuario: integerSchema(7),
      nombre_completo: stringSchema("Ana Pérez"),
      email: stringSchema("ana@example.com"),
      telefono: stringSchema("+584121234567", true),
      pais: stringSchema("Venezuela", true),
      ciudad: stringSchema("Caracas", true),
      rol: stringSchema("USER"),
      estado: booleanSchema(true),
      fecha_registro: dateTimeSchema("2026-11-19T10:00:00.000Z"),
      ultimo_acceso: dateTimeSchema("2026-11-19T10:30:00.000Z", true),
    },
    {
      id_usuario: 7,
      nombre_completo: "Ana Pérez",
      email: "ana@example.com",
      telefono: null,
      pais: null,
      ciudad: null,
      rol: "USER",
      estado: true,
      fecha_registro: "2026-11-19T10:00:00.000Z",
      ultimo_acceso: "2026-11-19T10:30:00.000Z",
    },
  ),
  AccountData: objectSchema(
    {
      id_cuenta: integerSchema(3),
      id_usuario: integerSchema(7),
      nombre: stringSchema("Cuenta principal"),
      entidad: stringSchema("Banco", true),
      tipo: stringSchema("BANCO"),
      numero_enmascarado: stringSchema("1234", true),
      color: stringSchema("#8B5CF6"),
      saldo_inicial: numberSchema(1000),
      saldo_actual: numberSchema(1250.5),
      estado: booleanSchema(true),
      fecha_creacion: dateTimeSchema("2026-11-19T10:00:00.000Z"),
    },
    {
      id_cuenta: 3,
      id_usuario: 7,
      nombre: "Cuenta principal",
      entidad: "Banco",
      tipo: "BANCO",
      numero_enmascarado: "1234",
      color: "#8B5CF6",
      saldo_inicial: 1000,
      saldo_actual: 1250.5,
      estado: true,
      fecha_creacion: "2026-11-19T10:00:00.000Z",
    },
  ),
  AccountListData: arraySchema(schemaRef("AccountData"), [
    {
      id_cuenta: 3,
      id_usuario: 7,
      nombre: "Cuenta principal",
      entidad: "Banco",
      tipo: "BANCO",
      numero_enmascarado: "1234",
      color: "#8B5CF6",
      saldo_inicial: 1000,
      saldo_actual: 1250.5,
      estado: true,
      fecha_creacion: "2026-11-19T10:00:00.000Z",
    },
  ]),
  AccountDeletedData: objectSchema(
    {
      id_cuenta: integerSchema(3),
      id_usuario: integerSchema(7),
      nombre: stringSchema("Cuenta principal"),
      entidad: stringSchema("Banco", true),
      tipo: stringSchema("BANCO"),
      numero_enmascarado: stringSchema("1234", true),
      color: stringSchema("#8B5CF6"),
      saldo_inicial: stringSchema("1000"),
      saldo_actual: stringSchema("1250.50"),
      estado: booleanSchema(true),
      fecha_creacion: dateTimeSchema("2026-11-19T10:00:00.000Z"),
    },
    {
      id_cuenta: 3,
      id_usuario: 7,
      nombre: "Cuenta principal",
      entidad: "Banco",
      tipo: "BANCO",
      numero_enmascarado: "1234",
      color: "#8B5CF6",
      saldo_inicial: "1000",
      saldo_actual: "1250.50",
      estado: true,
      fecha_creacion: "2026-11-19T10:00:00.000Z",
    },
  ),
  CategoryData: objectSchema(
    {
      id_categoria: integerSchema(12),
      id_usuario: integerSchema(7, true),
      nombre: stringSchema("Alimentación"),
      tipo: stringSchema("GASTO"),
      icono: stringSchema("utensils", true),
      color: stringSchema("#2563eb"),
      es_default: booleanSchema(false),
      estado: booleanSchema(true),
      fecha_creacion: dateTimeSchema("2026-11-19T10:00:00.000Z"),
      es_personalizada: booleanSchema(true),
    },
    {
      id_categoria: 12,
      id_usuario: 7,
      nombre: "Alimentación",
      tipo: "GASTO",
      icono: "utensils",
      color: "#2563eb",
      es_default: false,
      estado: true,
      fecha_creacion: "2026-11-19T10:00:00.000Z",
      es_personalizada: true,
    },
  ),
  CategoryListData: arraySchema(schemaRef("CategoryData"), [
    {
      id_categoria: 12,
      id_usuario: 7,
      nombre: "Alimentación",
      tipo: "GASTO",
      icono: "utensils",
      color: "#2563eb",
      es_default: false,
      estado: true,
      fecha_creacion: "2026-11-19T10:00:00.000Z",
      es_personalizada: true,
    },
  ]),
  CategoryDeletedData: objectSchema(
    {
      id_categoria: integerSchema(12),
      id_usuario: integerSchema(7, true),
      nombre: stringSchema("Alimentación"),
      tipo: stringSchema("GASTO"),
      icono: stringSchema("utensils", true),
      color: stringSchema("#2563eb"),
      es_default: booleanSchema(false),
      estado: booleanSchema(false),
      fecha_creacion: dateTimeSchema("2026-11-19T10:00:00.000Z"),
    },
    {
      id_categoria: 12,
      id_usuario: 7,
      nombre: "Alimentación",
      tipo: "GASTO",
      icono: "utensils",
      color: "#2563eb",
      es_default: false,
      estado: false,
      fecha_creacion: "2026-11-19T10:00:00.000Z",
    },
  ),
  TransactionListItem: objectSchema({
    id_transaccion: integerSchema(42),
    id_usuario: integerSchema(7),
    id_cuenta: integerSchema(3, true),
    id_cuenta_destino: integerSchema(4, true),
    nombre_cuenta: stringSchema("Cuenta principal", true),
    nombre_cuenta_destino: stringSchema("Cuenta de ahorros", true),
    id_categoria: integerSchema(12, true),
    nombre_categoria: stringSchema("Alimentación", true),
    icono_categoria: stringSchema("utensils", true),
    color_categoria: stringSchema("#2563eb", true),
    canal: stringSchema("webhook"),
    monto: numberSchema(50.75),
    tipo_movimiento: stringSchema("GASTO"),
    comercio: stringSchema("Tienda", true),
    descripcion: stringSchema("Compra", true),
    estado: stringSchema("CONFIRMADA"),
    fecha_transaccion: dateTimeSchema("2026-11-19T10:00:00.000Z"),
    latitud: numberSchema(10.48, true),
    longitud: numberSchema(-66.9, true),
    es_sospechosa: booleanSchema(false),
    nivel_riesgo: stringSchema("BAJO"),
    motivo_riesgo: stringSchema("", true),
  }),
  TransactionListData: objectSchema(
    {
      items: arraySchema(schemaRef("TransactionListItem")),
      pagination: objectSchema({
        total: integerSchema(1),
        page: integerSchema(1),
        limit: integerSchema(10),
        total_pages: integerSchema(1),
      }),
    },
    {
      items: [
        {
          id_transaccion: 42,
          id_usuario: 7,
          id_cuenta: 3,
          id_cuenta_destino: null,
          nombre_cuenta: "Cuenta principal",
          nombre_cuenta_destino: null,
          id_categoria: 12,
          nombre_categoria: "Alimentación",
          icono_categoria: "utensils",
          color_categoria: "#2563eb",
          monto: 50.75,
          tipo_movimiento: "GASTO",
          comercio: "Tienda",
          descripcion: "Compra",
          estado: "CONFIRMADA",
          fecha_transaccion: "2026-11-19T10:00:00.000Z",
          latitud: null,
          longitud: null,
          es_sospechosa: false,
          nivel_riesgo: "BAJO",
          motivo_riesgo: null,
        },
      ],
      pagination: { total: 1, page: 1, limit: 10, total_pages: 1 },
    },
  ),
  TransactionData: objectSchema(
    {
      id_transaccion: integerSchema(42),
      id_usuario: integerSchema(7),
      id_cuenta: integerSchema(3, true),
      id_cuenta_destino: integerSchema(4, true),
      id_categoria: integerSchema(12, true),
      id_dispositivo: integerSchema(4, true),
      id_ubicacion: integerSchema(9, true),
      tipo_movimiento: stringSchema("GASTO"),
      monto: numberSchema(50.75),
      moneda: stringSchema("COP"),
      descripcion: stringSchema("Compra", true),
      comercio: stringSchema("Tienda", true),
      canal: stringSchema("web"),
      fuente_externa: stringSchema("SIMULADOR", true),
      id_evento_externo: stringSchema("event-123", true),
      confirmacion_correo_enviado_en: dateTimeSchema("2026-11-19T10:00:00.000Z", true),
      es_recurrente: booleanSchema(false),
      score_anomalia: numberSchema(5, true),
      estado: stringSchema("CONFIRMADA"),
      fecha_transaccion: dateTimeSchema("2026-11-19T10:00:00.000Z"),
    },
    {
      id_transaccion: 42,
      id_usuario: 7,
      id_cuenta: 3,
      id_cuenta_destino: null,
      id_categoria: 12,
      id_dispositivo: null,
      id_ubicacion: null,
      tipo_movimiento: "GASTO",
      monto: 50.75,
      moneda: "COP",
      descripcion: "Compra",
      comercio: "Tienda",
      canal: "web",
      fuente_externa: null,
      id_evento_externo: null,
      confirmacion_correo_enviado_en: null,
      es_recurrente: false,
      score_anomalia: 5,
      estado: "CONFIRMADA",
      fecha_transaccion: "2026-11-19T10:00:00.000Z",
    },
  ),
  TransactionArchivePreparationData: objectSchema(
    {
      id_exportacion: integerSchema(17, true),
      total: integerSchema(125),
      fecha_corte: dateTimeSchema("2025-11-21T18:11:54.001Z"),
      expira_en: dateTimeSchema("2026-11-21T18:41:54.001Z", true),
    },
    {
      id_exportacion: 17,
      total: 125,
      fecha_corte: "2025-11-21T18:11:54.001Z",
      expira_en: "2026-11-21T18:41:54.001Z",
    },
  ),
  TransactionArchivePurgeData: objectSchema(
    {
      eliminadas: integerSchema(125),
      omitidas: integerSchema(0),
      fecha_corte: dateTimeSchema("2025-11-21T18:11:54.001Z"),
      saldos_modificados: booleanSchema(false),
    },
    {
      eliminadas: 125,
      omitidas: 0,
      fecha_corte: "2025-11-21T18:11:54.001Z",
      saldos_modificados: false,
    },
  ),
  TransactionCreateData: objectSchema(
    {
      transaction: schemaRef("TransactionData"),
      evaluation: objectSchema({
        score_riesgo: numberSchema(5),
        nivel_riesgo: stringSchema("BAJO"),
        estado_evaluacion: stringSchema("APROBADA"),
        razones: arraySchema(stringSchema()),
      }),
      alert: objectSchema(
        {
          id_alerta: integerSchema(6),
          id_usuario: integerSchema(7),
          id_transaccion: integerSchema(42),
          severidad: stringSchema("MEDIA"),
          motivo: stringSchema("Revisar movimiento"),
          estado: stringSchema("PENDIENTE"),
          fecha_detectada: dateTimeSchema("2026-11-19T10:00:00.000Z"),
          fecha_resuelta: dateTimeSchema("2026-11-19T10:00:00.000Z", true),
          accion_usuario: stringSchema("FUI_YO", true),
        },
        {
          id_alerta: 6,
          id_usuario: 7,
          id_transaccion: 42,
          severidad: "MEDIA",
          motivo: "Revisar movimiento",
          estado: "PENDIENTE",
          fecha_detectada: "2026-11-19T10:00:00.000Z",
          fecha_resuelta: null,
          accion_usuario: null,
        },
      ),
    },
    {
      transaction: {
        id_transaccion: 42,
        id_usuario: 7,
        id_cuenta: 3,
        id_cuenta_destino: null,
        id_categoria: 12,
        id_dispositivo: null,
        id_ubicacion: null,
        tipo_movimiento: "GASTO",
        monto: 50.75,
        moneda: "COP",
        descripcion: "Compra",
        comercio: "Tienda",
        canal: "web",
        fuente_externa: null,
        id_evento_externo: null,
        confirmacion_correo_enviado_en: null,
        es_recurrente: false,
        score_anomalia: 5,
        estado: "CONFIRMADA",
        fecha_transaccion: "2026-11-19T10:00:00.000Z",
      },
      evaluation: {
        score_riesgo: 5,
        nivel_riesgo: "BAJO",
        estado_evaluacion: "APROBADA",
        razones: [],
      },
      alert: null,
    },
  ),
  TransactionStatusData: objectSchema({
    id_transaccion: integerSchema(42),
    id_usuario: integerSchema(7),
    id_cuenta: integerSchema(3, true),
    id_cuenta_destino: integerSchema(4, true),
    id_categoria: integerSchema(12, true),
    id_dispositivo: integerSchema(4, true),
    id_ubicacion: integerSchema(9, true),
    tipo_movimiento: stringSchema("GASTO"),
    monto: stringSchema("50.75"),
    moneda: stringSchema("COP"),
    descripcion: stringSchema("Compra", true),
    comercio: stringSchema("Tienda", true),
    canal: stringSchema("web"),
    fuente_externa: stringSchema("SIMULADOR", true),
    id_evento_externo: stringSchema("event-123", true),
    confirmacion_correo_enviado_en: dateTimeSchema("2026-11-19T10:00:00.000Z", true),
    es_recurrente: booleanSchema(false),
    score_anomalia: stringSchema("5.00", true),
    estado: stringSchema("CONFIRMADA"),
    fecha_transaccion: dateTimeSchema("2026-11-19T10:00:00.000Z"),
  }),
  TransactionIdData: objectSchema({ id_transaccion: integerSchema(42) }, { id_transaccion: 42 }),
  EmailTransactionConfirmationData: objectSchema(
    {
      id_transaccion: integerSchema(42),
      monto: numberSchema(50.75),
      comercio: stringSchema("Tienda", true),
      descripcion: stringSchema("Compra", true),
      fecha_transaccion: dateTimeSchema("2026-11-19T10:00:00.000Z"),
      nombre_cuenta: stringSchema("Cuenta principal", true),
      estado: stringSchema("PENDIENTE"),
      puede_responder: booleanSchema(true),
    },
    {
      id_transaccion: 42,
      monto: 50.75,
      comercio: "Tienda",
      descripcion: "Compra",
      fecha_transaccion: "2026-11-19T10:00:00.000Z",
      nombre_cuenta: "Cuenta principal",
      estado: "PENDIENTE",
      puede_responder: true,
    },
  ),
  EmailTransactionConfirmationResultData: objectSchema(
    {
      id_transaccion: integerSchema(42),
      decision: stringSchema("FUI_YO"),
      estado: stringSchema("CONFIRMADA"),
      alerta_critica_creada: booleanSchema(false),
    },
    {
      id_transaccion: 42,
      decision: "FUI_YO",
      estado: "CONFIRMADA",
      alerta_critica_creada: false,
    },
  ),
  ExternalTransactionIngestData: objectSchema(
    {
      id_transaccion: integerSchema(42),
      estado: stringSchema("PENDIENTE"),
      duplicado: booleanSchema(false),
      archivado: booleanSchema(false),
    },
    { id_transaccion: 42, estado: "PENDIENTE", duplicado: false, archivado: false },
  ),
  RiskCountsData: {
    type: "object",
    additionalProperties: { type: "integer", minimum: 0 },
    example: { BAJO: 3, MEDIO: 2, ALTO: 1, CRITICO: 0 },
  },
  DeviceData: objectSchema(
    {
      id_dispositivo: integerSchema(4),
      id_usuario: integerSchema(7),
      tipo_dispositivo: stringSchema("MOBILE"),
      identificador_unico: stringSchema("device-fingerprint-abc123"),
      sistema_operativo: stringSchema("iOS 18", true),
      navegador: stringSchema("Safari", true),
      confiable: booleanSchema(true),
      fecha_primer_uso: dateTimeSchema("2026-11-19T10:00:00.000Z"),
      fecha_ultimo_uso: dateTimeSchema("2026-11-19T10:00:00.000Z"),
    },
    {
      id_dispositivo: 4,
      id_usuario: 7,
      tipo_dispositivo: "MOBILE",
      identificador_unico: "device-fingerprint-abc123",
      sistema_operativo: "iOS 18",
      navegador: "Safari",
      confiable: true,
      fecha_primer_uso: "2026-11-19T10:00:00.000Z",
      fecha_ultimo_uso: "2026-11-19T10:00:00.000Z",
    },
  ),
  DeviceListData: arraySchema(schemaRef("DeviceData")),
  AlertData: objectSchema({
    id_alerta: integerSchema(6),
    id_usuario: integerSchema(7),
    id_transaccion: integerSchema(42),
    severidad: stringSchema("MEDIA"),
    motivo: stringSchema("Revisar movimiento"),
    estado: stringSchema("PENDIENTE"),
    fecha_detectada: dateTimeSchema("2026-11-19T10:00:00.000Z"),
    fecha_resuelta: dateTimeSchema("2026-11-19T10:00:00.000Z", true),
    accion_usuario: stringSchema("FUI_YO", true),
  }),
  AlertListItem: objectSchema({
    id_alerta: integerSchema(6),
    id_usuario: integerSchema(7),
    id_transaccion: integerSchema(42),
    severidad: stringSchema("MEDIA"),
    motivo: stringSchema("Revisar movimiento"),
    estado: stringSchema("PENDIENTE"),
    fecha_detectada: dateTimeSchema("2026-11-19T10:00:00.000Z"),
    fecha_resuelta: dateTimeSchema("2026-11-19T10:00:00.000Z", true),
    accion_usuario: stringSchema("FUI_YO", true),
    transaccion: objectSchema({
      id_transaccion: integerSchema(42),
      monto: numberSchema(50.75),
      tipo_movimiento: stringSchema("GASTO"),
      descripcion: stringSchema("Compra", true),
      comercio: stringSchema("Tienda", true),
      fecha_transaccion: dateTimeSchema("2026-11-19T10:00:00.000Z"),
      ubicacion: {
        ...objectSchema({ ciudad: stringSchema("Caracas", true) }),
        nullable: true,
      },
    }),
  }),
  AlertListData: objectSchema(
    {
      items: arraySchema(schemaRef("AlertListItem")),
      pagination: objectSchema({
        total: integerSchema(1),
        limit: integerSchema(20),
        offset: integerSchema(0),
      }),
    },
    {
      items: [
        {
          id_alerta: 6,
          id_usuario: 7,
          id_transaccion: 42,
          severidad: "MEDIA",
          motivo: "Revisar movimiento",
          estado: "PENDIENTE",
          fecha_detectada: "2026-11-19T10:00:00.000Z",
          fecha_resuelta: null,
          accion_usuario: null,
          transaccion: {
            id_transaccion: 42,
            monto: 50.75,
            tipo_movimiento: "GASTO",
            descripcion: "Compra",
            comercio: "Tienda",
            fecha_transaccion: "2026-11-19T10:00:00.000Z",
            ubicacion: { ciudad: "Caracas" },
          },
        },
      ],
      pagination: { total: 1, limit: 20, offset: 0 },
    },
  ),
  AlertDetailData: objectSchema({
    id_alerta: integerSchema(6),
    id_usuario: integerSchema(7),
    id_transaccion: integerSchema(42),
    severidad: stringSchema("MEDIA"),
    motivo: stringSchema("Revisar movimiento"),
    estado: stringSchema("PENDIENTE"),
    fecha_detectada: dateTimeSchema("2026-11-19T10:00:00.000Z"),
    fecha_resuelta: dateTimeSchema("2026-11-19T10:00:00.000Z", true),
    accion_usuario: stringSchema("FUI_YO", true),
    transaccion: objectSchema({
      id_transaccion: integerSchema(42),
      id_usuario: integerSchema(7),
      id_cuenta: integerSchema(3, true),
      id_categoria: integerSchema(12, true),
      id_dispositivo: integerSchema(4, true),
      id_ubicacion: integerSchema(9, true),
      tipo_movimiento: stringSchema("GASTO"),
      monto: numberSchema(50.75),
      moneda: stringSchema("COP"),
      descripcion: stringSchema("Compra", true),
      comercio: stringSchema("Tienda", true),
      canal: stringSchema("web"),
      es_recurrente: booleanSchema(false),
      score_anomalia: stringSchema("5.00", true),
      estado: stringSchema("CONFIRMADA"),
      fecha_transaccion: dateTimeSchema("2026-11-19T10:00:00.000Z"),
    }),
  }),
  AlertCountsData: {
    type: "object",
    additionalProperties: { type: "integer", minimum: 0 },
    example: { BAJA: 3, MEDIA: 2, ALTA: 1, CRITICA: 0 },
  },
  DashboardStatsData: objectSchema(
    {
      saldo_total: numberSchema(1500),
      periodo: objectSchema({
        dias: integerSchema(30),
        fecha_inicio: dateTimeSchema("2026-10-20T12:00:00.000Z"),
        fecha_fin: dateTimeSchema("2026-11-19T12:00:00.000Z"),
        ingresos: numberSchema(2000),
        gastos: numberSchema(500),
        ahorros: numberSchema(250),
        balance_neto: numberSchema(1250),
      }),
      alertas: objectSchema({
        activas: integerSchema(2),
        criticas: integerSchema(1),
      }),
    },
    {
      saldo_total: 1500,
      periodo: {
        dias: 30,
        fecha_inicio: "2026-10-20T12:00:00.000Z",
        fecha_fin: "2026-11-19T12:00:00.000Z",
        ingresos: 2000,
        gastos: 500,
        ahorros: 250,
        balance_neto: 1250,
      },
      alertas: { activas: 2, criticas: 1 },
    },
  ),
  DashboardRecentAlertData: arraySchema(
    objectSchema({
      id_alerta: integerSchema(6),
      id_transaccion: integerSchema(42),
      severidad: stringSchema("MEDIA"),
      fecha_detectada: dateTimeSchema("2026-11-19T10:00:00.000Z"),
      motivo: stringSchema("Revisar movimiento"),
      accion_usuario: stringSchema("FUI_YO", true),
      estado: stringSchema("PENDIENTE"),
      monto: numberSchema(50.75),
      comercio: stringSchema("Tienda", true),
      estado_transaccion: stringSchema("PENDIENTE"),
    }),
  ),
  DashboardRecentTransactionData: arraySchema(
    objectSchema({
      id_transaccion: integerSchema(42),
      monto: numberSchema(50.75),
      tipo_movimiento: stringSchema("GASTO"),
      fecha_transaccion: dateTimeSchema("2026-11-19T10:00:00.000Z"),
      comercio: stringSchema("Tienda", true),
      estado: stringSchema("CONFIRMADA"),
      score_anomalia: numberSchema(5),
      categoria: objectSchema({
        nombre: stringSchema("Alimentación"),
        icono: stringSchema("utensils", true),
        color: stringSchema("#2563eb", true),
      }),
    }),
  ),
  AdviceData: arraySchema(
    objectSchema({
      id_consejo: integerSchema(2),
      tipo: stringSchema("PRESUPUESTO"),
      titulo: stringSchema("Presupuesto al 80%"),
      descripcion: stringSchema("Has usado el 80% de tu presupuesto."),
      prioridad: stringSchema("MEDIA"),
      fecha_generado: dateTimeSchema("2026-11-19T10:00:00.000Z"),
    }),
  ),
  AdviceReadData: objectSchema(
    {
      id_consejo: integerSchema(2),
      leido: booleanSchema(true),
      fecha_leido: dateTimeSchema("2026-11-19T10:00:00.000Z", true),
    },
    { id_consejo: 2, leido: true, fecha_leido: "2026-11-19T10:00:00.000Z" },
  ),
  BudgetListItem: objectSchema({
    id_presupuesto: integerSchema(5),
    id_categoria: integerSchema(12, true),
    limite_mensual: numberSchema(300),
    mes: integerSchema(11),
    anio: integerSchema(2026),
    fecha_creacion: dateTimeSchema("2026-11-01T10:00:00.000Z"),
    gastado: numberSchema(175.5),
    categoria: objectSchema({
      nombre: stringSchema("Alimentación", true),
      icono: stringSchema("utensils", true),
      color: stringSchema("#2563eb", true),
    }),
  }),
  BudgetListData: arraySchema(schemaRef("BudgetListItem")),
  BudgetCreatedData: objectSchema({
    id_presupuesto: integerSchema(5),
    id_categoria: integerSchema(12, true),
    limite_mensual: numberSchema(300),
    mes: integerSchema(11),
    anio: integerSchema(2026),
    fecha_creacion: dateTimeSchema("2026-11-01T10:00:00.000Z"),
  }),
  BudgetUpdatedData: objectSchema({
    id_presupuesto: integerSchema(5),
    limite_mensual: numberSchema(350),
    mes: integerSchema(11),
    anio: integerSchema(2026),
  }),
  BudgetDeletedData: objectSchema({ id_presupuesto: integerSchema(5) }, { id_presupuesto: 5 }),
  SavingsGoalData: objectSchema(
    {
      id_meta: integerSchema(8),
      nombre: stringSchema("Fondo de emergencia"),
      monto_objetivo: numberSchema(1000),
      monto_actual: numberSchema(250),
      progreso: numberSchema(25),
      fecha_limite: dateTimeSchema("2027-06-30T00:00:00.000Z", true),
      estado: stringSchema("ACTIVA"),
      fecha_creacion: dateTimeSchema("2026-11-19T10:00:00.000Z"),
    },
    {
      id_meta: 8,
      nombre: "Fondo de emergencia",
      monto_objetivo: 1000,
      monto_actual: 250,
      progreso: 25,
      fecha_limite: "2027-06-30",
      estado: "ACTIVA",
      fecha_creacion: "2026-11-19T10:00:00.000Z",
    },
  ),
  SavingsListData: arraySchema(schemaRef("SavingsGoalData")),
  SavingsDeletedData: objectSchema({ id_meta: integerSchema(8) }, { id_meta: 8 }),
  BehaviorPatternData: objectSchema(
    {
      id_usuario: integerSchema(7),
      total_transacciones: integerSchema(32),
      monto_promedio: numberSchema(75.5),
      monto_maximo: numberSchema(450),
      transacciones_sospechosas: integerSchema(1),
      categorias_frecuentes: arraySchema(
        objectSchema({
          id_categoria: integerSchema(12),
          nombre: stringSchema("Alimentación"),
          cantidad: integerSchema(12),
        }),
      ),
      patron_evaluado_en: dateTimeSchema("2026-11-19T10:00:00.000Z"),
    },
    {
      id_usuario: 7,
      total_transacciones: 32,
      monto_promedio: 75.5,
      monto_maximo: 450,
      transacciones_sospechosas: 1,
      categorias_frecuentes: [{ id_categoria: 12, nombre: "Alimentación", cantidad: 12 }],
      patron_evaluado_en: "2026-11-19T10:00:00.000Z",
    },
  ),
  InsightsData: objectSchema(
    {
      periodo_dias: integerSchema(30),
      resumen: objectSchema({
        ingresos: numberSchema(2000),
        gastos: numberSchema(1200),
        ahorros: numberSchema(250),
        balance: numberSchema(550),
        tasa_ahorro: numberSchema(12.5),
        total_transacciones: integerSchema(25),
        score_riesgo_promedio: numberSchema(8.5),
        total_alertas: integerSchema(2),
        alertas_criticas: integerSchema(0),
      }),
      top_categorias: arraySchema(
        objectSchema({
          nombre: stringSchema("Alimentación"),
          icono: stringSchema("utensils", true),
          color: stringSchema("#2563eb", true),
          total: numberSchema(500),
          cantidad: integerSchema(8),
        }),
      ),
      top_comercios: arraySchema(
        objectSchema({
          comercio: stringSchema("Tienda"),
          total: numberSchema(300),
          cantidad: integerSchema(4),
        }),
      ),
      consejos: arraySchema(stringSchema()),
    },
    {
      periodo_dias: 30,
      resumen: {
        ingresos: 2000,
        gastos: 1200,
        ahorros: 250,
        balance: 550,
        tasa_ahorro: 12.5,
        total_transacciones: 25,
        score_riesgo_promedio: 8.5,
        total_alertas: 2,
        alertas_criticas: 0,
      },
      top_categorias: [
        { nombre: "Alimentación", icono: "utensils", color: "#2563eb", total: 500, cantidad: 8 },
      ],
      top_comercios: [{ comercio: "Tienda", total: 300, cantidad: 4 }],
      consejos: ["Revisa tus gastos del periodo."],
    },
  ),
  ReportSummaryData: objectSchema(
    {
      periodo: objectSchema({
        fecha_inicio: dateTimeSchema("2026-11-01T00:00:00.000Z"),
        fecha_fin: dateTimeSchema("2026-11-19T10:00:00.000Z"),
      }),
      totales: objectSchema({
        ingresos: numberSchema(2000),
        gastos: numberSchema(1200),
        ahorros: numberSchema(250),
        balance: numberSchema(550),
      }),
      transacciones: objectSchema({
        total: integerSchema(25),
        aprobadas: integerSchema(23),
        alertadas: integerSchema(2),
        bloqueadas: integerSchema(0),
      }),
    },
    {
      periodo: {
        fecha_inicio: "2026-11-01T00:00:00.000Z",
        fecha_fin: "2026-11-19T10:00:00.000Z",
      },
      totales: { ingresos: 2000, gastos: 1200, ahorros: 250, balance: 550 },
      transacciones: { total: 25, aprobadas: 23, alertadas: 2, bloqueadas: 0 },
    },
  ),
  ReportByCategoryData: objectSchema(
    {
      periodo: objectSchema({
        fecha_inicio: dateTimeSchema("2026-11-01T00:00:00.000Z"),
        fecha_fin: dateTimeSchema("2026-11-19T10:00:00.000Z"),
      }),
      tipo_movimiento: stringSchema("GASTO"),
      categorias: arraySchema(
        objectSchema({
          id_categoria: integerSchema(12, true),
          nombre: stringSchema("Alimentación"),
          icono: stringSchema("utensils", true),
          color: stringSchema("#2563eb", true),
          total: numberSchema(500),
          cantidad: integerSchema(8),
        }),
      ),
    },
    {
      periodo: {
        fecha_inicio: "2026-11-01T00:00:00.000Z",
        fecha_fin: "2026-11-19T10:00:00.000Z",
      },
      tipo_movimiento: "GASTO",
      categorias: [
        {
          id_categoria: 12,
          nombre: "Alimentación",
          icono: "utensils",
          color: "#2563eb",
          total: 500,
          cantidad: 8,
        },
        {
          id_categoria: null,
          nombre: "Sin categoría",
          icono: null,
          color: null,
          total: 100,
          cantidad: 2,
        },
      ],
    },
  ),
  ReportTransactionsData: objectSchema(
    {
      periodo: objectSchema({
        fecha_inicio: dateTimeSchema("2026-11-01T00:00:00.000Z"),
        fecha_fin: dateTimeSchema("2026-11-19T10:00:00.000Z"),
      }),
      total: integerSchema(25),
      truncated: booleanSchema(false),
      top_comercios: arraySchema(
        objectSchema({
          comercio: stringSchema("Tienda"),
          total: numberSchema(300),
          numero_transacciones: integerSchema(4),
        }),
      ),
      items: arraySchema(
        objectSchema({
          id_transaccion: integerSchema(42),
          fecha_transaccion: dateTimeSchema("2026-11-19T10:00:00.000Z"),
          tipo_movimiento: stringSchema("GASTO"),
          monto: numberSchema(50.75),
          comercio: stringSchema("Tienda", true),
          descripcion: stringSchema("Compra", true),
          estado: stringSchema("CONFIRMADA"),
          score_anomalia: numberSchema(5),
          ciudad: stringSchema("Caracas", true),
          nombre_cuenta: stringSchema("Cuenta principal", true),
          nombre_cuenta_destino: stringSchema("Cuenta de ahorros", true),
          nombre_categoria: stringSchema("Alimentación", true),
        }),
      ),
    },
    {
      periodo: {
        fecha_inicio: "2026-11-01T00:00:00.000Z",
        fecha_fin: "2026-11-19T10:00:00.000Z",
      },
      total: 25,
      truncated: false,
      top_comercios: [{ comercio: "Tienda", total: 300, numero_transacciones: 4 }],
      items: [
        {
          id_transaccion: 42,
          fecha_transaccion: "2026-11-19T10:00:00.000Z",
          tipo_movimiento: "GASTO",
          monto: 50.75,
          comercio: "Tienda",
          descripcion: "Compra",
          estado: "CONFIRMADA",
          score_anomalia: 5,
          ciudad: "Caracas",
          nombre_cuenta: "Cuenta principal",
          nombre_cuenta_destino: null,
          nombre_categoria: "Alimentación",
        },
      ],
    },
  ),
  MapStatsData: objectSchema(
    {
      total_geolocalizadas: integerSchema(18),
      ciudades_distintas: integerSchema(3),
      paises_distintos: integerSchema(1),
      transacciones_riesgo_alto: integerSchema(2),
      score_promedio: numberSchema(7.5),
    },
    {
      total_geolocalizadas: 18,
      ciudades_distintas: 3,
      paises_distintos: 1,
      transacciones_riesgo_alto: 2,
      score_promedio: 7.5,
    },
  ),
  MapLocationItem: objectSchema({
    id_transaccion: integerSchema(42),
    monto: numberSchema(50.75),
    tipo_movimiento: stringSchema("GASTO"),
    comercio: stringSchema("Tienda", true),
    estado: stringSchema("CONFIRMADA"),
    score_anomalia: numberSchema(5),
    es_sospechosa: booleanSchema(false),
    nivel_riesgo: stringSchema("BAJO"),
    ciudad: stringSchema("Caracas", true),
    pais: stringSchema("Venezuela", true),
    latitud: numberSchema(10.48),
    longitud: numberSchema(-66.9),
    fecha_transaccion: dateTimeSchema("2026-11-19T10:00:00.000Z"),
    nombre_cuenta: stringSchema("Cuenta principal", true),
    nombre_categoria: stringSchema("Alimentación", true),
  }),
  MapLocationsData: objectSchema(
    {
      items: arraySchema(schemaRef("MapLocationItem")),
      total: integerSchema(18),
      truncated: booleanSchema(false),
    },
    {
      items: [
        {
          id_transaccion: 42,
          monto: 50.75,
          tipo_movimiento: "GASTO",
          comercio: "Tienda",
          estado: "CONFIRMADA",
          score_anomalia: 5,
          es_sospechosa: false,
          nivel_riesgo: "BAJO",
          ciudad: "Caracas",
          pais: "Venezuela",
          latitud: 10.48,
          longitud: -66.9,
          fecha_transaccion: "2026-11-19T10:00:00.000Z",
          nombre_cuenta: "Cuenta principal",
          nombre_categoria: "Alimentación",
        },
      ],
      total: 18,
      truncated: false,
    },
  ),
};

const successSchemaByOperation: Record<string, Record<string, string>> = {
  "/api/v2/audit": { get: "AuditHistoryData" },
  "/api/v2/auth/register": { post: "RegistrationData" },
  "/api/v2/auth/login": { post: "LoginData" },
  "/api/v2/auth/logout": { post: "MessageData" },
  "/api/v2/auth/verify-email": { post: "MessageData" },
  "/api/v2/auth/forgot-password": { post: "MessageData" },
  "/api/v2/auth/verify-reset-token": { post: "ResetTokenData" },
  "/api/v2/auth/reset-password": { post: "MessageData" },
  "/api/v2/auth/me": { get: "UserProfileData", patch: "UserProfileData" },
  "/api/v2/auth/change-password": { post: "MessageData" },
  "/api/v2/accounts": { get: "AccountListData", post: "AccountData" },
  "/api/v2/accounts/{id}": {
    get: "AccountData",
    patch: "AccountData",
    delete: "AccountDeletedData",
  },
  "/api/v2/categories": { get: "CategoryListData", post: "CategoryData" },
  "/api/v2/categories/{id}": {
    get: "CategoryData",
    patch: "CategoryData",
    delete: "CategoryDeletedData",
  },
  "/api/v2/transactions": { get: "TransactionListData", post: "TransactionCreateData" },
  "/api/v2/transactions/counts-by-level": { get: "RiskCountsData" },
  "/api/v2/transactions/archive/prepare": { post: "TransactionArchivePreparationData" },
  "/api/v2/transactions/archive/{exportId}/purge": {
    post: "TransactionArchivePurgeData",
  },
  "/api/v2/transactions/{id}": {
    get: "TransactionData",
  },
  "/api/v2/transactions/{id}/status": { patch: "TransactionStatusData" },
  "/api/v2/transactions/{id}/category": { patch: "TransactionStatusData" },
  "/api/v2/transactions/email-confirmation": {
    get: "EmailTransactionConfirmationData",
    post: "EmailTransactionConfirmationResultData",
  },
  "/api/v2/integrations/transactions/webhook": {
    post: "ExternalTransactionIngestData",
  },
  "/api/v2/devices": { get: "DeviceListData", post: "DeviceData" },
  "/api/v2/devices/{id}": { get: "DeviceData", delete: "DeviceData" },
  "/api/v2/devices/{id}/trust": { patch: "DeviceData" },
  "/api/v2/alerts": { get: "AlertListData" },
  "/api/v2/alerts/counts-by-level": { get: "AlertCountsData" },
  "/api/v2/alerts/{id}": { get: "AlertDetailData" },
  "/api/v2/alerts/{id}/status": { patch: "AlertData" },
  "/api/v2/dashboard/stats": { get: "DashboardStatsData" },
  "/api/v2/dashboard/estadisticas": { get: "DashboardStatsData" },
  "/api/v2/dashboard/recent-alerts": { get: "DashboardRecentAlertData" },
  "/api/v2/dashboard/alertas-recientes": { get: "DashboardRecentAlertData" },
  "/api/v2/dashboard/recent-transactions": { get: "DashboardRecentTransactionData" },
  "/api/v2/dashboard/transacciones-recientes": { get: "DashboardRecentTransactionData" },
  "/api/v2/dashboard/advice": { get: "AdviceData" },
  "/api/v2/dashboard/advice/{id}/read": { patch: "AdviceReadData" },
  "/api/v2/budgets": { get: "BudgetListData", post: "BudgetCreatedData" },
  "/api/v2/budgets/{id}": {
    patch: "BudgetUpdatedData",
    delete: "BudgetDeletedData",
  },
  "/api/v2/savings": { get: "SavingsListData", post: "SavingsGoalData" },
  "/api/v2/savings/{id}": {
    patch: "SavingsGoalData",
    delete: "SavingsDeletedData",
  },
  "/api/v2/savings/{id}/funds": { post: "SavingsGoalData" },
  "/api/v2/profile": { get: "UserProfileData", patch: "UserProfileData" },
  "/api/v2/profile/behavior-pattern": { get: "BehaviorPatternData" },
  "/api/v2/insights": { get: "InsightsData" },
  "/api/v2/reports/summary": { get: "ReportSummaryData" },
  "/api/v2/reports/by-category": { get: "ReportByCategoryData" },
  "/api/v2/reports/transactions": { get: "ReportTransactionsData" },
  "/api/v2/map/stats": { get: "MapStatsData" },
  "/api/v2/map/locations": { get: "MapLocationsData" },
  "/api/v2/map/ubicaciones": { get: "MapLocationsData" },
};

const rawResponseOperations = new Set(["post /api/v2/transactions/archive/{exportId}/download"]);

const strongPasswordOpenApiSchema = {
  type: "string",
  minLength: 12,
  maxLength: 72,
  pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[^\\p{L}\\p{N}\\s])",
  description:
    "12–72 caracteres, con al menos una mayúscula, una minúscula y un carácter especial distinto de letras, números o espacios.",
};

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "TriDa API v2",
      version: "2.0.0",
      description:
        "API de finanzas personales con prevención de fraude.\n\n" +
        "**Flujo recomendado:**\n" +
        "1. `POST /api/v2/auth/register` o `POST /api/v2/auth/login`\n" +
        "2. Copiar el token JWT\n" +
        "3. Pulsar **Authorize** e ingresar el token\n" +
        "4. Probar el resto de endpoints protegidos",
    },
    servers: [
      {
        url: "/",
        description: "Origen actual de la API",
      },
    ],
    tags: [
      { name: "Health", description: "Estado del servicio" },
      { name: "Audit", description: "Historial de seguridad personal, de solo lectura" },
      { name: "Auth", description: "Registro, login y contraseñas" },
      { name: "Accounts", description: "Cuentas financieras" },
      { name: "Categories", description: "Categorías INGRESO/GASTO/AHORRO" },
      { name: "Transactions", description: "Movimientos y riesgo" },
      { name: "Devices", description: "Dispositivos del usuario" },
      { name: "Alerts", description: "Alertas de fraude" },
      { name: "Dashboard", description: "Resumen financiero" },
      { name: "Budgets", description: "Presupuestos por categoría" },
      { name: "Savings", description: "Metas de ahorro" },
      { name: "Profile", description: "Perfil y patrón de comportamiento" },
      { name: "Insights", description: "Consejos y analítica" },
      { name: "Reports", description: "Reportes financieros" },
      { name: "Map", description: "Mapa de transacciones" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        transactionWebhookSecret: {
          type: "apiKey",
          in: "header",
          name: "X-TriDa-Webhook-Secret",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          required: ["success", "error"],
          properties: {
            success: { type: "boolean", enum: [false] },
            error: {
              type: "object",
              required: ["code", "message"],
              properties: {
                code: { type: "string", example: "VALIDATION_ERROR" },
                message: { type: "string", example: "Error de validación de datos" },
                details: {
                  nullable: true,
                  oneOf: [
                    {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          field: { type: "string" },
                          message: { type: "string" },
                        },
                      },
                    },
                    { type: "object", additionalProperties: true },
                    { type: "string" },
                  ],
                },
              },
            },
          },
        },
        RateLimitErrorResponse: {
          allOf: [{ $ref: "#/components/schemas/ErrorResponse" }],
        },
        VerifyResetTokenRequest: {
          type: "object",
          required: ["token"],
          properties: { token: { type: "string" } },
        },
        VerifyEmailRequest: {
          type: "object",
          required: ["token"],
          properties: { token: { type: "string" } },
        },
        RegisterRequest: {
          type: "object",
          required: ["nombre_completo", "email", "password"],
          properties: {
            nombre_completo: { type: "string", example: "Ana Pérez" },
            email: { type: "string", format: "email", example: "ana@email.com" },
            password: {
              ...strongPasswordOpenApiSchema,
              example: "ClaveSegura1!",
            },
            telefono: {
              type: "string",
              nullable: true,
              example: "+584121234567",
              description: "Enviar null para eliminar el teléfono guardado.",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "ana@email.com" },
            password: { type: "string", example: "ClaveSegura1!" },
          },
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["token", "password_nueva"],
          properties: {
            token: { type: "string" },
            password_nueva: { ...strongPasswordOpenApiSchema },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["password_actual", "password_nueva"],
          properties: {
            password_actual: { type: "string" },
            password_nueva: { ...strongPasswordOpenApiSchema },
          },
        },
        CreateAccountRequest: {
          type: "object",
          required: ["nombre", "tipo"],
          properties: {
            nombre: { type: "string", example: "Banco Principal" },
            tipo: {
              type: "string",
              enum: ["BANCO", "TARJETA", "BILLETERA", "EFECTIVO"],
            },
            entidad: {
              type: "string",
              example: "Bancolombia",
              description: "Requerida para banco, tarjeta y billetera.",
            },
            numero_enmascarado: {
              type: "string",
              example: "1234",
              pattern: "^[0-9]{4}$",
              description:
                "Enviar únicamente los últimos cuatro dígitos. Nunca enviar el número completo.",
            },
            color: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", example: "#8B5CF6" },
            saldo_inicial: { type: "number", example: 1000 },
            saldo_actual: { type: "number", example: 1000, readOnly: true },
            estado: { type: "boolean", default: true },
          },
        },
        CreateCategoryRequest: {
          type: "object",
          required: ["nombre", "tipo"],
          properties: {
            nombre: { type: "string", example: "Comida" },
            tipo: { type: "string", enum: ["INGRESO", "GASTO", "AHORRO"] },
            color: { type: "string", example: "#ef4444" },
          },
        },
        CreateTransactionRequest: {
          type: "object",
          required: ["id_cuenta", "monto", "tipo_movimiento"],
          description:
            "Registro manual permitido únicamente en cuentas de efectivo. Los movimientos de otras cuentas deben ingresar por el webhook.",
          properties: {
            id_cuenta: { type: "integer", example: 1 },
            id_categoria: {
              type: "integer",
              description:
                "Opcional; usar un ID devuelto por GET /api/v2/categories que sea propio o del sistema.",
            },
            id_dispositivo: {
              type: "integer",
              description:
                "Opcional; incluir solo un dispositivo registrado por este usuario. Omitir si no aplica.",
            },
            monto: { type: "number", example: 50.75 },
            tipo_movimiento: {
              type: "string",
              enum: ["INGRESO", "GASTO", "AHORRO"],
            },
            comercio: { type: "string", example: "Farmatodo" },
            descripcion: { type: "string", example: "Compra mensual" },
            ciudad: { type: "string", example: "Caracas" },
            pais: { type: "string", example: "Venezuela" },
            latitud: { type: "number", example: 10.48 },
            longitud: { type: "number", example: -66.9 },
            fecha_transaccion: { type: "string", format: "date-time" },
            es_recurrente: { type: "boolean", default: false },
          },
        },
        ExternalTransactionWebhookRequest: {
          type: "object",
          required: ["fuente", "id_evento", "id_cuenta", "monto", "tipo_movimiento"],
          properties: {
            fuente: {
              type: "string",
              maxLength: 30,
              pattern: "^[A-Z0-9_-]+$",
              example: "SIMULADOR",
            },
            id_evento: {
              type: "string",
              maxLength: 160,
              description: "Identificador único del movimiento en la fuente.",
              example: "evt-2026-000123",
            },
            id_cuenta: {
              type: "integer",
              description: "ID local de la cuenta de origen registrada en TriDa.",
              example: 3,
            },
            id_cuenta_destino: {
              type: "integer",
              description:
                "Obligatorio solo para TRANSFERENCIA; debe ser otra cuenta activa del mismo usuario.",
              example: 4,
            },
            monto: { type: "number", minimum: 0.01, example: 50.75 },
            tipo_movimiento: {
              type: "string",
              enum: ["INGRESO", "GASTO", "AHORRO", "TRANSFERENCIA"],
            },
            comercio: { type: "string", maxLength: 150, example: "Tienda" },
            descripcion: { type: "string", maxLength: 255 },
            fecha_transaccion: { type: "string", format: "date-time" },
            es_recurrente: { type: "boolean", default: false },
          },
        },
        EmailTransactionConfirmationRequest: {
          type: "object",
          required: ["token", "decision"],
          properties: {
            token: { type: "string" },
            decision: { type: "string", enum: ["FUI_YO", "NO_FUI_YO"] },
          },
        },
        UpdateTransactionCategoryRequest: {
          type: "object",
          required: ["id_categoria"],
          properties: {
            id_categoria: {
              type: "integer",
              nullable: true,
              description: "ID de una categoría propia/compartida o null para quitarla.",
              example: 12,
            },
          },
        },
        RegisterDeviceRequest: {
          type: "object",
          required: ["identificador_unico", "tipo_dispositivo"],
          properties: {
            identificador_unico: { type: "string", example: "device-fingerprint-abc123" },
            tipo_dispositivo: { type: "string", maxLength: 50, example: "MOBILE" },
            sistema_operativo: { type: "string", maxLength: 100, example: "iOS 18" },
            navegador: { type: "string", maxLength: 100, example: "Safari" },
          },
        },
        UpdateDeviceTrustRequest: {
          type: "object",
          required: ["confiable"],
          properties: {
            confiable: { type: "boolean", example: true },
          },
        },
        UpdateAlertStatusRequest: {
          type: "object",
          required: ["estado", "accion_usuario"],
          properties: {
            estado: {
              type: "string",
              enum: ["CONFIRMADA", "DESCARTADA"],
            },
            accion_usuario: {
              type: "string",
              enum: ["FUI_YO", "NO_FUI_YO", "BLOQUEAR_TARJETA"],
            },
          },
        },
        UpdateTransactionStatusRequest: {
          type: "object",
          required: ["estado"],
          properties: {
            estado: { type: "string", enum: ["CONFIRMADA", "RECHAZADA"] },
          },
        },
        CreateBudgetRequest: {
          type: "object",
          required: ["id_categoria", "limite_mensual", "mes", "anio"],
          properties: {
            id_categoria: { type: "integer", example: 1 },
            limite_mensual: { type: "number", example: 300 },
            mes: { type: "integer", minimum: 1, maximum: 12, example: 6 },
            anio: { type: "integer", minimum: 2020, maximum: 2100, example: 2026 },
          },
        },
        UpdateBudgetRequest: {
          type: "object",
          required: ["limite_mensual"],
          properties: {
            limite_mensual: { type: "number", example: 400 },
          },
        },
        CreateSavingsRequest: {
          type: "object",
          required: ["nombre", "monto_objetivo"],
          properties: {
            nombre: { type: "string", example: "Fondo de emergencia" },
            monto_objetivo: { type: "number", example: 1000 },
            monto_actual: { type: "number", example: 100 },
            fecha_limite: { type: "string", format: "date" },
          },
        },
        UpdateSavingsRequest: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            monto_objetivo: { type: "number" },
            fecha_limite: { type: "string", format: "date" },
            estado: {
              type: "string",
              enum: ["ACTIVA", "PAUSADA", "COMPLETADA", "CANCELADA"],
            },
          },
        },
        AddFundsRequest: {
          type: "object",
          required: ["monto"],
          properties: {
            monto: { type: "number", example: 50 },
          },
        },
        UpdateProfileRequest: {
          type: "object",
          properties: {
            nombre_completo: { type: "string", example: "Ana Pérez" },
            telefono: { type: "string", example: "+584121234567" },
          },
        },
      },
      responses: errorResponses,
      examples: {
        ValidationError: {
          summary: "Error de validación",
          value: {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Error de validación de datos",
              details: [{ field: "monto", message: "El monto debe ser mayor a 0" }],
            },
          },
        },
        InvalidRelationError: {
          summary: "Referencia inválida (Prisma P2003)",
          value: {
            success: false,
            error: {
              code: "INVALID_REFERENCE",
              message: "Relación inválida: El recurso asociado no existe.",
            },
          },
        },
        DatabaseRecordError: {
          summary: "Conflicto de base de datos",
          value: {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "El recurso solicitado no fue encontrado.",
            },
          },
        },
        UnauthorizedError: {
          summary: "Autenticación requerida",
          value: {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Token no proporcionado." },
          },
        },
        ForbiddenError: {
          summary: "Acceso denegado",
          value: {
            success: false,
            error: { code: "FORBIDDEN", message: "Permisos insuficientes para esta acción." },
          },
        },
        NotFoundError: {
          summary: "Recurso no encontrado",
          value: {
            success: false,
            error: { code: "NOT_FOUND", message: "Recurso no encontrado." },
          },
        },
        ConflictError: {
          summary: "Conflicto de estado o datos",
          value: {
            success: false,
            error: {
              code: "CONFLICT",
              message: "La operación entra en conflicto con los datos existentes.",
            },
          },
        },
        AccountLockedError: {
          summary: "Cuenta bloqueada temporalmente",
          value: {
            success: false,
            error: {
              code: "ACCOUNT_LOCKED",
              message:
                "Cuenta bloqueada por una hora tras 3 intentos fallidos. Inténtalo más tarde.",
            },
          },
        },
        RateLimitError: {
          summary: "Límite de peticiones excedido",
          value: {
            success: false,
            error: {
              code: "RATE_LIMITED",
              message: "Límite de peticiones superado. Por favor ralentice sus solicitudes.",
            },
          },
        },
        ServiceUnavailableError: {
          summary: "Servicio externo no disponible",
          value: {
            success: false,
            error: {
              code: "SERVICE_UNAVAILABLE",
              message: "El servicio requerido no está disponible temporalmente.",
            },
          },
        },
        InternalServerError: {
          summary: "Error interno",
          value: {
            success: false,
            error: {
              code: "INTERNAL_SERVER_ERROR",
              message: "Ocurrió un error interno en el servidor.",
            },
          },
        },
      },
    },
    paths: {
      // ───────────── HEALTH ─────────────
      "/health": {
        get: {
          tags: ["Health"],
          security: [],
          summary: "Healthcheck del backend",
          responses: {
            "200": {
              description: "Servicio operativo",
              content: {
                "application/json": {
                  example: {
                    status: "ok",
                    service: "trida-backend",
                    version: "2.0.0",
                  },
                },
              },
            },
          },
        },
      },
      "/health/ready": {
        get: {
          tags: ["Health"],
          security: [],
          summary: "Verificar disponibilidad de PostgreSQL",
          responses: {
            "200": {
              description: "Backend y base de datos disponibles",
              content: {
                "application/json": {
                  example: {
                    status: "ready",
                    service: "trida-backend",
                    version: "2.0.0",
                  },
                },
              },
            },
            "503": {
              description: "Base de datos no disponible",
              content: {
                "application/json": {
                  example: {
                    status: "not_ready",
                    service: "trida-backend",
                    version: "2.0.0",
                  },
                },
              },
            },
          },
        },
      },

      // ───────────── AUDIT ─────────────
      "/api/v2/audit": {
        get: {
          tags: ["Audit"],
          summary: "Consultar el historial de seguridad propio",
          description:
            "Devuelve eventos de la cuenta autenticada en orden descendente. No expone direcciones IP y no permite modificar ni eliminar registros.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
            },
            {
              name: "before_id",
              in: "query",
              description: "ID del último evento visto para cargar eventos anteriores.",
              schema: { type: "integer", minimum: 1 },
            },
          ],
          responses: {
            "200": {
              description: "Historial del usuario autenticado.",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    data: {
                      items: [
                        {
                          id_log: 42,
                          tipo_accion: "INICIO_SESION_EXITOSO",
                          entidad_afectada: "usuarios",
                          id_entidad: 7,
                          descripcion: "Inicio de sesión exitoso.",
                          fecha_accion: "2026-11-19T15:00:00.000Z",
                        },
                      ],
                      has_more: false,
                      next_cursor: null,
                    },
                  },
                },
              },
            },
            "401": {
              description: "No autenticado",
              content: errorContentByStatus["401"],
            },
          },
        },
      },

      // ───────────── AUTH ─────────────
      "/api/v2/auth/register": {
        post: {
          tags: ["Auth"],
          security: [],
          summary: "Registrar usuario",
          description:
            "Crea una cuenta pendiente de verificación por correo. El enlace de verificación vence en 15 minutos.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" },
              },
            },
          },
          responses: {
            "201": {
              description:
                "Registro recibido; se requiere verificar el correo para iniciar sesión.",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    message: "Registro completado con éxito",
                    data: {
                      message:
                        "Si el correo puede registrarse, recibirás un enlace de verificación",
                      emailVerificationRequired: true,
                    },
                  },
                },
              },
            },
            "400": {
              description: "Validación fallida",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "503": { $ref: "#/components/responses/ServiceUnavailableError" },
          },
        },
      },
      "/api/v2/auth/login": {
        post: {
          tags: ["Auth"],
          security: [],
          summary: "Iniciar sesión",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Login exitoso. Devuelve un JWT válido por 8 horas por defecto.",
            },
            "401": { description: "Credenciales inválidas" },
            "423": { $ref: "#/components/responses/AccountLockedError" },
          },
        },
      },
      "/api/v2/auth/verify-email": {
        post: {
          tags: ["Auth"],
          security: [],
          summary: "Verificar correo electrónico (enlace válido por 15 minutos)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VerifyEmailRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Correo verificado" },
            "400": { $ref: "#/components/responses/BadRequestError" },
          },
        },
      },
      "/api/v2/auth/forgot-password": {
        post: {
          tags: ["Auth"],
          security: [],
          summary: "Solicitar restablecimiento de contraseña",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ForgotPasswordRequest" },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Siempre devuelve el mismo mensaje; si la cuenta existe, se envían instrucciones por correo.",
            },
            "400": { description: "Correo inválido" },
          },
        },
      },
      "/api/v2/auth/verify-reset-token": {
        post: {
          tags: ["Auth"],
          security: [],
          summary: "Verificar token de restablecimiento",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VerifyResetTokenRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Token válido; no expone datos del usuario" },
            "400": { description: "Token no proporcionado o solicitud inválida" },
            "401": { description: "Token inválido o expirado" },
          },
        },
      },
      "/api/v2/auth/reset-password": {
        post: {
          tags: ["Auth"],
          security: [],
          summary: "Restablecer contraseña",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ResetPasswordRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Contraseña actualizada" },
            "400": { description: "Solicitud inválida" },
            "401": { description: "Token inválido o expirado" },
          },
        },
      },
      "/api/v2/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Usuario autenticado actual",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Perfil de sesión" },
            "401": { description: "No autenticado" },
          },
        },
        patch: {
          tags: ["Auth"],
          summary: "Actualizar perfil del usuario autenticado",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateProfileRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Perfil actualizado" },
            "400": { description: "Validación fallida" },
            "401": { description: "No autenticado" },
          },
        },
      },
      "/api/v2/auth/change-password": {
        post: {
          tags: ["Auth"],
          summary: "Cambiar contraseña",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChangePasswordRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Contraseña actualizada" },
            "400": { description: "Validación fallida" },
            "401": { description: "No autenticado" },
          },
        },
      },
      "/api/v2/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Cerrar sesión e invalidar todos los tokens del usuario",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Sesión revocada",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessMessageEnvelope" },
                },
              },
            },
            "401": { $ref: "#/components/responses/UnauthorizedError" },
          },
        },
      },

      // ───────────── ACCOUNTS ─────────────
      "/api/v2/accounts": {
        get: {
          tags: ["Accounts"],
          summary: "Listar cuentas del usuario",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "Lista de cuentas" } },
        },
        post: {
          tags: ["Accounts"],
          summary: "Crear cuenta",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateAccountRequest" },
              },
            },
          },
          responses: {
            "201": { description: "Cuenta creada" },
            "400": { description: "Validación fallida" },
          },
        },
      },
      "/api/v2/accounts/{id}": {
        get: {
          tags: ["Accounts"],
          summary: "Obtener cuenta por ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Cuenta encontrada" },
            "404": { description: "No encontrada" },
          },
        },
        patch: {
          summary: "Actualizar una cuenta bancaria",
          tags: ["Accounts"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID de la cuenta a actualizar",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    nombre: { type: "string", example: "Banco Principal Editado" },
                    tipo: { type: "string", example: "BANCO" },
                    entidad: { type: "string", example: "BAC Credomatic" },
                    numero_enmascarado: {
                      type: "string",
                      example: "9999",
                      description: "Solo se actualizan los últimos cuatro dígitos.",
                    },
                    color: {
                      type: "string",
                      pattern: "^#[0-9A-Fa-f]{6}$",
                      example: "#8B5CF6",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Cuenta actualizada exitosamente" },
            404: { description: "Cuenta no encontrada" },
          },
        },
        delete: {
          tags: ["Accounts"],
          summary: "Eliminar cuenta",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: { "200": { description: "Cuenta eliminada" } },
        },
      },

      // ───────────── CATEGORIES ─────────────
      "/api/v2/categories": {
        get: {
          tags: ["Categories"],
          summary: "Listar categorías (sistema + propias)",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "Lista de categorías" } },
        },
        post: {
          tags: ["Categories"],
          summary: "Crear categoría personalizada",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateCategoryRequest" },
              },
            },
          },
          responses: { "201": { description: "Categoría creada" } },
        },
      },
      "/api/v2/categories/{id}": {
        get: {
          tags: ["Categories"],
          summary: "Obtener una categoría activa propia o del sistema",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer", minimum: 1 },
            },
          ],
          responses: {
            "200": {
              description: "Categoría encontrada",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    data: {
                      id_categoria: 12,
                      id_usuario: 7,
                      nombre: "Alimentación",
                      tipo: "GASTO",
                      icono: "utensils",
                      color: "#2563eb",
                      es_default: false,
                      estado: true,
                      fecha_creacion: "2026-11-19T10:00:00.000Z",
                      es_personalizada: true,
                    },
                  },
                },
              },
            },
            "404": { description: "Categoría no encontrada" },
          },
        },
        patch: {
          summary: "Actualizar una categoría de transacción",
          tags: ["Categories"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID de la categoría a actualizar",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    nombre: { type: "string", example: "Comida y Restaurantes" },
                    tipo: { type: "string", example: "GASTO" },
                    icono: { type: "string", example: "utensils" },
                    color: { type: "string", example: "#ef4444" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Categoría actualizada exitosamente" },
            403: { description: "No se pueden modificar categorías del sistema" },
            404: { description: "Categoría no encontrada" },
          },
        },
        delete: {
          tags: ["Categories"],
          summary: "Desactivar categoría propia",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": {
              description: "Categoría desactivada; el historial se conserva",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    message: "Categoría eliminada exitosamente",
                    data: {
                      id_categoria: 12,
                      id_usuario: 7,
                      nombre: "Alimentación",
                      tipo: "GASTO",
                      icono: "utensils",
                      color: "#2563eb",
                      es_default: false,
                      estado: false,
                      fecha_creacion: "2026-11-19T10:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ───────────── TRANSACTIONS ─────────────
      "/api/v2/transactions": {
        get: {
          tags: ["Transactions"],
          summary: "Listar transacciones paginadas",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, default: 10 } },
            { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
            {
              name: "estado",
              in: "query",
              schema: {
                type: "string",
                enum: ["PENDIENTE", "CONFIRMADA", "APROBADA", "SOSPECHOSA", "RECHAZADA"],
              },
            },
            {
              name: "nivel_riesgo",
              in: "query",
              schema: {
                type: "string",
                enum: ["BAJO", "MEDIO", "ALTO", "CRITICO", "ALL"],
                example: "ALTO",
              },
            },
            {
              name: "tipo_movimiento",
              in: "query",
              schema: {
                type: "string",
                enum: ["INGRESO", "GASTO", "AHORRO", "TRANSFERENCIA"],
              },
            },
            { name: "id_cuenta", in: "query", schema: { type: "integer" } },
            { name: "id_categoria", in: "query", schema: { type: "integer" } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "min_monto", in: "query", schema: { type: "number" } },
            { name: "max_monto", in: "query", schema: { type: "number" } },
            {
              name: "fecha_inicio",
              in: "query",
              schema: {
                oneOf: [
                  { type: "string", format: "date-time" },
                  { type: "string", format: "date" },
                ],
              },
            },
            {
              name: "fecha_fin",
              in: "query",
              schema: {
                oneOf: [
                  { type: "string", format: "date-time" },
                  { type: "string", format: "date" },
                ],
              },
            },
            {
              name: "sort_by",
              in: "query",
              schema: {
                type: "string",
                enum: ["fecha_transaccion", "monto", "tipo_movimiento", "nivel_riesgo"],
                default: "fecha_transaccion",
              },
            },
            { name: "sort_order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
          ],
          responses: { "200": { description: "Listado paginado" } },
        },
        post: {
          tags: ["Transactions"],
          summary: "Crear transacción (evaluación de riesgo incluida)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateTransactionRequest" },
              },
            },
          },
          responses: {
            "201": { description: "Transacción creada + evaluación" },
            "400": {
              description:
                "Validación fallida o intento de registro manual en una cuenta que no es de efectivo",
            },
            "404": {
              description: "Cuenta o categoría inexistente o no disponible para el usuario",
            },
          },
        },
      },
      "/api/v2/transactions/counts-by-level": {
        get: {
          tags: ["Transactions"],
          summary: "Conteos por nivel de riesgo",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Conteos por nivel de riesgo de transacción.",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    data: { BAJO: 3, MEDIO: 2, ALTO: 1, CRITICO: 0 },
                  },
                },
              },
            },
          },
        },
      },
      "/api/v2/transactions/archive/prepare": {
        post: {
          tags: ["Transactions"],
          summary: "Preparar exportación anual de transacciones",
          description:
            "Captura movimientos finalizados con fecha de un año o más. El archivo debe descargarse antes de confirmar la eliminación; la preparación vence en 30 minutos.",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Exportación preparada; total puede ser cero" },
          },
        },
      },
      "/api/v2/transactions/archive/{exportId}/download": {
        post: {
          tags: ["Transactions"],
          summary: "Descargar CSV de movimientos antiguos",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "exportId",
              in: "path",
              required: true,
              schema: { type: "integer", minimum: 1 },
            },
          ],
          responses: {
            "200": {
              description: "CSV UTF-8 de los movimientos incluidos en la preparación",
              content: {
                "text/csv": {
                  schema: { type: "string", format: "binary" },
                },
              },
            },
            "404": { description: "Exportación no encontrada" },
            "409": { description: "Exportación expirada o ya utilizada" },
          },
        },
      },
      "/api/v2/transactions/archive/{exportId}/purge": {
        post: {
          tags: ["Transactions"],
          summary: "Eliminar movimientos exportados",
          description:
            "Elimina solo movimientos finalizados incluidos en el CSV descargado, conserva los saldos actuales y registra la operación en auditoría.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "exportId",
              in: "path",
              required: true,
              schema: { type: "integer", minimum: 1 },
            },
          ],
          responses: {
            "200": { description: "Eliminación anual completada" },
            "404": { description: "Exportación no encontrada" },
            "409": {
              description: "CSV no descargado, exportación expirada o movimientos modificados",
            },
          },
        },
      },
      "/api/v2/transactions/{id}": {
        get: {
          tags: ["Transactions"],
          summary: "Detalle de transacción",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Transacción encontrada" },
            "404": { description: "No encontrada" },
          },
        },
        delete: {
          tags: ["Transactions"],
          summary: "Eliminación individual deshabilitada",
          description:
            "Los movimientos solo se eliminan mediante el flujo anual tras descargar el CSV correspondiente.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "404": { description: "Transacción no encontrada" },
            "409": { description: "La eliminación individual está deshabilitada" },
          },
        },
      },
      "/api/v2/transactions/{id}/status": {
        patch: {
          tags: ["Transactions"],
          summary: "Resolver una transacción pendiente",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateTransactionStatusRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Transacción pendiente resuelta" },
            "400": { description: "Estado inválido" },
            "404": { description: "Transacción no encontrada" },
            "409": { description: "La transacción ya no está pendiente" },
          },
        },
      },
      "/api/v2/transactions/{id}/category": {
        patch: {
          tags: ["Transactions"],
          summary: "Asignar o cambiar la categoría de un movimiento",
          description:
            "La categoría debe estar activa, pertenecer al usuario o ser compartida y coincidir con el tipo de movimiento. Las transferencias no se categorizan.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateTransactionCategoryRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Categoría actualizada" },
            "400": { description: "La categoría no corresponde o es una transferencia" },
            "404": { description: "Transacción o categoría no encontrada" },
          },
        },
      },
      "/api/v2/transactions/email-confirmation": {
        get: {
          tags: ["Transactions"],
          summary: "Consultar un gasto enviado por correo para confirmar",
          description:
            "Endpoint público. Leer el enlace no modifica el estado ni consume la posibilidad de responder; los enlaces vencen a los 15 minutos.",
          parameters: [
            {
              name: "token",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Detalle del gasto y disponibilidad de respuesta" },
            "400": { description: "Enlace inválido o expirado" },
            "404": { description: "Movimiento no encontrado" },
          },
        },
        post: {
          tags: ["Transactions"],
          summary: "Confirmar o rechazar un gasto automático desde el correo",
          description:
            "El enlace puede consultarse varias veces durante 15 minutos, pero solo se acepta una decisión por gasto. La resolución se aplica de forma transaccional y cualquier repetición recibe 409. NO_FUI_YO rechaza el movimiento y registra una alerta crítica.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EmailTransactionConfirmationRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Decisión registrada" },
            "400": { description: "Enlace inválido o expirado" },
            "409": { description: "El movimiento ya fue resuelto" },
            "503": { description: "No se pudo enviar el correo de alerta crítica" },
          },
        },
      },
      "/api/v2/integrations/transactions/webhook": {
        post: {
          tags: ["Transactions"],
          summary: "Recibir un movimiento de un simulador o fuente externa",
          description:
            "Requiere el secreto configurado en TRANSACTION_WEBHOOK_SECRET. Se deduplica por cuenta, fuente e ID externo. GASTO queda pendiente y requiere confirmación por correo; TRANSFERENCIA requiere dos cuentas activas del mismo usuario.",
          security: [{ transactionWebhookSecret: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ExternalTransactionWebhookRequest" },
              },
            },
          },
          responses: {
            "201": { description: "Movimiento recibido" },
            "200": { description: "Evento duplicado; no se creó otro movimiento" },
            "400": { description: "Evento inválido" },
            "401": { description: "Secreto del webhook inválido" },
            "404": { description: "Cuenta no encontrada o fuera del usuario" },
            "503": {
              description: "Webhook no configurado o servicio SMTP no disponible para un gasto",
            },
          },
        },
      },

      // ───────────── DEVICES ─────────────
      "/api/v2/devices": {
        get: {
          tags: ["Devices"],
          summary: "Listar dispositivos",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "Lista de dispositivos" } },
        },
        post: {
          tags: ["Devices"],
          summary: "Registrar o actualizar dispositivo",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterDeviceRequest" },
              },
            },
          },
          responses: { "201": { description: "Dispositivo registrado/actualizado" } },
        },
      },
      "/api/v2/devices/{id}": {
        get: {
          tags: ["Devices"],
          summary: "Detalle de dispositivo",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Dispositivo encontrado" },
            "404": { description: "No encontrado" },
          },
        },
        delete: {
          tags: ["Devices"],
          summary: "Eliminar dispositivo",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: { "200": { description: "Eliminado" } },
        },
      },
      "/api/v2/devices/{id}/trust": {
        patch: {
          tags: ["Devices"],
          summary: "Actualizar estado de confianza",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateDeviceTrustRequest" },
              },
            },
          },
          responses: { "200": { description: "Estado actualizado" } },
        },
      },

      // ───────────── ALERTS ─────────────
      "/api/v2/alerts": {
        get: {
          tags: ["Alerts"],
          summary: "Listar alertas paginadas",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
            { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
            {
              name: "severidad",
              in: "query",
              schema: { type: "string", enum: ["BAJA", "MEDIA", "ALTA", "CRITICA"] },
            },
            {
              name: "estado",
              in: "query",
              schema: { type: "string", enum: ["PENDIENTE", "CONFIRMADA", "DESCARTADA"] },
            },
            {
              name: "sort_by",
              in: "query",
              schema: { type: "string", enum: ["fecha_detectada", "severidad", "estado"] },
            },
            { name: "sort_order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
          ],
          responses: { "200": { description: "Listado paginado" } },
        },
      },
      "/api/v2/alerts/counts-by-level": {
        get: {
          tags: ["Alerts"],
          summary: "Conteos de alertas por nivel",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Conteos por severidad de alerta.",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    data: { BAJA: 3, MEDIA: 2, ALTA: 1, CRITICA: 0 },
                  },
                },
              },
            },
          },
        },
      },
      "/api/v2/alerts/{id}": {
        get: {
          tags: ["Alerts"],
          summary: "Detalle de alerta",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Alerta encontrada" },
            "400": { description: "ID inválido" },
            "404": { description: "No encontrada" },
          },
        },
      },
      "/api/v2/alerts/{id}/status": {
        patch: {
          tags: ["Alerts"],
          summary: "Actualizar estado de alerta",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateAlertStatusRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Estado actualizado" },
            "400": { description: "ID o payload inválido" },
            "404": { description: "Alerta no encontrada" },
          },
        },
      },

      // ───────────── DASHBOARD ─────────────
      "/api/v2/dashboard/stats": {
        get: {
          tags: ["Dashboard"],
          summary: "Estadísticas principales para un periodo seleccionable",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "periodo_dias",
              in: "query",
              schema: { type: "integer", enum: [30, 90, 180, 365], default: 30 },
            },
            {
              name: "id_cuenta",
              in: "query",
              schema: { type: "integer", minimum: 1 },
            },
          ],
          responses: {
            "200": { description: "Saldo total, métricas del periodo y alertas" },
            "400": { description: "Periodo o ID de cuenta inválido" },
          },
        },
      },
      "/api/v2/dashboard/estadisticas": {
        get: {
          tags: ["Dashboard"],
          summary: "Estadísticas principales (alias ES)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "periodo_dias",
              in: "query",
              schema: { type: "integer", enum: [30, 90, 180, 365], default: 30 },
            },
            {
              name: "id_cuenta",
              in: "query",
              schema: { type: "integer", minimum: 1 },
            },
          ],
          responses: {
            "200": { description: "Saldo total, métricas del periodo y alertas" },
            "400": { description: "Periodo o ID de cuenta inválido" },
          },
        },
      },
      "/api/v2/dashboard/recent-alerts": {
        get: {
          tags: ["Dashboard"],
          summary: "Alertas recientes",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 5 } }],
          responses: { "200": { description: "Lista corta de alertas" } },
        },
      },
      "/api/v2/dashboard/alertas-recientes": {
        get: {
          tags: ["Dashboard"],
          summary: "Alertas recientes (alias ES)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 5 } }],
          responses: { "200": { description: "Lista corta de alertas" } },
        },
      },
      "/api/v2/dashboard/recent-transactions": {
        get: {
          tags: ["Dashboard"],
          summary: "Transacciones recientes",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 5 } }],
          responses: { "200": { description: "Lista corta de transacciones" } },
        },
      },
      "/api/v2/dashboard/transacciones-recientes": {
        get: {
          tags: ["Dashboard"],
          summary: "Transacciones recientes (alias ES)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 5 } }],
          responses: { "200": { description: "Lista corta de transacciones" } },
        },
      },
      "/api/v2/dashboard/advice": {
        get: {
          tags: ["Dashboard"],
          summary: "Consejos financieros no leídos",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Consejos recientes generados por reglas del sistema" },
          },
        },
      },
      "/api/v2/dashboard/advice/{id}/read": {
        patch: {
          tags: ["Dashboard"],
          summary: "Marcar un consejo como leído",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer", minimum: 1 },
            },
          ],
          responses: {
            "200": { description: "Consejo marcado como leído" },
            "404": { description: "Consejo no encontrado" },
          },
        },
      },

      // ───────────── BUDGETS ─────────────
      "/api/v2/budgets": {
        get: {
          tags: ["Budgets"],
          summary: "Listar presupuestos con gasto calculado",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id_cuenta", in: "query", schema: { type: "integer", minimum: 1 } },
            { name: "mes", in: "query", schema: { type: "integer", minimum: 1, maximum: 12 } },
            {
              name: "anio",
              in: "query",
              schema: { type: "integer", minimum: 2020, maximum: 2100 },
            },
          ],
          responses: { "200": { description: "Lista de presupuestos" } },
        },
        post: {
          tags: ["Budgets"],
          summary: "Crear presupuesto",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateBudgetRequest" },
              },
            },
          },
          responses: { "201": { description: "Presupuesto creado" } },
        },
      },
      "/api/v2/budgets/{id}": {
        patch: {
          tags: ["Budgets"],
          summary: "Actualizar presupuesto",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateBudgetRequest" },
              },
            },
          },
          responses: { "200": { description: "Presupuesto actualizado" } },
        },
        delete: {
          tags: ["Budgets"],
          summary: "Eliminar presupuesto",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: { "200": { description: "Eliminado" } },
        },
      },

      // ───────────── SAVINGS ─────────────
      "/api/v2/savings": {
        get: {
          tags: ["Savings"],
          summary: "Listar metas de ahorro",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "Lista de metas" } },
        },
        post: {
          tags: ["Savings"],
          summary: "Crear meta de ahorro",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateSavingsRequest" },
              },
            },
          },
          responses: { "201": { description: "Meta creada" } },
        },
      },
      "/api/v2/savings/{id}": {
        patch: {
          tags: ["Savings"],
          summary: "Actualizar meta de ahorro",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateSavingsRequest" },
              },
            },
          },
          responses: { "200": { description: "Meta actualizada" } },
        },
        delete: {
          tags: ["Savings"],
          summary: "Eliminar meta de ahorro",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: { "200": { description: "Eliminada" } },
        },
      },
      "/api/v2/savings/{id}/funds": {
        post: {
          tags: ["Savings"],
          summary: "Agregar fondos a una meta",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AddFundsRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Aporte registrado y meta actualizada" },
            "400": { description: "ID o monto inválido" },
            "404": { description: "Meta no encontrada para el usuario" },
            "409": { description: "La meta no está activa" },
          },
        },
      },

      // ───────────── PROFILE ─────────────
      "/api/v2/profile": {
        get: {
          tags: ["Profile"],
          summary: "Alias compatible de GET /auth/me",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "Perfil" } },
        },
        patch: {
          tags: ["Profile"],
          summary: "Alias compatible de PATCH /auth/me",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateProfileRequest" },
              },
            },
          },
          responses: { "200": { description: "Perfil actualizado" } },
        },
      },
      "/api/v2/profile/behavior-pattern": {
        get: {
          tags: ["Profile"],
          summary: "Patrón de comportamiento financiero",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "Patrón o null" } },
        },
      },

      // ───────────── INSIGHTS ─────────────
      "/api/v2/insights": {
        get: {
          tags: ["Insights"],
          summary: "Insights y consejos financieros",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "periodo_dias",
              in: "query",
              schema: { type: "integer", default: 30, minimum: 7, maximum: 365 },
            },
          ],
          responses: {
            "200": {
              description: "Resumen, top categorías/comercios y consejos",
            },
          },
        },
      },

      // ───────────── REPORTS ─────────────
      "/api/v2/reports/summary": {
        get: {
          tags: ["Reports"],
          summary: "Resumen financiero por periodo",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "fecha_inicio",
              in: "query",
              schema: { type: "string", description: "Fecha ISO 8601 (fecha o fecha-hora)" },
            },
            {
              name: "fecha_fin",
              in: "query",
              schema: { type: "string", description: "Fecha ISO 8601 (fecha o fecha-hora)" },
            },
            {
              name: "id_cuenta",
              in: "query",
              schema: { type: "integer", minimum: 1 },
            },
          ],
          responses: { "200": { description: "Totales e indicadores" } },
        },
      },
      "/api/v2/reports/by-category": {
        get: {
          tags: ["Reports"],
          summary: "Desglose por categoría",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "fecha_inicio",
              in: "query",
              schema: { type: "string", description: "Fecha ISO 8601 (fecha o fecha-hora)" },
            },
            {
              name: "fecha_fin",
              in: "query",
              schema: { type: "string", description: "Fecha ISO 8601 (fecha o fecha-hora)" },
            },
            {
              name: "id_cuenta",
              in: "query",
              schema: { type: "integer", minimum: 1 },
            },
            {
              name: "tipo_movimiento",
              in: "query",
              schema: {
                type: "string",
                enum: ["INGRESO", "GASTO", "AHORRO", "TRANSFERENCIA"],
              },
            },
          ],
          responses: { "200": { description: "Totales por categoría" } },
        },
      },
      "/api/v2/reports/transactions": {
        get: {
          tags: ["Reports"],
          summary: "Detalle exportable de transacciones",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "fecha_inicio",
              in: "query",
              schema: { type: "string", description: "Fecha ISO 8601 (fecha o fecha-hora)" },
            },
            {
              name: "fecha_fin",
              in: "query",
              schema: { type: "string", description: "Fecha ISO 8601 (fecha o fecha-hora)" },
            },
            {
              name: "id_cuenta",
              in: "query",
              schema: { type: "integer", minimum: 1 },
            },
            {
              name: "tipo_movimiento",
              in: "query",
              schema: {
                type: "string",
                enum: ["INGRESO", "GASTO", "AHORRO", "TRANSFERENCIA"],
              },
            },
            { name: "limit", in: "query", schema: { type: "integer", default: 500 } },
          ],
          responses: {
            "200": {
              description:
                "Listado paginado con total real, truncated y cinco comercios principales",
            },
          },
        },
      },

      // ───────────── MAP ─────────────
      "/api/v2/map/stats": {
        get: {
          tags: ["Map"],
          summary: "Estadísticas geográficas",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id_cuenta",
              in: "query",
              schema: { type: "integer", minimum: 1 },
            },
          ],
          responses: {
            "200": {
              description: "Conteos de ubicaciones y riesgo geográfico",
            },
          },
        },
      },
      "/api/v2/map/locations": {
        get: {
          tags: ["Map"],
          summary: "Marcadores de transacciones geolocalizadas",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id_cuenta",
              in: "query",
              schema: { type: "integer", minimum: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 500, minimum: 1, maximum: 2000 },
            },
            {
              name: "nivel_riesgo",
              in: "query",
              schema: { type: "string", enum: ["BAJO", "MEDIO", "ALTO", "CRITICO", "ALL"] },
            },
            {
              name: "estado",
              in: "query",
              schema: {
                type: "string",
                enum: ["PENDIENTE", "CONFIRMADA", "APROBADA", "SOSPECHOSA", "RECHAZADA", "ALL"],
              },
            },
            {
              name: "fecha_inicio",
              in: "query",
              schema: { type: "string", description: "Fecha ISO 8601 (fecha o fecha-hora)" },
            },
            {
              name: "fecha_fin",
              in: "query",
              schema: { type: "string", description: "Fecha ISO 8601 (fecha o fecha-hora)" },
            },
          ],
          responses: { "200": { description: "items + total + truncated" } },
        },
      },
      "/api/v2/map/ubicaciones": {
        get: {
          tags: ["Map"],
          summary: "Marcadores geolocalizados (alias ES)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 500, minimum: 1, maximum: 2000 },
            },
            {
              name: "nivel_riesgo",
              in: "query",
              schema: { type: "string", enum: ["BAJO", "MEDIO", "ALTO", "CRITICO", "ALL"] },
            },
            {
              name: "estado",
              in: "query",
              schema: {
                type: "string",
                enum: ["PENDIENTE", "CONFIRMADA", "APROBADA", "SOSPECHOSA", "RECHAZADA", "ALL"],
              },
            },
            {
              name: "fecha_inicio",
              in: "query",
              schema: { type: "string", description: "Fecha ISO 8601 (fecha o fecha-hora)" },
            },
            {
              name: "fecha_fin",
              in: "query",
              schema: { type: "string", description: "Fecha ISO 8601 (fecha o fecha-hora)" },
            },
          ],
          responses: { "200": { description: "items + total + truncated" } },
        },
      },
    },
  },
  apis: [],
};

type SwaggerResponse = {
  $ref?: string;
  description?: string;
  content?: unknown;
  [key: string]: unknown;
};

type SwaggerOperation = {
  security?: unknown[];
  responses?: Record<string, SwaggerResponse>;
};

const generatedSwaggerSpec = swaggerJsdoc(options);
type SwaggerDocument = {
  components?: { schemas?: Record<string, OpenApiSchema> };
  paths?: Record<string, Record<string, unknown>>;
};
const swaggerDocument = generatedSwaggerSpec as unknown as SwaggerDocument;
const componentSchemas = swaggerDocument.components?.schemas;
if (!componentSchemas) {
  throw new Error("OpenAPI component schemas were not generated");
}
Object.assign(componentSchemas, responseDataSchemas);
const paths = swaggerDocument.paths;
const httpMethods = new Set(["get", "post", "put", "patch", "delete", "options", "head", "trace"]);

function getExample(schema: OpenApiSchema, depth = 0): unknown {
  if (depth > 8) return null;
  if (typeof schema.$ref === "string") {
    const componentName = schema.$ref.split("/").pop();
    const referencedSchema = componentName ? componentSchemas?.[componentName] : undefined;
    return referencedSchema ? getExample(referencedSchema, depth + 1) : null;
  }
  if ("example" in schema) return schema.example;
  if (schema.nullable === true) return null;
  if (schema.type === "array") {
    return [getExample(schema.items as OpenApiSchema, depth + 1)];
  }
  if (schema.type === "object") {
    const properties = schema.properties as Record<string, OpenApiSchema> | undefined;
    return Object.fromEntries(
      Object.entries(properties ?? {}).map(([name, property]) => [
        name,
        getExample(property, depth + 1),
      ]),
    );
  }
  if (schema.type === "string") {
    return schema.format === "date-time" ? "2026-11-19T10:00:00.000Z" : "string";
  }
  if (schema.type === "integer" || schema.type === "number") return 1;
  if (schema.type === "boolean") return true;
  return null;
}

for (const [path, pathItem] of Object.entries(paths ?? {})) {
  for (const [method, rawOperation] of Object.entries(pathItem)) {
    if (!httpMethods.has(method) || typeof rawOperation !== "object" || rawOperation === null) {
      continue;
    }

    const operation = rawOperation as SwaggerOperation;
    const responses = operation.responses ?? {};
    const statuses = new Set(
      Object.keys(responses).filter((status) => status in errorResponseComponentByStatus),
    );

    if (path.startsWith("/api/v2/")) {
      statuses.add("400");
      statuses.add("409");
      statuses.add("429");
      statuses.add("500");
      if (path === "/api/v2/auth/login") {
        statuses.add("423");
      }

      if (operation.security?.length) {
        statuses.add("401");
        statuses.add("403");
      }

      if (
        path.includes("{id}") ||
        (method === "post" && (path === "/api/v2/transactions" || path === "/api/v2/budgets"))
      ) {
        statuses.add("404");
      }

      if (method === "post" && path === "/api/v2/devices") {
        statuses.add("409");
      }
    } else if (path === "/health" || path === "/health/ready") {
      statuses.add("429");
      statuses.add("500");
    }

    for (const status of statuses) {
      const componentName = errorResponseComponentByStatus[status];
      const existing = responses[status];
      responses[status] = existing
        ? {
            ...existing,
            content: errorContentByStatus[status as keyof typeof errorContentByStatus],
          }
        : { $ref: `#/components/responses/${componentName}` };
    }

    if (path.startsWith("/api/v2/")) {
      for (const [status, response] of Object.entries(responses)) {
        if (!/^2\d\d$/.test(status)) continue;
        if (rawResponseOperations.has(`${method} ${path}`)) continue;

        const schemaName = successSchemaByOperation[path]?.[method];
        const dataSchema = schemaName ? componentSchemas[schemaName] : undefined;
        if (!schemaName || !dataSchema) {
          throw new Error(`Missing response schema for ${method.toUpperCase()} ${path}`);
        }

        const content =
          typeof response.content === "object" && response.content !== null
            ? (response.content as Record<
                string,
                { schema?: { $ref?: string }; [key: string]: unknown }
              >)
            : {};
        const jsonContent = content["application/json"] ?? {};
        const responseExample = jsonContent.example ?? {
          success: true,
          message: "Operación exitosa",
          data: getExample(schemaRef(schemaName)),
        };
        responses[status] = {
          ...response,
          content: {
            ...content,
            "application/json": {
              ...jsonContent,
              schema: {
                type: "object",
                required: ["success", "data"],
                properties: {
                  success: { type: "boolean", enum: [true] },
                  message: { type: "string" },
                  data: schemaRef(schemaName),
                },
              },
              example: responseExample,
            },
          },
        };
      }
    }

    operation.responses = responses;
  }
}

export const swaggerSpec = generatedSwaggerSpec;
