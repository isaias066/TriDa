import { Request, Response } from 'express';
import pool from '../config/db';

export const getMetricas = async (req: Request, res: Response) => {
    try {
        const banco = req.query.banco as string | undefined;
        const resultado = await pool.query('SELECT * FROM trida.fn_analytics_metricas($1);', [banco || null]);
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al consultar métricas de analytics:', error);
        res.status(500).json({ error: 'No se pudieron obtener las métricas' });
    }
};

export const getAgregaciones = async (req: Request, res: Response) => {
    try {
        const banco = req.query.banco as string | undefined;
        const params = [banco || null];

        const [porTipo, porCiudad, porCanal, porBanco] = await Promise.all([
            pool.query('SELECT * FROM trida.fn_analytics_por_tipo($1);', params),
            pool.query('SELECT * FROM trida.fn_analytics_por_ciudad($1);', params),
            pool.query('SELECT * FROM trida.fn_analytics_por_canal($1);', params),
            pool.query('SELECT * FROM trida.fn_analytics_por_banco_fraude($1);', params),
        ]);

        res.json({
            porTipo: porTipo.rows,
            porCiudad: porCiudad.rows,
            porCanal: porCanal.rows,
            porBanco: porBanco.rows,
        });
    } catch (error) {
        console.error('Error al consultar agregaciones:', error);
        res.status(500).json({ error: 'No se pudieron obtener las agregaciones' });
    }
};

