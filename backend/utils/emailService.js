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
      from: `"MediCore HMS 🏥" <${process.env.EMAIL_USER || 'no-reply@medicore.com'}>`,
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

  const roleGradients = {
    'super-admin': 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
    'doctor': 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)',
    'nurse': 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
    'receptionist': 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
    'patient': 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
  };

  const roleLabels = {
    'super-admin': 'Super Administrator',
    'doctor': 'Doctor',
    'nurse': 'Nurse',
    'receptionist': 'Receptionist',
    'patient': 'Patient',
  };

  const roleIcons = {
    'super-admin': '🛡️',
    'doctor': '🩺',
    'nurse': '💉',
    'receptionist': '🏥',
    'patient': '👤',
  };

  const gradient = roleGradients[role] || roleGradients['doctor'];
  const roleLabel = roleLabels[role] || role;
  const roleIcon = roleIcons[role] || '🏥';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset — MediCore HMS</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Segoe UI', Arial, sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">

        <!-- Email card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px; width:100%; background:#ffffff; border-radius:20px; overflow:hidden;
                 box-shadow: 0 20px 60px rgba(0,0,0,0.12);">

          <!-- HERO HEADER -->
          <tr>
            <td style="background: ${gradient}; padding: 40px 32px 32px; text-align:center;">
              <!-- Logo / Brand -->
              <div style="display:inline-block; background:rgba(255,255,255,0.15); border-radius:16px;
                          padding:12px 20px; margin-bottom:20px; backdrop-filter: blur(10px);">
                <span style="font-size:28px; font-weight:900; color:#ffffff; letter-spacing:-0.5px;">
                  🏥 MediCore
                </span>
              </div>
              <div style="color:rgba(255,255,255,0.85); font-size:13px; letter-spacing:2px;
                          text-transform:uppercase; font-weight:600; margin-bottom:24px;">
                Hospital Management System
              </div>

              <!-- Big lock icon circle -->
              <div style="display:inline-flex; align-items:center; justify-content:center;
                          width:72px; height:72px; background:rgba(255,255,255,0.2);
                          border-radius:50%; border:3px solid rgba(255,255,255,0.4);
                          font-size:32px; margin-bottom:16px;">
                🔐
              </div>

              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:800; line-height:1.2;">
                Password Reset Request
              </h1>
              <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px; line-height:1.5;">
                We received a request to reset your account password
              </p>
            </td>
          </tr>

          <!-- ROLE BADGE -->
          <tr>
            <td style="background: ${gradient}; padding: 0 32px 24px; text-align:center;">
              <div style="display:inline-block; background:rgba(255,255,255,0.25);
                          border-radius:100px; padding:6px 18px; border:1px solid rgba(255,255,255,0.4);">
                <span style="color:#ffffff; font-size:13px; font-weight:700;">
                  ${roleIcon} ${roleLabel} Account
                </span>
              </div>
            </td>
          </tr>

          <!-- BODY CONTENT -->
          <tr>
            <td style="padding: 36px 32px;">

              <!-- Greeting -->
              <p style="margin:0 0 20px; font-size:16px; color:#1e293b; font-weight:600;">
                Hello${userName ? `, <span style="color:#7c3aed;">${userName}</span>` : ''}! 👋
              </p>

              <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#475569;">
                We received a password reset request for your <strong>MediCore HMS</strong> account
                registered under:
              </p>

              <!-- Email chip -->
              <div style="background:#f8fafc; border:2px solid #e2e8f0; border-radius:12px;
                          padding:14px 20px; margin:0 0 24px; display:flex; align-items:center; gap:12px;">
                <span style="font-size:20px;">📧</span>
                <div>
                  <div style="font-size:11px; text-transform:uppercase; letter-spacing:1px;
                               color:#94a3b8; font-weight:600; margin-bottom:2px;">Email Address</div>
                  <div style="font-size:15px; font-weight:700; color:#1e293b;">${toEmail}</div>
                </div>
              </div>

              <p style="margin:0 0 28px; font-size:14px; line-height:1.7; color:#64748b;">
                Click the button below to create a new password. This link will guide you through
                the secure password reset process.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center; margin:28px 0;">
                <a href="${resetLink}" target="_blank"
                  style="display:inline-block; background: ${gradient};
                         color:#ffffff; text-decoration:none; padding:16px 40px;
                         border-radius:14px; font-weight:800; font-size:16px;
                         letter-spacing:0.3px; box-shadow: 0 8px 24px rgba(0,0,0,0.18);
                         transition: transform 0.2s;">
                  🔑 &nbsp; Reset My Password
                </a>
                <p style="margin:14px 0 0; font-size:12px; color:#94a3b8;">
                  Button not working? Copy and paste this link:<br/>
                  <a href="${resetLink}" style="color:#7c3aed; word-break:break-all; font-size:11px;">${resetLink}</a>
                </p>
              </div>

              <!-- Divider -->
              <hr style="border:none; border-top:1px solid #f1f5f9; margin:28px 0;" />

              <!-- Warning box -->
              <div style="background: linear-gradient(to right, #fff1f2, #fff7ed);
                           border-left:4px solid #f43f5e; border-radius:10px;
                           padding:16px 20px; margin-bottom:24px;">
                <div style="display:flex; align-items:flex-start; gap:10px;">
                  <span style="font-size:18px; flex-shrink:0;">⚠️</span>
                  <div>
                    <div style="font-size:13px; font-weight:700; color:#be123c; margin-bottom:4px;">
                      Didn't request this?
                    </div>
                    <p style="margin:0; font-size:13px; color:#9f1239; line-height:1.6;">
                      If you did not request a password reset, please ignore this email.
                      Your account remains secure. If this continues, contact our support team immediately.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Security info pills -->
              <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:24px;">
                ${[
                  ['🛡️', 'HIPAA Compliant'],
                  ['🔒', '256-bit Encrypted'],
                  ['✅', 'ISO 27001 Certified'],
                ].map(([icon, label]) => `
                  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:100px;
                               padding:6px 14px; font-size:12px; color:#64748b; font-weight:600;">
                    ${icon} ${label}
                  </div>
                `).join('')}
              </div>

              <!-- Timestamp -->
              <p style="margin:0; font-size:12px; color:#cbd5e1;">
                🕐 &nbsp;Request received: <strong>${now}</strong>
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8fafc; border-top:1px solid #e2e8f0;
                        padding:24px 32px; text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <a href="#" style="color:#94a3b8; text-decoration:none; font-size:12px; margin:0 10px;">Privacy Policy</a>
                    <span style="color:#cbd5e1;">•</span>
                    <a href="#" style="color:#94a3b8; text-decoration:none; font-size:12px; margin:0 10px;">Terms of Service</a>
                    <span style="color:#cbd5e1;">•</span>
                    <a href="mailto:care@medicore.app" style="color:#94a3b8; text-decoration:none; font-size:12px; margin:0 10px;">Support</a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.6;">
                      <strong style="color:#64748b;">MediCore Health Systems Pvt. Ltd.</strong><br/>
                      F-8 Markaz, Islamabad, Pakistan &nbsp;•&nbsp; +92 51 111-MEDI (6334)<br/>
                      care@medicore.app &nbsp;•&nbsp; www.medicore.app
                    </p>
                    <p style="margin:12px 0 0; font-size:11px; color:#cbd5e1;">
                      © ${new Date().getFullYear()} MediCore HMS. All rights reserved. This is an automated security email — do not reply.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- END Email card -->

      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmailNotification(
    toEmail,
    `🔐 Password Reset Instructions — MediCore HMS (${roleLabel})`,
    html
  );
};

