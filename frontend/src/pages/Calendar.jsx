// src/components/admin/hostel/Calendar.jsx
import React from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Calendar = ({
  value,
  onChange,
  bookings,
  onDateClick,
}) => {
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const hasBooking = bookings.some((b) => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return date >= start && date <= end;
    });

    if (!hasBooking) return null;

    return (
      <div className="mt-1 flex justify-center">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-2">
        Hostel Bookings Calendar
      </h3>
      <p className="text-[11px] text-slate-500 mb-3">
        Highlighted dates have check‑ins / check‑outs. Click a date to add
        a booking.
      </p>

      <ReactCalendar
        selectRange
        onChange={onChange}
        value={value}
        tileContent={tileContent}
        onClickDay={(date) => onDateClick(date)}
        className="rounded-xl border border-slate-100 text-xs"
      />
    </div>
  );
};

export default Calendar;