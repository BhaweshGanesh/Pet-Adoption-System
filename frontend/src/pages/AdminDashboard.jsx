import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chart as ChartJS } from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import { API_ENDPOINTS } from "../config/api";

const AdminDashboard = () => {
  const [activeMenu] = useState("Dashboard");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [activities, setActivities] = useState({ bookings: [], orders: [], adoptions: [] });
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      // Fetch stats, revenue, and activities in parallel
      const [statsRes, revenueRes, activitiesRes] = await Promise.all([
        fetch(API_ENDPOINTS.DASHBOARD_STATS, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(API_ENDPOINTS.DASHBOARD_REVENUE, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_ENDPOINTS.DASHBOARD_ACTIVITIES}?limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
      ]);

      const statsData = await statsRes.json();
      const revenueDataRes = await revenueRes.json();
      const activitiesData = await activitiesRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (revenueDataRes.success) {
        setRevenueData(revenueDataRes.data);
      }

      if (activitiesData.success) {
        setActivities(activitiesData.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const occupancyPercent = useMemo(() => {
    if (!stats?.rooms) return 0;
    const { total, occupied } = stats.rooms;
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  }, [stats]);

  // chart.js setup using canvas + ref
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!revenueData || revenueData.length === 0) return;

    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) return;

    // destroy previous chart if exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: revenueData.map((m) => m.month),
        datasets: [
          {
            label: "Total Revenue",
            data: revenueData.map((m) => m.total),
            backgroundColor: "rgba(249, 115, 22, 0.8)", // orange-500
            borderRadius: 8,
            barThickness: 20,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `₹${ctx.raw.toLocaleString()}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#94a3b8", font: { size: 11 } },
          },
          y: {
            grid: { color: "rgba(148, 163, 184, 0.2)" },
            ticks: {
              color: "#94a3b8",
              font: { size: 11 },
              callback: (v) => `₹${(v / 1000).toFixed(0)}k`,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [revenueData]);

    // Loading state
    if (loading) {
      return (
        <div className="min-h-screen bg-[#fff7f0] flex">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <AdminNavbar subtitle="Admin Dashboard" title={activeMenu} />
            <main className="flex-1 p-4 lg:p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                <p className="mt-4 text-slate-600">Loading dashboard data...</p>
              </div>
            </main>
          </div>
        </div>
      );
    }

    // Error state
    if (error || !stats) {
      return (
        <div className="min-h-screen bg-[#fff7f0] flex">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <AdminNavbar subtitle="Admin Dashboard" title={activeMenu} />
            <main className="flex-1 p-4 lg:p-8 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error || 'Failed to load data'}</p>
                <button
                  onClick={fetchDashboardData}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Retry
                </button>
              </div>
            </main>
          </div>
        </div>
      );
    }

    return (
    <div className="min-h-screen bg-[#fff7f0] flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar
          subtitle="Admin Dashboard"
          title={activeMenu}
        />

                {/* Dashboard body */}
        <main className="flex-1 p-4 lg:p-8 space-y-4">
          {/* Stats cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Total Pets */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Total Pets
              </p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold text-slate-900">
                  {stats.pets.total}
                </p>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {stats.pets.available} available
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {stats.pets.adopted} adopted · {stats.pets.available} available
              </p>
            </div>

            {/* Hostel Rooms */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Hostel Rooms
              </p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold text-slate-900">
                  {stats.rooms.occupied}/{stats.rooms.total}
                </p>
                <span className="text-[11px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                  {occupancyPercent}% occupied
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-1">
                <div
                  className="h-full bg-sky-500"
                  style={{ width: `${occupancyPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {stats.rooms.available} available · {stats.rooms.occupied} occupied
              </p>
            </div>

            {/* Adoption Requests */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Bookings
              </p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold text-slate-900">
                  {stats.bookings.total}
                </p>
                <span className="text-[11px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  {stats.bookings.active} active
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {stats.bookings.recent} new this week
              </p>
            </div>

            {/* Orders / Revenue */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Orders & Revenue
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {stats.orders.total}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Total orders
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Revenue</p>
                  <p className="text-sm font-semibold text-emerald-600">
                    ₹{stats.orders.revenue.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-500">
                    {stats.orders.recent} recent
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Revenue chart + mini tables */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Revenue chart */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Monthly Revenue
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Hostel bookings & shop orders
                  </p>
                </div>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Live Data
                </span>
              </div>
              <div className="h-64 lg:h-72">
                <canvas ref={chartRef} />
              </div>
            </div>

            {/* Right column mini lists */}
            <div className="space-y-4">
              {/* System Overview */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  System Overview
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total Users</span>
                    <span className="font-semibold text-slate-900">{stats.users.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Active Staff</span>
                    <span className="font-semibold text-slate-900">{stats.staff.active}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total Products</span>
                    <span className="font-semibold text-slate-900">{stats.products.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Low Stock Items</span>
                    <span className="font-semibold text-orange-600">{stats.products.lowStock}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Pending Adoptions</span>
                    <span className="font-semibold text-orange-600">{stats.adoptions.pending}</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Recent Activity
                </h3>
                <div className="space-y-2 text-xs text-slate-600">
                  {activities.bookings.slice(0, 3).map((booking, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>
                        Booking {booking.bookingNumber} - {booking.status}
                      </span>
                    </div>
                  ))}
                  {activities.orders.slice(0, 2).map((order, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>
                        Order {order.orderNumber} - ₹{order.totalAmount}
                      </span>
                    </div>
                  ))}
                  {activities.bookings.length === 0 && activities.orders.length === 0 && (
                    <p className="text-slate-400 italic">No recent activity</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button 
                    className="px-3 py-1.5 rounded-full bg-orange-500 text-white hover:bg-orange-600"
                    onClick={() => navigate("/admin-pets-management")}
                  >
                    Manage Pets
                  </button>
                  <button 
                    className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
                    onClick={() => navigate("/admin-hostel-management")}
                  >
                    View Rooms
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
                    onClick={() => navigate("/admin-inventory-management")}
                  >
                    Manage Inventory
                  </button>
                  <button 
                    className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
                    onClick={() => navigate("/admin-staff-management")}
                  >
                    Manage Staff
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;