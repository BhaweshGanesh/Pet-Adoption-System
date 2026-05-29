import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { label: "Dashboard",       to: "/admin-dashboard" },
  { label: "Pets",            to: "/admin-pets-management" },
  { label: "Inventory",       to: "/admin-inventory-management" },
  { label: "Hostel Rooms",    to: "/admin-hostel-management" },
  { label: "Hostel Bookings", to: "/hostel-bookings" },
  { label: "Staff",           to: "/admin-staff-management" },
];

const NavItems = ({ location, onItemClick }) => (
  <ul className="space-y-1 px-3 text-sm">
    {items.map((item) => {
      const isActive = location.pathname === item.to;
      return (
        <li key={item.label}>
          <Link
            to={item.to}
            onClick={onItemClick}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
              isActive
                ? "bg-orange-500 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>{item.label}</span>
            {isActive && (
              <span className="text-[10px] uppercase tracking-wide">Active</span>
            )}
          </Link>
        </li>
      );
    })}
  </ul>
);

const AdminSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("admin-sidebar-toggle", handleToggle);
    return () => window.removeEventListener("admin-sidebar-toggle", handleToggle);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-slate-200 sticky top-0 h-screen shrink-0">
        <div className="h-20 flex items-center px-5 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              Pet<span className="text-orange-500">Adopt+</span>
            </p>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <NavItems location={location} onItemClick={undefined} />
        </nav>

        <div className="px-4 py-3 border-t border-slate-200 text-[11px] text-slate-400">
          © {new Date().getFullYear()} PetAdopt+
        </div>
      </aside>

      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-white border-r border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-200 shrink-0">
          <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              Pet<span className="text-orange-500">Adopt+</span>
            </p>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <NavItems location={location} onItemClick={() => setIsOpen(false)} />
        </nav>

        <div className="px-4 py-3 border-t border-slate-200 text-[11px] text-slate-400 shrink-0">
          © {new Date().getFullYear()} PetAdopt+
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
