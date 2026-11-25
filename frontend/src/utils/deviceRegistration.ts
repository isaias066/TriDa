import { DevicesApi } from "@/api/Devices";

const registrationPromises = new Map<number, Promise<number>>();

const deviceIdentifierKey = (userId: number) =>
  `trida_device_identifier_${userId}`;
const deviceRecordIdKey = (userId: number) => `trida_device_record_${userId}`;

export const getCurrentDeviceRecordId = (userId: number): number | null => {
  const recordId = Number(localStorage.getItem(deviceRecordIdKey(userId)));
  return Number.isSafeInteger(recordId) && recordId > 0 ? recordId : null;
};

export const clearCurrentDeviceRecordId = (
  userId: number,
  recordId: number,
) => {
  const key = deviceRecordIdKey(userId);
  if (Number(localStorage.getItem(key)) === recordId) {
    localStorage.removeItem(key);
  }
};

export const registerCurrentDevice = async (
  userId: number,
): Promise<number> => {
  const inFlight = registrationPromises.get(userId);
  if (inFlight) return inFlight;

  const registration = registerDevice(userId);
  registrationPromises.set(userId, registration);
  try {
    return await registration;
  } finally {
    registrationPromises.delete(userId);
  }
};

const registerDevice = async (userId: number): Promise<number> => {
  const identifierKey = deviceIdentifierKey(userId);
  let identifier = localStorage.getItem(identifierKey);
  if (!identifier) {
    identifier = crypto.randomUUID();
    localStorage.setItem(identifierKey, identifier);
  }

  const userAgent = navigator.userAgent;
  const browser = userAgent.includes("Edg/")
    ? "Edge"
    : userAgent.includes("Firefox/")
      ? "Firefox"
      : userAgent.includes("Chrome/")
        ? "Chrome"
        : userAgent.includes("Safari/")
          ? "Safari"
          : "Desconocido";
  const operatingSystem = userAgent.includes("Windows")
    ? "Windows"
    : userAgent.includes("Mac OS")
      ? "macOS"
      : userAgent.includes("Android")
        ? "Android"
        : userAgent.includes("iPhone") || userAgent.includes("iPad")
          ? "iOS"
          : userAgent.includes("Linux")
            ? "Linux"
            : "Desconocido";

  const response = await DevicesApi.register({
    identificador_unico: identifier,
    tipo_dispositivo: /Mobi|Android|iPhone|iPad/i.test(userAgent)
      ? "MOBILE"
      : "BROWSER",
    sistema_operativo: operatingSystem,
    navegador: browser,
  });
  const recordId = response.id_dispositivo;
  localStorage.setItem(deviceRecordIdKey(userId), String(recordId));
  window.dispatchEvent(new Event("trida-device-registered"));
  return recordId;
};
