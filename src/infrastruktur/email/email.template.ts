export const EmailTemplate = (otp: string) => ({
  html: `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table width="420" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
            
            <tr>
              <td style="background:linear-gradient(135deg,#1BE6C9,#771FE6);padding:20px;text-align:center;color:#fff;">
                <h2 style="margin:0;">Insidia</h2>
              </td>
            </tr>

            <tr>
              <td style="padding:30px;text-align:center;">
                <h3>Kode OTP Kamu</h3>
                <p>Gunakan kode di bawah ini untuk login:</p>

                <div style="
                  display:inline-block;
                  background:#f4f6f8;
                  padding:15px 25px;
                  border-radius:10px;
                  font-size:28px;
                  font-weight:bold;
                  letter-spacing:4px;
                  color:#771FE6;
                  border:2px dashed #1BE6C9;
                ">
                  ${otp}
                </div>

                <p style="margin-top:20px;font-size:12px;color:#999;">
                  Berlaku selama 5 menit. Jangan bagikan kode ini.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px;text-align:center;font-size:12px;color:#aaa;">
                © ${new Date().getFullYear()} Insidia
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
  text: `
Kode OTP kamu: ${otp}

Gunakan kode ini untuk login.
Kode berlaku selama 5 menit.

Jangan bagikan kode ini ke siapa pun.
`,
});
