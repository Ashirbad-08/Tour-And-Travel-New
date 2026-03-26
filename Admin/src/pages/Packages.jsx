import React, { useState, useRef } from "react";
import api from "../utils/api";
import {
  Star,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  Plus,
  X,
  Trash2,
  Upload
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
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPackages = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/packages");
      const data = res.data?.data || [];
      setPackages(data);
      setSelectedPackage((prev) => prev || data[0] || null);
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

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
  const filtered = packages.filter(p => {
    const title = (p?.title || "").toLowerCase();
    const destination = (p?.destination || "").toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      title.includes(query) ||
      destination.includes(query);
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
      location: selectedPackage.destination,
      days: selectedPackage.durationDays,
      nights: selectedPackage.durationNights,
      price: selectedPackage.price,
      participants: selectedPackage.maxPerson,
      category: selectedPackage.category,
      image: selectedPackage.thumbnailImage,
      description: selectedPackage.description,
      includes: selectedPackage.includes?.join("\n") || "",
      tripSchedule: selectedPackage.travelPlans
        ?.map(s => `${s.dayNumber} | ${s.title} | ${s.description}`)
        .join("\n") || "",
    });
    setImagePreview(selectedPackage.thumbnailImage);
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location) {
      alert("Please fill in at least Title and Location");
      return;
    }

    const includesArr = formData.includes
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    const scheduleArr = formData.tripSchedule
      .split("\n")
      .map((line, idx) => {
        const parts = line.split("|").map(s => s.trim());
        return {
          day: parts[0] ? parseInt(parts[0], 10) || idx + 1 : idx + 1,
          title: parts[1] || "Untitled",
          description: parts[2] || "",
        };
      })
      .filter(s => s.title);

    const payload = {
      title: formData.title,
      destination: formData.location,
      durationDays: parseInt(formData.days, 10) || 1,
      durationNights: parseInt(formData.nights, 10) || 0,
      price: parseInt(formData.price, 10) || 0,
      maxPerson: parseInt(formData.participants, 10) || 10,
      category: formData.category || "Adventure",
      thumbnailImage: formData.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
      description: formData.description,
      includes: includesArr,
      excludes: [],
      travelPlans: scheduleArr.map(s => ({ ...s, dayNumber: s.day, date: new Date() })),
    };

    setLoading(true);
    try {
      if (modalMode === "add") {
        const res = await api.post("/packages/create", payload);
        alert("Package created!");
        setSelectedPackage(res.data?.data);
      } else {
        await api.put(`/packages/${selectedPackage._id}`, payload);
        alert("Package updated!");
      }
      setShowModal(false);
      await fetchPackages();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save package");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${selectedPackage.title}"?`)) return;
    setLoading(true);
    try {
      await api.delete(`/packages/${selectedPackage._id}`);
      alert("Package deleted!");
      setSelectedPackage(null);
      await fetchPackages();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete package");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="packages-page-container">
      {/* --- COLUMN 1: SIDEBAR LIST --- */}
      <div className="packages-sidebar">
        <div className="sidebar-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search package, location, etc"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="filter-btn" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} />
          </button>
        </div>

        {showFilters && (
          <div className="filter-dropdown">
            <label>Price Range</label>
            <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
              <option value="all">All Prices</option>
              <option value="budget">Budget (&lt; $1,500)</option>
              <option value="mid">Mid ($1,500 – $2,500)</option>
              <option value="luxury">Luxury (&gt; $2,500)</option>
            </select>
          </div>
        )}

        <div className="packages-list">
          {loading && (
            <div style={{ textAlign: 'center', padding: '14px', color: '#64748b', fontSize: '13px' }}>
              Loading packages...
            </div>
          )}
          {filtered.map(pkg => (
            <div
              key={pkg._id}
              className={`package-list-item ${selectedPackage?._id === pkg._id ? 'active' : ''}`}
              onClick={() => setSelectedPackage(pkg)}
            >
              <img src={pkg.thumbnailImage} alt={pkg.title} />
              <div className="pkg-info">
                <h4>{pkg.title}</h4>
                <div className="pkg-meta">
                  <span><MapPin size={10} /> {pkg.destination}</span>
                  <span><Clock size={10} /> {pkg.durationDays} Days / {pkg.durationNights} Nights</span>
                </div>
                <div className="pkg-footer">
                  <div className="rating">
                    <Star size={12} fill="#FACC15" stroke="none" /> <span>{pkg.rating || "New"}</span>
                  </div>
                  <div className="price">
                    <span>${pkg.price?.toLocaleString()}</span>/person
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>
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
              <img src={selectedPackage.thumbnailImage} alt={selectedPackage.title} className="hero-image" />
            </div>

            <div className="details-header">
              <div>
                <h2>{selectedPackage.title}</h2>
                <div className="rating-row">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.floor(selectedPackage.rating || 0) ? "#FACC15" : "#E5E7EB"}
                      stroke="none"
                    />
                  ))}
                  <span className="rating-val">{selectedPackage.rating || "No ratings"}</span>
                </div>
              </div>
              <button className="edit-btn" onClick={openEditModal}>Edit Package</button>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="icon"><MapPin size={16} /></span>
                <span className="label">Location</span>
                <span className="val">{selectedPackage.destination}</span>
              </div>
              <div className="info-item">
                <span className="icon"><Clock size={16} /></span>
                <span className="label">Duration</span>
                <span className="val">{selectedPackage.durationDays} Days / {selectedPackage.durationNights} Nights</span>
              </div>
              <div className="info-item">
                <span className="icon"><Users size={16} /></span>
                <span className="label">Quota</span>
                <span className="val">{selectedPackage.maxPerson} participants</span>
              </div>
              <div className="info-item">
                <span className="icon"><DollarSign size={16} /></span>
                <span className="label">Price</span>
                <span className="val price-val text-blue">${selectedPackage.price?.toLocaleString()} <span className="text-gray">per person</span></span>
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
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            No package selected. Add one to get started!
          </div>
        )}
      </div>

      {/* --- COLUMN 3: TRIP SCHEDULE --- */}
      <div className="trip-schedule">
        <h3>Trip Schedule</h3>
        <div className="timeline">
          {selectedPackage && selectedPackage.travelPlans && selectedPackage.travelPlans.map((item, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="day-header">
                  <span className="day-num">Day {item.dayNumber}</span>
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
              <h3>{modalMode === "add" ? "Add New Package" : `Edit: ${selectedPackage.title}`}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Package Title *</label>
                  <input name="title" value={formData.title} onChange={handleFormChange} placeholder="e.g. Venice Dreams" required />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <input name="location" value={formData.location} onChange={handleFormChange} placeholder="e.g. Venice, Italy" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Days</label>
                  <input name="days" type="number" value={formData.days} onChange={handleFormChange} placeholder="6" />
                </div>
                <div className="form-group">
                  <label>Nights</label>
                  <input name="nights" type="number" value={formData.nights} onChange={handleFormChange} placeholder="5" />
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input name="price" type="number" value={formData.price} onChange={handleFormChange} placeholder="1500" />
                </div>
                <div className="form-group">
                  <label>Participants</label>
                  <input name="participants" type="number" value={formData.participants} onChange={handleFormChange} placeholder="20" />
                </div>
              </div>
              <div className="form-group">
                <label>Package Image</label>
                <div className="image-upload-area" onClick={() => fileInputRef.current.click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="image-upload-preview" />
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
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange} rows={3} placeholder="About this package..." />
              </div>
              <div className="form-group">
                <label>Includes (one per line)</label>
                <textarea name="includes" value={formData.includes} onChange={handleFormChange} rows={3} placeholder="Hotel accommodation&#10;Daily breakfast&#10;Guided tours" />
              </div>
              <div className="form-group">
                <label>Trip Schedule (day | title | description, one per line)</label>
                <textarea name="tripSchedule" value={formData.tripSchedule} onChange={handleFormChange} rows={4} placeholder="1 | Arrival | Transfer to hotel&#10;2 | City Tour | Guided tour" />
              </div>
              <div className="modal-actions">
                {modalMode === "edit" && (
                  <button type="button" className="delete-btn" onClick={handleDelete}>
                    <Trash2 size={16} /> Delete
                  </button>
                )}
                <div style={{ flex: 1 }} />
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
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
