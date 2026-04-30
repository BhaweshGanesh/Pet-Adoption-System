// src/pages/StaffRooms.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StaffNavbar from "../components/StaffNavbar";

const StaffRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/hostel-rooms');
      const data = await response.json();

      if (data.success) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      alert('Failed to fetch rooms');  
    } finally {
      setLoading(false);       
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    const matchesSearch = 
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Occupied': return 'bg-red-100 text-red-800';
      case 'Under Maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <StaffNavbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Hostel Rooms</h1>
          <p className="text-lg text-gray-600">View room details, availability, and status</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Rooms</label>
              <input
                type="text"
                placeholder="Search by room number or name..."
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
                <option value="all">All Rooms</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pet Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price/Day
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
                {filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => (
                    <tr key={room._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {room.roomNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {room.roomName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {room.roomType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {room.petType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {room.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        ₹{room.pricePerDay}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(room.status)}`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedRoom(room)}
                          className="text-orange-600 hover:text-orange-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No rooms found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Room Details Modal */}
      {selectedRoom && (
        <div
          className="fixed left-1/2 top-16 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
        >
          <div className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Room Details</h3>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Room Image */}
              {selectedRoom.image && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={selectedRoom.image}
                    alt={selectedRoom.roomName}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Room Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Room Number</p>
                  <p className="font-medium text-gray-900">{selectedRoom.roomNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Room Name</p>
                  <p className="font-medium text-gray-900">{selectedRoom.roomName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium text-gray-900">{selectedRoom.roomType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pet Type</p>
                  <p className="font-medium text-gray-900">{selectedRoom.petType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="font-medium text-gray-900">{selectedRoom.capacity} pet(s)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price per Day</p>
                  <p className="font-medium text-gray-900">₹{selectedRoom.pricePerDay}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRoom.status)}`}>
                    {selectedRoom.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              {selectedRoom.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-700">{selectedRoom.description}</p>
                </div>
              )}

              {/* Facilities */}
              {selectedRoom.facilities && selectedRoom.facilities.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Facilities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Occupant */}
              {selectedRoom.status === 'Occupied' && selectedRoom.currentOccupant && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-2">Current Occupant</p>
                  {selectedRoom.currentOccupant.petName && (
                    <p className="text-blue-900">{selectedRoom.currentOccupant.petName}</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
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

export default StaffRooms;
