// ¿Qué? Configuración central de la aplicación Express.
// ¿Para qué? Registrar middlewares globales y montar todos los módulos de la API.
// ¿Impacto? Punto único de ensamblaje del backend TriDa.
// ¿Qué? Configuración central de Express con compatibilidad de BigInt y alias de rutas.
// ¿Para qué? Servir endpoints en inglés técnico (RL-001) y en español (compatibilidad con frontend).
// ¿Impacto? Resuelve los errores 500 por BigInt y los errores 404 por rutas en español.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { apiRateLimiter } from './middlewares/rateLimit.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import transactionsRoutes from './modules/transactions/transactions.routes.js';
import alertsRoutes from './modules/alerts/alerts.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import mapRoutes from './modules/map/map.routes.js';
import banksRoutes from './modules/banks/banks.routes.js';
import customersRoutes from './modules/customers/customers.routes.js';
import devicesRoutes from './modules/devices/devices.routes.js';
import usersRoutes from './modules/users/users.routes.js';
// ── FIX BIGINT: Permitir que JSON.stringify convierta BigInt de PostgreSQL a Number ──
BigInt.prototype.toJSON = function () {
    return Number(this);
};
const app = express();
app.use(helmet());
app.use(cors({
    origin: config.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use('/api', apiRateLimiter);
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ── RUTAS PRINCIPALES (Inglés Técnico - RL-001) ───────────────
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/banks', banksRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/users', usersRoutes);
// ── COMPATIBILIDAD FRONTEND (Alias en Español para evitar 404) ─
app.use('/api/transacciones', transactionsRoutes);
app.use('/api/alertas', alertsRoutes);
app.use('/api/bancos', banksRoutes);
app.use('/api/dispositivos', devicesRoutes);
app.use('/api/tareas', customersRoutes);
app.use('/api/usuarios', customersRoutes);
app.use('/api/mapa', mapRoutes);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map