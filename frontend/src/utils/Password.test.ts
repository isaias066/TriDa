import { describe, expect, it } from "vitest";
import {
  getPasswordChecks,
  getPasswordValidationMessage,
  isStrongPassword,
} from "./Password";

describe("password validation", () => {
  it("accepts only passwords that satisfy every backend rule", () => {
    expect(isStrongPassword("SecurePass!word")).toBe(true);
    expect(isStrongPassword("Abcdefg!12")).toBe(false);
    expect(isStrongPassword("Abcdefgh!12")).toBe(false);
    expect(isStrongPassword("Abcdefg!hijk")).toBe(true);
    expect(isStrongPassword("Abcdefghijk1")).toBe(false);
    expect(isStrongPassword("Abcdefg hijk")).toBe(false);
    expect(isStrongPassword(`A!${"a".repeat(70)}`)).toBe(true);
    expect(isStrongPassword(`A!${"a".repeat(71)}`)).toBe(false);
  });

  it("reports the limit independently from character content", () => {
    const checks = getPasswordChecks("SecurePass!word");
    expect(checks.minLength).toBe(true);
    expect(checks.maxLength).toBe(true);
    expect(checks.hasUpper).toBe(true);
    expect(checks.hasLower).toBe(true);
    expect(checks.hasSpecial).toBe(true);
    expect(getPasswordValidationMessage("SecurePass!word")).toBe("");
  });

  it("returns a clear message for passwords above the backend limit", () => {
    expect(getPasswordValidationMessage(`A!${"a".repeat(71)}`)).toBe(
      "La contraseña no puede superar los 72 caracteres.",
    );
  });

  it("requires at least 12 characters and a special character", () => {
    expect(getPasswordValidationMessage("Abcdefgh!12")).toBe(
      "La contraseña debe tener al menos 12 caracteres.",
    );
    expect(getPasswordValidationMessage("Abcdefghijkl")).toBe(
      "La contraseña debe contener al menos una mayúscula, una minúscula y un carácter especial distinto de letras, números o espacios.",
    );
  });
});