const sendLoginNotificationEmail = async (toEmail, role = 'User', userName = '') => {
  const now = new Date().toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const roleGradients = {
    'super-admin': 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
    'doctor': 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)',
    'nurse': 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
    'receptionist': 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
    'patient': 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
  };

  const roleLabels = {
    'super-admin': 'Super Administrator',
    'doctor': 'Doctor',
    'nurse': 'Nurse',
    'receptionist': 'Receptionist',
    'patient': 'Patient',
  };

  const roleIcons = {
    'super-admin': '🛡️',
    'doctor': '🩺',
    'nurse': '💉',
    'receptionist': '🏥',
    'patient': '👤',
  };

  const gradient = roleGradients[role] || roleGradients['doctor'];
  const roleLabel = roleLabels[role] || role;
  const roleIcon = roleIcons[role] || '🏥';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login Successful — MediCore HMS</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px; width:100%; background:#ffffff; border-radius:20px; overflow:hidden;
                 box-shadow: 0 20px 60px rgba(0,0,0,0.12);">
          
          <!-- HERO HEADER -->
          <tr>
            <td style="background: ${gradient}; padding: 40px 32px 28px; text-align:center;">
              <div style="display:inline-block; background:rgba(255,255,255,0.15); border-radius:16px;
                          padding:12px 20px; margin-bottom:20px; backdrop-filter: blur(10px);">
                <span style="font-size:28px; font-weight:900; color:#ffffff; letter-spacing:-0.5px;">
                  🏥 MediCore
                </span>
              </div>
              <div style="color:rgba(255,255,255,0.85); font-size:13px; letter-spacing:2px;
                          text-transform:uppercase; font-weight:600; margin-bottom:24px;">
                Hospital Management System
              </div>
              <div style="display:inline-flex; align-items:center; justify-content:center;
                          width:72px; height:72px; background:rgba(255,255,255,0.2);
                          border-radius:50%; border:3px solid rgba(255,255,255,0.4);
                          font-size:32px; margin-bottom:16px;">
                🎉
              </div>
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:800; line-height:1.2;">
                Successful Account Login
              </h1>
              <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px; line-height:1.5;">
                You have successfully signed in to your MediCore account
              </p>
            </td>
          </tr>

          <!-- ROLE BADGE -->
          <tr>
            <td style="background: ${gradient}; padding: 0 32px 24px; text-align:center;">
              <div style="display:inline-block; background:rgba(255,255,255,0.25);
                          border-radius:100px; padding:6px 18px; border:1px solid rgba(255,255,255,0.4);">
                <span style="color:#ffffff; font-size:13px; font-weight:700;">
                  ${roleIcon} ${roleLabel} Portal
                </span>
              </div>
            </td>
          </tr>

          <!-- BODY CONTENT -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin:0 0 20px; font-size:16px; color:#1e293b; font-weight:600;">
                Hello${userName ? `, <span style="color:#2563eb;">${userName}</span>` : ''}! 👋
              </p>
              <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#475569;">
                This email confirms that your <strong>MediCore HMS</strong> account was just accessed successfully.
              </p>

              <!-- Account Details Box -->
              <div style="background:#f8fafc; border:2px solid #e2e8f0; border-radius:14px;
                          padding:18px 20px; margin:0 0 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:10px;">
                      <div style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; font-weight:600;">Email Address</div>
                      <div style="font-size:15px; font-weight:700; color:#1e293b; margin-top:2px;">${toEmail}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:10px; border-top:1px solid #f1f5f9; padding-top:10px;">
                      <div style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; font-weight:600;">Role & Access</div>
                      <div style="font-size:15px; font-weight:700; color:#1e293b; margin-top:2px;">${roleIcon} ${roleLabel}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #f1f5f9; padding-top:10px;">
                      <div style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; font-weight:600;">Login Time</div>
                      <div style="font-size:14px; font-weight:600; color:#334155; margin-top:2px;">🕒 ${now}</div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Security Warning Box -->
              <div style="background: #f0fdf4; border-left:4px solid #16a34a; border-radius:10px; padding:16px 20px; margin-bottom:24px;">
                <div style="font-size:13px; font-weight:700; color:#15803d; margin-bottom:4px;">
                  🔒 Account Security Notice
                </div>
                <p style="margin:0; font-size:13px; color:#166534; line-height:1.6;">
                  If you performed this login, no further action is required. If you did not log in or suspect unauthorized access, please reset your password immediately or contact MediCore system administration.
                </p>
              </div>

              <div style="text-align:center; margin:28px 0 10px;">
                <a href="http://localhost:5173" target="_blank"
                  style="display:inline-block; background: ${gradient};
                         color:#ffffff; text-decoration:none; padding:14px 36px;
                         border-radius:12px; font-weight:800; font-size:15px;
                         letter-spacing:0.3px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
                  🏥 Open MediCore HMS Portal
                </a>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:24px 32px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.6;">
                <strong style="color:#64748b;">MediCore Health Systems Pvt. Ltd.</strong><br/>
                Automated Security Notification &nbsp;•&nbsp; care@medicore.app
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmailNotification(
    toEmail,
    `✅ Login Successful — MediCore HMS (${roleLabel})`,
    html
  );
};

module.exports = {
  sendEmailNotification,
  sendPasswordResetEmail,
  sendLoginNotificationEmail,
};

