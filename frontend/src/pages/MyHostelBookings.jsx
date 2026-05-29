import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const MyHostelBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    loadUserData();
    fetchBookings();
  }, []);

  const loadUserData = () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      alert("Please login to view your bookings");
      navigate('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:4000/api/hostel-bookings/my-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === "All") return true;
    return booking.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Confirmed': 'bg-green-100 text-green-800 border-green-200',
      'Checked-In': 'bg-blue-100 text-blue-800 border-blue-200',
      'Checked-Out': 'bg-slate-100 text-slate-800 border-slate-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/hostel-bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert("Booking cancelled successfully");
        fetchBookings();
      } else {
        alert(data.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert("Failed to cancel booking");
    }
  };

  return (
    <div className="min-h-screen bg-[#fff7f0]">
      <header className="sticky top-0 z-20 bg-white border-b border-orange-100/80 px-6 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">
              Pet<span className="text-green-500">Hostel</span>
            </span>
          </div>

          <nav className="hidden md:flex gap-6 text-sm text-slate-500">
            <Link to="/" className="hover:text-slate-900">Home</Link>
            <Link to="/browse-pets" className="hover:text-slate-900">Browse Pets</Link>
            <Link to="/shop" className="hover:text-slate-900">Shop</Link>
            <Link to="/hostel" className="hover:text-slate-900">Hostel</Link>
            <Link to="/my-hostel-bookings" className="text-green-500 border-b-2 border-green-400 pb-0.5">My Bookings</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <Link
              to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'}
              className="px-4 py-2 rounded-full border-2 border-slate-900 text-slate-900 text-sm font-semibold hover:bg-slate-900 hover:text-white transition-colors"
            >
              {user.fullName || 'Dashboard'}
            </Link>
          )}
        </div>
      </header>

      <div className="bg-white border-b border-slate-100 px-6 lg:px-16 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Hostel Bookings</h1>
          <p className="text-slate-600">View and manage your pet hostel reservations</p>
        </div>
      </div>

      <div className="px-6 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">Filter:</span>
              {['All', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              <p className="mt-4 text-slate-600">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
              <p className="text-slate-600 mb-6">
                {filter === "All"
                  ? "You haven't made any hostel bookings yet"
                  : `No ${filter.toLowerCase()} bookings`}
              </p>
              <Link
                to="/hostel"
                className="inline-block px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors"
              >
                Browse Rooms
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        {booking.room.image ? (
                          <img
                            src={booking.room.image}
                            alt={booking.room.roomName}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-green-100 flex items-center justify-center text-3xl">
                            🏠
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{booking.room.roomName}</h3>
                          <p className="text-sm text-slate-600">Room {booking.room.roomNumber} • {booking.room.roomType}</p>
                          <p className="text-xs text-slate-500 mt-1">Booking #{booking.bookingNumber}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Pet Details</p>
                        <p className="font-semibold text-slate-900">{booking.petDetails.petName}</p>
                        <p className="text-sm text-slate-600">{booking.petDetails.petType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Check-In</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(booking.checkInDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Check-Out</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(booking.checkOutDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Total Amount</p>
                        <p className="text-xl font-bold text-green-600">Rs {booking.totalAmount}</p>
                        <p className="text-xs text-slate-600">{booking.numberOfDays} day{booking.numberOfDays > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {booking.specialInstructions && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-semibold text-blue-800 mb-1">Special Instructions:</p>
                        <p className="text-sm text-blue-900">{booking.specialInstructions}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="px-4 py-2 border-2 border-slate-200 text-slate-700 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors"
                      >
                        View Details
                      </button>

                      {(booking.status === 'Confirmed' || booking.status === 'Pending') && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="px-4 py-2 border-2 border-red-200 text-red-600 rounded-full text-sm font-semibold hover:bg-red-50 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}

                      <p className="text-xs text-slate-500 ml-auto">
                        Booked on {new Date(booking.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center pb-6 border-b border-slate-100">
                <p className="text-sm text-slate-500 mb-1">Booking Number</p>
                <p className="text-2xl font-bold text-green-600">{selectedBooking.bookingNumber}</p>
                <span className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Room Information</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <p><strong>Room:</strong> {selectedBooking.room.roomName} ({selectedBooking.room.roomNumber})</p>
                  <p><strong>Type:</strong> {selectedBooking.room.roomType}</p>
                  <p><strong>Price per Day:</strong> Rs {selectedBooking.room.pricePerDay}</p>
                  {selectedBooking.room.facilities && selectedBooking.room.facilities.length > 0 && (
                    <div>
                      <strong>Facilities:</strong>
                      <ul className="list-disc list-inside mt-1 text-sm text-slate-600">
                        {selectedBooking.room.facilities.map((facility, idx) => (
                          <li key={idx}>{facility}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Pet Information</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <p><strong>Name:</strong> {selectedBooking.petDetails.petName}</p>
                  <p><strong>Type:</strong> {selectedBooking.petDetails.petType}</p>
                  {selectedBooking.petDetails.age && <p><strong>Age:</strong> {selectedBooking.petDetails.age}</p>}
                  {selectedBooking.petDetails.breed && <p><strong>Breed:</strong> {selectedBooking.petDetails.breed}</p>}
                  {selectedBooking.petDetails.specialNeeds && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                      <p className="text-sm"><strong>Special Needs:</strong> {selectedBooking.petDetails.specialNeeds}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Stay Details</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <p><strong>Check-In:</strong> {new Date(selectedBooking.checkInDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                  <p><strong>Check-Out:</strong> {new Date(selectedBooking.checkOutDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                  <p><strong>Duration:</strong> {selectedBooking.numberOfDays} day{selectedBooking.numberOfDays > 1 ? 's' : ''}</p>
                  <div className="pt-2 mt-2 border-t border-slate-200">
                    <p className="text-xl font-bold text-green-600">
                      Total Amount: Rs {selectedBooking.totalAmount}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Contact Information</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <p><strong>Email:</strong> {selectedBooking.contactInfo.email}</p>
                  <p><strong>Phone:</strong> {selectedBooking.contactInfo.phone}</p>
                  {selectedBooking.contactInfo.emergencyContact && (
                    <p><strong>Emergency Contact:</strong> {selectedBooking.contactInfo.emergencyContact}</p>
                  )}
                </div>
              </div>

              {selectedBooking.specialInstructions && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Special Instructions</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">{selectedBooking.specialInstructions}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  Booking created on {new Date(selectedBooking.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyHostelBookings;

