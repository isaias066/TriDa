import { prisma } from '../../db/prisma.js';
export const usersService = {
    async listAll() {
        const rows = await prisma.$queryRaw `
      SELECT * FROM trida.fn_listar_usuarios_sistema()
    `;
        return rows.map((u) => {
            const idNum = Number(u.id_usuario);
            return {
                id: String(idNum),
                id_usuario: idNum,
                nombre_completo: u.nombre_completo,
                nombre: u.nombre_completo,
                email: u.email,
                rol: u.rol,
                estado: Boolean(u.estado),
                fecha_creacion: u.fecha_creacion,
                ultimo_acceso: u.ultimo_acceso,
                id_usuario_generador: u.id_usuario_generador ? Number(u.id_usuario_generador) : null,
            };
        });
    },
    async updateStatus(idUsuario, estado) {
        const u = await prisma.usuarioSistema.update({
            where: { id_usuario: idUsuario },
            data: { estado },
            select: {
                id_usuario: true,
                nombre_completo: true,
                email: true,
                rol: true,
                estado: true,
            },
        });
        return {
            ...u,
            id: String(u.id_usuario),
            nombre: u.nombre_completo,
        };
    },
    async updateRole(idUsuario, rol) {
        const u = await prisma.usuarioSistema.update({
            where: { id_usuario: idUsuario },
            data: { rol },
            select: {
                id_usuario: true,
                nombre_completo: true,
                email: true,
                rol: true,
                estado: true,
            },
        });
        return {
            ...u,
            id: String(u.id_usuario),
            nombre: u.nombre_completo,
        };
    },
};
//# sourceMappingURL=users.service.js.map