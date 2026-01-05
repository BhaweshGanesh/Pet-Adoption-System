import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const UserHostelPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("rooms"); // "rooms" or "bookings"
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    petType: "All",
    roomType: "All",
    priceRange: "All",
  });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    petName: "",
    petType: "Dog",
    age: "",
    breed: "",
    specialNeeds: "",
    checkInDate: "",
    checkOutDate: "",
    phone: "",
    emergencyContact: "",
    specialInstructions: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  
  // My Bookings state
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingFilter, setBookingFilter] = useState("All");
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);

  useEffect(() => {
    loadUserData();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (activeTab === "bookings" && user) {
      fetchMyBookings();
    }
  }, [activeTab, user]);

  const loadUserData = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setBookingForm(prev => ({
          ...prev,
          phone: parsedUser.phone || "",
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/hostel-rooms?status=Available');
      const data = await response.json();

      if (data.success) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    if (filters.petType !== "All" && room.petType !== "All" && room.petType !== filters.petType) {
      return false;
    }
    if (filters.roomType !== "All" && room.roomType !== filters.roomType) {
      return false;
    }
    if (filters.priceRange !== "All") {
      const price = room.pricePerDay;
      if (filters.priceRange === "under500" && price >= 500) return false;
      if (filters.priceRange === "500-1000" && (price < 500 || price > 1000)) return false;
      if (filters.priceRange === "above1000" && price <= 1000) return false;
    }
    return true;
  });

  const openBookingModal = (room) => {
    if (!user) {
      alert("Please login to book a hostel room");
      navigate('/login');
      return;
    }
    setSelectedRoom(room);
    setBookingError("");
  };

  const closeBookingModal = () => {
    setSelectedRoom(null);
    setBookingForm({
      petName: "",
      petType: "Dog",
      age: "",
      breed: "",
      specialNeeds: "",
      checkInDate: "",
      checkOutDate: "",
      phone: user?.phone || "",
      emergencyContact: "",
      specialInstructions: "",
    });
    setBookingError("");
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError("");

    if (!user) {
      alert("Please login to book");
      navigate('/login');
      return;
    }

    // Validation
    if (!bookingForm.petName || !bookingForm.checkInDate || !bookingForm.checkOutDate || !bookingForm.phone) {
      setBookingError("Please fill in all required fields");
      return;
    }

    const checkIn = new Date(bookingForm.checkInDate);
    const checkOut = new Date(bookingForm.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      setBookingError("Check-in date cannot be in the past");
      return;
    }

    if (checkOut <= checkIn) {
      setBookingError("Check-out date must be after check-in date");
      return;
    }

    try {
      setBookingLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please login to continue");
        navigate('/login');
        return;
      }

      const bookingData = {
        roomId: selectedRoom._id,
        petDetails: {
          petName: bookingForm.petName,
          petType: bookingForm.petType,
          age: bookingForm.age,
          breed: bookingForm.breed,
          specialNeeds: bookingForm.specialNeeds,
        },
        checkInDate: bookingForm.checkInDate,
        checkOutDate: bookingForm.checkOutDate,
        phone: bookingForm.phone,
        emergencyContact: bookingForm.emergencyContact,
        specialInstructions: bookingForm.specialInstructions,
      };

      const response = await fetch('http://localhost:4000/api/hostel-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Booking confirmed! Booking Number: ${data.data.bookingNumber}\n\nA confirmation email has been sent to ${user.email}`);
        closeBookingModal();
        setActiveTab("bookings"); // Switch to bookings tab
        fetchMyBookings(); // Refresh bookings
      } else {
        setBookingError(data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setBookingError('Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateDaysAndPrice = () => {
    if (!bookingForm.checkInDate || !bookingForm.checkOutDate || !selectedRoom) return null;

    const checkIn = new Date(bookingForm.checkInDate);
    const checkOut = new Date(bookingForm.checkOutDate);
    
    if (checkOut <= checkIn) return null;

    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const total = days * selectedRoom.pricePerDay;

    return { days, total };
  };

  const priceInfo = calculateDaysAndPrice();

  // Fetch user's bookings
  const fetchMyBookings = async () => {
    try {
      setBookingsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }

      const response = await fetch('http://localhost:4000/api/hostel-bookings/my-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMyBookings(data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const filteredMyBookings = myBookings.filter(booking => {
    if (bookingFilter === "All") return true;
    return booking.status === bookingFilter;
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
        alert('Booking cancelled successfully!');
        fetchMyBookings();
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  return (
    <div className="min-h-screen bg-[#fff7f0]">
      {/* NAVBAR - Matching BrowsePets style */}
      <header className="sticky top-0 z-20 bg-white border-b border-orange-100/80 px-6 lg:px-16 py-4 flex items-center justify-between">
        {/* Left: logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🐾</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">
            Pet<span className="text-orange-500">Adopt+</span>
          </span>
        </div>

        <nav className="hidden md:flex gap-12 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-900">
            Home
          </Link>
          <Link to="/browse-pets" className="hover:text-slate-900">
            Browse Pets
          </Link>
          <Link to="/hostel" className="text-orange-500 border-b-2 border-orange-400 pb-0.5">
            Pet Hotel
          </Link>
          <Link to="/shop" className="hover:text-slate-900">
            Shop
          </Link>
          <a href="#" className="hover:text-slate-900">
            About
          </a>
          {user ? (
            <Link to="/user-profile" className="hover:text-slate-900">
              Profile
            </Link>
          ) : (
            <Link to="/login" className="hover:text-slate-900">
              Login
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-slate-600 hidden lg:block">
              Welcome, {user.fullName}
            </span>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 px-6 lg:px-16 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Pet Hostel Services
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A safe, comfortable, and loving home away from home for your pets
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="px-6 lg:px-16 py-6 border-b border-orange-100">
        <div className="max-w-7xl mx-auto flex gap-4">
          <button
            onClick={() => setActiveTab("rooms")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === "rooms"
                ? "bg-orange-500 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-orange-300"
            }`}
          >
            🏠 Available Rooms
          </button>
          {user && (
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === "bookings"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-orange-300"
              }`}
            >
              📋 My Bookings
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="px-6 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === "rooms" ? (
            <>
              {/* FILTERS */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Filter Rooms</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pet Type</label>
                <select
                  value={filters.petType}
                  onChange={(e) => setFilters({...filters, petType: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="All">All Pets</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Rabbit">Rabbit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Room Type</label>
                <select
                  value={filters.roomType}
                  onChange={(e) => setFilters({...filters, roomType: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="All">All Types</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="Shared">Shared</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price Range</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="All">All Prices</option>
                  <option value="under500">Under Rs 500</option>
                  <option value="500-1000">Rs 500 - 1000</option>
                  <option value="above1000">Above Rs 1000</option>
                </select>
              </div>
            </div>
          </div>

          {/* ROOMS GRID */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Available Rooms</h2>
            <p className="text-slate-600">{filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              <p className="mt-4 text-slate-600">Loading rooms...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <p className="text-slate-600 text-lg">No rooms available matching your filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <div
                  key={room._id}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 bg-gradient-to-br from-green-100 to-emerald-100">
                    {room.image ? (
                      <img
                        src={room.image}
                        alt={room.roomName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🏠
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {room.roomType}
                    </span>
                    <span className="absolute top-3 right-3 bg-white text-slate-700 text-xs px-3 py-1 rounded-full font-semibold">
                      {room.petType}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-slate-900">{room.roomName}</h3>
                      <p className="text-sm text-slate-600">Room {room.roomNumber}</p>
                    </div>

                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {room.description || "Comfortable accommodation for your pet"}
                    </p>

                    {room.facilities && room.facilities.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Facilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {room.facilities.slice(0, 3).map((facility, idx) => (
                            <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                              {facility}
                            </span>
                          ))}
                          {room.facilities.length > 3 && (
                            <span className="text-xs text-slate-500">+{room.facilities.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500">Per Day</p>
                        <p className="text-2xl font-bold text-green-600">Rs {room.pricePerDay}</p>
                      </div>
                      <button
                        onClick={() => openBookingModal(room)}
                        className="px-4 py-2 bg-green-500 text-white rounded-full font-semibold text-sm hover:bg-green-600 transition-colors"
                      >
                        Book Now
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      Capacity: {room.capacity} pet{room.capacity > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
            </>
          ) : (
            /* MY BOOKINGS TAB */
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">My Hostel Bookings</h2>
                  <p className="text-slate-600 mt-1">View and manage your booking history</p>
                </div>
                <select
                  value={bookingFilter}
                  onChange={(e) => setBookingFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="All">All Bookings</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Checked-In">Checked-In</option>
                  <option value="Checked-Out">Checked-Out</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {bookingsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                  <p className="mt-4 text-slate-600">Loading bookings...</p>
                </div>
              ) : filteredMyBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                  <p className="text-slate-600 text-lg mb-4">No bookings found</p>
                  <button
                    onClick={() => setActiveTab("rooms")}
                    className="px-6 py-2 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600"
                  >
                    Book a Room
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredMyBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-bold text-slate-900">
                              {booking.room?.roomName || 'Room'}
                            </h3>
                            <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div>
                              <span className="text-slate-600">Booking #:</span>
                              <span className="font-semibold text-slate-900 ml-2">{booking.bookingNumber}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Room:</span>
                              <span className="font-semibold text-slate-900 ml-2">{booking.room?.roomNumber}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Pet:</span>
                              <span className="font-semibold text-slate-900 ml-2">{booking.petDetails?.petName} ({booking.petDetails?.petType})</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Check-In:</span>
                              <span className="font-semibold text-slate-900 ml-2">
                                {new Date(booking.checkInDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-600">Check-Out:</span>
                              <span className="font-semibold text-slate-900 ml-2">
                                {new Date(booking.checkOutDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-600">Total Amount:</span>
                              <span className="font-semibold text-slate-900 ml-2">Rs {booking.totalAmount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedBookingDetail(booking)}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            View Details
                          </button>
                          {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="px-4 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* BOOKING MODAL */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Book {selectedRoom.roomName}</h2>
              <button
                onClick={closeBookingModal}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              {bookingError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {bookingError}
                </div>
              )}

              {user && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Booking for:</strong> {user.fullName}<br />
                    <strong>Email:</strong> {user.email} (Confirmation will be sent here)
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Pet Name *
                  </label>
                  <input
                    type="text"
                    value={bookingForm.petName}
                    onChange={(e) => setBookingForm({...bookingForm, petName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Pet Type *
                  </label>
                  <select
                    value={bookingForm.petType}
                    onChange={(e) => setBookingForm({...bookingForm, petType: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Age
                  </label>
                  <input
                    type="text"
                    value={bookingForm.age}
                    onChange={(e) => setBookingForm({...bookingForm, age: e.target.value})}
                    placeholder="e.g., 2 years"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Breed
                  </label>
                  <input
                    type="text"
                    value={bookingForm.breed}
                    onChange={(e) => setBookingForm({...bookingForm, breed: e.target.value})}
                    placeholder="e.g., Golden Retriever"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Check-In Date *
                  </label>
                  <input
                    type="date"
                    value={bookingForm.checkInDate}
                    onChange={(e) => setBookingForm({...bookingForm, checkInDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Check-Out Date *
                  </label>
                  <input
                    type="date"
                    value={bookingForm.checkOutDate}
                    onChange={(e) => setBookingForm({...bookingForm, checkOutDate: e.target.value})}
                    min={bookingForm.checkInDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    value={bookingForm.emergencyContact}
                    onChange={(e) => setBookingForm({...bookingForm, emergencyContact: e.target.value})}
                    placeholder="Alternative phone number"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Special Needs/Medical Conditions
                </label>
                <textarea
                  value={bookingForm.specialNeeds}
                  onChange={(e) => setBookingForm({...bookingForm, specialNeeds: e.target.value})}
                  rows={2}
                  placeholder="Any allergies, medications, or special care requirements..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={bookingForm.specialInstructions}
                  onChange={(e) => setBookingForm({...bookingForm, specialInstructions: e.target.value})}
                  rows={2}
                  placeholder="Any additional instructions for pet care..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>

              {priceInfo && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-700">Duration:</span>
                    <span className="font-semibold text-slate-900">{priceInfo.days} day{priceInfo.days > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-700">Price per day:</span>
                    <span className="font-semibold text-slate-900">Rs {selectedRoom.pricePerDay}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-amber-300">
                    <span className="font-bold text-slate-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-600">Rs {priceInfo.total}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS MODAL */}
      {selectedBookingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Booking Details</h2>
              <button
                onClick={() => setSelectedBookingDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Booking Info */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Booking Information</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Booking Number:</span>
                    <span className="font-semibold text-slate-900">{selectedBookingDetail.bookingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full border font-semibold text-xs ${getStatusColor(selectedBookingDetail.status)}`}>
                      {selectedBookingDetail.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Room:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedBookingDetail.room?.roomNumber} - {selectedBookingDetail.room?.roomName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Check-In:</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(selectedBookingDetail.checkInDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Check-Out:</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(selectedBookingDetail.checkOutDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Duration:</span>
                    <span className="font-semibold text-slate-900">{selectedBookingDetail.numberOfDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Amount:</span>
                    <span className="font-semibold text-orange-600 text-lg">Rs {selectedBookingDetail.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Pet Details */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Pet Information</h3>
                <div className="bg-amber-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pet Name:</span>
                    <span className="font-semibold text-slate-900">{selectedBookingDetail.petDetails?.petName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Type:</span>
                    <span className="font-semibold text-slate-900">{selectedBookingDetail.petDetails?.petType}</span>
                  </div>
                  {selectedBookingDetail.petDetails?.age && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Age:</span>
                      <span className="font-semibold text-slate-900">{selectedBookingDetail.petDetails.age}</span>
                    </div>
                  )}
                  {selectedBookingDetail.petDetails?.breed && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Breed:</span>
                      <span className="font-semibold text-slate-900">{selectedBookingDetail.petDetails.breed}</span>
                    </div>
                  )}
                  {selectedBookingDetail.petDetails?.specialNeeds && (
                    <div>
                      <span className="text-slate-600">Special Needs:</span>
                      <p className="font-semibold text-slate-900 mt-1">{selectedBookingDetail.petDetails.specialNeeds}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Contact Information</h3>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Phone:</span>
                    <span className="font-semibold text-slate-900">{selectedBookingDetail.contactInfo?.phone}</span>
                  </div>
                  {selectedBookingDetail.contactInfo?.emergencyContact && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Emergency Contact:</span>
                      <span className="font-semibold text-slate-900">{selectedBookingDetail.contactInfo.emergencyContact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Instructions */}
              {selectedBookingDetail.specialInstructions && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Special Instructions</h3>
                  <div className="bg-cyan-50 rounded-lg p-4 text-sm text-slate-700">
                    {selectedBookingDetail.specialInstructions}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedBookingDetail(null)}
                className="w-full px-6 py-3 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHostelPage;

