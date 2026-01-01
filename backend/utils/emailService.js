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

// Send hostel booking confirmation email
export const sendHostelBookingConfirmationEmail = async (email, fullName, bookingDetails) => {
  try {
    const transporter = createTransporter();

    const {
      bookingNumber,
      roomName,
      roomNumber,
      roomType,
      petName,
      petType,
      checkInDate,
      checkOutDate,
      numberOfDays,
      totalAmount,
      pricePerDay,
      facilities,
      specialInstructions
    } = bookingDetails;

    // Format facilities list
    const facilitiesList = facilities && facilities.length > 0 
      ? facilities.map(f => `<li>${f}</li>`).join('') 
      : '<li>Standard facilities</li>';

    const mailOptions = {
      from: `"PetAdopt+" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Hostel Booking Confirmed #${bookingNumber} - PetAdopt+`,
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
              background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
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
            .booking-box {
              background: white;
              border: 2px solid #10b981;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            .booking-number {
              font-size: 24px;
              font-weight: bold;
              color: #10b981;
              text-align: center;
              margin-bottom: 20px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .info-value {
              color: #1f2937;
            }
            .pet-box {
              background: #f0fdf4;
              border-left: 4px solid #10b981;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .total-box {
              background: #fff7ed;
              border: 2px solid #f97316;
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .total-amount {
              font-size: 32px;
              font-weight: bold;
              color: #f97316;
            }
            .facilities-list {
              background: white;
              padding: 15px 20px;
              border-radius: 8px;
              margin: 15px 0;
            }
            .facilities-list ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .facilities-list li {
              margin: 5px 0;
              color: #4b5563;
            }
            .success-box {
              background: #d1fae5;
              border-left: 4px solid #10b981;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
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
              <h1>🏠 Hostel Booking Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Thank you, ${fullName}!</h2>
              <p>Your pet hostel booking has been successfully confirmed. We're excited to welcome <strong>${petName}</strong> to our facility!</p>
              
              <div class="booking-box">
                <div class="booking-number">Booking #${bookingNumber}</div>
                
                <div class="info-row">
                  <span class="info-label">Room:</span>
                  <span class="info-value">${roomName} (${roomNumber})</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Room Type:</span>
                  <span class="info-value">${roomType}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Check-In Date:</span>
                  <span class="info-value">${new Date(checkInDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Check-Out Date:</span>
                  <span class="info-value">${new Date(checkOutDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })}</span>
                </div>
                <div class="info-row" style="border-bottom: none;">
                  <span class="info-label">Duration:</span>
                  <span class="info-value">${numberOfDays} ${numberOfDays === 1 ? 'day' : 'days'}</span>
                </div>
              </div>

              <div class="pet-box">
                <h3 style="margin-top: 0; color: #10b981;">🐾 Pet Information</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${petName}</p>
                <p style="margin: 5px 0;"><strong>Type:</strong> ${petType}</p>
                ${specialInstructions ? `<p style="margin: 5px 0;"><strong>Special Instructions:</strong> ${specialInstructions}</p>` : ''}
              </div>

              <div class="facilities-list">
                <h3 style="margin-top: 0; color: #1f2937;">🎁 Room Facilities</h3>
                <ul>
                  ${facilitiesList}
                </ul>
              </div>

              <div class="total-box">
                <p style="margin: 0; color: #78350f; font-size: 14px;">Total Amount</p>
                <div class="total-amount">Rs ${totalAmount}</div>
                <p style="margin: 5px 0 0 0; color: #78350f; font-size: 12px;">
                  (Rs ${pricePerDay} per day × ${numberOfDays} ${numberOfDays === 1 ? 'day' : 'days'})
                </p>
              </div>

              <div class="success-box">
                <p style="margin: 0;"><strong>✨ What to Bring on Check-In:</strong></p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Pet's food and favorite toys</li>
                  <li>Vaccination records</li>
                  <li>Any medications (if applicable)</li>
                  <li>Emergency contact information</li>
                </ul>
              </div>
              
              <p>If you have any questions or need to modify your booking, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>The PetAdopt+ Team 🐕🐱</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 PetAdopt+. All rights reserved.</p>
              <p>Booking Number: ${bookingNumber}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Hostel booking confirmation email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending hostel booking confirmation email:', error);
    // Don't throw error - we don't want to fail the booking if email fails
    return false;
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (email, fullName, orderDetails) => {
  try {
    const transporter = createTransporter();

    const {
      orderNumber,
      items,
      subtotal,
      shippingFee,
      totalAmount,
      paymentMethod,
      address,
      orderDate
    } = orderDetails;

    // Format items for email
    const itemsHTML = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
          ${item.productName}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          Rs ${item.price}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">
          Rs ${item.subtotal}
        </td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"PetAdopt+" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order Confirmation #${orderNumber} - PetAdopt+`,
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
            .order-box {
              background: white;
              border: 2px solid #f97316;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            .order-number {
              font-size: 24px;
              font-weight: bold;
              color: #f97316;
              text-align: center;
              margin-bottom: 20px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background: white;
              border-radius: 8px;
              overflow: hidden;
            }
            th {
              background: #f97316;
              color: white;
              padding: 12px 10px;
              text-align: left;
            }
            .total-row {
              background: #fff7f0;
              font-weight: bold;
              font-size: 18px;
            }
            .success-box {
              background: #d1fae5;
              border-left: 4px solid #10b981;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
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
              <h1>✅ Order Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Thank you, ${fullName}!</h2>
              <p>Your order has been successfully placed and is being processed.</p>
              
              <div class="order-box">
                <div class="order-number">Order #${orderNumber}</div>
                
                <div style="margin: 20px 0;">
                  <div class="info-row">
                    <span class="info-label">Order Date:</span>
                    <span>${new Date(orderDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Payment Method:</span>
                    <span>${paymentMethod}</span>
                  </div>
                  <div class="info-row" style="border-bottom: none;">
                    <span class="info-label">Delivery Address:</span>
                    <span>${address}</span>
                  </div>
                </div>
              </div>

              <h3 style="color: #1f2937; margin-top: 30px;">Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  <tr>
                    <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
                    <td style="padding: 10px; text-align: right;">Rs ${subtotal}</td>
                  </tr>
                  <tr>
                    <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">
                      Shipping Fee:
                      ${shippingFee === 0 ? '<span style="color: #10b981; font-size: 12px; margin-left: 5px;">(FREE)</span>' : ''}
                    </td>
                    <td style="padding: 10px; text-align: right; ${shippingFee === 0 ? 'color: #10b981;' : ''}">
                      ${shippingFee === 0 ? 'FREE' : `Rs ${shippingFee}`}
                    </td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3" style="padding: 15px 10px; text-align: right;">Total Amount:</td>
                    <td style="padding: 15px 10px; text-align: right; color: #f97316;">Rs ${totalAmount}</td>
                  </tr>
                </tbody>
              </table>

              <div class="success-box">
                <p style="margin: 0;"><strong>✨ What's Next?</strong></p>
                <p style="margin: 5px 0 0 0;">We're preparing your order for shipment. You'll receive another email once your order is dispatched with tracking details.</p>
              </div>
              
              <p>If you have any questions about your order, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>The PetAdopt+ Team 🐕🐱</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 PetAdopt+. All rights reserved.</p>
              <p>Order Number: ${orderNumber}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    // Don't throw error - we don't want to fail the order if email fails
    return false;
  }
};
