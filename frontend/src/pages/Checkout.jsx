import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { initiateKhaltiOrderPayment } from "../utils/khaltiConfig";
import UserNavbar from "../components/UserNavbar";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const NEPAL_PHONE_REGEX = /^(97|98)\d{8}$/;

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
  const [errors, setErrors] = useState({ phone: "", address: "" });

  useEffect(() => {
    loadCart();
    loadUserData();
  }, []);

  const loadUserData = () => {
    const storedToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (storedToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setToken(storedToken);
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

    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length === 0) {
        setErrors(prev => ({ ...prev, phone: "" }));
      } else if (!NEPAL_PHONE_REGEX.test(digits)) {
        setErrors(prev => ({ ...prev, phone: "Enter a valid Nepal mobile number (e.g. 98XXXXXXXX or 97XXXXXXXX)" }));
      } else {
        setErrors(prev => ({ ...prev, phone: "" }));
      }
    }

    if (name === 'address') {
      if (value.trim().length > 0 && value.trim().length < 10) {
        setErrors(prev => ({ ...prev, address: "Address must be at least 10 characters (include street, city)" }));
      } else {
        setErrors(prev => ({ ...prev, address: "" }));
      }
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const SHIPPING_FEE = 100;
  const FREE_SHIPPING_THRESHOLD = 10000;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!NEPAL_PHONE_REGEX.test(phoneDigits)) {
      setErrors(prev => ({ ...prev, phone: "Enter a valid Nepal mobile number (e.g. 98XXXXXXXX or 97XXXXXXXX)" }));
      alert('Please enter a valid Nepal phone number');
      return;
    }

    if (formData.address.trim().length < 10) {
      setErrors(prev => ({ ...prev, address: "Address must be at least 10 characters (include street, city)" }));
      alert('Please enter a complete delivery address');
      return;
    }

    if (formData.paymentMethod === 'Khalti') {
      if (!user || !token) {
        alert('Please log in to use Khalti payment');
        return;
      }

      try {
        setLoading(true);

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
          subtotal,
          shippingFee: shipping,
          totalAmount: total,
          paymentMethod: 'Khalti',
          notes: formData.notes,
        };

        const response = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });

        const data = await response.json();

        if (!data.success) {
          alert(`Error creating order: ${data.message || 'Unknown error'}`);
          setLoading(false);
          return;
        }

        const orderId = data.data._id;

        await initiateKhaltiOrderPayment(orderId, token);

      } catch (error) {
        console.error('Error placing order:', error);
        alert(`Failed to place order: ${error.message || 'Please try again.'}`);
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);

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
        subtotal,
        shippingFee: shipping,
        totalAmount: total,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify(orderData),
        });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem('petshop_cart');
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
      <UserNavbar />

      <div className="bg-white border-b border-slate-100 px-6 lg:px-16 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Link to="/shop" className="hover:text-orange-500">Shop</Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-orange-500">Cart</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Checkout</span>
        </div>
      </div>

      <div className="px-6 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

          <form onSubmit={handlePlaceOrder}>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
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
                          Phone Number * <span className="text-xs font-normal text-slate-500">(Nepal)</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="98XXXXXXXX"
                          maxLength={10}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                            errors.phone ? 'border-red-400 bg-red-50' : 'border-slate-200'
                          }`}
                          required
                        />
                        {errors.phone ? (
                          <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                        ) : (
                          <p className="text-xs text-slate-400 mt-1">10-digit Nepal mobile (97/98XXXXXXXX)</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Delivery Address * <span className="text-xs font-normal text-slate-500">(Nepal)</span>
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none ${
                          errors.address ? 'border-red-400 bg-red-50' : 'border-slate-200'
                        }`}
                        placeholder="e.g. Thamel, Kathmandu, Bagmati Province"
                        required
                      />
                      {errors.address ? (
                        <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">Include street, city/district, and province</p>
                      )}
                    </div>
                  </div>
                </div>

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

                    <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Khalti"
                        checked={formData.paymentMethod === "Khalti"}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-purple-600"
                        disabled={!user}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">Khalti Payment</p>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                            Recommended
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">Pay securely with Khalti — you'll be redirected to Khalti</p>
                        {!user && (
                          <p className="text-xs text-red-600 mt-1">Login required for Khalti payment</p>
                        )}
                      </div>
                      <img
                        src="https://khalti.com/static/khalti_logo.png"
                        alt="Khalti"
                        className="h-6"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </label>

                  </div>
                </div>

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

              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Order Summary</h2>

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

                  <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                    <div className="flex justify-between text-slate-700">
                      <span>Subtotal</span>
                      <span className="font-semibold">Rs {subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span className="flex items-center gap-2">
                        Shipping
                        {shipping === 0 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                            FREE
                          </span>
                        )}
                      </span>
                      <span className={`font-semibold ${shipping === 0 ? 'text-green-600 line-through' : ''}`}>
                        Rs {SHIPPING_FEE}
                      </span>
                    </div>
                    {subtotal >= FREE_SHIPPING_THRESHOLD && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-green-800 font-semibold">
                          You've qualified for FREE shipping!
                        </p>
                      </div>
                    )}
                    {subtotal < FREE_SHIPPING_THRESHOLD && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                          Add <span className="font-semibold">Rs {FREE_SHIPPING_THRESHOLD - subtotal}</span> more to get FREE shipping
                        </p>
                      </div>
                    )}
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
                    {loading
                      ? formData.paymentMethod === 'Khalti'
                        ? 'Redirecting to Khalti...'
                        : 'Placing Order...'
                      : 'Place Order'}
                  </button>

                  <Link
                    to="/cart"
                    className="block w-full py-3 border-2 border-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-colors text-center"
                  >
                    Back to Cart
                  </Link>

                  <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
                    <p className="font-semibold mb-1">Secure Checkout</p>
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
