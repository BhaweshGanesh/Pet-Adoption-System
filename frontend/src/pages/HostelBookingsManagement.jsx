// src/pages/HostelBookingsManagement.jsx
import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

const HostelBookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    roomId: "",
    customerEmail: "",
    customerName: "",
    petName: "",
    petType: "Dog",
    age: "",
    breed: "",
    specialNeeds: "",
    checkInDate: "",
    checkOutDate: "",
    phone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    specialInstructions: "",
  });

  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/hostel-bookings');
      const data = await response.json();

      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/hostel-rooms');
      const data = await response.json();

      if (data.success) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter === "all") return true;
    return booking.status === statusFilter;
  });

  const openBookingModal = () => {
    setBookingForm({
      roomId: "",
      customerEmail: "",
      customerName: "",
      petName: "",
      petType: "Dog",
      age: "",
      breed: "",
      specialNeeds: "",
      checkInDate: "",
      checkOutDate: "",
      phone: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      specialInstructions: "",
    });
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!bookingForm.roomId || !bookingForm.customerEmail || !bookingForm.customerName ||
        !bookingForm.petName || !bookingForm.checkInDate || !bookingForm.checkOutDate ||
        !bookingForm.phone) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const bookingData = {
        room: bookingForm.roomId,
        customerEmail: bookingForm.customerEmail,
        customerName: bookingForm.customerName,
        petDetails: {
          petName: bookingForm.petName,
          petType: bookingForm.petType,
          age: bookingForm.age,
          breed: bookingForm.breed,
          specialNeeds: bookingForm.specialNeeds,
        },
        checkInDate: bookingForm.checkInDate,
        checkOutDate: bookingForm.checkOutDate,
        contactInfo: {
          phone: bookingForm.phone,
          emergencyContactName: bookingForm.emergencyContactName,
          emergencyContactPhone: bookingForm.emergencyContactPhone,
        },
        specialInstructions: bookingForm.specialInstructions,
      };

      const response = await fetch('http://localhost:4000/api/hostel-bookings/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Booking created successfully! Booking Number: ${data.data.bookingNumber}`);
        setIsBookingModalOpen(false);
        fetchBookings();
      } else {
        alert(data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus, currentStatus) => {
    // Status-specific confirmation messages
    const confirmationMessages = {
      'Confirmed': 'Are you sure you want to confirm this booking? The customer will receive a confirmation email.',
      'Checked-In': 'Are you sure you want to check in this user? The customer will be notified via email.',
      'Checked-Out': 'Are you sure you want to check out this user? The customer will receive a check-out confirmation email.',
      'Cancelled': 'Are you sure you want to cancel this booking? The customer will be notified of the cancellation.',
      'Pending': 'Are you sure you want to change this booking back to pending status?'
    };

    const confirmMessage = confirmationMessages[newStatus] || `Are you sure you want to change status to ${newStatus}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await fetch(`http://localhost:4000/api/hostel-bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Booking status updated to ${newStatus}! Confirmation email sent to customer.`);
        fetchBookings();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      const response = await fetch(`http://localhost:4000/api/hostel-bookings/${bookingId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Booking deleted successfully!');
        fetchBookings();
      } else {
        alert(data.message || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    }
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fff7f0] flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar
          subtitle="Hostel Bookings Management"
          title="Manage Bookings"
        />

        <main className="flex-1 p-4 lg:p-8 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Hostel Booking Records
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Manage customer bookings and reservations
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-full px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="all">All Bookings</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Checked-In">Checked-In</option>
                <option value="Checked-Out">Checked-Out</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button
                onClick={openBookingModal}
                className="inline-flex items-center gap-1 rounded-full bg-green-500 text-white text-xs font-semibold px-4 py-2 hover:bg-green-600 shadow-sm"
              >
                <span className="text-lg leading-none">+</span>
                <span>Add Booking</span>
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Booking #</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Room</th>
                    <th className="px-4 py-3 text-left">Pet</th>
                    <th className="px-4 py-3 text-left">Check-In</th>
                    <th className="px-4 py-3 text-left">Check-Out</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                        Loading bookings...
                      </td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                        No bookings found.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className="border-t border-slate-100 hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {booking.bookingNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-900">
                              {booking.user?.fullName || 'Walk-in'}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {booking.contactInfo?.phone}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {booking.room?.roomNumber || 'N/A'}
                          <span className="text-[10px] text-slate-500 block">
                            {booking.room?.roomType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {booking.petDetails?.petName}
                          <span className="text-[10px] text-slate-500 block">
                            {booking.petDetails?.petType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {new Date(booking.checkInDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {new Date(booking.checkOutDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              booking.status === "Confirmed"
                                ? "bg-emerald-50 text-emerald-600"
                                : booking.status === "Checked-In"
                                ? "bg-blue-50 text-blue-600"
                                : booking.status === "Checked-Out"
                                ? "bg-purple-50 text-purple-600"
                                : booking.status === "Cancelled"
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => viewBookingDetails(booking)}
                              className="px-3 py-1 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-100"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking._id)}
                              className="px-3 py-1 rounded-full border border-red-200 text-[11px] text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <h3 className="text-base font-semibold text-slate-900">
                Create Hostel Booking
              </h3>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="overflow-y-auto flex-1">
              <div className="p-5 space-y-4">
              {/* Customer Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wide border-b pb-1.5">
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={bookingForm.customerName}
                      onChange={(e) => setBookingForm({...bookingForm, customerName: e.target.value})}
                      placeholder="Full Name"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Customer Email *
                    </label>
                    <input
                      type="email"
                      value={bookingForm.customerEmail}
                      onChange={(e) => setBookingForm({...bookingForm, customerEmail: e.target.value})}
                      placeholder="email@example.com"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                      placeholder="Contact number"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Room *
                    </label>
                    <select
                      value={bookingForm.roomId}
                      onChange={(e) => setBookingForm({...bookingForm, roomId: e.target.value})}
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                      required
                    >
                      <option value="">Select Room</option>
                      {rooms.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.roomNumber} - {room.roomName} ({room.roomType}) - Rs {room.pricePerDay}/day
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pet Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wide border-b pb-1.5">
                  Pet Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Pet Name *
                    </label>
                    <input
                      type="text"
                      value={bookingForm.petName}
                      onChange={(e) => setBookingForm({...bookingForm, petName: e.target.value})}
                      placeholder="e.g., Max"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Pet Type *
                    </label>
                    <select
                      value={bookingForm.petType}
                      onChange={(e) => setBookingForm({...bookingForm, petType: e.target.value})}
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Age
                    </label>
                    <input
                      type="text"
                      value={bookingForm.age}
                      onChange={(e) => setBookingForm({...bookingForm, age: e.target.value})}
                      placeholder="e.g., 2 years"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Breed
                    </label>
                    <input
                      type="text"
                      value={bookingForm.breed}
                      onChange={(e) => setBookingForm({...bookingForm, breed: e.target.value})}
                      placeholder="e.g., Golden Retriever"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Special Needs
                    </label>
                    <input
                      type="text"
                      value={bookingForm.specialNeeds}
                      onChange={(e) => setBookingForm({...bookingForm, specialNeeds: e.target.value})}
                      placeholder="Allergies, medications, etc."
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                    />
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wide border-b pb-1.5">
                  Booking Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Check-In Date *
                    </label>
                    <input
                      type="date"
                      value={bookingForm.checkInDate}
                      onChange={(e) => setBookingForm({...bookingForm, checkInDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Check-Out Date *
                    </label>
                    <input
                      type="date"
                      value={bookingForm.checkOutDate}
                      onChange={(e) => setBookingForm({...bookingForm, checkOutDate: e.target.value})}
                      min={bookingForm.checkInDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wide border-b pb-1.5">
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      value={bookingForm.emergencyContactName}
                      onChange={(e) => setBookingForm({...bookingForm, emergencyContactName: e.target.value})}
                      placeholder="Alternative contact person"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={bookingForm.emergencyContactPhone}
                      onChange={(e) => setBookingForm({...bookingForm, emergencyContactPhone: e.target.value})}
                      placeholder="Alternative phone number"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                    />
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  value={bookingForm.specialInstructions}
                  onChange={(e) => setBookingForm({...bookingForm, specialInstructions: e.target.value})}
                  rows={2}
                  placeholder="Any additional information or requests..."
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 resize-none"
                />
              </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Details Modal - Enhanced UI */}
      {isDetailsModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 overflow-y-auto py-8">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">📋</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Booking Details
                  </h3>
                  <p className="text-sm text-white/80">
                    #{selectedBooking.bookingNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-white/80 hover:text-white text-3xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Booking Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-3">Booking Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-600">Booking Number:</span>
                      <p className="font-semibold text-slate-900">{selectedBooking.bookingNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Room:</span>
                      <p className="font-semibold text-slate-900">
                        {selectedBooking.room?.roomNumber} - {selectedBooking.room?.roomName}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-600">Check-In:</span>
                      <p className="font-semibold text-slate-900">
                        {new Date(selectedBooking.checkInDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-600">Check-Out:</span>
                      <p className="font-semibold text-slate-900">
                        {new Date(selectedBooking.checkOutDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-600">Total Amount:</span>
                      <p className="font-semibold text-green-600">Rs {selectedBooking.totalAmount}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-3">Pet Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-600">Pet Name:</span>
                      <p className="font-semibold text-slate-900">{selectedBooking.petDetails?.petName}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Pet Type:</span>
                      <p className="font-semibold text-slate-900">{selectedBooking.petDetails?.petType}</p>
                    </div>
                    {selectedBooking.petDetails?.breed && (
                      <div>
                        <span className="text-slate-600">Breed:</span>
                        <p className="font-semibold text-slate-900">{selectedBooking.petDetails.breed}</p>
                      </div>
                    )}
                    {selectedBooking.petDetails?.specialNeeds && (
                      <div>
                        <span className="text-slate-600">Special Needs:</span>
                        <p className="font-semibold text-slate-900">{selectedBooking.petDetails.specialNeeds}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="font-semibold text-slate-900 text-sm mb-3">Contact Information</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Phone:</span>
                    <p className="font-semibold text-slate-900">{selectedBooking.contactInfo?.phone}</p>
                  </div>
                  {selectedBooking.contactInfo?.emergencyContactPhone && (
                    <div>
                      <span className="text-slate-600">Emergency Contact:</span>
                      <p className="font-semibold text-slate-900">
                        {selectedBooking.contactInfo.emergencyContactName} - {selectedBooking.contactInfo.emergencyContactPhone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Instructions */}
              {selectedBooking.specialInstructions && (
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-2">Special Instructions</h4>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
                    {selectedBooking.specialInstructions}
                  </p>
                </div>
              )}

              {/* Status Actions */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 text-sm mb-3">
                  Update Booking Status
                  <span className="block text-xs text-slate-500 font-normal mt-1">
                    Customer will receive an email notification for each status change
                  </span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['Pending', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        handleStatusUpdate(selectedBooking._id, status, selectedBooking.status);
                        setIsDetailsModalOpen(false);
                      }}
                      disabled={selectedBooking.status === status}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                        selectedBooking.status === status
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                          : status === 'Checked-In'
                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                          : status === 'Checked-Out'
                          ? 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'
                          : status === 'Cancelled'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelBookingsManagement;

