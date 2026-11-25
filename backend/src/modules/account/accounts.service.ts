import { prisma } from "../../db/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateAccountInput, UpdateAccountInput } from "./accounts.schemas.js";

type AccountRecord = NonNullable<Awaited<ReturnType<typeof prisma.cuenta.findFirst>>>;

function formatAccount(account: AccountRecord) {
  return {
    ...account,
    saldo_inicial: Number(account.saldo_inicial),
    saldo_actual: Number(account.saldo_actual),
  };
}

export class AccountError extends AppError {
  constructor(message: string, statusCode = 400, code = "ACCOUNT_ERROR") {
    super(message, statusCode, code);
  }
}

export class AccountsService {
  async getAccounts(userId: number) {
    const accounts = await prisma.cuenta.findMany({
      where: { id_usuario: userId, estado: true },
    });
    return accounts.map(formatAccount);
  }

  async list(userId: number) {
    return this.getAccounts(userId);
  }

  async getAccountById(userId: number, accountId: number) {
    const account = await prisma.cuenta.findFirst({
      where: {
        id_cuenta: accountId,
        id_usuario: userId,
      },
    });

    if (!account) {
      throw new AccountError("Cuenta bancaria no encontrada", 404);
    }

    return formatAccount(account);
  }

  async getById(userId: number, accountId: number) {
    return this.getAccountById(userId, accountId);
  }

  async createAccount(userId: number, data: CreateAccountInput) {
    const account = await prisma.cuenta.create({
      data: {
        id_usuario: userId,
        nombre: data.nombre,
        entidad: data.tipo === "EFECTIVO" ? null : data.entidad,
        tipo: data.tipo,
        numero_enmascarado:
          data.tipo === "EFECTIVO" ? null : data.numero_enmascarado,
        color: data.color,
        saldo_inicial: data.saldo_inicial,
        saldo_actual: data.saldo_inicial,
        estado: data.estado,
      },
    });
    return formatAccount(account);
  }

  async create(userId: number, data: CreateAccountInput) {
    return this.createAccount(userId, data);
  }

  async updateAccount(userId: number, accountId: number, data: UpdateAccountInput) {
    const existing = await this.getAccountById(userId, accountId);
    const tipo = data.tipo ?? existing.tipo;
    const entidad = data.entidad ?? existing.entidad;
    const numero = data.numero_enmascarado ?? existing.numero_enmascarado;

    if (tipo !== "EFECTIVO" && !entidad?.trim()) {
      throw new AccountError("La entidad financiera es requerida");
    }
    if (tipo !== "EFECTIVO" && !numero) {
      throw new AccountError("El número de cuenta es requerido");
    }

    const updateData =
      data.tipo === "EFECTIVO"
        ? { ...data, entidad: null, numero_enmascarado: null }
        : data;

    const account = await prisma.cuenta.update({
      where: { id_cuenta: accountId },
      data: updateData,
    });
    return formatAccount(account);
  }

  async update(userId: number, accountId: number, data: UpdateAccountInput) {
    return this.updateAccount(userId, accountId, data);
  }

  async deactivate(userId: number, accountId: number) {
    await this.getAccountById(userId, accountId);

    const account = await prisma.cuenta.update({
      where: { id_cuenta: accountId },
      data: { estado: false },
    });

    return {
      id_cuenta: account.id_cuenta,
      nombre: account.nombre,
      estado: account.estado,
    };
  }
}

export const accountsService = new AccountsService();
export const accountService = accountsService;
