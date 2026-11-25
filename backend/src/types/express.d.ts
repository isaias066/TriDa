// ¿Qué? Extensión de tipos globales de Express.
// ¿Para qué? Añadir la propiedad `user` al objeto Request tras pasar el middleware de autenticación.
// ¿Impacto? Alto (permite type-safety para req.user en todos los controllers y middlewares).

import { JwtPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
