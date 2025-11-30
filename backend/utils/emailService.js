import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  // For development, use Gmail or other SMTP service
  // For production, use services like SendGrid, AWS SES, etc.
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Generate 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, fullName, verificationCode) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"PetAdopt+" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - PetAdopt+',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .code-box {
              background: white;
              border: 2px solid #f97316;
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #f97316;
              letter-spacing: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🐾 Welcome to PetAdopt+!</h1>
            </div>
            <div class="content">
              <h2>Hi ${fullName},</h2>
              <p>Thank you for registering with PetAdopt+! To complete your registration, please verify your email address.</p>
              
              <p>Your verification code is:</p>
              
              <div class="code-box">
                <div class="code">${verificationCode}</div>
              </div>
              
              <p><strong>This code will expire in 10 minutes.</strong></p>
              
              <p>If you didn't create an account with PetAdopt+, please ignore this email.</p>
              
              <p>Best regards,<br>The PetAdopt+ Team 🐕🐱</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 PetAdopt+. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email, fullName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"PetAdopt+" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to PetAdopt+! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to PetAdopt+!</h1>
            </div>
            <div class="content">
              <h2>Congratulations, ${fullName}!</h2>
              <p>Your email has been verified successfully. You're now part of the PetAdopt+ family!</p>
              
              <p>You can now:</p>
              <ul>
                <li>🐕 Browse available pets</li>
                <li>📅 Schedule appointments</li>
                <li>❤️ Save your favorite pets</li>
                <li>🏥 Access pet care services</li>
              </ul>
              
              <p>Start your journey by logging in to your dashboard!</p>
              
              <p>Best regards,<br>The PetAdopt+ Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, fullName, resetCode) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"PetAdopt+" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - PetAdopt+',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .code-box {
              background: white;
              border: 2px solid #3b82f6;
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #3b82f6;
              letter-spacing: 5px;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${fullName},</h2>
              <p>We received a request to reset your password for your PetAdopt+ account.</p>
              
              <p>Your password reset code is:</p>
              
              <div class="code-box">
                <div class="code">${resetCode}</div>
              </div>
              
              <p><strong>This code will expire in 10 minutes.</strong></p>
              
              <div class="warning">
                <p><strong>⚠️ Security Notice:</strong></p>
                <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
              </div>
              
              <p>Best regards,<br>The PetAdopt+ Team 🐕🐱</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 PetAdopt+. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};