// src/components/admin/hostel/RoomTable.jsx
import React from "react";

const RoomTable = ({
  rooms,
  onEdit,
  onDelete,
  onCheckIn,
  onCheckOut,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Room No.</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Capacity</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Pet Staying</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  No rooms found for selected filters.
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr
                  key={room.id}
                  className="border-t border-slate-100 hover:bg-slate-50/60"
                >
                  <td className="px-4 py-3 text-slate-700">
                    {room.roomNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {room.roomType}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {room.capacity}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        room.status === "Available"
                          ? "bg-emerald-50 text-emerald-600"
                          : room.status === "Occupied"
                          ? "bg-sky-50 text-sky-600"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {room.currentPet || "-"}
                  </td>
                 <td className="px-4 py-3 text-right">
  <div className="inline-flex flex-nowrap items-center gap-1.5">
    <button
      onClick={() => onEdit(room)}
      className="px-3 py-1 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-100"
    >
      Edit
    </button>
    <button
      onClick={() => onDelete(room)}
      className="px-3 py-1 rounded-full border border-red-200 text-[11px] text-red-600 hover:bg-red-50"
    >
      Delete
    </button>
    {room.status !== "Occupied" ? (
      <button
        onClick={() => onCheckIn(room)}
        className="px-3 py-1 rounded-full border border-emerald-200 text-[11px] text-emerald-600 hover:bg-emerald-50"
      >
        Check‑In
      </button>
    ) : (
      <button
        onClick={() => onCheckOut(room)}
        className="px-3 py-1 rounded-full border border-sky-200 text-[11px] text-sky-700 hover:bg-sky-50"
      >
        Check‑Out
      </button>
    )}
  </div>
</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomTable;