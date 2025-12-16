import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chart as ChartJS } from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

// sample dynamic dashboard data
const DASHBOARD_DATA = {
  stats: {
    totalPets: 48,
    hostelRooms: { total: 30, occupied: 22 },
    adoptionRequests: 18,
    orders: 62,
    revenue: 42000,
  },
  revenueByMonth: [
    { month: "Jan", value: 2500 },
    { month: "Feb", value: 3800 },
    { month: "Mar", value: 3100 },
    { month: "Apr", value: 4500 },
    { month: "May", value: 5200 },
    { month: "Jun", value: 4800 },
    { month: "Jul", value: 6000 },
    { month: "Aug", value: 5500 },
    { month: "Sep", value: 4300 },
    { month: "Oct", value: 4900 },
    { month: "Nov", value: 5300 },
    { month: "Dec", value: 6400 },
  ],
};

const AdminDashboard = () => {
  const [activeMenu] = useState("Dashboard");
  const navigate = useNavigate();

  const { stats, revenueByMonth } = DASHBOARD_DATA;

  const occupancyPercent = useMemo(() => {
    const { total, occupied } = stats.hostelRooms;
    return Math.round((occupied / total) * 100);
  }, [stats.hostelRooms]);

  // chart.js setup using canvas + ref
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) return;

    // destroy previous chart if exists (Hot Reload / re-renders)
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: revenueByMonth.map((m) => m.month),
        datasets: [
          {
            label: "Monthly Revenue (USD)",
            data: revenueByMonth.map((m) => m.value),
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
              label: (ctx) => `$${ctx.raw.toLocaleString()}`,
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
              callback: (v) => `$${v / 1000}k`,
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
  }, [revenueByMonth]);

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
                  {stats.totalPets}
                </p>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  +5 this week
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Active in shelter / hostel
              </p>
            </div>

            {/* Hostel Rooms */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Hostel Rooms
              </p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold text-slate-900">
                  {stats.hostelRooms.occupied}/{stats.hostelRooms.total}
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
                Pet hotel utilization
              </p>
            </div>

            {/* Adoption Requests */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Adoption Requests
              </p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold text-slate-900">
                  {stats.adoptionRequests}
                </p>
                <span className="text-[11px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  3 pending review
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                New forms awaiting approval
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
                    {stats.orders}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Orders this month
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Revenue</p>
                  <p className="text-sm font-semibold text-emerald-600">
                    ${stats.revenue.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-500">
                    +12% vs last month
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
                    Pet hostel, adoptions & shop orders
                  </p>
                </div>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Demo Data
                </span>
              </div>
              <div className="h-64 lg:h-72">
                <canvas ref={chartRef} />
              </div>
            </div>

            {/* Right column mini lists */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Today&apos;s Overview
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li>• 2 new pets added to inventory</li>
                  <li>• 1 hostel room booking confirmed</li>
                  <li>• 3 new adoption requests received</li>
                  <li>• 5 product orders placed</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button className="px-3 py-1.5 rounded-full bg-orange-500 text-white hover:bg-orange-600">
                    Add New Pet
                  </button>
                  <button className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50">
                    View Hostel Rooms
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
                    onClick={() => navigate("/admin-inventory-management")}
                  >
                    Manage Inventory
                  </button>
                  <button className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50">
                    Review Requests
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