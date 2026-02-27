import React, { useState, useRef } from "react";
import {
  Star,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Filter,
  CheckCircle2,
  Plus,
  X,
  Trash2,
  Upload,
} from "lucide-react";
import "../styles/Packages.css";

const emptyForm = {
  title: "",
  location: "",
  days: "",
  nights: "",
  price: "",
  participants: "",
  image: "",
  description: "",
  includes: "",
  tripSchedule: "",
};

const Packages = () => {
  /* ----- MOCK DATA ----- */
  const [packages, setPackages] = useState([
    {
      id: 1,
      title: "Venice Dreams",
      location: "Venice, Italy",
      days: 6,
      nights: 5,
      price: 1500,
      rating: 4.5,
      participants: 20,
      image:
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&q=80",
      description:
        "Immerse yourself in the timeless beauty and romance of Venice with our Venice Dreams package. Explore the enchanting canals, historic architecture, and vibrant culture of this unique city. This package offers a perfect blend of guided tours and leisure time to experience Venice at your own pace.",
      includes: [
        "Accommodation in a charming boutique hotel along the Grand Canal",
        "Daily breakfast and one traditional Venetian dinner",
        "Gondola ride through the canals",
        "Guided tour of St. Mark's Basilica and Doge's Palace",
      ],
      tripSchedule: [
        {
          day: 1,
          title: "Arrival in Venice",
          description:
            "Transfer to hotel, welcome drink, and orientation. Leisure time to explore local surroundings.",
        },
        {
          day: 2,
          title: "Guided City Tour",
          description:
            "Guided tour of St. Mark's Basilica and Doge's Palace. Traditional Venetian dinner.",
        },
        {
          day: 3,
          title: "Murano and Burano",
          description:
            "Visit to Murano glass-blowing factory, exploration of Burano island. Free time.",
        },
        {
          day: 4,
          title: "Cultural Immersion",
          description:
            "Visit to local markets, optional cooking class. Free time to explore cafes and restaurants.",
        },
        {
          day: 5,
          title: "Leisure Day",
          description:
            "Free day to explore Venice on your own, optional activities. Farewell gathering.",
        },
        {
          day: 6,
          title: "Departure",
          description: "Transfer to airport for departure.",
        },
      ],
    },
    {
      id: 2,
      title: "Safari Adventure",
      location: "Serengeti, Tanzania",
      days: 8,
      nights: 7,
      price: 3200,
      rating: 5.0,
      participants: 15,
      image:
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80",
      description:
        "Experience the wild beauty of Africa with our Safari Adventure package. Witness the Great Migration, spot the Big Five, and immerse yourself in the stunning landscapes of the Serengeti.",
      includes: [
        "Luxury safari lodge accommodation",
        "All meals and beverages",
        "Professional safari guide",
        "4x4 safari vehicle",
      ],
      tripSchedule: [
        {
          day: 1,
          title: "Arrival",
          description: "Arrive in Arusha, transfer to hotel. Safari briefing.",
        },
        {
          day: 2,
          title: "Serengeti Park",
          description: "Flight to Serengeti. Afternoon game drive.",
        },
        {
          day: 3,
          title: "Full Day Safari",
          description:
            "Morning game drive, afternoon game drive. Sundowner experience.",
        },
      ],
    },
    {
      id: 3,
      title: "Alpine Escape",
      location: "Swiss Alps, Switzerland",
      days: 7,
      nights: 6,
      price: 2100,
      rating: 4.0,
      participants: 18,
      image:
        "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80",
      description:
        "Discover the breathtaking beauty of the Swiss Alps. From pristine mountain peaks to charming alpine villages, this package offers the perfect blend of adventure and relaxation.",
      includes: [
        "Mountain resort accommodation",
        "Daily breakfast and dinner",
        "Cable car passes",
        "Guided hiking tours",
      ],
      tripSchedule: [
        {
          day: 1,
          title: "Arrival in Zurich",
          description: "Transfer to resort. Welcome dinner.",
        },
        {
          day: 2,
          title: "Jungfraujoch",
          description: "Train to Top of Europe. Mountain exploration.",
        },
        {
          day: 3,
          title: "Hiking Adventure",
          description: "Guided alpine hike. Mountain lake visit.",
        },
      ],
    },
    {
      id: 4,
      title: "Seoul Cultural Exploration",
      location: "Seoul, South Korea",
      days: 10,
      nights: 9,
      price: 2800,
      rating: 5.0,
      participants: 25,
      image:
        "https://images.unsplash.com/photo-1538882357723-2d0281d0a3c5?w=600&q=80",
      description:
        "Dive deep into Korean culture with our comprehensive Seoul package. Experience ancient palaces, modern K-pop culture, traditional temples, and world-class cuisine.",
      includes: [
        "Central Seoul hotel accommodation",
        "Daily breakfast",
        "K-pop experience tour",
        "Palace and temple tours",
      ],
      tripSchedule: [
        {
          day: 1,
          title: "Arrival",
          description: "Hotel check-in. Myeongdong shopping district.",
        },
        {
          day: 2,
          title: "Palace Tour",
          description:
            "Gyeongbokgung Palace, Bukchon Hanok Village. Hanbok experience.",
        },
      ],
    },
    {
      id: 5,
      title: "Parisian Romance",
      location: "Paris, France",
      days: 5,
      nights: 4,
      price: 1200,
      rating: 4.5,
      participants: 30,
      image:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
      description:
        "Fall in love with the City of Light. Experience iconic landmarks, world-class museums, exquisite cuisine, and the romantic ambiance that makes Paris unforgettable.",
      includes: [
        "Boutique hotel in central Paris",
        "Daily breakfast",
        "Seine river cruise",
        "Louvre Museum skip-the-line tickets",
      ],
      tripSchedule: [
        {
          day: 1,
          title: "Arrival",
          description:
            "Hotel check-in, evening Seine cruise. Welcome champagne.",
        },
        {
          day: 2,
          title: "Iconic Paris",
          description: "Eiffel Tower visit, Champs-Élysées. Arc de Triomphe.",
        },
      ],
    },
    {
      id: 6,
      title: "Tokyo Cultural Adventure",
      location: "Tokyo, Japan",
      days: 7,
      nights: 6,
      price: 1800,
      rating: 4.5,
      participants: 20,
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
      description:
        "Discover the perfect blend of ancient traditions and modern innovation in Tokyo. From serene temples to bustling districts, experience the heart of Japanese culture.",
      includes: [
        "Central Tokyo hotel",
        "Daily breakfast",
        "Sumo wrestling experience",
        "Traditional tea ceremony",
      ],
      tripSchedule: [
        {
          day: 1,
          title: "Arrival",
          description: "Hotel check-in, Shibuya crossing. Robot Restaurant.",
        },
        {
          day: 2,
          title: "Traditional Tokyo",
          description: "Senso-ji Temple, tea ceremony. Asakusa district.",
        },
      ],
    },
  ]);

  const [selectedPackage, setSelectedPackage] = useState(packages[0]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [formData, setFormData] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [priceFilter, setPriceFilter] = useState("all");

  // --- FILTERING ---
  const filtered = packages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "budget" && p.price < 1500) ||
      (priceFilter === "mid" && p.price >= 1500 && p.price < 2500) ||
      (priceFilter === "luxury" && p.price >= 2500);
    return matchesSearch && matchesPrice;
  });

  // --- MODAL HELPERS ---
  const openAddModal = () => {
    setModalMode("add");
    setFormData(emptyForm);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = () => {
    setModalMode("edit");
    setFormData({
      title: selectedPackage.title,
      location: selectedPackage.location,
      days: selectedPackage.days,
      nights: selectedPackage.nights,
      price: selectedPackage.price,
      participants: selectedPackage.participants,
      image: selectedPackage.image,
      description: selectedPackage.description,
      includes: selectedPackage.includes.join("\n"),
      tripSchedule: selectedPackage.tripSchedule
        .map((s) => `${s.day} | ${s.title} | ${s.description}`)
        .join("\n"),
    });
    setImagePreview(selectedPackage.image);
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location) {
      alert("Please fill in at least Title and Location");
      return;
    }

    const includesArr = formData.includes
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const scheduleArr = formData.tripSchedule
      .split("\n")
      .map((line, idx) => {
        const parts = line.split("|").map((s) => s.trim());
        return {
          day: parts[0] ? parseInt(parts[0], 10) || idx + 1 : idx + 1,
          title: parts[1] || "Untitled",
          description: parts[2] || "",
        };
      })
      .filter((s) => s.title);

    if (modalMode === "add") {
      const newPkg = {
        id: Date.now(),
        title: formData.title,
        location: formData.location,
        days: parseInt(formData.days, 10) || 1,
        nights: parseInt(formData.nights, 10) || 0,
        price: parseInt(formData.price, 10) || 0,
        rating: 0,
        participants: parseInt(formData.participants, 10) || 0,
        image:
          formData.image ||
          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
        description: formData.description,
        includes: includesArr,
        tripSchedule: scheduleArr,
      };
      const updated = [...packages, newPkg];
      setPackages(updated);
      setSelectedPackage(newPkg);
    } else {
      const updatedPkg = {
        ...selectedPackage,
        title: formData.title,
        location: formData.location,
        days: parseInt(formData.days, 10) || selectedPackage.days,
        nights: parseInt(formData.nights, 10) || selectedPackage.nights,
        price: parseInt(formData.price, 10) || selectedPackage.price,
        participants:
          parseInt(formData.participants, 10) || selectedPackage.participants,
        image: formData.image || selectedPackage.image,
        description: formData.description,
        includes: includesArr,
        tripSchedule: scheduleArr,
      };
      const updated = packages.map((p) =>
        p.id === updatedPkg.id ? updatedPkg : p,
      );
      setPackages(updated);
      setSelectedPackage(updatedPkg);
    }

    setShowModal(false);
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete "${selectedPackage.title}"?`)) return;
    const updated = packages.filter((p) => p.id !== selectedPackage.id);
    setPackages(updated);
    setSelectedPackage(updated.length > 0 ? updated[0] : null);
    setShowModal(false);
  };

  return (
    <div className="packages-page-container">
      {/* --- COLUMN 1: SIDEBAR LIST --- */}
      <div className="packages-sidebar">
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search package, location, etc"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
          </button>
        </div>

        {showFilters && (
          <div className="filter-dropdown">
            <label>Price Range</label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <option value="all">All Prices</option>
              <option value="budget">Budget (&lt; $1,500)</option>
              <option value="mid">Mid ($1,500 – $2,500)</option>
              <option value="luxury">Luxury (&gt; $2,500)</option>
            </select>
          </div>
        )}

        <div className="packages-list">
          {filtered.map((pkg) => (
            <div
              key={pkg.id}
              className={`package-list-item ${selectedPackage?.id === pkg.id ? "active" : ""}`}
              onClick={() => setSelectedPackage(pkg)}
            >
              <img src={pkg.image} alt={pkg.title} />
              <div className="pkg-info">
                <h4>{pkg.title}</h4>
                <div className="pkg-meta">
                  <span>
                    <MapPin size={10} /> {pkg.location}
                  </span>
                  <span>
                    <Clock size={10} /> {pkg.days} Days / {pkg.nights} Nights
                  </span>
                </div>
                <div className="pkg-footer">
                  <div className="rating">
                    <Star size={12} fill="#FACC15" stroke="none" />{" "}
                    <span>{pkg.rating}</span>
                  </div>
                  <div className="price">
                    <span>${pkg.price.toLocaleString()}</span>/person
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#9ca3af",
                fontSize: "13px",
              }}
            >
              No packages found
            </div>
          )}
        </div>

        <button className="add-package-btn" onClick={openAddModal}>
          <Plus size={18} /> Add Package
        </button>
      </div>

      {/* --- COLUMN 2: DETAILS VIEW --- */}
      <div className="package-details">
        {selectedPackage ? (
          <>
            <div className="hero-image-wrapper">
              <img
                src={selectedPackage.image}
                alt={selectedPackage.title}
                className="hero-image"
              />
            </div>

            <div className="details-header">
              <div>
                <h2>{selectedPackage.title}</h2>
                <div className="rating-row">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={
                        i < Math.floor(selectedPackage.rating)
                          ? "#FACC15"
                          : "#E5E7EB"
                      }
                      stroke="none"
                    />
                  ))}
                  <span className="rating-val">{selectedPackage.rating}</span>
                  <span className="review-count">12,256 ratings</span>
                </div>
              </div>
              <button className="edit-btn" onClick={openEditModal}>
                Edit Package
              </button>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="icon">
                  <MapPin size={16} />
                </span>
                <span className="label">Location</span>
                <span className="val">{selectedPackage.location}</span>
              </div>
              <div className="info-item">
                <span className="icon">
                  <Clock size={16} />
                </span>
                <span className="label">Duration</span>
                <span className="val">
                  {selectedPackage.days} Days / {selectedPackage.nights} Nights
                </span>
              </div>
              <div className="info-item">
                <span className="icon">
                  <Users size={16} />
                </span>
                <span className="label">Quota</span>
                <span className="val">
                  {selectedPackage.participants} participants
                </span>
              </div>
              <div className="info-item">
                <span className="icon">
                  <DollarSign size={16} />
                </span>
                <span className="label">Price</span>
                <span className="val price-val text-blue">
                  ${selectedPackage.price}{" "}
                  <span className="text-gray">per person</span>
                </span>
              </div>
            </div>

            <div className="section">
              <h5>ABOUT</h5>
              <p>{selectedPackage.description}</p>
            </div>

            <div className="section">
              <h5>INCLUDES</h5>
              <div className="includes-grid">
                {selectedPackage.includes.map((inc, i) => (
                  <div key={i} className="include-item">
                    <CheckCircle2 size={18} className="check-icon" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}
          >
            No package selected. Add one to get started!
          </div>
        )}
      </div>

      {/* --- COLUMN 3: TRIP SCHEDULE --- */}
      <div className="trip-schedule">
        <h3>Trip Schedule</h3>
        <div className="timeline">
          {selectedPackage &&
            selectedPackage.tripSchedule &&
            selectedPackage.tripSchedule.map((item, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="day-header">
                    <span className="day-num">Day {item.day}</span>
                    <span className="separator">-</span>
                    <span className="day-title">{item.title}</span>
                  </div>
                  <div className="day-body">
                    <span className="activity-label">Activity:</span>
                    <p>{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* --- MODAL (ADD / EDIT) --- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalMode === "add"
                  ? "Add New Package"
                  : `Edit: ${selectedPackage.title}`}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Package Title *</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="e.g. Venice Dreams"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    placeholder="e.g. Venice, Italy"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Days</label>
                  <input
                    name="days"
                    type="number"
                    value={formData.days}
                    onChange={handleFormChange}
                    placeholder="6"
                  />
                </div>
                <div className="form-group">
                  <label>Nights</label>
                  <input
                    name="nights"
                    type="number"
                    value={formData.nights}
                    onChange={handleFormChange}
                    placeholder="5"
                  />
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="1500"
                  />
                </div>
                <div className="form-group">
                  <label>Participants</label>
                  <input
                    name="participants"
                    type="number"
                    value={formData.participants}
                    onChange={handleFormChange}
                    placeholder="20"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Package Image</label>
                <div
                  className="image-upload-area"
                  onClick={() => fileInputRef.current.click()}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="image-upload-preview"
                    />
                  ) : (
                    <div className="image-upload-placeholder">
                      <Upload size={24} />
                      <span>Click to upload image</span>
                      <span className="upload-hint">JPG, PNG or WEBP</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="About this package..."
                />
              </div>
              <div className="form-group">
                <label>Includes (one per line)</label>
                <textarea
                  name="includes"
                  value={formData.includes}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Hotel accommodation&#10;Daily breakfast&#10;Guided tours"
                />
              </div>
              <div className="form-group">
                <label>
                  Trip Schedule (day | title | description, one per line)
                </label>
                <textarea
                  name="tripSchedule"
                  value={formData.tripSchedule}
                  onChange={handleFormChange}
                  rows={4}
                  placeholder="1 | Arrival | Transfer to hotel&#10;2 | City Tour | Guided tour"
                />
              </div>
              <div className="modal-actions">
                {modalMode === "edit" && (
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={handleDelete}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
                <div style={{ flex: 1 }} />
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {modalMode === "add" ? "Add Package" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packages;
