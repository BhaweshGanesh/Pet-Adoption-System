// src/components/admin/AdminSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { label: "Dashboard", to: "/admin-dashboard" },
  { label: "Pets", to: "/admin-pets-management" },
  { label: "Inventory", to: "/admin-inventory-management" },
  { label: "Hostel Rooms", to: "/admin-hostel-management" },
  { label: "Hostel Bookings", to: "/hostel-bookings" },
  { label: "Staff", to: "/admin-staff-management" },
 
];

const AdminSidebar = () => {  
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-slate-200">
      <div className="h-20 flex items-center px-5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">
                Pet<span className="text-orange-500">Adopt+</span>
              </p>
            </div>
          </Link>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3 text-sm">
          {items.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="text-[10px] uppercase tracking-wide">
                      Active
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 py-3 border-t border-slate-200 text-[11px] text-slate-400">
        © {new Date().getFullYear()} PetAdopt+
      </div>
    </aside>
  );
};

export default AdminSidebar;