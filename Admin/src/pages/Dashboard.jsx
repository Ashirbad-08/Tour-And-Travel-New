import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiArrowUpRight,
  FiArrowDownRight,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiEdit,
  FiCheckSquare,
  FiCreditCard,
  FiXSquare,
  FiStar,
  FiPlus,
  FiUser,
  FiClock,
} from "react-icons/fi";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import {
  LineChart,
  PieChart,
  Pie,
  Cell,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import "../styles/Dashboard.css";
import api from "../utils/api";

/* ═══════════════════════════════════════════════
   HELPERS — calendar generation & seeded random
   ═══════════════════════════════════════════════ */
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];



function buildCalendarWeeks(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let week = new Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}



/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();

  /* ── Calendar state — starts on today ── */
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(now.getDate());
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topDests, setTopDests] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysisMode, setAnalysisMode] = useState("Month"); // Missing state

  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [messages, setMessages] = useState([]);
  const [travelPackages, setTravelPackages] = useState([]);
  const [calendarBookedDates, setCalendarBookedDates] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Fetch all dashboard data
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [ovRes, revRes, destRes, bookRes, actRes, tripsRes, pkgsRes, notifRes] = await Promise.all([
          api.get("/dashboard/overview"),
          api.get("/dashboard/revenue"),
          api.get("/dashboard/top-destinations"),
          api.get("/dashboard/recent-bookings"),
          api.get("/dashboard/recent-activity"),
          api.get("/dashboard/upcoming-trips"),
          api.get("/dashboard/travel-packages"),
          api.get("/notifications")
        ]);

        setOverview(ovRes.data?.data);
        setRevenue(revRes.data?.currentWeek?.days || []);
        setTopDests(destRes.data?.data || []);
        setRecentBookings(bookRes.data?.data || []);
        setRecentActivities(actRes.data?.data || []);
        setUpcomingTrips(tripsRes.data?.data || []);
        setTravelPackages(pkgsRes.data?.data || []);
        setMessages(notifRes.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  React.useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const res = await api.get("/dashboard/booking-calendar", {
          params: {
            year: calYear,
            month: calMonth + 1,
          },
        });

        setCalendarBookedDates(res.data?.bookedDates || []);
        setCalendarEvents(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch booking calendar:", err);
        setCalendarBookedDates([]);
        setCalendarEvents([]);
      }
    };

    fetchCalendarData();
  }, [calYear, calMonth]);

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calWeeks = useMemo(() => buildCalendarWeeks(calYear, calMonth), [calYear, calMonth]);

  React.useEffect(() => {
    if (selectedDate > daysInMonth) {
      setSelectedDate(daysInMonth);
    }
  }, [daysInMonth, selectedDate]);

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalYear(calYear - 1);
      setCalMonth(11);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalYear(calYear + 1);
      setCalMonth(0);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  /* ── Compute selected range ── */
  const selectedRange = useMemo(() => {
    if (analysisMode === "Day") {
      return { start: selectedDate, end: selectedDate };
    }
    if (analysisMode === "Week") {
      const dow = new Date(calYear, calMonth, selectedDate).getDay(); // 0=Sun
      const start = Math.max(1, selectedDate - dow);
      const end = Math.min(daysInMonth, selectedDate + (6 - dow));
      return { start, end };
    }
    // Month
    return { start: 1, end: daysInMonth };
  }, [analysisMode, selectedDate, calYear, calMonth, daysInMonth]);


  const stats = [
    {
      title: "Total Booking",
      value: overview?.totalBookings?.toLocaleString() || "0",
      change: "+12%",
      trend: "up",
      icon: <FiCalendar size={20} />, bg: "#EEF2FF", color: "#4F46E5",
    },
    {
      title: "Total Packages",
      value: overview?.totalPackages?.toLocaleString() || "0",
      change: "+5%",
      trend: "up",
      icon: <FiUsers size={20} />, bg: "#D1FAE5", color: "#10B981",
    },
    {
      title: "Total Earnings",
      value: `$${overview?.totalEarnings?.toLocaleString() || "0"}`,
      change: "+18%",
      trend: "up",
      icon: <FiDollarSign size={20} />, bg: "#FEF3C7", color: "#F59E0B",
    },
    {
      title: "Total Users",
      value: overview?.totalUsers?.toLocaleString() || "0",
      change: "+8%",
      trend: "up",
      icon: <FiUser size={20} />, bg: "#FCE7F3", color: "#EC4899",
    },
  ];

  /* ── Period label for stats row ── */
  const periodLabel = useMemo(() => {
    const mName = MONTH_NAMES[calMonth];
    if (analysisMode === "Day") return `${mName} ${selectedDate}, ${calYear}`;
    if (analysisMode === "Week") return `${mName} ${selectedRange.start}–${selectedRange.end}, ${calYear}`;
    return `${mName} ${calYear}`;
  }, [analysisMode, selectedDate, calMonth, calYear, selectedRange]);

  /* ── Revenue chart that responds to calendar ── */
  const maxRevenue = Math.max(...revenue.map(r => r.revenue), 100);
  const yMax = Math.ceil(maxRevenue / 200) * 200;
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round(yMax / 4 * i));

  /* ── Highlight dates in the selected range ── */
  const bookedDateSet = useMemo(() => new Set(calendarBookedDates), [calendarBookedDates]);
  const selectedDayEvents = useMemo(
    () => calendarEvents.filter((event) => event.day === selectedDate),
    [calendarEvents, selectedDate]
  );

  // ─── Destinations ───
  const destColors = ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#E0F2FE"];
  const destTotal = useMemo(() => topDests.reduce((sum, d) => sum + d.totalBookings, 0), [topDests]);
  const destinations = useMemo(() => topDests.map((d, i) => ({
    name: d._id || "Unknown",
    pct: destTotal > 0 ? Math.round((d.totalBookings / destTotal) * 100) : 0,
    people: `${d.totalBookings} Bookings`,
    color: destColors[i % destColors.length]
  })), [topDests, destTotal]);

  /* ── Recent Bookings ── */
  const tripBreakdown = useMemo(() => {
    const total = overview?.totalTrips || 0;
    const done = overview?.tripStats?.Done || 0;
    const booked = overview?.tripStats?.Booked || 0;
    const cancelled = overview?.tripStats?.cancelled || 0;
    return { total, done, booked, cancelled };
  }, [overview]);

  return (
    <div className="db-root">
      <div className="db-grid">
        {/* ═══════ LEFT + CENTER AREA ═══════ */}
        <div className="db-main">

          {/* ── STATS ROW ── */}
          <div className="db-stats-header">
            <div className="period-info">
              <span className="period-label"><FiCalendar size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {periodLabel}</span>
              <span className="period-mode">{analysisMode} view</span>
            </div>
            <div className="analysis-toggle">
              {["Day", "Week", "Month"].map(m => (
                <button
                  key={m}
                  className={`toggle-btn ${analysisMode === m ? "active" : ""}`}
                  onClick={() => setAnalysisMode(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="db-stats-row">
            {stats.map((s, i) => (
              <div key={i} className="db-stat-card">
                <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div className="stat-body">
                  <span className="stat-label">{s.title}</span>
                  <div className="stat-value-row">
                    <h3>{s.value}</h3>
                    <span className={`stat-badge ${s.trend}`}>
                      {s.trend === "up"
                        ? <FiArrowUpRight size={14} strokeWidth={2.5} />
                        : <FiArrowDownRight size={14} strokeWidth={2.5} />}
                      {s.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── REVENUE + DESTINATIONS ROW ── */}
          <div className="db-row-2">
            {/* Revenue */}
            <div className="db-card db-revenue">
              <div className="db-card-head">
                <h4>Revenue Overview</h4>
                <span className="db-badge-blue">
                  {analysisMode === "Day" ? "Hourly" : analysisMode === "Week" ? "Daily" : "Weekly"} ▾
                </span>
              </div>
              <div className="db-chart-wrap" style={{ height: 240 }}>
                <ResponsiveContainer>
                  <LineChart data={revenue} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2FF" />
                    <XAxis dataKey="day" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, yMax]} ticks={yTicks} tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 14px rgba(0,0,0,.08)" }} formatter={(v) => [`$${v}`, "Revenue"]} />
                    <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Destinations */}
            <div className="db-card db-destinations">
              <div className="db-card-head">
                <h4>Top Destinations</h4>
              </div>
              <div className="dest-wrap">
                <div className="dest-donut">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={destinations} dataKey="pct" innerRadius={60} outerRadius={85} paddingAngle={3}>
                        {destinations.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="dest-legend">
                  {destinations.map((d, i) => (
                    <div key={i} className="legend-row">
                      <span className="legend-dot" style={{ background: d.color }} />
                      <div>
                        <p className="legend-name">{d.name} ({d.pct}%)</p>
                        <span className="legend-sub">{d.people}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── TOTAL TRIPS + MESSAGES ROW ── */}
          <div className="db-row-3">
            <div className="db-card db-trips-summary">
              <div className="trips-top">
                <div>
                  <span className="trips-label">Total Trips</span>
                  <h3 className="trips-num">{tripBreakdown.total.toLocaleString()}</h3>
                </div>
              <div className="trips-bar">
                  <div className="bar-done" style={{ width: `${tripBreakdown.total > 0 ? Math.round((tripBreakdown.done / tripBreakdown.total) * 100) : 0}%` }} />
                  <div className="bar-booked" style={{ width: `${tripBreakdown.total > 0 ? Math.round((tripBreakdown.booked / tripBreakdown.total) * 100) : 0}%` }} />
                  <div className="bar-cancelled" style={{ width: `${tripBreakdown.total > 0 ? Math.round((tripBreakdown.cancelled / tripBreakdown.total) * 100) : 0}%` }} />
                </div>
                <div className="trips-legend">
                  <span><i className="dot done" /> Done <b>{tripBreakdown.done.toLocaleString()}</b></span>
                  <span><i className="dot booked" /> Booked <b>{tripBreakdown.booked.toLocaleString()}</b></span>
                  <span><i className="dot cancelled" /> Cancelled <b>{tripBreakdown.cancelled.toLocaleString()}</b></span>
                </div>
              </div>
            </div>

            <div className="db-card db-messages">
              <div className="db-card-head">
                <h4>Messages</h4>
                <span className="dots">•••</span>
              </div>
              <div className="msg-list">
                {messages.length === 0 ? (
                  <p style={{ color: "#6B7280", fontSize: 13, padding: "10px 0" }}>No new messages.</p>
                ) : messages.map((m, i) => (
                  <div key={i} className="msg-row">
                    <div className="msg-avatar">{(m.type || "S").charAt(0).toUpperCase()}</div>
                    <div className="msg-body">
                      <div className="msg-top">
                        <b style={{ textTransform: "capitalize" }}>{m.type || "System"} Notification</b>
                        <span className="msg-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p>{m.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── TRAVEL PACKAGES ── */}
          <div className="db-card db-packages-section">
            <div className="db-card-head">
              <h4>Travel Packages</h4>
              <div className="pkg-actions">
                <span className="sort-lbl">Sort by:</span>
                <select className="db-select-sm">
                  <option>Latest</option>
                  <option>Popular</option>
                </select>
                <button className="view-all-btn" onClick={() => navigate("/tour-packages")}>View All</button>
              </div>
            </div>
            <div className="pkg-grid">
              {travelPackages.length === 0 ? (
                <p style={{ gridColumn: "1 / -1", color: "#6B7280", textAlign: "center", padding: "20px 0" }}>No packages found.</p>
              ) : travelPackages.map((p, i) => (
                <div key={i} className="pkg-card">
                  <div className="pkg-img-wrap">
                    <img src={p.thumbnailImage || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&h=180&fit=crop"} alt={p.location} />
                    <span className="pkg-tag">{p.title}</span>
                  </div>
                  <h5>{p.location}</h5>
                  <span className="pkg-dur"><FiClock size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {p.durationDays} Days / {p.durationNights} Nights</span>
                  <div className="pkg-foot">
                    <div>
                      <b className="pkg-price">${p.price?.toLocaleString()}</b>
                      <span className="per-p">per person</span>
                    </div>
                    <button className="see-detail" onClick={() => navigate("/tour-packages")}>See Detail</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RECENT BOOKINGS ── */}
          <div className="db-card db-recent-bookings">
            <div className="db-card-head">
              <h4>Recent Bookings</h4>
              <div className="bk-actions">
                <div className="bk-search">
                  <FiSearch size={14} />
                  <input placeholder="Search anything" />
                </div>
                <button className="view-all-btn" onClick={() => navigate("/bookings")}>View All</button>
              </div>
            </div>
            <table className="bk-table">
              <thead>
                <tr>
                  <th>Name ↕</th>
                  <th>Package ↕</th>
                  <th>Duration ↕</th>
                  <th>Date ↕</th>
                  <th>Price ↕</th>
                  <th>Status ↕</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b, i) => (
                  <tr key={i}>
                    <td>{b.travelerName}</td>
                    <td>{b.packageName}</td>
                    <td>{b.duration}</td>
                    <td>{new Date(b.startDate).toLocaleDateString()}</td>
                    <td>${b.price?.toLocaleString()}</td>
                    <td><span className={`pill ${b.status?.toLowerCase()}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── FOOTER ── */}
          <footer className="db-footer">
            <p>Copyright © 2024 Peterdraw &nbsp; Privacy Policy &nbsp; Term and conditions &nbsp; Contact</p>
            <div className="footer-social">
              <FaFacebookF /> <FaTwitter /> <FaInstagram /> <FaYoutube />
            </div>
          </footer>
        </div>

        {/* ═══════ RIGHT SIDEBAR ═══════ */}
        <div className="db-right">
          {/* Calendar */}
          <div className="db-card db-calendar">
            <div className="cal-head">
              <span className="cal-title">{MONTH_NAMES[calMonth]} {calYear} <FiChevronDown size={14} /></span>
              <div className="cal-nav">
                <button onClick={prevMonth}><FiChevronLeft size={16} /></button>
                <button onClick={nextMonth}><FiChevronRight size={16} /></button>
              </div>
            </div>
            <div className="cal-grid">
              {DAY_LABELS.map(d => <div key={d} className="cal-dow">{d}</div>)}
              {calWeeks.flat().map((d, i) => (
                <div
                  key={i}
                  className={`cal-date ${!d ? "empty" : ""} ${d && bookedDateSet.has(d) ? "hl" : ""} ${d === selectedDate ? "today" : ""}`}
                  onClick={() => d && setSelectedDate(d)}
                >
                  {d || ""}
                </div>
              ))}
            </div>
            <div className="cal-selected-info">
              <FiCalendar size={13} />
              <span>Selected: <b>{MONTH_NAMES[calMonth]} {selectedDate}, {calYear}</b> ({selectedDayEvents.length} booking{selectedDayEvents.length !== 1 ? "s" : ""})</span>
            </div>
          </div>

          {/* Upcoming Trips */}
          <div className="db-card db-upcoming">
            <div className="db-card-head">
              <h4>Upcoming Trips</h4>
            </div>

            <div className="trip-list">
              {upcomingTrips.length === 0 ? (
                <p style={{ color: "#6B7280", fontSize: 13, padding: "10px 0" }}>No upcoming trips.</p>
              ) : upcomingTrips.map((t, i) => (
                <div
                  key={i}
                  className={`trip-item ${t.status === "confirmed" ? "active" : ""}`}
                  onClick={() => navigate("/bookings")}
                  style={{ cursor: "pointer" }}
                >
                  <img src={t.package?.thumbnailImage ? `http://localhost:5000${t.package.thumbnailImage}` : "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=120&h=80&fit=crop"} alt={t.package?.destination || "Destination"} />
                  <div className="trip-info">
                    <span className="trip-tag">{t.package?.title || "Package"}</span>
                    <h5>{t.package?.destination || "Unknown Location"}</h5>
                    <div className="trip-meta">
                      <span><FiUser size={13} style={{ marginRight: 2, verticalAlign: 'middle' }} /> {t.participants || 1}</span>
                      <span><FiCalendar size={13} style={{ marginRight: 2, verticalAlign: 'middle' }} /> {new Date(t.startDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="db-card db-activity">
            <div className="db-card-head">
              <h4>Recent Activity</h4>
              <span className="dots">•••</span>
            </div>
            <p className="act-day">Today</p>
            <div className="act-list">
              {recentActivities.map((a, i) => (
                <div key={i} className="act-row">
                  <div className="act-icon" style={{
                    background: a.type === 'booking' ? '#4F46E518' : a.type === 'cancelled' ? '#EF444418' : '#10B98118',
                    color: a.type === 'booking' ? '#4F46E5' : a.type === 'cancelled' ? '#EF4444' : '#10B981'
                  }}>
                    {a.type === 'booking' ? <FiPlus /> : a.type === 'cancelled' ? <FiXSquare /> : <FiCheckSquare />}
                  </div>
                  <div className="act-body">
                    <p>{a.message}</p>
                    <span className="act-time">{new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
