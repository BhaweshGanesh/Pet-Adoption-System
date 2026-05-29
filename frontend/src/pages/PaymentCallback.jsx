import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyKhaltiOrderPayment, verifyKhaltiBookingPayment } from "../utils/khaltiConfig";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const pidx = searchParams.get("pidx");
      const paymentStatus = searchParams.get("status");
      const type = searchParams.get("type");
      const orderId = searchParams.get("orderId");
      const bookingId = searchParams.get("bookingId");
      const token = localStorage.getItem("token");

      if (!pidx) {
        setStatus("error");
        setMessage("Invalid payment callback — no payment ID found.");
        return;
      }

      if (paymentStatus === "User canceled") {
        setStatus("cancelled");
        setMessage("Payment was cancelled. Your order/booking has been saved and you can retry payment later.");
        return;
      }

      if (!token) {
        setStatus("error");
        setMessage("You are not logged in. Please log in and check your orders.");
        return;
      }

      try {
        if (type === "booking" && bookingId) {
          const data = await verifyKhaltiBookingPayment(pidx, bookingId, token);
          if (data.success) {
            setBookingData(data.data.booking);
            setStatus("success");
          } else {
            setStatus("error");
            setMessage(data.message || "Payment verification failed.");
          }
        } else if (orderId) {
          const data = await verifyKhaltiOrderPayment(pidx, orderId, token);
          if (data.success) {
            localStorage.removeItem("petshop_cart");
            setOrderData(data.data.order);
            setStatus("success");
          } else {
            setStatus("error");
            setMessage(data.message || "Payment verification failed.");
          }
        } else {
          setStatus("error");
          setMessage("Missing order or booking information in callback URL.");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setStatus("error");
        setMessage(err.message || "An error occurred during payment verification.");
      }
    };

    verifyPayment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-[#fff7f0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Verifying Payment...</h2>
          <p className="text-slate-600">Please wait while we confirm your payment with Khalti.</p>
        </div>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="min-h-screen bg-[#fff7f0] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 p-8 text-center shadow-xl">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Cancelled</h1>
          <p className="text-slate-600 mb-6">{message}</p>
          <div className="flex flex-col gap-3">
            <Link
              to="/checkout"
              className="py-3 px-6 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
            >
              Return to Checkout
            </Link>
            <Link
              to="/shop"
              className="py-3 px-6 border-2 border-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#fff7f0] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 p-8 text-center shadow-xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Verification Failed</h1>
          <p className="text-slate-600 mb-2">{message}</p>
          <p className="text-sm text-slate-500 mb-6">
            If you were charged, please contact support with your payment details.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/checkout"
              className="py-3 px-6 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
            >
              Return to Checkout
            </Link>
            <Link
              to="/"
              className="py-3 px-6 border-2 border-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isBooking = !!bookingData;

  return (
    <div className="min-h-screen bg-[#fff7f0] flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-100 p-8 lg:p-12 text-center shadow-xl">
        <div className="mb-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-slate-600">
            {isBooking ? "Your hostel booking is confirmed." : "Thank you for your purchase!"}
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 mb-6 text-left">
          {isBooking ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Booking Number</p>
                <p className="text-lg font-bold text-slate-900">{bookingData.bookingNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Amount</p>
                <p className="text-lg font-bold text-purple-600">Rs {bookingData.totalAmount}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Payment Method</p>
                <p className="text-sm font-semibold text-slate-900">Khalti</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                  Confirmed
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Order Number</p>
                <p className="text-lg font-bold text-slate-900">{orderData?.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Amount</p>
                <p className="text-lg font-bold text-orange-500">Rs {orderData?.totalAmount}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Payment Method</p>
                <p className="text-sm font-semibold text-slate-900">Khalti</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Payment Status</p>
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                  Paid
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-emerald-50 rounded-2xl p-6 mb-8 text-left">
          <h3 className="font-bold text-emerald-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-emerald-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span>You'll receive a confirmation email shortly</span>
            </li>
            {!isBooking && (
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Expect delivery within 3–5 business days</span>
              </li>
            )}
            {isBooking && (
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Your pet's room is reserved for the selected dates</span>
              </li>
            )}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {isBooking ? (
            <Link
              to="/hostel"
              className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors"
            >
              View My Bookings
            </Link>
          ) : (
            <Link
              to="/shop"
              className="flex-1 py-3 px-6 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
            >
              Continue Shopping
            </Link>
          )}
          <Link
            to="/shop"
            className="flex-1 py-3 px-6 border-2 border-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-colors"
          >
            Back to Shop
          </Link>
        </div>

        {orderData && (
          <p className="mt-6 text-sm text-slate-600">
            Save your order number{" "}
            <span className="font-bold text-orange-500">{orderData.orderNumber}</span> for reference
          </p>
        )}
      </div>

      <div className="mt-8 flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <span className="text-lg">🐾</span>
        </div>
        <span className="text-xl font-bold text-slate-900">
          Pet<span className="text-orange-500">Adopt+</span>
        </span>
      </div>
    </div>
  );
};

export default PaymentCallback;
