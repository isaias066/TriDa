interface BrandedEmailContent {
  preheader: string;
  badge: string;
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
  expiration: string;
  securityNote: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function createBrandedEmailTemplate(content: BrandedEmailContent) {
  const safe = {
    preheader: escapeHtml(content.preheader),
    badge: escapeHtml(content.badge),
    title: escapeHtml(content.title),
    description: escapeHtml(content.description),
    actionLabel: escapeHtml(content.actionLabel),
    actionUrl: escapeHtml(content.actionUrl),
    expiration: escapeHtml(content.expiration),
    securityNote: escapeHtml(content.securityNote),
  };
  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safe.title} | TriDa</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f5fa;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <div style="display:none;font-size:1px;color:#f3f5fa;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
      ${safe.preheader}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f5fa;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #e1e5ee;border-radius:20px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:30px 24px;background-color:#5b42c6;">
                <p style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.5px;">TriDa</p>
                <p style="margin:7px 0 0;color:#eeeaff;font-size:13px;line-height:20px;">Asesor financiero y protección inteligente</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:36px 32px 24px;">
                <p style="display:inline-block;margin:0 0 16px;padding:7px 12px;border:1px solid #dcd5ff;border-radius:999px;background-color:#f3f0ff;color:#4b36a4;font-size:11px;font-weight:700;letter-spacing:0.8px;">${safe.badge}</p>
                <h1 style="margin:0;color:#172033;font-size:25px;line-height:1.3;font-weight:700;text-align:center;">${safe.title}</h1>
                <p style="margin:16px 0 0;color:#596275;font-size:15px;line-height:24px;text-align:center;">${safe.description}</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:4px 32px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" bgcolor="#5b42c6" style="border-radius:10px;">
                      <a href="${safe.actionUrl}" style="display:inline-block;padding:14px 28px;border:1px solid #5b42c6;border-radius:10px;color:#ffffff;font-size:15px;font-weight:700;line-height:20px;text-align:center;text-decoration:none;">${safe.actionLabel}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:20px 0 0;color:#596275;font-size:13px;line-height:21px;text-align:center;">
                  ${safe.expiration}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;">
                <div style="height:1px;background-color:#e8ebf2;font-size:0;line-height:0;">&nbsp;</div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 32px 30px;">
                <p style="margin:0;color:#596275;font-size:13px;line-height:21px;text-align:center;">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:
                </p>
                <p style="margin:10px 0 0;font-size:12px;line-height:19px;text-align:center;word-break:break-all;">
                  <a href="${safe.actionUrl}" style="color:#4b36a4;text-decoration:underline;">${safe.actionUrl}</a>
                </p>
                <p style="margin:22px 0 0;color:#687185;font-size:12px;line-height:19px;text-align:center;">
                  ${safe.securityNote}
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0;color:#7a8292;font-size:11px;line-height:18px;text-align:center;">
            © ${new Date().getFullYear()} TriDa · Este es un mensaje automático, por favor no respondas.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  const text = [
    content.title,
    "",
    content.description,
    content.actionUrl,
    "",
    content.expiration,
    content.securityNote,
  ].join("\n");

  return { html, text };
}
