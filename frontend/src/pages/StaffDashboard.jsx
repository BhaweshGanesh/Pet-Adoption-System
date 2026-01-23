// src/pages/StaffDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import StaffNavbar from "../components/StaffNavbar";

const StaffDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <StaffNavbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
          <p className="text-lg text-gray-600">Welcome! Manage hostel rooms and bookings.</p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Rooms Card */}
          <Link 
            to="/staff-rooms"
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Hostel Rooms</h2>
                <p className="text-gray-600">View room details, availability, and status</p>
              </div>
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-3xl">🏠</span>
              </div>
            </div>
            <div className="flex items-center text-orange-500 font-medium mt-6">
              View Rooms
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Bookings Card */}
          <Link 
            to="/staff-bookings"
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Hostel Bookings</h2>
                <p className="text-gray-600">View bookings, check-in/check-out status, booking details</p>
              </div>
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
            </div>
            <div className="flex items-center text-orange-500 font-medium mt-6">
              View Bookings
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Staff Access Information</h3>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>You can view and manage hostel rooms</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>You can view and manage bookings</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>You can update booking statuses (Check-in/Check-out)</span>
            </div>
            <div className="flex items-start text-gray-500">
              <span className="mr-3">✗</span>
              <span>Admin features, payments, and reports are restricted</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
