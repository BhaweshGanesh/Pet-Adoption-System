import React from "react";

const AddRoomModal = ({ isOpen, form, onChange, onImageChange, onClose, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-5 lg:p-6 my-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Add New Room
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
        >
          <div>
            <label className="block mb-1 text-slate-600 font-semibold">Room Number *</label>
            <input
              type="text"
              name="roomNumber"
              value={form.roomNumber}
              onChange={onChange}
              placeholder="e.g., H-101"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-600 font-semibold">Room Name *</label>
            <input
              type="text"
              name="roomName"
              value={form.roomName}
              onChange={onChange}
              placeholder="e.g., Deluxe Suite"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-600 font-semibold">Room Type</label>
            <select
              name="roomType"
              value={form.roomType}
              onChange={onChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
              <option value="Shared">Shared</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-slate-600 font-semibold">Pet Type</label>
            <select
              name="petType"
              value={form.petType}
              onChange={onChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="All">All Pets</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Rabbit">Rabbit</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-slate-600 font-semibold">Capacity *</label>
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={onChange}
              min="1"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-600 font-semibold">Price Per Day (Rs) *</label>
            <input
              type="number"
              name="pricePerDay"
              value={form.pricePerDay}
              onChange={onChange}
              min="0"
              step="1"
              placeholder="e.g., 500"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-600 font-semibold">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={onChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-slate-600 font-semibold">
              Room Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="block w-full text-[11px] text-slate-600 file:mr-2 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
            />
            <p className="text-[10px] text-slate-500 mt-1">Upload room photo</p>
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 text-slate-600 font-semibold">Facilities</label>
            <input
              type="text"
              name="facilities"
              value={form.facilities}
              onChange={onChange}
              placeholder="e.g., Air Conditioning, Play Area, Webcam (comma-separated)"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <p className="text-[10px] text-slate-500 mt-1">Separate multiple facilities with commas</p>
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 text-slate-600 font-semibold">Description</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={onChange}
              placeholder="Describe the room features..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full border-2 border-slate-200 text-xs text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 shadow-sm"
            >
              Add Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal;
