import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const currentUserId = useMemo(() => {
    try {
      const u = localStorage.getItem("user");
      if (!u) return null;
      const parsed = JSON.parse(u);
      return parsed.id || parsed._id || null;
    } catch {
      return null;
    }
  }, []);

  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (id) fetchReviews();
  }, [id]);

  const myReview = useMemo(() => {
    if (!currentUserId || !reviews.length) return null;
    return reviews.find(
      (r) => (r.user?._id || r.user)?.toString() === currentUserId.toString()
    );
  }, [reviews, currentUserId]);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await fetch(`${API_URL}/api/products/${id}/reviews`);
      const data = await res.json();
      if (data.success) setReviews(data.data || []);
    } catch (e) {
      console.error("Error fetching reviews:", e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products/${id}`);
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
      const response = await fetch(`${API_URL}/api/products?category=${category}`);
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

  const getEffectivePrice = (p) => {
    if (!p.discount || p.discount === 0) return p.price;
    return Math.round(p.price * (1 - p.discount / 100));
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('petshop_cart') || '[]');
    const existing = cart.find(item => item._id === product._id);
    const effectivePrice = getEffectivePrice(product);

    if (existing) {
      if (existing.quantity + quantity > product.stock) {
        alert(`Only ${product.stock} items available in stock`);
        return;
      }
      existing.quantity += quantity;
    } else {
      cart.push({ ...product, price: effectivePrice, originalPrice: product.price, quantity });
    }

    localStorage.setItem('petshop_cart', JSON.stringify(cart));
    alert('Added to cart!');
  };

  const buyNow = () => {
    addToCart();
    navigate('/cart');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }
    if (!newComment.trim()) {
      alert("Please write your feedback");
      return;
    }
    try {
      setSubmittingReview(true);
      const res = await fetch(`${API_URL}/api/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: newRating, comment: newComment.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Could not submit review");
        return;
      }
      setNewComment("");
      setNewRating(5);
      await fetchReviews();
    } catch (err) {
      alert("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const saveEditReview = async (reviewId) => {
    if (!token || !editComment.trim()) {
      alert("Feedback cannot be empty");
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/api/products/${id}/reviews/${reviewId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: editRating,
            comment: editComment.trim(),
          }),
        }
      );
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Could not update review");
        return;
      }
      setEditingId(null);
      await fetchReviews();
    } catch {
      alert("Failed to update review");
    }
  };

  const confirmDeleteReview = async () => {
    if (!deleteTarget || !token) return;
    try {
      const res = await fetch(
        `${API_URL}/api/products/${id}/reviews/${deleteTarget}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Could not delete");
        return;
      }
      setDeleteTarget(null);
      await fetchReviews();
    } catch {
      alert("Failed to delete review");
    }
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setEditRating(r.rating);
    setEditComment(r.comment);
  };

  const StarRow = ({ value, onChange, disabled }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className={`text-2xl leading-none transition ${
            n <= value ? "text-amber-400" : "text-slate-200"
          } ${disabled ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          aria-label={`${n} stars`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-slate-500">{value}/5</span>
    </div>
  );

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
          <Link to="/shop" className="text-orange-500">Shop</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/cart" className="px-4 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">
            🛒 Cart
          </Link>

        </div>
      </header>

      <div className="bg-white border-b border-slate-100 px-6 lg:px-16 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Link to="/shop" className="hover:text-orange-500">Shop</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-orange-500">{product.category}</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="px-6 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 p-6 relative">
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                  {product.discount}% OFF
                </div>
              )}
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
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  {product.discount > 0 ? (
                    <>
                      <span className="text-4xl font-bold text-orange-500">
                        Rs {getEffectivePrice(product)}
                      </span>
                      <span className="text-xl text-slate-400 line-through">
                        Rs {product.price}
                      </span>
                      <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                        {product.discount}% OFF
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-orange-500">
                      Rs {product.price}
                    </span>
                  )}
                </div>
                {product.discount > 0 && (
                  <p className="text-sm text-emerald-600 font-medium">
                    You save Rs {product.price - getEffectivePrice(product)}!
                  </p>
                )}
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

          <section className="mb-12 bg-white rounded-2xl border border-orange-100 p-6 lg:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Reviews & Feedback</h2>
            <p className="text-sm text-slate-500 mb-6">
              Share your experience with this product. You can edit or delete your own review anytime.
            </p>

            {token && !myReview && (
              <form
                onSubmit={submitReview}
                className="mb-8 p-4 rounded-xl border border-slate-100 bg-[#fffaf4]"
              >
                <p className="text-sm font-semibold text-slate-800 mb-2">Write a review</p>
                <label className="block text-xs font-medium text-slate-600 mb-2">Rating</label>
                <StarRow value={newRating} onChange={setNewRating} disabled={false} />
                <label className="block text-xs font-medium text-slate-600 mt-4 mb-2">
                  Your feedback
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none text-sm resize-none"
                  placeholder="Tell others what you think about this product..."
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="mt-3 px-6 py-2.5 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
                >
                  {submittingReview ? "Submitting…" : "Submit review"}
                </button>
              </form>
            )}

            {!token && (
              <p className="mb-6 text-sm text-slate-600">
                <Link to="/login" className="text-orange-500 font-semibold hover:underline">
                  Log in
                </Link>{" "}
                to leave a review.
              </p>
            )}

            {reviewsLoading ? (
              <p className="text-sm text-slate-500 py-4">Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No reviews yet. Be the first to share feedback!</p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => {
                  const uid = r.user?._id || r.user;
                  const isOwner =
                    currentUserId &&
                    uid?.toString() === currentUserId.toString();
                  const isEditing = editingId === r._id;

                  return (
                    <li
                      key={r._id}
                      className="rounded-xl border border-slate-100 p-4 bg-slate-50/50"
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <StarRow
                            value={editRating}
                            onChange={setEditRating}
                            disabled={false}
                          />
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveEditReview(r._id)}
                              className="px-4 py-2 rounded-full bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600"
                            >
                              Save changes
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-4 py-2 rounded-full border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {r.user?.fullName || "Customer"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-amber-400 text-sm tracking-tight">
                                  {"★".repeat(r.rating)}
                                  <span className="text-slate-200">
                                    {"★".repeat(5 - r.rating)}
                                  </span>
                                </span>
                                <span className="text-xs text-slate-400">
                                  {r.rating}/5
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-slate-400">
                              {r.createdAt
                                ? new Date(r.createdAt).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {r.comment}
                          </p>
                          {isOwner && (
                            <div className="mt-3 flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(r)}
                                className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(r._id)}
                                className="text-xs font-semibold text-red-600 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

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

          {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete review?</h3>
                <p className="text-sm text-slate-600 mb-4">
                  This cannot be undone. You can write a new review later if you change your mind.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteReview}
                    className="px-4 py-2 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

