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

// Send order status update email
export const sendOrderStatusUpdateEmail = async (email, fullName, orderDetails) => {
  try {
    const transporter = createTransporter();

    const statusMessages = {
      'Pending': {
        title: 'Order Received',
        message: 'We have received your order and it is being processed.',
        icon: '📋',
        color: '#f59e0b'
      },
      'Processing': {
        title: 'Order Processing',
        message: 'Your order is being prepared for shipment.',
        icon: '📦',
        color: '#3b82f6'
      },
      'Shipped': {
        title: 'Order Shipped',
        message: 'Your order has been shipped and is on its way!',
        icon: '🚚',
        color: '#8b5cf6'
      },
      'Delivered': {
        title: 'Order Delivered',
        message: 'Your order has been successfully delivered!',
        icon: '✅',
        color: '#10b981'
      },
      'Cancelled': {
        title: 'Order Cancelled',
        message: orderDetails.paymentStatus === 'Failed' 
          ? 'Your order has been cancelled due to payment failure. The amount will not be charged, and stock has been restored.'
          : 'Your order has been cancelled. Stock has been restored to our inventory.',
        icon: '❌',
        color: '#ef4444'
      },
      'Returned': {
        title: 'Order Returned',
        message: 'Your order has been returned and refund has been processed. Stock has been restored to our inventory.',
        icon: '↩️',
        color: '#6366f1'
      }
    };

    const statusInfo = statusMessages[orderDetails.status] || statusMessages['Pending'];

    const mailOptions = {
      from: `"PetAdopt+" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${statusInfo.icon} Order ${orderDetails.status} - ${orderDetails.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
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
            .status-banner {
              background: ${statusInfo.color};
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 24px;
              font-weight: bold;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
            }
            .order-box {
              background: white;
              border: 2px solid #e5e7eb;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            .order-item {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .order-item:last-child {
              border-bottom: none;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 15px 0;
              font-size: 18px;
              font-weight: bold;
              border-top: 2px solid #f97316;
              margin-top: 10px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
              padding: 20px;
              border-radius: 0 0 10px 10px;
            }
            .badge {
              display: inline-block;
              padding: 5px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            }
            .badge-paid { background: #d1fae5; color: #065f46; }
            .badge-pending { background: #fef3c7; color: #92400e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${statusInfo.icon} Order Status Update</h1>
            </div>
            <div class="status-banner">
              ${statusInfo.title}
            </div>
            <div class="content">
              <h2>Hi ${fullName},</h2>
              <p>${statusInfo.message}</p>
              
              <div class="order-box">
                <h3 style="margin-top: 0; color: #f97316;">Order Details</h3>
                <div class="info-row">
                  <span><strong>Order Number:</strong></span>
                  <span>${orderDetails.orderNumber}</span>
                </div>
                <div class="info-row">
                  <span><strong>Order Status:</strong></span>
                  <span style="color: ${statusInfo.color}; font-weight: bold;">${orderDetails.status}</span>
                </div>
                <div class="info-row">
                  <span><strong>Payment Status:</strong></span>
                  <span class="badge badge-${orderDetails.paymentStatus.toLowerCase()}">${orderDetails.paymentStatus}</span>
                </div>
                <div class="info-row">
                  <span><strong>Order Date:</strong></span>
                  <span>${new Date(orderDetails.orderDate).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>

              <div class="order-box">
                <h3 style="margin-top: 0; color: #1f2937;">Order Items</h3>
                ${orderDetails.items.map(item => `
                  <div class="order-item">
                    <div>
                      <strong>${item.productName}</strong><br>
                      <span style="color: #666; font-size: 13px;">Quantity: ${item.quantity} × Rs ${item.price}</span>
                    </div>
                    <div style="font-weight: bold;">Rs ${item.subtotal}</div>
                  </div>
                `).join('')}
                
                <div style="margin-top: 15px;">
                  <div class="info-row">
                    <span>Subtotal:</span>
                    <span>Rs ${orderDetails.subtotal}</span>
                  </div>
                  <div class="info-row">
                    <span>Shipping Fee:</span>
                    <span style="color: ${orderDetails.shippingFee === 0 ? '#10b981' : '#333'}; font-weight: ${orderDetails.shippingFee === 0 ? 'bold' : 'normal'};">
                      ${orderDetails.shippingFee === 0 ? 'FREE' : `Rs ${orderDetails.shippingFee}`}
                    </span>
                  </div>
                  <div class="total-row">
                    <span>Total Amount:</span>
                    <span style="color: #f97316;">Rs ${orderDetails.totalAmount}</span>
                  </div>
                </div>
              </div>

              ${orderDetails.status === 'Delivered' ? `
                <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 10px; padding: 15px; margin-top: 20px; text-align: center;">
                  <p style="margin: 0; color: #065f46; font-weight: bold;">
                    🎉 Thank you for shopping with PetAdopt+! We hope your pets love their new items!
                  </p>
                </div>
              ` : ''}

              ${orderDetails.status === 'Cancelled' ? `
                <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 10px; padding: 15px; margin-top: 20px;">
                  <p style="margin: 0; color: #991b1b; font-weight: bold;">
                    ⚠️ Order Cancelled
                  </p>
                  <p style="margin: 10px 0 0 0; color: #991b1b;">
                    ${orderDetails.paymentStatus === 'Failed' 
                      ? 'Your order has been automatically cancelled due to payment failure. You will not be charged. Stock has been restored to our inventory.'
                      : 'Your order has been cancelled. Stock has been restored to our inventory. If you have any questions, please contact our support team.'}
                  </p>
                </div>
              ` : ''}

              ${orderDetails.status === 'Returned' ? `
                <div style="background: #ede9fe; border: 2px solid #6366f1; border-radius: 10px; padding: 15px; margin-top: 20px;">
                  <p style="margin: 0; color: #4338ca; font-weight: bold;">
                    ↩️ Order Returned & Refunded
                  </p>
                  <p style="margin: 10px 0 0 0; color: #4338ca;">
                    Your order has been successfully returned. The refund of <strong>Rs ${orderDetails.totalAmount}</strong> has been processed and will be credited to your account within 5-7 business days. Stock has been restored to our inventory.
                  </p>
                </div>
              ` : ''}

              <p style="margin-top: 20px;">If you have any questions about your order, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>The PetAdopt+ Team 🐕🐱</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} PetAdopt+. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order status update email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending order status update email:', error);
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

// Send adoption application confirmation email
export const sendAdoptionConfirmationEmail = async (email, fullName, adoptionDetails) => {
  try {
    const transporter = createTransporter();

    const {
      petName,
      petBreed,
      petAge,
      applicationDate,
      status = 'pending'
    } = adoptionDetails;

    const mailOptions = {
      from: `"PetAdopt+" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Adoption Application Received for ${petName} - PetAdopt+`,
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
            .pet-box {
              background: white;
              border: 2px solid #f97316;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            .pet-name {
              font-size: 24px;
              font-weight: bold;
              color: #f97316;
              text-align: center;
              margin-bottom: 15px;
            }
            .info-row {
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .status-badge {
              display: inline-block;
              background: #fef3c7;
              color: #d97706;
              padding: 5px 15px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 14px;
              margin-top: 10px;
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
            .paw-icon {
              font-size: 40px;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="paw-icon">🐾</div>
              <h1>Application Received!</h1>
            </div>
            <div class="content">
              <h2>Thank you, ${fullName}!</h2>
              <p>We've received your adoption application and we're excited about your interest in giving a loving pet a forever home!</p>
              
              <div class="pet-box">
                <div class="pet-name">🐕 ${petName}</div>
                
                <div style="margin: 15px 0;">
                  <div class="info-row">
                    <span class="info-label">Breed:</span>
                    <span>${petBreed || 'Mixed'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Age:</span>
                    <span>${petAge || 'Unknown'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Application Date:</span>
                    <span>${new Date(applicationDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  <div class="info-row" style="border-bottom: none;">
                    <span class="info-label">Status:</span>
                    <span class="status-badge">⏳ ${status.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div class="success-box">
                <p style="margin: 0;"><strong>✨ What's Next?</strong></p>
                <p style="margin: 5px 0 0 0;">
                  Our team is reviewing your application. We'll contact you within 2-3 business days to discuss the next steps. 
                  This may include a phone interview, home visit, and meeting with ${petName}.
                </p>
              </div>
              
              <p><strong>In the meantime:</strong></p>
              <ul style="color: #475569;">
                <li>Please ensure your contact information is up to date</li>
                <li>Prepare any questions you might have about ${petName}</li>
                <li>Think about how you'll welcome your new family member</li>
              </ul>
              
              <p>If you have any questions or need to update your application, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>The PetAdopt+ Team 🐕🐱</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 PetAdopt+. All rights reserved.</p>
              <p>Making tails wag and hearts happy! 🐾</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Adoption confirmation email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending adoption confirmation email:', error);
    return false;
  }
};

// Send adoption approval email with pickup details
export const sendAdoptionApprovalEmail = async (email, fullName, approvalDetails) => {
  try {
    const transporter = createTransporter();

    const {
      petName,
      petBreed,
      petAge,
      pickupDate,
      pickupTime,
      pickupLocation
    } = approvalDetails;

    const mailOptions = {
      from: `"PetAdopt+" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎉 Adoption Approved for ${petName} - PetAdopt+`,
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
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .celebration {
              font-size: 60px;
              margin-bottom: 10px;
            }
            .pet-box {
              background: white;
              border: 3px solid #10b981;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            .pet-name {
              font-size: 28px;
              font-weight: bold;
              color: #10b981;
              text-align: center;
              margin-bottom: 15px;
            }
            .pickup-section {
              background: #ecfdf5;
              border: 2px solid #10b981;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            .pickup-title {
              font-size: 18px;
              font-weight: bold;
              color: #065f46;
              margin-bottom: 15px;
              text-align: center;
            }
            .pickup-detail {
              display: flex;
              align-items: center;
              padding: 10px 0;
              border-bottom: 1px solid #d1fae5;
            }
            .pickup-detail:last-child {
              border-bottom: none;
            }
            .pickup-icon {
              font-size: 24px;
              margin-right: 15px;
              min-width: 30px;
            }
            .pickup-label {
              font-weight: bold;
              color: #065f46;
              margin-right: 10px;
            }
            .pickup-value {
              color: #047857;
              font-size: 16px;
            }
            .info-row {
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .checklist {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
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
            ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            li {
              margin: 5px 0;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="celebration">🎉</div>
              <h1>Congratulations!</h1>
              <h2 style="margin-top: 10px; font-weight: normal;">Your Adoption Has Been Approved!</h2>
            </div>
            <div class="content">
              <h2>Dear ${fullName},</h2>
              <p>We are absolutely delighted to inform you that your adoption application has been <strong>APPROVED</strong>! 
              You're about to give a wonderful pet a loving forever home. 🏡❤️</p>
              
              <div class="pet-box">
                <div class="pet-name">🐕 ${petName}</div>
                <div style="margin: 15px 0; text-align: center;">
                  <div class="info-row" style="border-bottom: none; text-align: center;">
                    <span class="info-label">Breed:</span>
                    <span>${petBreed || 'Mixed'}</span>
                    <span class="info-label" style="margin-left: 20px;">Age:</span>
                    <span>${petAge || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              <div class="pickup-section">
                <div class="pickup-title">📍 Pickup Details</div>
                
                <div class="pickup-detail">
                  <span class="pickup-icon">📅</span>
                  <div>
                    <span class="pickup-label">Date:</span>
                    <span class="pickup-value">${pickupDate}</span>
                  </div>
                </div>
                
                <div class="pickup-detail">
                  <span class="pickup-icon">🕐</span>
                  <div>
                    <span class="pickup-label">Time:</span>
                    <span class="pickup-value">${pickupTime}</span>
                  </div>
                </div>
                
                <div class="pickup-detail">
                  <span class="pickup-icon">📍</span>
                  <div>
                    <span class="pickup-label">Location:</span>
                    <span class="pickup-value">${pickupLocation}</span>
                  </div>
                </div>
              </div>

              <div class="checklist">
                <p style="margin: 0 0 10px 0;"><strong>⚠️ Important: What to Bring</strong></p>
                <ul style="margin: 5px 0;">
                  <li>Valid government-issued photo ID</li>
                  <li>Proof of address (utility bill, lease agreement, etc.)</li>
                  <li>Pet carrier or leash (depending on the pet)</li>
                  <li>No adoption fee is required</li>
                  <li>A lot of love and excitement! ❤️</li>
                </ul>
              </div>

              <div class="success-box">
                <p style="margin: 0;"><strong>✨ What Happens Next?</strong></p>
                <p style="margin: 5px 0 0 0;">
                  Please arrive at the specified date and time. Our team will have ${petName} ready for you, 
                  along with any medical records, vaccination certificates, and care instructions. 
                  If you have any questions before the pickup, feel free to contact us!
                </p>
              </div>

              <div style="background: #fef3c7; border-radius: 10px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #78350f;"><strong>📞 Need to Reschedule?</strong></p>
                <p style="margin: 5px 0 0 0; color: #92400e;">
                  Please contact us at least 24 hours in advance if you need to change your pickup time. 
                  We understand that circumstances can change!
                </p>
              </div>
              
              <p style="font-size: 16px; color: #047857; font-weight: bold; text-align: center; margin: 30px 0;">
                Thank you for choosing to adopt and giving ${petName} a wonderful new home! 🐾
              </p>
              
              <p>Warmest regards,<br><strong>The PetAdopt+ Team</strong> 🐕🐱</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 PetAdopt+. All rights reserved.</p>
              <p>Making tails wag and hearts happy! 🐾</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Adoption approval email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending adoption approval email:', error);
    return false;
  }
};

// Send adoption rejection email
export const sendAdoptionRejectionEmail = async (email, fullName, rejectionDetails) => {
  try {
    const transporter = createTransporter();

    const {
      petName,
      petBreed,
      petAge,
      reviewNotes
    } = rejectionDetails;

    const mailOptions = {
      from: `"PetAdopt+" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Adoption Application Update for ${petName} - PetAdopt+`,
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
            .pet-box {
              background: white;
              border: 2px solid #f97316;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            .pet-name {
              font-size: 24px;
              font-weight: bold;
              color: #f97316;
              text-align: center;
              margin-bottom: 15px;
            }
            .info-box {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .message-box {
              background: #ffe4e6;
              border-left: 4px solid #f43f5e;
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
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .browse-button {
              display: inline-block;
              background: #f97316;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🐾 Adoption Application Update</h1>
            </div>
            <div class="content">
              <h2>Dear ${fullName},</h2>
              <p>Thank you for your interest in adopting from PetAdopt+. We appreciate the time and effort you put into your adoption application.</p>
              
              <div class="pet-box">
                <div class="pet-name">🐕 ${petName}</div>
                <div style="margin: 15px 0; text-align: center;">
                  <span class="info-label">Breed:</span> ${petBreed || 'Mixed'}
                  <span class="info-label" style="margin-left: 20px;">Age:</span> ${petAge || 'Unknown'}
                </div>
              </div>

              <div class="message-box">
                <p style="margin: 0; font-weight: bold; color: #991b1b;">Application Status: Not Approved</p>
                <p style="margin: 10px 0 0 0; color: #991b1b;">
                  After careful review, we regret to inform you that we are unable to approve your adoption application for ${petName} at this time.
                </p>
              </div>

              ${reviewNotes ? `
              <div class="info-box">
                <p style="margin: 0; font-weight: bold; color: #92400e;">Review Notes:</p>
                <p style="margin: 10px 0 0 0; color: #78350f;">
                  ${reviewNotes}
                </p>
              </div>
              ` : ''}

              <p>Please don't be discouraged! We have many wonderful pets waiting for their forever homes. Each pet has unique needs, and we're committed to finding the perfect match for both our pets and adopters.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/browse-pets" class="browse-button" style="color: white;">
                  🐾 Browse Other Pets
                </a>
              </div>

              <div class="info-box">
                <p style="margin: 0; font-weight: bold; color: #92400e;">💡 Tips for Future Applications:</p>
                <ul style="margin: 10px 0; padding-left: 20px; color: #78350f;">
                  <li>Ensure your home environment is suitable for the specific pet type</li>
                  <li>Provide detailed information about your pet care experience</li>
                  <li>Consider visiting our adoption center to meet pets in person</li>
                  <li>You're welcome to apply for other pets that may be a better match</li>
                </ul>
              </div>

              <p>If you have any questions or would like to discuss your application further, please don't hesitate to contact us. We're here to help you find your perfect companion!</p>
              
              <p>Best regards,<br><strong>The PetAdopt+ Team</strong> 🐕🐱</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 PetAdopt+. All rights reserved.</p>
              <p>Making tails wag and hearts happy! 🐾</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Adoption rejection email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending adoption rejection email:', error);
    return false;
  }
};

// Send hostel booking status update email
export const sendBookingStatusUpdateEmail = async (email, customerName, statusDetails) => {
  try {
    const transporter = createTransporter();

    const {
      bookingNumber,
      status,
      roomNumber,
      roomName,
      petName,
      checkInDate,
      checkOutDate,
      updateDate
    } = statusDetails;

    // Different content based on status
    let statusColor, statusIcon, statusTitle, statusMessage, actionMessage;

    switch(status) {
      case 'Confirmed':
        statusColor = '#10b981';
        statusIcon = '✅';
        statusTitle = 'Booking Confirmed';
        statusMessage = 'Your hostel booking has been confirmed! We\'re preparing everything for your pet\'s stay.';
        actionMessage = 'Please arrive at the scheduled check-in time. Our staff will be ready to welcome your pet!';
        break;
      case 'Checked-In':
        statusColor = '#3b82f6';
        statusIcon = '🏠';
        statusTitle = 'Checked In Successfully';
        statusMessage = `${petName} has been checked in and is now comfortable in their room. We\'ll take great care of your pet!`;
        actionMessage = 'You can contact us anytime if you have questions. We\'ll send you updates during the stay.';
        break;
      case 'Checked-Out':
        statusColor = '#8b5cf6';
        statusIcon = '👋';
        statusTitle = 'Checked Out';
        statusMessage = `${petName} has been checked out. Thank you for choosing our pet hostel service!`;
        actionMessage = 'We hope to see you again soon! Please share your feedback with us.';
        break;
      case 'Cancelled':
        statusColor = '#ef4444';
        statusIcon = '❌';
        statusTitle = 'Booking Cancelled';
        statusMessage = 'Your hostel booking has been cancelled as requested.';
        actionMessage = 'If you need to rebook, please don\'t hesitate to contact us or make a new reservation.';
        break;
      default:
        statusColor = '#f59e0b';
        statusIcon = '📋';
        statusTitle = 'Booking Update';
        statusMessage = `Your booking status has been updated to: ${status}`;
        actionMessage = 'For any questions, please contact our support team.';
    }

    const mailOptions = {
      from: `"PetAdopt+ Hostel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${statusIcon} ${statusTitle} - Booking #${bookingNumber}`,
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
              background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%);
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
            .status-icon {
              font-size: 50px;
              margin-bottom: 10px;
            }
            .booking-box {
              background: white;
              border: 2px solid ${statusColor};
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            .booking-number {
              font-size: 20px;
              font-weight: bold;
              color: ${statusColor};
              text-align: center;
              margin-bottom: 15px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: bold;
              color: #666;
            }
            .detail-value {
              color: #1f2937;
            }
            .info-box {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
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
              <div class="status-icon">${statusIcon}</div>
              <h1>${statusTitle}</h1>
            </div>
            <div class="content">
              <h2>Dear ${customerName},</h2>
              <p>${statusMessage}</p>
              
              <div class="booking-box">
                <div class="booking-number">Booking #${bookingNumber}</div>
                
                <div style="margin: 15px 0;">
                  <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value" style="color: ${statusColor}; font-weight: bold;">${status.toUpperCase()}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Room:</span>
                    <span class="detail-value">${roomNumber} - ${roomName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Pet:</span>
                    <span class="detail-value">${petName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Check-In Date:</span>
                    <span class="detail-value">${new Date(checkInDate).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Check-Out Date:</span>
                    <span class="detail-value">${new Date(checkOutDate).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Updated On:</span>
                    <span class="detail-value">${new Date(updateDate).toLocaleString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              </div>

              <div class="info-box">
                <p style="margin: 0;"><strong>💡 What's Next?</strong></p>
                <p style="margin: 5px 0 0 0;">${actionMessage}</p>
              </div>
              
              <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br><strong>PetAdopt+ Hostel Team</strong> 🐕🐱</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 PetAdopt+ Hostel Services. All rights reserved.</p>
              <p>Booking Number: ${bookingNumber}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking status update email (${status}) sent to:`, email);
    return true;
  } catch (error) {
    console.error('❌ Error sending booking status update email:', error);
    return false;
  }
};
