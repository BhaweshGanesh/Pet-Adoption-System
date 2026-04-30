const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Initiate Khalti payment for an order.
 * Calls backend → backend calls Khalti → returns payment_url.
 * Redirects the user to pay.khalti.com.
 */
export const initiateKhaltiOrderPayment = async (orderId, authToken) => {
  const response = await fetch(`${API_URL}/api/payments/initiate-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ orderId }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to initiate payment');
  }

  // Redirect user to Khalti payment page
  window.location.href = data.data.payment_url;
};

/**
 * Initiate Khalti payment for a hostel booking.
 * Calls backend → backend calls Khalti → returns payment_url.
 * Redirects the user to pay.khalti.com.
 */
export const initiateKhaltiBookingPayment = async (bookingId, authToken) => {
  const response = await fetch(`${API_URL}/api/payments/initiate-booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ bookingId }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to initiate payment');
  }

  // Redirect user to Khalti payment page
  window.location.href = data.data.payment_url;
};

// Verify Khalti payment using pidx (called from PaymentCallback page).
 
export const verifyKhaltiOrderPayment = async (pidx, orderId, authToken) => {
  const response = await fetch(`${API_URL}/api/payments/verify-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ pidx, orderId }),
  });

  return await response.json();
};

// Verify Khalti payment for a booking using pidx (called from PaymentCallback page).
 
export const verifyKhaltiBookingPayment = async (pidx, bookingId, authToken) => {
  const response = await fetch(`${API_URL}/api/payments/verify-booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ pidx, bookingId }),
  });

  return await response.json();
};
