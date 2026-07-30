const nodemailer = require('nodemailer');

const createTransporter = async () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });
  }
  console.log('⚠️ No SMTP variables found. Creating Ethereal test account...');
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

const sendEmailNotification = async (toEmail, subject, htmlContent) => {
  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `"MediCore HMS" <${process.env.EMAIL_USER || 'no-reply@medicore.com'}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    });
    console.log(`📩 Real Gmail sent to ${toEmail}: ${subject} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Real Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async (toEmail, role = 'User', userName = '') => {
  const resetLink = `http://localhost:8080/forgot-password?email=${encodeURIComponent(toEmail)}&role=${encodeURIComponent(role)}`;
  const now = new Date().toLocaleString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #7c3aed, #c026d3); padding: 32px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 800; tracking-tight: -0.05em;">🏥 MediCore HMS</h1>
        <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Hospital Management System Security</p>
      </div>
      <div style="padding: 32px; color: #334155;">
        <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">Password Reset Instructions</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #475569;">
          Hello ${userName ? `<strong>${userName}</strong>` : ''},
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #475569;">
          We received a request to reset the password for your <strong>MediCore HMS</strong> account (Role: <strong>${role}</strong>) registered under <span style="color: #7c3aed; font-weight: 600;">${toEmail}</span>.
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Action Required</p>
          <a href="${resetLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #c026d3); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
            Reset My Password
          </a>
        </div>

        <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
          <p style="margin: 0; color: #e11d48; font-size: 13px;">
            ⚠️ If you did not request this password reset, please ignore this email or contact system administration.
          </p>
        </div>

        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Date & Time: ${now}</p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 11px; color: #cbd5e1; text-align: center; margin: 0;">
          © 2026 MediCore HMS • F-8 Markaz, Islamabad • Confidential Security Alert
        </p>
      </div>
    </div>
  `;

  return sendEmailNotification(
    toEmail,
    '🔐 Password Reset Instructions — MediCore HMS',
    html
  );
};

module.exports = {
  sendEmailNotification,
  sendPasswordResetEmail,
};
