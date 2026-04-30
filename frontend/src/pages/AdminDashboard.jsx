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
  const [productSales, setProductSales] = useState([]);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(null);
  const [selectedMonthDetails, setSelectedMonthDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
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

      // Fetch stats, revenue, and product sales in parallel
      const [statsRes, revenueRes, productSalesRes] = await Promise.all([
        fetch(API_ENDPOINTS.DASHBOARD_STATS, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(API_ENDPOINTS.DASHBOARD_REVENUE, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_ENDPOINTS.ORDERS}/product-sales`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
      ]);

      const statsData = await statsRes.json();
      const revenueDataRes = await revenueRes.json();
      const productSalesData = await productSalesRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (revenueDataRes.success) {
        setRevenueData(revenueDataRes.data);
      }

      if (productSalesData.success) {
        setProductSales(productSalesData.data || []);
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
  const pieChartRef = useRef(null);
  const pieChartInstanceRef = useRef(null);
  const selectedYear = new Date().getFullYear();

  const fetchMonthDetails = async (monthIndex) => {
    try {
      setDetailsLoading(true);
      setDetailsError(null);
      const token = localStorage.getItem('token');
      const month = monthIndex + 1;
      const response = await fetch(
        `${API_ENDPOINTS.ORDERS}/revenue/${month}/${selectedYear}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSelectedMonthDetails(data.data);
      } else {
        setDetailsError(data.message || 'Failed to load monthly details');
      }
    } catch (e) {
      console.error('Error fetching month details:', e);
      setDetailsError('Failed to load monthly details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const clearMonthSelection = () => {
    setSelectedMonthIndex(null);
    setSelectedMonthDetails(null);
    setDetailsError(null);
  };

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
            backgroundColor: revenueData.map((_, idx) =>
              selectedMonthIndex === null
                ? "rgba(249, 115, 22, 0.8)"
                : selectedMonthIndex === idx
                ? "rgba(234, 88, 12, 0.95)"
                : "rgba(251, 146, 60, 0.35)"
            ),
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
        onClick: (_, elements) => {
          if (!elements || elements.length === 0) return;
          const barIndex = elements[0].index;

          if (selectedMonthIndex === barIndex) {
            clearMonthSelection();
            return;
          }

          setSelectedMonthIndex(barIndex);
          fetchMonthDetails(barIndex);
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
  }, [revenueData, selectedMonthIndex]);

  useEffect(() => {
    if (!pieChartRef.current) return;

    const ctx = pieChartRef.current.getContext("2d");
    if (!ctx) return;

    if (pieChartInstanceRef.current) {
      pieChartInstanceRef.current.destroy();
    }

    const topProducts = (productSales || []).slice(0, 8);
    if (topProducts.length === 0) return;

    const total = topProducts.reduce((sum, p) => sum + p.totalQuantitySold, 0);

    pieChartInstanceRef.current = new ChartJS(ctx, {
      type: "pie",
      data: {
        labels: topProducts.map((p) => p.productName),
        datasets: [
          {
            data: topProducts.map((p) => p.totalQuantitySold),
            backgroundColor: [
              "#f97316",
              "#fb923c",
              "#fdba74",
              "#f59e0b",
              "#10b981",
              "#3b82f6",
              "#8b5cf6",
              "#ef4444",
            ],
            borderWidth: 1,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              padding: 12,
              font: { size: 11 },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = Number(ctx.raw || 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
                return `${ctx.label}: ${value} sold (${percentage}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (pieChartInstanceRef.current) {
        pieChartInstanceRef.current.destroy();
      }
    };
  }, [productSales]);

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
                    Click a bar for successful/completed monthly breakdown
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Live Data
                  </span>
                  {selectedMonthIndex !== null && (
                    <button
                      type="button"
                      onClick={clearMonthSelection}
                      className="text-[11px] text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full hover:bg-slate-50"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </div>
              <div className="h-64 lg:h-72">
                <canvas ref={chartRef} />
              </div>
              {selectedMonthIndex !== null && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {revenueData[selectedMonthIndex]?.month} {selectedYear} revenue details
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Only successful/completed records are included (bookings must be paid).
                  </p>

                  {detailsLoading && (
                    <p className="text-xs text-slate-500 mt-3">Loading monthly details...</p>
                  )}

                  {detailsError && (
                    <p className="text-xs text-red-600 mt-3">{detailsError}</p>
                  )}

                  {!detailsLoading && !detailsError && selectedMonthDetails && (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="rounded-lg bg-emerald-50 px-3 py-2">
                          <p className="text-slate-500">Order Revenue</p>
                          <p className="font-semibold text-emerald-700">
                            ₹{selectedMonthDetails.orderRevenue.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-lg bg-sky-50 px-3 py-2">
                          <p className="text-slate-500">Booking Revenue</p>
                          <p className="font-semibold text-sky-700">
                            ₹{selectedMonthDetails.bookingRevenue.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-lg bg-orange-50 px-3 py-2">
                          <p className="text-slate-500">Total Revenue</p>
                          <p className="font-semibold text-orange-700">
                            ₹{selectedMonthDetails.totalRevenue.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 mb-2">
                          Successful Orders ({selectedMonthDetails.orders.length})
                        </h4>
                        {selectedMonthDetails.orders.length === 0 ? (
                          <p className="text-xs text-slate-500">No successful orders in this month.</p>
                        ) : (
                          <div className="overflow-x-auto border border-slate-100 rounded-lg">
                            <table className="min-w-full text-xs">
                              <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                  <th className="text-left px-3 py-2">Product</th>
                                  <th className="text-left px-3 py-2">Qty</th>
                                  <th className="text-left px-3 py-2">Price</th>
                                  <th className="text-left px-3 py-2">Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedMonthDetails.orders.map((item, idx) => (
                                  <tr key={`${item.orderId}-${idx}`} className="border-t border-slate-100">
                                    <td className="px-3 py-2">{item.productName}</td>
                                    <td className="px-3 py-2">{item.quantity}</td>
                                    <td className="px-3 py-2">₹{item.price}</td>
                                    <td className="px-3 py-2">
                                      {new Date(item.date).toLocaleDateString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 mb-2">
                          Successful Paid Bookings ({selectedMonthDetails.bookings.length})
                        </h4>
                        {selectedMonthDetails.bookings.length === 0 ? (
                          <p className="text-xs text-slate-500">
                            No successful paid bookings in this month.
                          </p>
                        ) : (
                          <div className="overflow-x-auto border border-slate-100 rounded-lg">
                            <table className="min-w-full text-xs">
                              <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                  <th className="text-left px-3 py-2">Room Name</th>
                                  <th className="text-left px-3 py-2">Room Number</th>
                                  <th className="text-left px-3 py-2">Amount</th>
                                  <th className="text-left px-3 py-2">Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedMonthDetails.bookings.map((booking) => (
                                  <tr key={booking.bookingId} className="border-t border-slate-100">
                                    <td className="px-3 py-2">{booking.roomName}</td>
                                    <td className="px-3 py-2">{booking.roomNumber || "-"}</td>
                                    <td className="px-3 py-2">₹{booking.amount}</td>
                                    <td className="px-3 py-2">
                                      {new Date(booking.date).toLocaleDateString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
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

              {/* Product Sales Pie */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Product Sales
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Best-selling products by quantity sold
                </p>
                {productSales.length === 0 ? (
                  <p className="text-xs text-slate-500">No successful product sales yet.</p>
                ) : (
                  <div className="h-72">
                    <canvas ref={pieChartRef} />
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;