import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const emailEnabled = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD &&
  process.env.GMAIL_USER !== 'your-gmail@gmail.com');

function desklyEmailTemplate(title: string, bodyHtml: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; padding: 0; background: #0f172a; font-family: 'Segoe UI', Arial, sans-serif; }
      .wrapper { max-width: 600px; margin: 40px auto; background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; }
      .header { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 32px; text-align: center; }
      .header h1 { margin: 0; color: #fff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
      .header p { margin: 6px 0 0; color: rgba(255,255,255,0.7); font-size: 13px; }
      .body { padding: 32px; color: #e2e8f0; }
      .body h2 { color: #f8fafc; font-size: 18px; margin: 0 0 16px; }
      .info-box { background: #0f172a; border-radius: 12px; padding: 16px 20px; margin: 16px 0; border-left: 3px solid #6366f1; }
      .info-box p { margin: 6px 0; font-size: 13px; color: #94a3b8; }
      .info-box strong { color: #e2e8f0; }
      .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; }
      .badge-pending { background: #ca8a04; color: #fef9c3; }
      .badge-approved { background: #16a34a; color: #dcfce7; }
      .badge-rejected { background: #dc2626; color: #fee2e2; }
      .footer { text-align: center; padding: 20px; border-top: 1px solid #1e293b; font-size: 11px; color: #475569; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>🏢 Deskly Enterprise</h1>
        <p>${title}</p>
      </div>
      <div class="body">${bodyHtml}</div>
      <div class="footer">© 2026 Deskly Enterprise · Company Management Platform · This is an automated alert.</div>
    </div>
  </body>
  </html>`;
}

export async function sendLoginAlert(to: string, fullName: string, ipAddress: string, loginTime: string) {
  if (!emailEnabled) {
    console.log(`[EMAIL SKIPPED - Not configured] Login alert would go to: ${to}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Deskly Security" <${process.env.GMAIL_USER}>`,
      to,
      subject: `🔐 New Sign-In to Deskly — ${loginTime}`,
      html: desklyEmailTemplate('Security Login Alert', `
        <h2>Hi ${fullName}, a new sign-in was detected on your account.</h2>
        <div class="info-box">
          <p><strong>Time:</strong> ${loginTime}</p>
          <p><strong>IP Address:</strong> ${ipAddress}</p>
          <p><strong>Platform:</strong> Deskly Enterprise Web App</p>
        </div>
        <p style="font-size:13px; color: #94a3b8;">If this was you, no action needed. If you didn't sign in, please change your password immediately.</p>
      `)
    });
    console.log(`[EMAIL SENT] Login alert → ${to}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send login alert:`, err);
  }
}

export async function sendLeaveSubmittedAlert(to: string, managerName: string, employeeName: string, leaveType: string, startDate: string, endDate: string, daysCount: number, reason: string) {
  if (!emailEnabled) {
    console.log(`[EMAIL SKIPPED] Leave submitted alert would go to manager: ${to}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Deskly HR" <${process.env.GMAIL_USER}>`,
      to,
      subject: `📋 Leave Request Submitted — ${employeeName}`,
      html: desklyEmailTemplate('New Leave Request', `
        <h2>Hi ${managerName}, a new leave request requires your approval.</h2>
        <div class="info-box">
          <p><strong>Employee:</strong> ${employeeName}</p>
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>Duration:</strong> ${startDate} → ${endDate} (${daysCount} day${daysCount > 1 ? 's' : ''})</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Status:</strong> <span class="badge badge-pending">PENDING APPROVAL</span></p>
        </div>
        <p style="font-size:13px; color: #94a3b8;">Please log in to Deskly to approve or reject this request.</p>
      `)
    });
    console.log(`[EMAIL SENT] Leave submitted alert → ${to}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send leave submitted alert:`, err);
  }
}

export async function sendLeaveDecisionAlert(to: string, employeeName: string, leaveType: string, startDate: string, endDate: string, decision: 'APPROVED' | 'REJECTED', approvedBy: string) {
  if (!emailEnabled) {
    console.log(`[EMAIL SKIPPED] Leave decision alert would go to: ${to}`);
    return;
  }
  const isApproved = decision === 'APPROVED';
  try {
    await transporter.sendMail({
      from: `"Deskly HR" <${process.env.GMAIL_USER}>`,
      to,
      subject: `${isApproved ? '✅ Leave Approved' : '❌ Leave Rejected'} — ${leaveType} Leave`,
      html: desklyEmailTemplate(`Leave Request ${decision}`, `
        <h2>Hi ${employeeName}, your leave request has been ${isApproved ? 'approved' : 'rejected'}.</h2>
        <div class="info-box">
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>Duration:</strong> ${startDate} → ${endDate}</p>
          <p><strong>Decision:</strong> <span class="badge ${isApproved ? 'badge-approved' : 'badge-rejected'}">${decision}</span></p>
          <p><strong>Reviewed by:</strong> ${approvedBy}</p>
        </div>
        <p style="font-size:13px; color: #94a3b8;">${isApproved ? 'Your leave has been approved. Please ensure your work is handed over before your leave begins.' : 'Your leave request was not approved. Please contact your manager or HR for more details.'}</p>
      `)
    });
    console.log(`[EMAIL SENT] Leave decision alert → ${to}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send leave decision alert:`, err);
  }
}
