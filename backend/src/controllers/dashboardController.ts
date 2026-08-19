import { Request, Response } from 'express';
import pool from '../config/db';

export const getStats = async (req: Request, res: Response) => {
    try {
        const banco = req.query.banco as string | undefined;
        const resultado = await pool.query('SELECT * FROM trida.fn_dashboard_stats($1);', [banco || null]);
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al consultar estadísticas del dashboard:', error);
        res.status(500).json({ error: 'No se pudieron obtener las estadísticas' });
    }
};

export const getAlertasRecientes = async (req: Request, res: Response) => {
    try {
        const banco = req.query.banco as string | undefined;
        const resultado = await pool.query('SELECT * FROM trida.fn_alertas_recientes($1);', [banco || null]);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar alertas recientes:', error);
        res.status(500).json({ error: 'No se pudieron obtener las alertas' });
    }
};
