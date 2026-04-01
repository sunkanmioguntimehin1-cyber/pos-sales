import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export async function createEmailTransporter() {
  if (transporter) return transporter;
  
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  
  console.log('\n📧 Ethereal Email Account Created!');
  console.log('📧 User:', testAccount.user);
  console.log('');
  
  return transporter;
}

export async function sendWelcomeEmail(
  to: string,
  ownerName: string,
  storeName: string,
  tempPassword: string,
  subdomain: string
): Promise<string> {
  const transport = await createEmailTransporter();
  
  const loginUrl = `http://${subdomain}.localhost:3000/login`;
  
  const info = await transport.sendMail({
    from: '"RetailCore POS" <noreply@retailcore.app>',
    to,
    subject: `Welcome to ${storeName} - Your Store is Ready!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%); padding: 32px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">RetailCore POS</h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Your Store Management Platform</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 20px;">Welcome, ${ownerName}!</h2>
                    <p style="margin: 0 0 24px; color: #6b7280; font-size: 15px; line-height: 1.6;">
                      Your store <strong style="color: #3B82F6;">${storeName}</strong> has been created successfully. You can now start managing your store.
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 24px;">
                          <h3 style="margin: 0 0 16px; color: #374151; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Login Credentials</h3>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                <span style="color: #6b7280; font-size: 13px;">Email</span>
                              </td>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                <strong style="color: #111827; font-size: 14px; font-family: monospace;">${to}</strong>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #6b7280; font-size: 13px;">Password</span>
                              </td>
                              <td style="padding: 8px 0; text-align: right;">
                                <strong style="color: #111827; font-size: 14px; font-family: monospace;">${tempPassword}</strong>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">Access Your Store</a>
                        </td>
                      </tr>
                    </table>
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-top: 16px;">
                      <p style="margin: 0; color: #92400e; font-size: 13px;">
                        <strong>Important:</strong> Please change your password after your first login.
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                      This email was sent by RetailCore POS. If you have questions, contact your administrator.
                    </p>
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
Welcome, ${ownerName}!

Your store "${storeName}" has been created successfully.

YOUR LOGIN CREDENTIALS:
------------------------
Email: ${to}
Password: ${tempPassword}
Login URL: ${loginUrl}
------------------------

Please change your password after your first login.

This email was sent by RetailCore POS.
    `,
  });
  
  const messageUrl = nodemailer.getTestMessageUrl(info as nodemailer.SentMessageInfo) || 'Preview URL not available';
  console.log('📧 Welcome email sent to:', to);
  console.log('📧 Email preview URL:', messageUrl);
  console.log('');
  
  return messageUrl;
}
