import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffNavbar from "../components/StaffNavbar";

const StaffBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    message: '',
    details: ''
  });

  const showNotification = (type, message, details = '') => {
    setNotification({
      show: true,
      type,
      message,
      details
    });
  };

  const closeNotification = () => {
    setNotification({
      ...notification,
      show: false
    });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:4000/api/hostel-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setBookings(data.data || []);
      } else {
        if (response.status === 403 || response.status === 401) {
          showNotification('error', 'Access denied', 'Staff privileges required');
          setTimeout(() => {
            localStorage.clear();
            navigate('/login');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showNotification('error', 'Failed to fetch bookings', 'Please try again later');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking || !newStatus) return;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:4000/api/hostel-bookings/${selectedBooking._id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      const data = await response.json();

      if (data.success) {
        showNotification('success', `Booking status updated to "${newStatus}"`, 'Email notification sent to customer!');
        setIsStatusModalOpen(false);
        setSelectedBooking(null);
        setNewStatus("");
        fetchBookings();
      } else {
        if (response.status === 403 || response.status === 401) {
          showNotification('error', 'Access denied', 'Staff privileges required');
          setTimeout(() => {
            localStorage.clear();
            navigate('/login');
          }, 2000);
        } else {
          showNotification('error', data.message || 'Failed to update booking status', 'Please try again');
        }
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      showNotification('error', 'Failed to update booking status', 'Please try again later');
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesSearch =
      booking.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.petDetails?.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Checked-In': return 'bg-green-100 text-green-800';
      case 'Checked-Out': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffNavbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Hostel Bookings</h1>
          <p className="text-lg text-gray-600">View and manage booking check-ins and check-outs</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Bookings</label>
              <input
                type="text"
                placeholder="Search by booking #, pet name, room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Bookings</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Checked-In">Checked-In</option>
                <option value="Checked-Out">Checked-Out</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pet Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-In
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-Out
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.bookingNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.petDetails?.petName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {booking.room?.roomNumber} - {booking.room?.roomName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(booking.checkInDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(booking.checkOutDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-blue-600 hover:text-blue-900 font-medium mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setNewStatus(booking.status);
                            setIsStatusModalOpen(true);
                          }}
                          className="text-orange-600 hover:text-orange-900 font-medium"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No bookings found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selectedBooking && !isStatusModalOpen && (
        <div className="fixed left-1/2 top-16 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-300 shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Booking Number</p>
                  <p className="font-medium text-gray-900">{selectedBooking.bookingNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pet Name</p>
                  <p className="font-medium text-gray-900">{selectedBooking.petDetails?.petName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pet Type</p>
                  <p className="font-medium text-gray-900">{selectedBooking.petDetails?.petType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Room</p>
                  <p className="font-medium text-gray-900">{selectedBooking.room?.roomNumber} - {selectedBooking.room?.roomName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium text-gray-900">₹{selectedBooking.totalAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-In Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedBooking.checkInDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-Out Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedBooking.checkOutDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Number of Days</p>
                  <p className="font-medium text-gray-900">{selectedBooking.numberOfDays} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium text-gray-900">{selectedBooking.user?.fullName || 'Walk-in'}</p>
                </div>
              </div>

              {selectedBooking.specialInstructions && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Special Instructions</p>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedBooking.specialInstructions}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isStatusModalOpen && selectedBooking && (
        <div className="fixed left-1/2 top-20 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-gray-300 shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Update Booking Status</h3>
              <p className="text-sm text-gray-600 mt-1">Booking #{selectedBooking.bookingNumber}</p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Checked-In">Checked-In</option>
                <option value="Checked-Out">Checked-Out</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Current:</strong> {selectedBooking.status}
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>New:</strong> {newStatus}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsStatusModalOpen(false);
                  setSelectedBooking(null);
                  setNewStatus("");
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {notification.show && (
        <div className="fixed left-1/2 top-24 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {notification.message}
              </h3>

              {notification.details && (
                <div className="flex items-start gap-2 mb-6">
                  {notification.type === 'success' && (
                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {notification.type === 'error' && (
                    <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  {notification.type === 'info' && (
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  <p className="text-base text-gray-700 whitespace-pre-line flex-1">
                    {notification.details}
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 mb-4"></div>

              <button
                onClick={closeNotification}
                className="w-full text-center py-3 text-blue-600 font-semibold text-lg hover:bg-gray-50 rounded-lg transition-colors"
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

export default StaffBookings;
