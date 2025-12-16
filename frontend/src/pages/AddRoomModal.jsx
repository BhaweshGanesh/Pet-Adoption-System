// src/components/admin/hostel/AddRoomModal.jsx
import React from "react";

const AddRoomModal = ({ isOpen, form, onChange, onImageChange, onClose, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 lg:p-6">
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
          className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"
        >
          <div className="space-y-2">
            <div>
              <label className="block mb-1 text-slate-600">Room Number *</label>
              <input
                type="text"
                name="roomNumber"
                value={form.roomNumber}
                onChange={onChange}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-600">Room Type</label>
              <select
                name="roomType"
                value={form.roomType}
                onChange={onChange}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option>Single</option>
                <option>Deluxe</option>
                <option>Shared</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-slate-600">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={onChange}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-600">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option>Available</option>
                <option>Occupied</option>
                <option>Under Maintenance</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block mb-1 text-slate-600">Description</label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={onChange}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-600">
                Room Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="block w-full text-[11px] text-slate-600 file:mr-2 file:py-1.5 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
              />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-slate-200 text-xs text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600"
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