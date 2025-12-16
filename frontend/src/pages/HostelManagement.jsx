// src/pages/HostelManagement.jsx
import React, { useMemo, useState } from "react";

// all these files are in the same folder: src/pages
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import RoomTable from "./RoomTable";
import AddRoomModal from "./AddRoomModal";
import EditRoomModal from "./EditRoomModal";
import Calendar from "./Calendar";

const INITIAL_ROOMS = [
  {
    id: 1,
    roomNumber: "H-101",
    roomType: "Single",
    capacity: 1,
    status: "Available",
    description: "Cozy single room for small pets.",
    currentPet: "",
  },
  {
    id: 2,
    roomNumber: "H-102",
    roomType: "Deluxe",
    capacity: 2,
    status: "Occupied",
    description: "Deluxe suite with toys and bed.",
    currentPet: "Bruno",
  },
  {
    id: 3,
    roomNumber: "H-201",
    roomType: "Shared",
    capacity: 4,
    status: "Under Maintenance",
    description: "Shared room – currently under maintenance.",
    currentPet: "",
  },
];

const SAMPLE_PETS = [
  "Bruno",
  "Lussy",
  "Coco",
  "Kiwi",
];

const HostelManagement = () => {
  const [rooms, setRooms] = useState(INITIAL_ROOMS);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [roomForm, setRoomForm] = useState({
    roomNumber: "",
    roomType: "Single",
    capacity: 1,
    status: "Available",
    description: "",
    image: "",
  });

  const [checkInRoom, setCheckInRoom] = useState(null);
  const [selectedPet, setSelectedPet] = useState(SAMPLE_PETS[0] || "");

  const [calendarValue, setCalendarValue] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [bookingDateRange, setBookingDateRange] = useState(null);
  const [bookingModal, setBookingModal] = useState({
    open: false,
    date: null,
  });
  const [bookingForm, setBookingForm] = useState({
    roomNumber: "",
    petName: "",
  });

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
          .includes(searchTerm.toLowerCase());
      });
  }, [rooms, statusFilter, searchTerm]);

  const handleRoomFormChange = (e) => {
    const { name, value } = e.target;
    setRoomForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setRoomForm((prev) => ({ ...prev, image: previewUrl }));
  };

  const openAddModal = () => {
    setRoomForm({
      roomNumber: "",
      roomType: "Single",
      capacity: 1,
      status: "Available",
      description: "",
      image: "",
    });
    setIsAddModalOpen(true);
  };

  const handleAddRoom = (e) => {
    e.preventDefault();

    if (!roomForm.roomNumber.trim()) {
      alert("Please enter Room Number.");
      return;
    }

    const newRoom = {
      id: rooms.length ? Math.max(...rooms.map((r) => r.id)) + 1 : 1,
      ...roomForm,
      capacity: Number(roomForm.capacity) || 1,
      currentPet: "",
    };

    setRooms((prev) => [...prev, newRoom]);
    setIsAddModalOpen(false);
  };

  const openEditModal = (room) => {
    setEditRoom(room);
    setRoomForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      capacity: room.capacity,
      status: room.status,
      description: room.description,
      image: room.image || "",
    });
  };

  const handleEditRoomSave = (e) => {
    e.preventDefault();

    setRooms((prev) =>
      prev.map((r) =>
        r.id === editRoom.id
          ? {
              ...r,
              ...roomForm,
              capacity: Number(roomForm.capacity) || 1,
            }
          : r
      )
    );
    setEditRoom(null);
  };

  const confirmDeleteRoom = (room) => {
    setDeleteTarget(room);
  };

  const handleDeleteRoom = () => {
    if (!deleteTarget) return;
    setRooms((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const openCheckInModal = (room) => {
    setCheckInRoom(room);
    setSelectedPet(SAMPLE_PETS[0] || "");
  };

  const handleConfirmCheckIn = () => {
    if (!checkInRoom || !selectedPet) return;

    setRooms((prev) =>
      prev.map((r) =>
        r.id === checkInRoom.id
          ? {
              ...r,
              status: "Occupied",
              currentPet: selectedPet,
            }
          : r
      )
    );
    setCheckInRoom(null);
  };

  const handleCheckOut = (room) => {
    const ok = window.confirm(
      `Check‑out pet from Room ${room.roomNumber}?`
    );
    if (!ok) return;

    setRooms((prev) =>
      prev.map((r) =>
        r.id === room.id
          ? {
              ...r,
              status: "Available",
              currentPet: "",
            }
          : r
      )
    );
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
      alert("Please select room and pet.");
      return;
    }

    const [start, end] = Array.isArray(bookingDateRange)
      ? bookingDateRange
      : [bookingDateRange, bookingDateRange];

    const newBooking = {
      id: bookings.length ? Math.max(...bookings.map((b) => b.id)) + 1 : 1,
      roomNumber: bookingForm.roomNumber,
      petName: bookingForm.petName,
      startDate: start || bookingModal.date,
      endDate: end || bookingModal.date,
    };

    setBookings((prev) => [...prev, newBooking]);
    setBookingModal({ open: false, date: null });
  };

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
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddRoom}
      />

      <EditRoomModal
        room={editRoom}
        form={roomForm}
        onChange={handleRoomFormChange}
        onClose={() => setEditRoom(null)}
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
              Select a pet to assign to this room.
            </p>
            <div className="space-y-3 text-xs">
              <select
                value={selectedPet}
                onChange={(e) => setSelectedPet(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {SAMPLE_PETS.map((pet) => (
                  <option key={pet}>{pet}</option>
                ))}
              </select>
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
                    <option key={r.id} value={r.roomNumber}>
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
    </div>
  );
};

export default HostelManagement;