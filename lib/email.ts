import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'StreakFlow - Email Verification',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #333; text-align: center;">StreakFlow Email Verification</h1>
        <p style="font-size: 16px; color: #666; text-align: center;">
          Thank you for signing up for StreakFlow! Please use the following code to verify your email:
        </p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h2 style="color: #333; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h2>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">
          This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}