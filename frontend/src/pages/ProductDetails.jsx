import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/products/${id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
        fetchRelatedProducts(data.data.category, data.data.petType);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category, petType) => {
    try {
      const response = await fetch(`http://localhost:4000/api/products?category=${category}`);
      const data = await response.json();
      if (data.success) {
        const related = data.data
          .filter(p => p._id !== id && (p.status === 'Available' || p.status === 'Out of Stock'))
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('petshop_cart') || '[]');
    const existing = cart.find(item => item._id === product._id);

    if (existing) {
      if (existing.quantity + quantity > product.stock) {
        alert(`Only ${product.stock} items available in stock`);
        return;
      }
      existing.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem('petshop_cart', JSON.stringify(cart));
    alert('Added to cart!');
  };

  const buyNow = () => {
    addToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7f0] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fff7f0] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
          <Link to="/shop" className="text-orange-500 hover:text-orange-600">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

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
          <Link to="/shop" className="text-orange-500">Shop</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/cart" className="px-4 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">
            🛒 Cart
          </Link>
          <Link to="/login" className="px-4 py-2 rounded-full border-2 border-slate-900 text-slate-900 text-sm font-semibold hover:bg-slate-900 hover:text-white">
            Login
          </Link>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="bg-white border-b border-slate-100 px-6 lg:px-16 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Link to="/shop" className="hover:text-orange-500">Shop</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-orange-500">{product.category}</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">{product.name}</span>
        </div>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="px-6 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Product Image */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 p-6">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-50">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-9xl">
                    📦
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                    {product.category}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                    For {product.petType}
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                  {product.name}
                </h1>
                {product.brand && (
                  <p className="text-lg text-slate-600">Brand: {product.brand}</p>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-orange-500">
                    Rs {product.price}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`font-medium ${
                    product.status === 'Out of Stock' ? 'text-red-600' : 
                    product.stock > 10 ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {product.status === 'Out of Stock' ? 'Out of Stock' : `${product.stock} in stock`}
                  </span>
                  {product.weight && (
                    <span className="text-slate-600">Weight: {product.weight}</span>
                  )}
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-2 uppercase">Description</h3>
                <p className="text-slate-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Quantity Selector */}
              {product.status !== 'Out of Stock' && product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-900 mb-2 uppercase">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full border-2 border-slate-300 hover:border-orange-500 flex items-center justify-center text-lg font-semibold"
                    >
                      -
                    </button>
                    <span className="text-xl font-bold text-slate-900 w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 rounded-full border-2 border-slate-300 hover:border-orange-500 flex items-center justify-center text-lg font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {product.status !== 'Out of Stock' && product.stock > 0 ? (
                  <>
                    <button
                      onClick={addToCart}
                      className="flex-1 py-3 px-6 bg-white border-2 border-orange-500 text-orange-500 rounded-full font-semibold hover:bg-orange-50 transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={buyNow}
                      className="flex-1 py-3 px-6 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Buy Now
                    </button>
                  </>
                ) : (
                  <button
                    disabled
                    className="flex-1 py-3 px-6 bg-slate-300 text-slate-600 rounded-full font-semibold cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((relProduct) => (
                  <Link
                    key={relProduct._id}
                    to={`/product/${relProduct._id}`}
                    className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all group"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-50">
                      {relProduct.image ? (
                        <img
                          src={relProduct.image}
                          alt={relProduct.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-slate-900 mb-1 line-clamp-1">
                        {relProduct.name}
                      </h3>
                      <p className="text-lg font-bold text-orange-500">
                        Rs {relProduct.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

