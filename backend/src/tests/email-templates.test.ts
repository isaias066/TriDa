import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmailVerificationTemplate,
  createPasswordResetEmailTemplate,
} from "../modules/auth/email-templates.js";
import {
  createCriticalAlertEmailTemplate,
  createTransactionConfirmationEmailTemplate,
} from "../utils/transaction-email-templates.js";

test("verification email includes a centered CTA, expiry, and plain-text alternative", () => {
  const verificationUrl = "https://app.example/verify-email#token=abc&scope=account";
  const template = createEmailVerificationTemplate(verificationUrl);

  assert.match(template.html, /Confirma tu correo/);
  assert.match(template.html, /Verificar mi correo/);
  assert.match(template.html, /15 minutos/);
  assert.match(template.html, /text-align:center/);
  assert.match(template.html, /token=abc&amp;scope=account/);
  assert.ok(template.text.includes(verificationUrl));
});

test("verification URL is escaped before it is embedded in HTML", () => {
  const template = createEmailVerificationTemplate(
    'https://app.example/verify-email?next="><script>alert(1)</script>',
  );

  assert.doesNotMatch(template.html, /<script>/);
  assert.match(template.html, /&quot;&gt;&lt;script&gt;/);
});

test("password reset email includes a centered CTA, expiry, and security notice", () => {
  const resetUrl = "https://app.example/reset-password#token=abc&scope=reset";
  const template = createPasswordResetEmailTemplate(resetUrl);

  assert.match(template.html, /Restablece tu contraseña/);
  assert.match(template.html, /Crear nueva contraseña/);
  assert.match(template.html, /20 minutos/);
  assert.match(template.html, /text-align:center/);
  assert.match(template.html, /token=abc&amp;scope=reset/);
  assert.match(template.html, /tu contraseña no cambiará/);
  assert.ok(template.text.includes(resetUrl));
});

test("transaction and alert emails use the shared TriDa design and preserve safe links", () => {
  const transactionEmail = createTransactionConfirmationEmailTemplate(
    "$ 25.000",
    '<img src=x onerror="alert(1)">',
    "https://app.example/transactions/confirm#token=abc&scope=transaction",
  );
  const alertEmail = createCriticalAlertEmailTemplate("https://app.example/security");

  for (const template of [transactionEmail, alertEmail]) {
    assert.match(template.html, /background-color:#5b42c6/);
    assert.match(template.html, /max-width:600px/);
    assert.match(template.html, /text-align:center/);
    assert.ok(template.text.includes("https://app.example/"));
  }
  assert.match(transactionEmail.html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.doesNotMatch(transactionEmail.html, /<img/);
  assert.match(alertEmail.html, /Alerta crítica de seguridad/);
  assert.match(alertEmail.html, /https:\/\/app\.example\/security/);
});
