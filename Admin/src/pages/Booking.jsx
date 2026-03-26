import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/Booking.css";
import api from "../utils/api";
import { FiCalendar, FiEye, FiSearch, FiX } from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
);

const overviewOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      align: "start",
      labels: { usePointStyle: true, padding: 20, boxWidth: 8 },
    },
    tooltip: { backgroundColor: "#111827", padding: 10 },
  },
  interaction: { intersect: false, mode: "index" },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#64748b" } },
    y: { grid: { color: "rgba(15,23,42,0.08)" }, ticks: { color: "#64748b" } },
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#64748b" } },
    y: { beginAtZero: true, grid: { color: "rgba(15,23,42,0.08)" }, ticks: { color: "#64748b" } },
  },
};

const getVisiblePages = (current, total) => {
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  const pages = [];
  for (let i = start; i <= end; i += 1) pages.push(i);
  return pages;
};

const AdminBooking = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("All Time");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [chartFilter, setChartFilter] = useState("Last 12 Months");
  const rowsPerPage = 8;

  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalBookings: 0,
  });
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalParticipants: 0,
    totalEarnings: 0,
    topPackages: [],
    tripsOverview: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionModalBooking, setActionModalBooking] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(rowsPerPage),
        search,
        dateFilter,
        status: statusFilter,
        paymentStatus: paymentFilter,
      });
      const [bookingsRes, statsRes] = await Promise.all([
        api.get(`/bookings?${params.toString()}`),
        api.get("/bookings/stats"),
      ]);

      const bookingsPayload = bookingsRes.data || {};
      setBookings(bookingsPayload.data || []);
      setPagination({
        page: bookingsPayload.page || page,
        totalPages: bookingsPayload.totalPages || 1,
        totalBookings: bookingsPayload.totalBookings || 0,
      });
      setStats(statsRes.data || {});
    } catch (err) {
      console.error("Failed to fetch booking data:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, dateFilter, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openBookingDetails = async (id) => {
    setDetailsError("");
    setDetailsLoading(true);
    setSelectedBooking(null);
    try {
      const res = await api.get(`/bookings/details/${id}`);
      setSelectedBooking(res.data?.data || null);
    } catch (err) {
      setDetailsError(err.response?.data?.message || "Failed to load booking details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeBookingDetails = () => {
    setSelectedBooking(null);
    setDetailsError("");
    setDetailsLoading(false);
  };

  const runStatusAction = async (bookingId, status) => {
    setActionLoadingId(bookingId);
    try {
      await api.patch(`/bookings/status/${bookingId}`, { status });
      await fetchData();
      if (selectedBooking?._id === bookingId) {
        const detailsRes = await api.get(`/bookings/details/${bookingId}`);
        setSelectedBooking(detailsRes.data?.data || null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update booking status");
    } finally {
      setActionLoadingId(null);
      setActionModalBooking(null);
    }
  };

  const runPaymentAction = async (bookingId, paymentStatus) => {
    setActionLoadingId(bookingId);
    try {
      await api.patch(`/bookings/payment-status/${bookingId}`, { paymentStatus });
      await fetchData();
      if (selectedBooking?._id === bookingId) {
        const detailsRes = await api.get(`/bookings/details/${bookingId}`);
        setSelectedBooking(detailsRes.data?.data || null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update payment status");
    } finally {
      setActionLoadingId(null);
      setActionModalBooking(null);
    }
  };

  const runDeleteAction = async (bookingId) => {
    const ok = window.confirm("Delete this booking? This action cannot be undone.");
    if (!ok) return;

    setActionLoadingId(bookingId);
    try {
      await api.delete(`/bookings/${bookingId}`);
      await fetchData();
      if (selectedBooking?._id === bookingId) {
        closeBookingDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete booking");
    } finally {
      setActionLoadingId(null);
      setActionModalBooking(null);
    }
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

  const statusTotals = useMemo(() => {
    const summary = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    (stats.tripsOverview || []).forEach((item) => {
      const s = item?._id?.status;
      if (summary[s] !== undefined) summary[s] += Number(item?.count || 0);
    });
    return summary;
  }, [stats.tripsOverview]);

  const lineChart = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const series = {
      pending: Array(12).fill(0),
      confirmed: Array(12).fill(0),
      completed: Array(12).fill(0),
      cancelled: Array(12).fill(0),
    };

    (stats.tripsOverview || []).forEach((item) => {
      const month = item?._id?.month;
      const status = item?._id?.status;
      const count = Number(item?.count || 0);
      if (!month || month < 1 || month > 12 || !series[status]) return;
      series[status][month - 1] += count;
    });

    const monthsToShow = chartFilter === "Last 6 Months" ? 6 : chartFilter === "Last 30 Days" ? 1 : 12;
    const labels = monthNames.slice(-monthsToShow);

    return {
      labels,
      datasets: [
        {
          label: "Confirmed",
          data: series.confirmed.slice(-monthsToShow),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37,99,235,0.12)",
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
        },
        {
          label: "Completed",
          data: series.completed.slice(-monthsToShow),
          borderColor: "#16a34a",
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
        },
        {
          label: "Pending",
          data: series.pending.slice(-monthsToShow),
          borderColor: "#f59e0b",
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
        },
        {
          label: "Cancelled",
          data: series.cancelled.slice(-monthsToShow),
          borderColor: "#ef4444",
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
        },
      ],
    };
  }, [stats.tripsOverview, chartFilter]);

  const barChart = useMemo(() => {
    const top = (stats.topPackages || []).slice(0, 6);
    const labels = top.length ? top.map((p) => p.packageName || "Unknown") : ["No Data"];
    const values = top.length ? top.map((p) => Number(p.totalParticipants || 0)) : [0];
    return {
      labels,
      datasets: [
        {
          label: "Participants",
          data: values,
          backgroundColor: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"],
          borderRadius: 6,
        },
      ],
    };
  }, [stats.topPackages]);

  const totalPages = pagination.totalPages || 1;
  const showingFrom = bookings.length ? (page - 1) * rowsPerPage + 1 : 0;
  const showingTo = bookings.length ? (page - 1) * rowsPerPage + bookings.length : 0;
  const pages = getVisiblePages(page, totalPages);

  return (
    <div className="booking-panel">
      <div className="booking-panel-header">
        <h2>Booking Management</h2>
        <p>Live data from bookings API with backend pagination and filters.</p>
      </div>

      <div className="booking-metrics-grid">
        <div className="metric-card">
          <span>Total Bookings</span>
          <strong>{stats.totalBookings?.toLocaleString() || 0}</strong>
        </div>
        <div className="metric-card">
          <span>Total Participants</span>
          <strong>{stats.totalParticipants?.toLocaleString() || 0}</strong>
        </div>
        <div className="metric-card">
          <span>Confirmed Earnings</span>
          <strong>${stats.totalEarnings?.toLocaleString() || 0}</strong>
        </div>
        <div className="metric-card">
          <span>Pending / Cancelled</span>
          <strong>{statusTotals.pending} / {statusTotals.cancelled}</strong>
        </div>
      </div>

      <div className="booking-charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <h4>Trips Overview</h4>
            <select value={chartFilter} onChange={(e) => setChartFilter(e.target.value)}>
              <option>Last 12 Months</option>
              <option>Last 6 Months</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="chart-wrap">
            <Line data={lineChart} options={overviewOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h4>Top Packages</h4>
          </div>
          <div className="chart-wrap">
            <Bar data={barChart} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="booking-table-card">
        <div className="booking-toolbar">
          <div className="search-box">
            <FiSearch />
            <input
              placeholder="Search traveler, package, booking code"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="filters-row">
            <label>
              <FiCalendar />
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option>All Time</option>
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </label>

            <label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>

            <label>
              <select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </label>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Traveler</th>
                <th>Code</th>
                <th>Package</th>
                <th>Start</th>
                <th>Participants</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9">Loading bookings...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="9">No bookings found.</td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id}>
                    <td>{b.travelerName || "N/A"}</td>
                    <td>{b.bookingCode || "N/A"}</td>
                    <td>{b.package?.title || "N/A"}</td>
                    <td>{formatDate(b.startDate)}</td>
                    <td>{b.participants || 0}</td>
                    <td>${(b.finalPrice || b.price || 0).toLocaleString()}</td>
                    <td><span className={`status-chip ${b.status}`}>{b.status}</span></td>
                    <td><span className={`payment-chip ${b.paymentStatus}`}>{b.paymentStatus}</span></td>
                    <td>
                      <div className="bk-action-cell">
                        <button type="button" className="view-btn" onClick={() => openBookingDetails(b._id)}>
                          <FiEye /> View
                        </button>
                        <button
                          type="button"
                          className="bk-action-menu-btn"
                          disabled={actionLoadingId === b._id}
                          onClick={() => setActionModalBooking(b)}
                        >
                          Action
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-row">
          <div className="pagination-info">
            Showing <b>{showingFrom}-{showingTo}</b> of <b>{pagination.totalBookings}</b>
          </div>
          <div className="pagination-controls">
            <button className="nav-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            {pages.map((n) => (
              <button key={n} className={`page-btn ${page === n ? "active" : ""}`} onClick={() => setPage(n)}>
                {n}
              </button>
            ))}
            <button className="nav-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>

      {actionModalBooking && (
        <div className="action-modal-overlay" onClick={() => setActionModalBooking(null)}>
          <div className="action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="action-modal-head">
              <h4>Booking Actions</h4>
              <button type="button" onClick={() => setActionModalBooking(null)}>
                <FiX />
              </button>
            </div>
            <p className="action-modal-sub">
              {actionModalBooking.travelerName} ({actionModalBooking.bookingCode})
            </p>
            <div className="action-modal-grid">
              <button type="button" onClick={() => runStatusAction(actionModalBooking._id, "confirmed")}>
                Mark Confirmed
              </button>
              <button type="button" onClick={() => runStatusAction(actionModalBooking._id, "completed")}>
                Mark Completed
              </button>
              <button type="button" onClick={() => runStatusAction(actionModalBooking._id, "cancelled")}>
                Cancel Booking
              </button>
              <button type="button" onClick={() => runPaymentAction(actionModalBooking._id, "paid")}>
                Mark Paid
              </button>
              <button type="button" onClick={() => runPaymentAction(actionModalBooking._id, "refunded")}>
                Mark Refunded
              </button>
              <button type="button" className="danger-action" onClick={() => runDeleteAction(actionModalBooking._id)}>
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {(detailsLoading || detailsError || selectedBooking) && (
        <div className="details-overlay" onClick={closeBookingDetails}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="details-head">
              <h4>Booking Details</h4>
              <button type="button" onClick={closeBookingDetails}>
                <FiX />
              </button>
            </div>

            {detailsLoading && <p className="details-state">Loading booking details...</p>}
            {detailsError && !detailsLoading && <p className="details-state error">{detailsError}</p>}

            {!detailsLoading && !detailsError && selectedBooking && (
              <div className="details-grid">
                <div><span>Booking Code</span><strong>{selectedBooking.bookingCode || "N/A"}</strong></div>
                <div><span>Traveler</span><strong>{selectedBooking.travelerName || "N/A"}</strong></div>
                <div><span>Status</span><strong>{selectedBooking.status || "N/A"}</strong></div>
                <div><span>Payment</span><strong>{selectedBooking.paymentStatus || "N/A"}</strong></div>
                <div><span>Package</span><strong>{selectedBooking.package?.title || "N/A"}</strong></div>
                <div><span>Destination</span><strong>{selectedBooking.package?.destination || "N/A"}</strong></div>
                <div><span>Participants</span><strong>{selectedBooking.participants || 0}</strong></div>
                <div><span>Duration</span><strong>{selectedBooking.duration || "N/A"}</strong></div>
                <div><span>Start Date</span><strong>{formatDate(selectedBooking.startDate)}</strong></div>
                <div><span>End Date</span><strong>{formatDate(selectedBooking.endDate)}</strong></div>
                <div><span>Price</span><strong>${(selectedBooking.price || 0).toLocaleString()}</strong></div>
                <div><span>Final Price</span><strong>${(selectedBooking.finalPrice || selectedBooking.price || 0).toLocaleString()}</strong></div>
                <div><span>Email</span><strong>{selectedBooking.user?.email || "N/A"}</strong></div>
                <div><span>Phone</span><strong>{selectedBooking.user?.phone || "N/A"}</strong></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooking;
