/**
 * Khalti Payment Gateway Configuration
 * 
 * This file contains the Khalti payment integration utilities.
 * Khalti is a popular payment gateway in Nepal.
 * 
 * Documentation: https://docs.khalti.com/
 */

// Khalti Configuration
const KHALTI_CONFIG = {
  // Public key - Khalti's public test key for development
  // Once you get your merchant account verified, replace with your own key
  // Set VITE_KHALTI_PUBLIC_KEY in .env to use your key
  publicKey: import.meta.env.VITE_KHALTI_PUBLIC_KEY || 'test_public_key_dc74e0fd57cb46cd93832aee0a390234',
  
  // Product identity prefix
  productIdentity: 'PETADOPT',
  
  // Product URL
  productUrl: window.location.origin,
  
  // Event tracking URLs
  eventUrl: `${window.location.origin}/api/payments/khalti-webhook`,
};

/**
 * Initialize Khalti Checkout for Orders
 * @param {Object} orderData - Order details
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const initKhaltiCheckout = (orderData, onSuccess, onError) => {
  const config = {
    publicKey: KHALTI_CONFIG.publicKey,
    productIdentity: `${KHALTI_CONFIG.productIdentity}-ORDER-${orderData.orderId}`,
    productName: orderData.productName || 'Pet Shop Order',
    productUrl: KHALTI_CONFIG.productUrl,
    eventHandler: {
      onSuccess: (payload) => {
        console.log('✅ Khalti Payment Success:', payload);
        onSuccess(payload);
      },
      onError: (error) => {
        console.error('❌ Khalti Payment Error:', error);
        onError(error);
      },
      onClose: () => {
        console.log('ℹ️ Khalti widget closed');
      },
    },
    paymentPreference: ['KHALTI', 'EBANKING', 'MOBILE_BANKING', 'CONNECT_IPS', 'SCT'],
  };

  const checkout = new window.KhaltiCheckout(config);
  
  // Amount in paisa (1 NPR = 100 paisa)
  const amountInPaisa = Math.round(orderData.amount * 100);
  
  checkout.show({ amount: amountInPaisa });
};

/**
 * Initialize Khalti Checkout for Hostel Bookings
 * @param {Object} bookingData - Booking details
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const initKhaltiBookingCheckout = (bookingData, onSuccess, onError) => {
  const config = {
    publicKey: KHALTI_CONFIG.publicKey,
    productIdentity: `${KHALTI_CONFIG.productIdentity}-BOOKING-${bookingData.bookingId || Date.now()}`,
    productName: bookingData.productName || 'Hostel Room Booking',
    productUrl: KHALTI_CONFIG.productUrl,
    eventHandler: {
      onSuccess: (payload) => {
        console.log('✅ Khalti Payment Success:', payload);
        onSuccess(payload);
      },
      onError: (error) => {
        console.error('❌ Khalti Payment Error:', error);
        onError(error);
      },
      onClose: () => {
        console.log('ℹ️ Khalti widget closed');
      },
    },
    paymentPreference: ['KHALTI', 'EBANKING', 'MOBILE_BANKING', 'CONNECT_IPS', 'SCT'],
  };

  const checkout = new window.KhaltiCheckout(config);
  
  // Amount in paisa (1 NPR = 100 paisa)
  const amountInPaisa = Math.round(bookingData.amount * 100);
  
  checkout.show({ amount: amountInPaisa });
};

/**
 * Load Khalti Checkout Script
 * @returns {Promise} - Resolves when script is loaded
 */
export const loadKhaltiScript = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.KhaltiCheckout) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.17.0.0.0/khalti-checkout.iffe.js';
    script.onload = () => {
      console.log('✅ Khalti script loaded');
      resolve();
    };
    script.onerror = () => {
      console.error('❌ Failed to load Khalti script');
      reject(new Error('Failed to load Khalti payment gateway'));
    };
    document.body.appendChild(script);
  });
};

/**
 * Verify payment on backend
 * @param {string} token - Khalti payment token
 * @param {number} amount - Amount in paisa
 * @param {string} id - Order or Booking ID
 * @param {string} type - 'order' or 'booking'
 * @param {string} authToken - JWT auth token
 * @returns {Promise} - API response
 */
export const verifyKhaltiPayment = async (token, amount, id, type = 'order', authToken) => {
  const endpoint = type === 'order' 
    ? '/api/payments/verify-order'
    : '/api/payments/verify-booking';

  const payload = type === 'order'
    ? { token, amount, orderId: id }
    : { token, amount, bookingId: id };

  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Payment verification failed');
  }

  return data;
};

export default KHALTI_CONFIG;
