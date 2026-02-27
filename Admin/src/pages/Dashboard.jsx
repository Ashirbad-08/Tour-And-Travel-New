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

/* ═══════════════════════════════════════════════
   HELPERS — calendar generation & seeded random
   ═══════════════════════════════════════════════ */
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Deterministic pseudo-random from a seed so same date always gives same numbers
function seededRand(seed) {
  let h = seed | 0;
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

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

/* Generate consistent daily metrics from a date seed */
function metricsForDay(y, m, d) {
  const seed = y * 10000 + (m + 1) * 100 + d;
  const rng = seededRand(seed);
  return {
    bookings: Math.round(20 + rng() * 80),       // 20–100
    customers: Math.round(10 + rng() * 50),       // 10–60
    earnings: Math.round(300 + rng() * 1200),     // 300–1500
  };
}

function sumMetrics(year, month, startDay, endDay) {
  let bookings = 0, customers = 0, earnings = 0;
  for (let d = startDay; d <= endDay; d++) {
    const m = metricsForDay(year, month, d);
    bookings += m.bookings;
    customers += m.customers;
    earnings += m.earnings;
  }
  return { bookings, customers, earnings };
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
  const [analysisMode, setAnalysisMode] = useState("Day"); // Day | Week | Month

  const calWeeks = useMemo(() => buildCalendarWeeks(calYear, calMonth), [calYear, calMonth]);
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
    setSelectedDate(1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
    setSelectedDate(1);
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

  /* ── Dynamic stats ── */
  const periodMetrics = useMemo(
    () => sumMetrics(calYear, calMonth, selectedRange.start, selectedRange.end),
    [calYear, calMonth, selectedRange]
  );

  // Previous period for comparison
  const prevPeriodMetrics = useMemo(() => {
    const span = selectedRange.end - selectedRange.start + 1;
    const prevEnd = Math.max(1, selectedRange.start - 1);
    const prevStart = Math.max(1, prevEnd - span + 1);
    return sumMetrics(calYear, calMonth, prevStart, prevEnd);
  }, [calYear, calMonth, selectedRange]);

  const pctChange = (cur, prev) => {
    if (prev === 0) return "+0.00%";
    const pct = ((cur - prev) / prev * 100).toFixed(2);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  };

  const stats = [
    {
      title: "Total Booking",
      value: periodMetrics.bookings.toLocaleString(),
      change: pctChange(periodMetrics.bookings, prevPeriodMetrics.bookings),
      trend: periodMetrics.bookings >= prevPeriodMetrics.bookings ? "up" : "down",
      icon: <FiCalendar size={20} />, bg: "#EEF2FF", color: "#4F46E5",
    },
    {
      title: "Total New Customers",
      value: periodMetrics.customers.toLocaleString(),
      change: pctChange(periodMetrics.customers, prevPeriodMetrics.customers),
      trend: periodMetrics.customers >= prevPeriodMetrics.customers ? "up" : "down",
      icon: <FiUsers size={20} />, bg: "#D1FAE5", color: "#10B981",
    },
    {
      title: "Total Earnings",
      value: `$${periodMetrics.earnings.toLocaleString()}`,
      change: pctChange(periodMetrics.earnings, prevPeriodMetrics.earnings),
      trend: periodMetrics.earnings >= prevPeriodMetrics.earnings ? "up" : "down",
      icon: <FiDollarSign size={20} />, bg: "#FEF3C7", color: "#F59E0B",
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
  const revenueData = useMemo(() => {
    if (analysisMode === "Day") {
      // Show hourly breakdown (8 AM – 6 PM)
      const seed = calYear * 10000 + (calMonth + 1) * 100 + selectedDate;
      const rng = seededRand(seed + 999);
      return ["8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM"].map(h => ({
        day: h, revenue: Math.round(40 + rng() * 160),
      }));
    }
    if (analysisMode === "Week") {
      const days = [];
      for (let d = selectedRange.start; d <= selectedRange.end; d++) {
        const m = metricsForDay(calYear, calMonth, d);
        days.push({ day: `${d}`, revenue: m.earnings });
      }
      return days;
    }
    // Month — show weekly totals
    const weekLabels = ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5"];
    const result = [];
    let wk = 0;
    for (let d = 1; d <= daysInMonth; d += 7) {
      const end = Math.min(d + 6, daysInMonth);
      const s = sumMetrics(calYear, calMonth, d, end);
      result.push({ day: weekLabels[wk] || `Wk ${wk + 1}`, revenue: s.earnings });
      wk++;
    }
    return result;
  }, [analysisMode, selectedDate, calYear, calMonth, selectedRange, daysInMonth]);

  const maxRevenue = Math.max(...revenueData.map(r => r.revenue), 100);
  const yMax = Math.ceil(maxRevenue / 200) * 200;
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round(yMax / 4 * i));

  /* ── Highlight dates in the selected range ── */
  const highlightedDates = useMemo(() => {
    const set = new Set();
    for (let d = selectedRange.start; d <= selectedRange.end; d++) set.add(d);
    return set;
  }, [selectedRange]);

  // ─── Destinations (unchanged) ───
  const [selectedDestMonth, setSelectedDestMonth] = useState("This Month");
  const destinationsMap = {
    "This Month": [
      { name: "Tokyo, Japan", pct: 35, people: "2,458 Participants", color: "#3B82F6" },
      { name: "Sydney, Australia", pct: 28, people: "2,458 Participants", color: "#60A5FA" },
      { name: "Paris, France", pct: 22, people: "2,458 Participants", color: "#93C5FD" },
      { name: "Venice, Italy", pct: 15, people: "2,458 Participants", color: "#BFDBFE" },
    ],
    "Last Month": [
      { name: "Paris, France", pct: 40, people: "3,100 Participants", color: "#3B82F6" },
      { name: "Tokyo, Japan", pct: 25, people: "2,000 Participants", color: "#60A5FA" },
      { name: "Rome, Italy", pct: 20, people: "1,800 Participants", color: "#93C5FD" },
      { name: "Dubai, UAE", pct: 15, people: "1,200 Participants", color: "#BFDBFE" },
    ],
  };
  const destinations = destinationsMap[selectedDestMonth];

  /* ── Upcoming Trips ── */
  const [upcomingTrips, setUpcomingTrips] = useState([
    { tag: "Romantic Getaway", loc: "Paris, France", date: "5 - 10 July", users: "+9", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=120&h=80&fit=crop" },
    { tag: "Cultural Exploration", loc: "Tokyo, Japan", date: "12 - 19 July", users: "+17", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=120&h=80&fit=crop", active: true },
    { tag: "Adventure Tour", loc: "Sydney, Australia", date: "15 - 24 July", users: "+12", img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=120&h=80&fit=crop" },
    { tag: "City Highlights", loc: "New York, USA", date: "20 - 25 July", users: "+22", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=120&h=80&fit=crop" },
  ]);
  const [showTripForm, setShowTripForm] = useState(false);
  const [tripForm, setTripForm] = useState({ tag: "", loc: "", date: "", users: "" });

  const handleAddTrip = () => {
    if (!tripForm.tag || !tripForm.loc) { alert("Please fill in Trip Name and Location"); return; }
    const newTrip = {
      tag: tripForm.tag,
      loc: tripForm.loc,
      date: tripForm.date || "TBD",
      users: tripForm.users || "+0",
      img: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=120&h=80&fit=crop",
      active: false,
    };
    setUpcomingTrips([newTrip, ...upcomingTrips]);
    setTripForm({ tag: "", loc: "", date: "", users: "" });
    setShowTripForm(false);
  };

  /* ── Messages ── */
  const messages = [
    { name: "Europia Hotel", preview: "We are pleased to announc...", time: "9:00 AM" },
    { name: "Global Travel Co", preview: "We have updated our comm...", time: "2:30 PM" },
    { name: "Kalendra Umbara", preview: "Hi, I need assistance with c...", time: "9:45 AM" },
    { name: "Osman Farooq", preview: "Hello, I had an amazing tim...", time: "10:15 AM" },
    { name: "Mellinda Jenkins", preview: "Can you provide more deta...", time: "1:20 PM" },
    { name: "David Hernandez", preview: "I would like to upgrade my...", time: "10:00 AM" },
    { name: "Alexandra Green", preview: "Our company is interested i...", time: "3:45 PM" },
  ];

  /* ── Travel Packages ── */
  const travelPackages = [
    { title: "Cultural Exploration", dest: "Seoul, South Korea", dur: "10 Days / 9 Nights", price: "$2,100", img: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?w=300&h=180&fit=crop" },
    { title: "Venice Dreams", dest: "Venice, Italy", dur: "6 Days / 5 Nights", price: "$1,500", img: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=300&h=180&fit=crop" },
    { title: "Safari Adventure", dest: "Serengeti, Tanzania", dur: "8 Days / 7 Nights", price: "$3,200", img: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=300&h=180&fit=crop" },
  ];

  /* ── Recent Bookings ── */
  const bookings = [
    { name: "Camellia Swan", pkg: "Venice Dreams", dur: "6D5N", date: "Jun 25 - Jun 30", price: "$1,500", status: "Confirmed" },
    { name: "Raphael Goodman", pkg: "Safari Adventure", dur: "8D7N", date: "Jun 25 - Jul 2", price: "$3,200", status: "Pending" },
    { name: "Ludwig Contessa", pkg: "Alpine Escape", dur: "7D6N", date: "Jun 26 - Jul 2", price: "$2,100", status: "Confirmed" },
    { name: "Armina Raul Meyes", pkg: "Caribbean Cruise", dur: "10D9N", date: "Jun 26 - Jul 5", price: "$2,800", status: "Cancelled" },
    { name: "James Dunn", pkg: "Parisian Romance", dur: "5D4N", date: "Jun 26 - Jun 30", price: "$1,200", status: "Confirmed" },
  ];

  /* ── Recent Activity ── */
  const activities = [
    { icon: <FiEdit />, color: "#4F46E5", text: "Alberto Cortez updated his profile and added a new payment method.", time: "9:30 AM" },
    { icon: <FiCheckSquare />, color: "#10B981", text: "Camellia Swan booked the Venice Dreams package for June 25, 2024.", time: "10:00 AM" },
    { icon: <FiCreditCard />, color: "#F59E0B", text: "Payment was processed for Ludwig Contessa's Alpine Escape package.", time: "9:15 AM" },
    { icon: <FiXSquare />, color: "#EF4444", text: "Armina Raul Meyes canceled her Caribbean Cruise package.", time: "12:45 PM" },
    { icon: <FiStar />, color: "#8B5CF6", text: "Lydia Billings submitted a review for her recent package.", time: "2:30 PM" },
  ];

  /* ── Trip breakdown for the Total Trips card ── */
  const tripBreakdown = useMemo(() => {
    const total = periodMetrics.bookings;
    const done = Math.round(total * 0.52);
    const booked = Math.round(total * 0.39);
    const cancelled = total - done - booked;
    return { total, done, booked, cancelled };
  }, [periodMetrics]);

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
                  <LineChart data={revenueData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
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
                <select className="db-select" value={selectedDestMonth} onChange={e => setSelectedDestMonth(e.target.value)}>
                  <option>This Month</option>
                  <option>Last Month</option>
                </select>
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
                  <div className="bar-done" style={{ width: "52%" }} />
                  <div className="bar-booked" style={{ width: "39%" }} />
                  <div className="bar-cancelled" style={{ width: "9%" }} />
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
                {messages.map((m, i) => (
                  <div key={i} className="msg-row">
                    <div className="msg-avatar">{m.name.charAt(0)}</div>
                    <div className="msg-body">
                      <div className="msg-top">
                        <b>{m.name}</b>
                        <span className="msg-time">{m.time}</span>
                      </div>
                      <p>{m.preview}</p>
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
              {travelPackages.map((p, i) => (
                <div key={i} className="pkg-card">
                  <div className="pkg-img-wrap">
                    <img src={p.img} alt={p.dest} />
                    <span className="pkg-tag">{p.title}</span>
                  </div>
                  <h5>{p.dest}</h5>
                  <span className="pkg-dur"><FiClock size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {p.dur}</span>
                  <div className="pkg-foot">
                    <div>
                      <b className="pkg-price">{p.price}</b>
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
                {bookings.map((b, i) => (
                  <tr key={i}>
                    <td>{b.name}</td>
                    <td>{b.pkg}</td>
                    <td>{b.dur}</td>
                    <td>{b.date}</td>
                    <td>{b.price}</td>
                    <td><span className={`pill ${b.status.toLowerCase()}`}>{b.status}</span></td>
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
                  className={`cal-date ${!d ? "empty" : ""} ${d && highlightedDates.has(d) ? "hl" : ""} ${d === selectedDate ? "today" : ""}`}
                  onClick={() => d && setSelectedDate(d)}
                >
                  {d || ""}
                </div>
              ))}
            </div>
            <div className="cal-selected-info">
              <FiCalendar size={13} />
              <span>Selected: <b>{MONTH_NAMES[calMonth]} {selectedDate}, {calYear}</b></span>
            </div>
          </div>

          {/* Upcoming Trips */}
          <div className="db-card db-upcoming">
            <div className="db-card-head">
              <h4>Upcoming Trips</h4>
              <button className="plus-btn" onClick={() => setShowTripForm(!showTripForm)}>
                {showTripForm ? <span style={{ fontSize: 18, lineHeight: 1 }}>×</span> : <FiPlus size={16} />}
              </button>
            </div>

            {showTripForm && (
              <div className="trip-form">
                <input
                  placeholder="Trip name (e.g. Beach Escape)"
                  value={tripForm.tag}
                  onChange={e => setTripForm({ ...tripForm, tag: e.target.value })}
                />
                <input
                  placeholder="Location (e.g. Bali, Indonesia)"
                  value={tripForm.loc}
                  onChange={e => setTripForm({ ...tripForm, loc: e.target.value })}
                />
                <div className="trip-form-row">
                  <input
                    placeholder="Date (e.g. 5 - 10 Aug)"
                    value={tripForm.date}
                    onChange={e => setTripForm({ ...tripForm, date: e.target.value })}
                  />
                  <input
                    placeholder="Users (e.g. +5)"
                    value={tripForm.users}
                    onChange={e => setTripForm({ ...tripForm, users: e.target.value })}
                  />
                </div>
                <button className="trip-form-submit" onClick={handleAddTrip}>Add Trip</button>
              </div>
            )}

            <div className="trip-list">
              {upcomingTrips.map((t, i) => (
                <div key={i} className={`trip-item ${t.active ? "active" : ""}`}>
                  <img src={t.img} alt={t.loc} />
                  <div className="trip-info">
                    <span className="trip-tag">{t.tag}</span>
                    <h5>{t.loc}</h5>
                    <div className="trip-meta">
                      <span><FiUser size={13} style={{ marginRight: 2, verticalAlign: 'middle' }} /> {t.users}</span>
                      <span><FiCalendar size={13} style={{ marginRight: 2, verticalAlign: 'middle' }} /> {t.date}</span>
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
              {activities.map((a, i) => (
                <div key={i} className="act-row">
                  <div className="act-icon" style={{ background: `${a.color}18`, color: a.color }}>{a.icon}</div>
                  <div className="act-body">
                    <p>{a.text}</p>
                    <span className="act-time">{a.time}</span>
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
