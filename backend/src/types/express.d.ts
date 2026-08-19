export interface JwtPayloadCustom {
    id_usuario: number;
    email: string;
    rol: string;
    nombre?: string;
    purpose?: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayloadCustom;
        }
    }
}

