import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    // Redirect to shop if no order data
    if (!order) {
      navigate('/shop');
    }
  }, [order, navigate]);

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fff7f0] flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-100 p-8 lg:p-12 text-center shadow-xl">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-lg text-slate-600">
            Thank you for your purchase!
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-slate-50 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-sm text-slate-600 mb-1">Order Number</p>
              <p className="text-lg font-bold text-slate-900">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Amount</p>
              <p className="text-lg font-bold text-orange-500">Rs {order.totalAmount}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Payment Method</p>
              <p className="text-sm font-semibold text-slate-900">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Status</p>
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-8 text-left">
          <h3 className="font-bold text-slate-900 mb-3">Delivery Information</h3>
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold">Name:</span> {order.customer.name}</p>
            <p><span className="font-semibold">Email:</span> {order.customer.email}</p>
            <p><span className="font-semibold">Phone:</span> {order.customer.phone}</p>
            <p><span className="font-semibold">Address:</span> {order.customer.address}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="text-left mb-8">
          <h3 className="font-bold text-slate-900 mb-3">Order Items ({order.items.length})</h3>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <p className="font-semibold text-slate-900">{item.productName}</p>
                  <p className="text-sm text-slate-600">Quantity: {item.quantity} × Rs {item.price}</p>
                </div>
                <p className="font-bold text-slate-900">Rs {item.subtotal}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-emerald-50 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-emerald-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-emerald-700 text-left space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span>You'll receive an order confirmation email shortly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span>We'll notify you when your order is being prepared</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span>Expect delivery within 3-5 business days</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/shop"
            className="flex-1 py-3 px-6 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="flex-1 py-3 px-6 border-2 border-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* Save Order Number */}
        <p className="mt-6 text-sm text-slate-600">
          Please save your order number <span className="font-bold text-orange-500">{order.orderNumber}</span> for future reference
        </p>
      </div>

      {/* PetAdopt+ Logo */}
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

export default OrderSuccess;

