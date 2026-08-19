import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config/env';
import { JwtPayloadCustom } from '../types/express';

export function verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, CONFIG.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }
        req.user = decoded as JwtPayloadCustom;
        next();
    });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.user || req.user.rol !== 'ADMINISTRADOR') {
        return res.status(403).json({ error: 'Se requieren privilegios de administrador' });
    }
    next();
}

