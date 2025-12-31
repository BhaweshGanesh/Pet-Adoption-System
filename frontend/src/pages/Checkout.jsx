import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "Cash on Delivery",
    notes: "",
  });

  useEffect(() => {
    loadCart();
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Check if user is logged in
    const storedToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (storedToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setToken(storedToken);
        
        // Pre-fill form with user data
        setFormData(prev => ({
          ...prev,
          name: parsedUser.fullName || "",
          email: parsedUser.email || "",
          phone: parsedUser.phone || "",
          address: parsedUser.address || "",
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('petshop_cart');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      if (cartData.length === 0) {
        navigate('/cart');
      }
      setCart(cartData);
    } else {
      navigate('/cart');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 100;
  const total = subtotal + shipping;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Prepare order data
      const orderData = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
        })),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      // Prepare headers with optional authentication
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add authentication token if user is logged in
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:4000/api/orders', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        // Clear cart
        localStorage.removeItem('petshop_cart');
        
        // Redirect to success page with order number
        navigate('/order-success', { state: { order: data.data } });
      } else {
        console.error('Order creation failed:', data);
        alert(`Error creating order: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff7f0]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-20 bg-white border-b border-orange-100/80 px-6 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🐾</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">
            Pet<span className="text-orange-500">Adopt+</span>
          </span>
        </div>

        <nav className="hidden md:flex gap-6 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-900">Home</Link>
          <Link to="/browse-pets" className="hover:text-slate-900">Browse Pets</Link>
          <Link to="/shop" className="hover:text-slate-900">Shop</Link>
        </nav>

        <Link to="/login" className="px-4 py-2 rounded-full border-2 border-slate-900 text-slate-900 text-sm font-semibold hover:bg-slate-900 hover:text-white">
          Login
        </Link>
      </header>

      {/* BREADCRUMB */}
      <div className="bg-white border-b border-slate-100 px-6 lg:px-16 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Link to="/shop" className="hover:text-orange-500">Shop</Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-orange-500">Cart</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Checkout</span>
        </div>
      </div>

      {/* CHECKOUT FORM */}
      <div className="px-6 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

          <form onSubmit={handlePlaceOrder}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Billing Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Customer Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Email * {user && <span className="text-xs text-green-600">(From your account)</span>}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${user ? 'bg-slate-50' : ''}`}
                          disabled={!!user}
                          required
                        />
                        {user && (
                          <p className="text-xs text-slate-600 mt-1">
                            Order confirmation will be sent to this email
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Delivery Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                        placeholder="House no, Street, City, State"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Payment Method</h2>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Cash on Delivery"
                        checked={formData.paymentMethod === "Cash on Delivery"}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-orange-500"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">Cash on Delivery</p>
                        <p className="text-sm text-slate-600">Pay when you receive your order</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Online Payment"
                        checked={formData.paymentMethod === "Online Payment"}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-orange-500"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">Online Payment</p>
                        <p className="text-sm text-slate-600">Pay now using card or UPI</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Bank Transfer"
                        checked={formData.paymentMethod === "Bank Transfer"}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-orange-500"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">Bank Transfer</p>
                        <p className="text-sm text-slate-600">Transfer to our bank account</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Order Notes */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Order Notes (Optional)</h2>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                    placeholder="Any special instructions for delivery..."
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Order Summary</h2>

                  {/* Cart Items */}
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item._id} className="flex gap-3 pb-3 border-b border-slate-100">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 truncate">{item.name}</h3>
                          <p className="text-xs text-slate-600">Qty: {item.quantity}</p>
                          <p className="text-sm font-bold text-orange-500">Rs {item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                    <div className="flex justify-between text-slate-700">
                      <span>Subtotal</span>
                      <span className="font-semibold">Rs {subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Shipping</span>
                      <span className="font-semibold">Rs {shipping}</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xl font-bold text-slate-900 mb-6">
                    <span>Total</span>
                    <span className="text-orange-500">Rs {total}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>

                  <Link
                    to="/cart"
                    className="block w-full py-3 border-2 border-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-colors text-center"
                  >
                    Back to Cart
                  </Link>

                  <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
                    <p className="font-semibold mb-1">🔒 Secure Checkout</p>
                    <p className="text-xs">Your information is protected and secure</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

