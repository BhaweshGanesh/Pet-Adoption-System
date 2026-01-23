// src/pages/HostelManagement.jsx
import React, { useMemo, useState, useEffect } from "react";

// all these files are in the same folder: src/pages
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import RoomTable from "./RoomTable";
import AddRoomModal from "./AddRoomModal";
import EditRoomModal from "./EditRoomModal";
import Calendar from "./Calendar";

const HostelManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [roomForm, setRoomForm] = useState({
    roomNumber: "",
    roomName: "",
    roomType: "Single",
    petType: "All",
    capacity: 1,
    pricePerDay: 0,
    facilities: [],
    status: "Available",
    description: "",
    image: "",
  });

  const [checkInRoom, setCheckInRoom] = useState(null);
  const [selectedPet, setSelectedPet] = useState("");

  const [calendarValue, setCalendarValue] = useState(new Date());
  const [bookingDateRange, setBookingDateRange] = useState(null);
  const [bookingModal, setBookingModal] = useState({
    open: false,
    date: null,
  });
  const [bookingForm, setBookingForm] = useState({
    roomNumber: "",
    petName: "",
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchRooms();
    fetchBookings();
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

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/hostel-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        // Convert bookings to calendar format
        const calendarBookings = data.data
          .filter(b => b.status !== 'Cancelled' && b.status !== 'Checked-Out')
          .map(b => ({
            id: b._id,
            roomNumber: b.room?.roomNumber || 'N/A',
            petName: b.petDetails?.petName || 'Unknown',
            startDate: new Date(b.checkInDate),
            endDate: new Date(b.checkOutDate),
          }));
        setBookings(calendarBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        if (statusFilter === "all") return true;
        return room.status === statusFilter;
      })
      .filter((room) => {
        if (!searchTerm.trim()) return true;
        return room.roomNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          room.roomName?.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [rooms, statusFilter, searchTerm]);

  const handleRoomFormChange = (e) => {
    const { name, value } = e.target;
    setRoomForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setRoomForm((prev) => ({ ...prev, image: previewUrl }));
  };

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        return data.url; // Backend returns 'url' not 'imageUrl'
      }
      throw new Error(data.message || 'Image upload failed');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error.message}`);
      return null;
    }
  };

  const openAddModal = () => {
    setRoomForm({
      roomNumber: "",
      roomName: "",
      roomType: "Single",
      petType: "All",
      capacity: 1,
      pricePerDay: 0,
      facilities: [],
      status: "Available",
      description: "",
      image: "",
    });
    setImageFile(null);
    setIsAddModalOpen(true);
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();

    if (!roomForm.roomNumber.trim() || !roomForm.roomName.trim()) {
      alert("Please enter Room Number and Room Name.");
      return;
    }

    if (!roomForm.pricePerDay || roomForm.pricePerDay <= 0) {
      alert("Please enter a valid price per day.");
      return;
    }

    try {
      let imageUrl = "";
      
      // Upload image if a new file was selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          alert('Failed to upload image. Please try again.');
          return;
        }
      }

      // Parse facilities from comma-separated string
      const facilitiesArray = roomForm.facilities
        ? (typeof roomForm.facilities === 'string' 
            ? roomForm.facilities.split(',').map(f => f.trim()).filter(f => f)
            : roomForm.facilities)
        : [];

      const roomData = {
        roomNumber: roomForm.roomNumber,
        roomName: roomForm.roomName,
        roomType: roomForm.roomType,
        petType: roomForm.petType,
        capacity: Number(roomForm.capacity) || 1,
        pricePerDay: Number(roomForm.pricePerDay),
        facilities: facilitiesArray,
        description: roomForm.description,
        image: imageUrl,
        status: roomForm.status,
      };

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/hostel-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Room added successfully!');
        setIsAddModalOpen(false);
        // Clear image file state
        setImageFile(null);
        // Reset form
        setRoomForm({
          roomNumber: "",
          roomName: "",
          roomType: "Single",
          petType: "All",
          capacity: 1,
          pricePerDay: 0,
          facilities: [],
          status: "Available",
          description: "",
          image: "",
        });
        await fetchRooms();
      } else {
        alert(data.message || 'Failed to add room');
      }
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Failed to add room');
    }
  };

  const openEditModal = (room) => {
    setEditRoom(room);
    setRoomForm({
      roomNumber: room.roomNumber,
      roomName: room.roomName || room.roomNumber,
      roomType: room.roomType,
      petType: room.petType || "All",
      capacity: room.capacity,
      pricePerDay: room.pricePerDay || 0,
      facilities: Array.isArray(room.facilities) ? room.facilities.join(', ') : (room.facilities || ''),
      status: room.status,
      description: room.description || "",
      image: room.image || "",
    });
    setImageFile(null);
  };

  const handleEditRoomSave = async (e) => {
    e.preventDefault();

    try {
      // Start with existing image URL from the room (not from form state which might have blob URL)
      let imageUrl = editRoom.image || "";
      
      // Upload new image if selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          alert('Failed to upload image. Please try again.');
          return;
        }
      }

      // Parse facilities from comma-separated string
      const facilitiesArray = roomForm.facilities
        ? (typeof roomForm.facilities === 'string' 
            ? roomForm.facilities.split(',').map(f => f.trim()).filter(f => f)
            : roomForm.facilities)
        : [];

      const roomData = {
        roomNumber: roomForm.roomNumber,
        roomName: roomForm.roomName,
        roomType: roomForm.roomType,
        petType: roomForm.petType,
        capacity: Number(roomForm.capacity) || 1,
        pricePerDay: Number(roomForm.pricePerDay),
        facilities: facilitiesArray,
        description: roomForm.description,
        image: imageUrl,
        status: roomForm.status,
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/hostel-rooms/${editRoom._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Room updated successfully!');
        setEditRoom(null);
        // Clear image file state
        setImageFile(null);
        await fetchRooms();
      } else {
        alert(data.message || 'Failed to update room');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Failed to update room');
    }
  };

  const confirmDeleteRoom = (room) => {
    setDeleteTarget(room);
  };

  const handleDeleteRoom = async () => {
    if (!deleteTarget) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/hostel-rooms/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert('Room deleted successfully!');
        setDeleteTarget(null);
        fetchRooms();
      } else {
        alert(data.message || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room');
    }
  };

  const openCheckInModal = (room) => {
    setCheckInRoom(room);
    setSelectedPet("");
  };

  const handleConfirmCheckIn = async () => {
    if (!checkInRoom || !selectedPet) {
      alert("Please enter pet name");
      return;
    }

    try {
      const roomData = {
        status: "Occupied",
        currentOccupant: {
          petName: selectedPet,
          checkIn: new Date(),
        }
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/hostel-rooms/${checkInRoom._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Pet "${selectedPet}" checked in successfully!`);
        setCheckInRoom(null);
        fetchRooms();
      } else {
        alert(data.message || 'Failed to check in');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Failed to check in');
    }
  };

  const handleCheckOut = async (room) => {
    const ok = window.confirm(
      `Check-out pet from Room ${room.roomNumber}?`
    );
    if (!ok) return;

    try {
      const roomData = {
        status: "Available",
        currentOccupant: {
          petName: "",
          checkIn: null,
          checkOut: null,
        }
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/hostel-rooms/${room._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Pet checked out successfully!');
        fetchRooms();
      } else {
        alert(data.message || 'Failed to check out');
      }
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Failed to check out');
    }
  };

  const handleCalendarChange = (value) => {
    setCalendarValue(value);
    setBookingDateRange(value);
  };

  const handleDateClick = (date) => {
    setBookingModal({ open: true, date });
    setBookingForm({
      roomNumber: "",
      petName: "",
    });
  };

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBooking = (e) => {
    e.preventDefault();

    if (!bookingForm.roomNumber || !bookingForm.petName) {
      alert("Please select room and enter pet name.");
      return;
    }

    const [start, end] = Array.isArray(bookingDateRange)
      ? bookingDateRange
      : [bookingDateRange, bookingDateRange];

    const newBooking = {
      id: bookings.length ? Math.max(...bookings.map((b) => b.id || 0)) + 1 : 1,
      roomNumber: bookingForm.roomNumber,
      petName: bookingForm.petName,
      startDate: start || bookingModal.date,
      endDate: end || bookingModal.date,
    };

    setBookings((prev) => [...prev, newBooking]);
    setBookingModal({ open: false, date: null });
    alert('Booking added to calendar view');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7f0] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
          <p className="text-slate-600">Loading hostel data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7f0] flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar
          subtitle="Admin Hostel Management"
          title="Hostel Management"
        />

        <main className="flex-1 p-4 lg:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Manage hostel rooms, check‑ins and bookings.
              </h2>
              <p className="text-xs text-slate-600 mt-1">{rooms.length} total rooms</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search by room number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-slate-200 rounded-full px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-full px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>

              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-1 rounded-full bg-orange-500 text-white text-xs font-semibold px-4 py-2 hover:bg-orange-600 shadow-sm"
              >
                <span className="text-lg leading-none">+</span>
                <span>Add Room</span>
              </button>
            </div>
          </div>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-4">
              <RoomTable
                rooms={filteredRooms}
                onEdit={openEditModal}
                onDelete={confirmDeleteRoom}
                onCheckIn={openCheckInModal}
                onCheckOut={handleCheckOut}
              />
            </div>

            <div className="space-y-4">
              <Calendar
                value={calendarValue}
                onChange={handleCalendarChange}
                bookings={bookings}
                onDateClick={handleDateClick}
              />
            </div>
          </section>
        </main>
      </div>

      <AddRoomModal
        isOpen={isAddModalOpen}
        form={roomForm}
        onChange={handleRoomFormChange}
        onImageChange={handleRoomImageChange}
        onClose={() => {
          setIsAddModalOpen(false);
          setImageFile(null);
          setRoomForm({
            roomNumber: "",
            roomName: "",
            roomType: "Single",
            petType: "All",
            capacity: 1,
            pricePerDay: 0,
            facilities: [],
            status: "Available",
            description: "",
            image: "",
          });
        }}
        onSubmit={handleAddRoom}
      />

      <EditRoomModal
        room={editRoom}
        form={roomForm}
        onChange={handleRoomFormChange}
        onImageChange={handleRoomImageChange}
        onClose={() => {
          setEditRoom(null);
          setImageFile(null);
        }}
        onSubmit={handleEditRoomSave}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Delete Room
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                Room {deleteTarget.roomNumber}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoom}
                className="px-4 py-1.5 rounded-full bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {checkInRoom && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Check‑In Pet – Room {checkInRoom.roomNumber}
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              Enter pet name to assign to this room.
            </p>
            <div className="space-y-3 text-xs">
              <input
                type="text"
                value={selectedPet}
                onChange={(e) => setSelectedPet(e.target.value)}
                placeholder="Enter pet name..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setCheckInRoom(null)}
                className="px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCheckIn}
                className="px-4 py-1.5 rounded-full bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600"
              >
                Check‑In
              </button>
            </div>
          </div>
        </div>
      )}

      {bookingModal.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Add Hostel Booking
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              Selected date range will be used as booking duration.
            </p>

            <form
              onSubmit={handleAddBooking}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block mb-1 text-slate-600">
                  Room Number
                </label>
                <select
                  name="roomNumber"
                  value={bookingForm.roomNumber}
                  onChange={handleBookingFormChange}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="">Select room</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r.roomNumber}>
                      {r.roomNumber} ({r.roomType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-slate-600">
                  Pet Name
                </label>
                <input
                  type="text"
                  name="petName"
                  value={bookingForm.petName}
                  onChange={handleBookingFormChange}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setBookingModal({ open: false, date: null })
                  }
                  className="px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600"
                >
                  Add Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal removed - moved to HostelBookingsManagement page */}
      {false && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 my-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Create Hostel Booking
              </h3>
              <button
                onClick={() => setIsAdminBookingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAdminBookingSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 text-sm border-b pb-2">
                  Customer Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={adminBookingForm.customerName}
                      onChange={(e) => setAdminBookingForm({...adminBookingForm, customerName: e.target.value})}
                      placeholder="Full Name"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Customer Email *
                    </label>
                    <input
                      type="email"
                      value={adminBookingForm.customerEmail}
                      onChange={(e) => setAdminBookingForm({...adminBookingForm, customerEmail: e.target.value})}
                      placeholder="email@example.com"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={adminBookingForm.phone}
                      onChange={(e) => setAdminBookingForm({...adminBookingForm, phone: e.target.value})}
                      placeholder="Contact number"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Room *
                    </label>
                    <select
                      value={adminBookingForm.roomId}
                      onChange={(e) => setAdminBookingForm({...adminBookingForm, roomId: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
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
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 text-sm border-b pb-2">
                  Pet Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Pet Name *
                    </label>
                    <input
                      type="text"
                      value={adminBookingForm.petName}
                      onChange={(e) => setAdminBookingForm({...adminBookingForm, petName: e.target.value})}
                      placeholder="e.g., Max"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Pet Type *
                    </label>
                    <select
                      value={adminBookingForm.petType}
                      onChange={(e) => setAdminBookingForm({...adminBookingForm, petType: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Age
                    </label>
                    <input
                      type="text"
                      value={adminBookingForm.age}
                      onChange={(e) => setAdminBookingForm({...adminBookingForm, age: e.target.value})}
                      placeholder="e.g., 2 years"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Breed
                    </label>
                    <input
                      type="text"
                      value={adminBookingForm.breed}
                      onChange={(e) => setAdminBookingForm({...adminBookingForm, breed: e.target.value})}
                      placeholder="e.g., Golden Retriever"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Special Needs
                    </label>
                    <input
                      type="text"
                      value={adminBookingForm.specialNeeds}
                      onChange={(e) => setAdminBookingForm({...adminBookingForm, specialNeeds: e.target.value})}
                      placeholder="Allergies, medications, etc."
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 text-sm border-b pb-2">
                  Booking Details
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Check-In Date *
                    </label>
                    <input
                      type="date"
                      value={adminBookingForm.checkInDate}
                      onChange={(e) => setAdminBookingForm({...adminBookingForm, checkInDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Check-Out Date *
                    </label>
                    <input
                      type="date"
                      value={adminBookingForm.checkOutDate}
                      onChange={(e) => setAdminBookingForm({...adminBookingForm, checkOutDate: e.target.value})}
                      min={adminBookingForm.checkInDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 text-sm border-b pb-2">
                  Emergency Contact
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      value={adminBookingForm.emergencyContactName}
                      onChange={(e) => setAdminBookingForm({...adminBookingForm, emergencyContactName: e.target.value})}
                      placeholder="Alternative contact person"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={adminBookingForm.emergencyContactPhone}
                      onChange={(e) => setAdminBookingForm({...adminBookingForm, emergencyContactPhone: e.target.value})}
                      placeholder="Alternative phone number"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={adminBookingForm.specialInstructions}
                  onChange={(e) => setAdminBookingForm({...adminBookingForm, specialInstructions: e.target.value})}
                  rows={3}
                  placeholder="Any additional information or requests..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAdminBookingModalOpen(false)}
                  className="px-6 py-2 rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-green-500 text-white text-sm font-semibold hover:bg-green-600"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelManagement;
