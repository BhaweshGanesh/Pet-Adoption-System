// src/components/admin/AdminNavbar.jsx
import React from "react";
import { Link } from "react-router-dom";

const AdminNavbar = ({ subtitle, title }) => {
  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-slate-200 h-20">
      <div className="flex items-center justify-between px-6 lg:px-10 h-full">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">
            {subtitle || "Admin Panel – Pet Hostel"}
          </p>
          <h1 className="text-lg font-semibold text-slate-900">
            {title || "Hostel Management"}
          </h1>
        </div>

       
      </div>
    </nav>
  );
};

export default AdminNavbar;