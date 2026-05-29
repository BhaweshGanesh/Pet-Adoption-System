import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('petshop_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('petshop_cart', JSON.stringify(newCart));
  };

  const updateQuantity = (productId, newQuantity) => {
    const item = cart.find(item => item._id === productId);
    if (newQuantity > item.stock) {
      alert(`Only ${item.stock} items available`);
      return;
    }
    if (newQuantity < 1) return;

    const newCart = cart.map(item =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    saveCart(newCart);
  };

  const removeItem = (productId) => {
    if (confirm('Remove this item from cart?')) {
      const newCart = cart.filter(item => item._id !== productId);
      saveCart(newCart);
    }
  };

  const clearCart = () => {
    if (confirm('Clear all items from cart?')) {
      saveCart([]);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSavings = cart.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);
  const shipping = cart.length > 0 ? 100 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#fff7f0]">
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

          <Link to="/browse-pets" className="hover:text-slate-900">Browse Pets</Link>
          <Link to="/shop" className="hover:text-slate-900">Shop</Link>
        </nav>

      </header>

      <div className="bg-white border-b border-slate-100 px-6 lg:px-16 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Link to="/shop" className="hover:text-orange-500">Shop</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Shopping Cart</span>
        </div>
      </div>

      <div className="px-6 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

          {cart.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
              <p className="text-slate-600 mb-6">Add some products to get started!</p>
              <Link
                to="/shop"
                className="inline-block px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {cart.length} {cart.length === 1 ? 'Item' : 'Items'} in Cart
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    Clear Cart
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      <Link to={`/product/${item._id}`} className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-50">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              📦
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-4 mb-2">
                          <div>
                            <Link to={`/product/${item._id}`}>
                              <h3 className="font-bold text-slate-900 hover:text-orange-500 mb-1">
                                {item.name}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-600">{item.category}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600">For {item.petType}</span>
                            </div>
                            {item.brand && (
                              <p className="text-xs text-slate-500 mt-1">{item.brand}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item._id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full border border-slate-300 hover:border-orange-500 flex items-center justify-center text-sm font-semibold"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-semibold text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full border border-slate-300 hover:border-orange-500 flex items-center justify-center text-sm font-semibold"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-500">
                              Rs {item.price * item.quantity}
                            </p>
                            {item.originalPrice && item.originalPrice > item.price ? (
                              <p className="text-xs text-slate-400 line-through">
                                Rs {item.originalPrice * item.quantity}
                              </p>
                            ) : item.quantity > 1 ? (
                              <p className="text-xs text-slate-500">
                                Rs {item.price} each
                              </p>
                            ) : null}
                            {item.originalPrice && item.originalPrice > item.price && (
                              <p className="text-[11px] text-emerald-600 font-medium">
                                Save Rs {(item.originalPrice - item.price) * item.quantity}
                              </p>
                            )}
                          </div>
                        </div>

                        {item.quantity >= item.stock && (
                          <div className="mt-2 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                            Maximum quantity reached
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                    <div className="flex justify-between text-slate-700">
                      <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <span className="font-semibold">Rs {subtotal}</span>
                    </div>
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span className="text-sm">Discount savings</span>
                        <span className="font-semibold text-sm">- Rs {totalSavings}</span>
                      </div>
                    )}
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
                    onClick={() => navigate('/checkout')}
                    className="w-full py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors mb-3"
                  >
                    Proceed to Checkout
                  </button>

                  <Link
                    to="/shop"
                    className="block w-full py-3 border-2 border-orange-500 text-orange-500 rounded-full font-semibold hover:bg-orange-50 transition-colors text-center"
                  >
                    Continue Shopping
                  </Link>

                  <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-600 text-xl">✓</span>
                      <div className="text-sm text-emerald-700">
                        <p className="font-semibold mb-1">Free Returns</p>
                        <p className="text-xs">30-day return policy on all products</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;

