import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const statusStyle = (status) => {
  const map = {
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Processing: "bg-blue-100 text-blue-800 border-blue-200",
    Shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Delivered: "bg-green-100 text-green-800 border-green-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
    Returned: "bg-slate-100 text-slate-800 border-slate-200",
  };
  return map[status] || "bg-slate-100 text-slate-800 border-slate-200";
};

const paymentStyle = (paymentStatus) => {
  const map = {
    Paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Failed: "bg-red-100 text-red-800 border-red-200",
    Refunded: "bg-purple-100 text-purple-800 border-purple-200",
    Unpaid: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return map[paymentStatus] || "bg-slate-100 text-slate-700 border-slate-200";
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view your orders.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.data || []);
          setError("");
        } else {
          setError(data.message || "Could not load orders.");
        }
      } catch {
        setError("Could not load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7f0]">
        <UserNavbar />
        <div className="flex flex-col items-center justify-center py-32">
          <div className="h-12 w-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-slate-600">Loading your orders…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7f0]">
      <UserNavbar />

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
          <p className="text-slate-600 mt-1">
            Shop purchases linked to your account ({orders.length} total)
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
            <p className="text-slate-600 text-lg mb-4">You have no shop orders yet.</p>
            <Link
              to="/shop"
              className="inline-flex px-6 py-2.5 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600"
            >
              Browse the shop
            </Link>
          </div>
        )}

        <ul className="space-y-6">
          {orders.map((order) => (
            <li
              key={order._id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Order number
                  </p>
                  <p className="text-lg font-bold text-slate-900">{order.orderNumber}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${paymentStyle(
                      order.paymentStatus
                    )}`}
                  >
                    Payment: {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="px-5 py-4 grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Delivery</h3>
                  <div className="text-sm text-slate-700 space-y-1">
                    <p>
                      <span className="text-slate-500">Name:</span>{" "}
                      {order.customer?.name}
                    </p>
                    <p>
                      <span className="text-slate-500">Email:</span>{" "}
                      {order.customer?.email}
                    </p>
                    <p>
                      <span className="text-slate-500">Phone:</span>{" "}
                      {order.customer?.phone}
                    </p>
                    <p>
                      <span className="text-slate-500">Address:</span>{" "}
                      {order.customer?.address}
                    </p>
                  </div>
                  <p className="text-sm text-slate-600 mt-3">
                    <span className="text-slate-500">Payment method:</span>{" "}
                    {order.paymentMethod}
                  </p>
                  {order.notes ? (
                    <p className="text-sm text-slate-600 mt-2">
                      <span className="text-slate-500">Notes:</span> {order.notes}
                    </p>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">
                    Items ({order.items?.length || 0})
                  </h3>
                  <ul className="space-y-3">
                    {order.items?.map((item, idx) => {
                      const pid = item.product?._id || item.product;
                      return (
                        <li
                          key={`${order._id}-${idx}`}
                          className="flex gap-3 text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                        >
                          <div className="w-14 h-14 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
                            {item.product?.image ? (
                              <img
                                src={item.product.image}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">
                                📦
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {item.productName}
                            </p>
                            <p className="text-slate-600">
                              Qty {item.quantity} × Rs {item.price}
                            </p>
                            {pid ? (
                              <Link
                                to={`/product/${pid}`}
                                className="text-xs text-orange-600 font-semibold hover:underline"
                              >
                                View product
                              </Link>
                            ) : null}
                          </div>
                          <p className="font-bold text-slate-900 shrink-0">
                            Rs {item.subtotal}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div className="px-5 py-4 bg-orange-50/50 border-t border-orange-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                  <div className="space-y-1 text-slate-700">
                    <div className="flex justify-between sm:justify-start sm:gap-8">
                      <span>Subtotal</span>
                      <span className="font-medium">Rs {order.subtotal}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start sm:gap-8">
                      <span>Shipping</span>
                      <span className="font-medium">
                        {order.shippingFee === 0 ? "FREE" : `Rs ${order.shippingFee}`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right sm:text-left pt-2 sm:pt-0 border-t sm:border-0 border-orange-100">
                    <p className="text-xs text-slate-500">Total paid</p>
                    <p className="text-xl font-bold text-orange-600">
                      Rs {order.totalAmount}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MyOrders;
