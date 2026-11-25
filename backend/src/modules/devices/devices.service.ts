import { prisma } from "../../db/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { RegisterDeviceInput } from "./devices.schemas.js";

export class DeviceError extends AppError {
  constructor(message: string, statusCode = 400, code = "DEVICE_ERROR") {
    super(message, statusCode, code);
  }
}

export class DevicesService {
  async list(userId: number) {
    return prisma.dispositivo.findMany({
      where: { id_usuario: userId },
      orderBy: { fecha_ultimo_uso: "desc" },
    });
  }

  async getById(userId: number, deviceId: number) {
    const device = await prisma.dispositivo.findFirst({
      where: {
        id_dispositivo: deviceId,
        id_usuario: userId,
      },
    });

    if (!device) {
      throw new DeviceError("Dispositivo no encontrado", 404);
    }

    return device;
  }

  async registerOrUpdate(userId: number, data: RegisterDeviceInput) {
    return prisma.$transaction(async (transaction) => {
      const uniqueDevice = {
        id_usuario_identificador_unico: {
          id_usuario: userId,
          identificador_unico: data.identificador_unico,
        },
      };
      const existingDevice = await transaction.dispositivo.findUnique({
        where: uniqueDevice,
        select: { id_dispositivo: true },
      });
      let firstDevice = false;
      if (!existingDevice) {
        const claimedFirstDevice = await transaction.$executeRaw`
          UPDATE trida.usuarios
          SET dispositivo_historial_registrado = TRUE
          WHERE id_usuario = ${userId}
            AND dispositivo_historial_registrado = FALSE
        `;
        firstDevice = claimedFirstDevice === 1;
      }

      const device = await transaction.dispositivo.upsert({
        where: uniqueDevice,
        create: {
          id_usuario: userId,
          identificador_unico: data.identificador_unico,
          tipo_dispositivo: data.tipo_dispositivo,
          sistema_operativo: data.sistema_operativo,
          navegador: data.navegador,
          confiable: firstDevice,
        },
        update: {
          tipo_dispositivo: data.tipo_dispositivo,
          sistema_operativo: data.sistema_operativo,
          navegador: data.navegador,
          fecha_ultimo_uso: new Date(),
        },
      });

      if (!existingDevice) {
        await transaction.log_auditoria.create({
          data: {
            id_usuario: userId,
            tipo_accion: "DISPOSITIVO_REGISTRADO",
            entidad_afectada: "dispositivos",
            id_entidad: device.id_dispositivo,
            descripcion: device.confiable
              ? "Se registró el primer dispositivo y se marcó como confiable."
              : "Se registró un dispositivo.",
          },
        });
      }

      return device;
    });
  }

  async updateTrustStatus(userId: number, deviceId: number, confiable: boolean) {
    return prisma.$transaction(async (transaction) => {
      const device = await transaction.dispositivo.findFirst({
        where: {
          id_dispositivo: deviceId,
          id_usuario: userId,
        },
      });

      if (!device) {
        throw new DeviceError("Dispositivo no encontrado", 404);
      }

      if (device.confiable === confiable) {
        return device;
      }

      const updatedDevice = await transaction.dispositivo.update({
        where: { id_dispositivo: deviceId },
        data: { confiable },
      });
      await transaction.log_auditoria.create({
        data: {
          id_usuario: userId,
          tipo_accion: confiable
            ? "DISPOSITIVO_MARCADO_CONFIABLE"
            : "DISPOSITIVO_MARCADO_NO_CONFIABLE",
          entidad_afectada: "dispositivos",
          id_entidad: deviceId,
          descripcion: confiable
            ? "El dispositivo fue marcado como confiable."
            : "El dispositivo dejó de ser confiable.",
        },
      });

      return updatedDevice;
    });
  }

  async delete(userId: number, deviceId: number) {
    return prisma.$transaction(async (transaction) => {
      const device = await transaction.dispositivo.findFirst({
        where: {
          id_dispositivo: deviceId,
          id_usuario: userId,
        },
      });

      if (!device) {
        throw new DeviceError("Dispositivo no encontrado", 404);
      }

      const deletedDevice = await transaction.dispositivo.delete({
        where: { id_dispositivo: deviceId },
      });
      await transaction.usuario.update({
        where: { id_usuario: userId },
        data: { token_version: { increment: 1 } },
      });
      await transaction.log_auditoria.create({
        data: {
          id_usuario: userId,
          tipo_accion: "DISPOSITIVO_ELIMINADO",
          entidad_afectada: "dispositivos",
          id_entidad: deviceId,
          descripcion: "Se eliminó un dispositivo de la cuenta.",
        },
      });

      return deletedDevice;
    });
  }
}

export const devicesService = new DevicesService();
export const deviceService = devicesService;
