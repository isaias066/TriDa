import { Request, Response } from 'express';
import pool from '../config/db';

export const getStats = async (req: Request, res: Response) => {
    try {
        const banco = req.query.banco as string | undefined;
        const resultado = await pool.query('SELECT * FROM trida.fn_mapa_stats($1);', [banco || null]);
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al consultar stats del mapa:', error);
        res.status(500).json({ error: 'No se pudieron obtener las estadísticas del mapa' });
    }
};

export const getUbicaciones = async (req: Request, res: Response) => {
    try {
        const banco = req.query.banco as string | undefined;
        const resultado = await pool.query('SELECT * FROM trida.fn_mapa_ubicaciones($1);', [banco || null]);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar ubicaciones:', error);
        res.status(500).json({ error: 'No se pudieron obtener las ubicaciones' });
    }
};

