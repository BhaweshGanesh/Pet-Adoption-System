import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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

const HostelRoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;

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

  const myReview = useMemo(() => {
    if (!currentUserId || !reviews.length) return null;
    return reviews.find(
      (r) => (r.user?._id || r.user)?.toString() === currentUserId.toString()
    );
  }, [reviews, currentUserId]);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/hostel-rooms/${id}`);
      const data = await res.json();
      if (data.success) setRoom(data.data);
      else setRoom(null);
    } catch (e) {
      console.error(e);
      setRoom(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!id) return;
    try {
      setReviewsLoading(true);
      const res = await fetch(`${API_URL}/api/hostel-rooms/${id}/reviews`);
      const data = await res.json();
      if (data.success) setReviews(data.data || []);
    } catch (e) {
      console.error("Error fetching room reviews:", e);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [id]);

  useEffect(() => {
    if (id) fetchReviews();
  }, [id]);

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
      const res = await fetch(`${API_URL}/api/hostel-rooms/${id}/reviews`, {
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
    } catch {
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
        `${API_URL}/api/hostel-rooms/${id}/reviews/${reviewId}`,
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
        `${API_URL}/api/hostel-rooms/${id}/reviews/${deleteTarget}`,
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

  const handleBookNow = () => {
    navigate("/hostel", { state: { openBookingRoomId: id } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7f0]">
        <UserNavbar />
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-12 w-12 border-b-2 border-green-500 rounded-full animate-spin" />
          <p className="mt-4 text-slate-600">Loading room…</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#fff7f0]">
        <UserNavbar />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <p className="text-slate-700 mb-6">Room not found.</p>
          <Link
            to="/hostel"
            className="inline-flex px-6 py-2.5 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600"
          >
            Back to hostel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7f0]">
      <UserNavbar />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        <button
          type="button"
          onClick={() => navigate("/hostel")}
          className="text-sm font-semibold text-green-600 hover:text-green-700 mb-6 cursor-pointer"
        >
          ← Back to available rooms
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm mb-10">
          <div className="relative h-64 md:h-80 bg-gradient-to-br from-green-100 to-emerald-100">
            {room.image ? (
              <img
                src={room.image}
                alt={room.roomName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">
                🏠
              </div>
            )}
            <span className="absolute top-4 left-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
              {room.roomType}
            </span>
            <span className="absolute top-4 right-4 bg-white text-slate-700 text-xs px-3 py-1 rounded-full font-semibold">
              {room.petType}
            </span>
            <span
              className={`absolute bottom-4 left-4 text-xs px-3 py-1 rounded-full font-semibold ${
                room.status === "Available"
                  ? "bg-white/95 text-green-700"
                  : "bg-amber-100 text-amber-900"
              }`}
            >
              {room.status}
            </span>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {room.roomName}
                </h1>
                <p className="text-slate-600 mt-1">Room {room.roomNumber}</p>
                <p className="mt-4 text-slate-700 leading-relaxed">
                  {room.description ||
                    "Comfortable, supervised accommodation for your pet with daily care and attention."}
                </p>
              </div>
              <div className="shrink-0 text-left md:text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  From
                </p>
                <p className="text-3xl font-bold text-green-600">
                  Rs {room.pricePerDay}
                </p>
                <p className="text-sm text-slate-500">per day</p>
                <p className="text-sm text-slate-600 mt-2">
                  Capacity: {room.capacity} pet{room.capacity > 1 ? "s" : ""}
                </p>
                <button
                  type="button"
                  onClick={handleBookNow}
                  className="mt-4 w-full md:w-auto px-8 py-3 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors cursor-pointer"
                >
                  Book this room
                </button>
              </div>
            </div>

            {room.facilities && room.facilities.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  Facilities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {room.facilities.map((f, idx) => (
                    <span
                      key={idx}
                      className="text-sm bg-green-50 text-green-800 px-3 py-1 rounded-full"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="bg-white rounded-2xl border border-green-100 p-6 md:p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Reviews & Feedback
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Share your experience with this room. You can edit or delete your
            own review anytime.
          </p>

          {token && !myReview && (
            <form
              onSubmit={submitReview}
              className="mb-8 p-4 rounded-xl border border-slate-100 bg-[#f0fdf4]"
            >
              <p className="text-sm font-semibold text-slate-800 mb-2">
                Write a review
              </p>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Rating
              </label>
              <StarRow value={newRating} onChange={setNewRating} disabled={false} />
              <label className="block text-xs font-medium text-slate-600 mt-4 mb-2">
                Your feedback
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:outline-none text-sm resize-none"
                placeholder="How was your pet’s stay or your visit to this room?"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="mt-3 px-6 py-2.5 rounded-full bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-50"
              >
                {submittingReview ? "Submitting…" : "Submit review"}
              </button>
            </form>
          )}

          {!token && (
            <p className="mb-6 text-sm text-slate-600">
              <Link
                to="/login"
                className="text-green-600 font-semibold hover:underline"
              >
                Log in
              </Link>{" "}
              to leave a review.
            </p>
          )}

          {reviewsLoading ? (
            <p className="text-sm text-slate-500 py-4">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">
              No reviews yet. Be the first to share feedback!
            </p>
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
                    className="rounded-xl border border-slate-100 p-4 bg-slate-50/60"
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
                          className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:outline-none text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveEditReview(r._id)}
                            className="px-4 py-2 rounded-full bg-green-500 text-white text-xs font-semibold hover:bg-green-600"
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
                              {r.user?.fullName || "Guest"}
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
                              className="text-xs font-semibold text-green-600 hover:text-green-700"
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
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Delete review?
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              This cannot be undone. You can add a new review later if you change
              your mind.
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
  );
};

export default HostelRoomDetails;
