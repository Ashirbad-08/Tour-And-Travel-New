import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Calendar,
  MapPin,
  Upload,
  Grid,
  List,
  X,
  Eye,
  Edit2,
  Edit,
  MoreHorizontal,
  MoreVertical,
  Trash2,
} from "lucide-react";
import api from "../utils/api";
import "../styles/Gallery.css";

const TravelGalleryPanel = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Packages");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  // Track raw File objects for upload
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [newAdditionalFiles, setNewAdditionalFiles] = useState([]);
  const [editFiles, setEditFiles] = useState([]);

  const [newPackage, setNewPackage] = useState({
    title: "",
    location: "",
    category: "Mountain",
    date: "",
    image: "",
    images: [],
  });

  // Fetch gallery from backend API
  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/gallery', { params: { limit: 100 } });
      const data = res.data?.data || [];
      // Map backend shape to frontend shape
      const mapped = data.map((item) => ({
        id: item._id,
        title: item.title || "Untitled",
        location: item.location || "Unknown",
        image: item.imageUrls?.[0] || "",
        images: item.imageUrls || [],
        date: item.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        category: "All", // Backend doesn't have categories yet
        description: item.description || "",
      }));
      setPackages(mapped);
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const filteredPackages = useMemo(() => {
    let filtered = [...packages];

    if (searchQuery) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.location.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedCategory !== "All Packages") {
      filtered = filtered.filter((pkg) => pkg.category === selectedCategory);
    }

    if (startDate && endDate) {
      filtered = filtered.filter((pkg) => {
        const pkgDate = new Date(pkg.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return pkgDate >= start && pkgDate <= end;
      });
    }

    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "location":
        filtered.sort((a, b) => a.location.localeCompare(b.location));
        break;
      case "location-desc":
        filtered.sort((a, b) => b.location.localeCompare(a.location));
        break;
      default:
        break;
    }

    return filtered;
  }, [packages, searchQuery, selectedCategory, sortBy, startDate, endDate]);

  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const paginatedPackages = filteredPackages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuickView = (pkg) => {
    setSelectedPackage(pkg);
    setSelectedImageIndex(0);
    setShowQuickView(true);
  };

  const handleAddPackage = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newPackage.title);
      formData.append('location', newPackage.location);
      formData.append('category', newPackage.category);
      formData.append('description', newPackage.title);

      // Append cover file first, then additional files
      if (newCoverFile) {
        formData.append('images', newCoverFile);
      }
      newAdditionalFiles.forEach((file) => {
        formData.append('images', file);
      });

      await api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowAddModal(false);
      setNewPackage({ title: '', location: '', category: 'Mountain', date: '', image: '', images: [] });
      setNewCoverFile(null);
      setNewAdditionalFiles([]);
      await fetchGallery();
    } catch (err) {
      console.error('Failed to add gallery item:', err);
      alert(err.response?.data?.message || 'Failed to add gallery item');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPackage = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', editingPackage.title);
      formData.append('location', editingPackage.location);
      formData.append('category', editingPackage.category);
      if (editingPackage.description) formData.append('description', editingPackage.description);

      // Append new files if user uploaded replacements
      editFiles.forEach((file) => {
        formData.append('images', file);
      });

      await api.put(`/gallery/${editingPackage.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowEditModal(false);
      setEditingPackage(null);
      setEditFiles([]);
      await fetchGallery();
    } catch (err) {
      console.error('Failed to update gallery item:', err);
      alert(err.response?.data?.message || 'Failed to update gallery item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      await fetchGallery();
    } catch (err) {
      console.error('Failed to delete gallery item:', err);
    }
  };

  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEdit) {
        setEditFiles((prev) => [file, ...prev]);
      } else {
        setNewCoverFile(file);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditingPackage((prev) => ({ ...prev, image: reader.result }));
        } else {
          setNewPackage((prev) => ({ ...prev, image: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle multiple images upload for ADD modal
  const handleMultipleImagesUploadForAdd = (e) => {
    const files = Array.from(e.target.files);
    // Track raw file objects for upload
    setNewAdditionalFiles((prev) => [...prev, ...files]);
    const newImages = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result);
        if (newImages.length === files.length) {
          setNewPackage((prev) => ({
            ...prev,
            images: [...(prev.images || []), ...newImages],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image from Add modal gallery
  const handleRemoveImageFromAdd = (index) => {
    setNewPackage((prev) => {
      const updatedImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: updatedImages,
      };
    });
  };

  // Handle multiple images upload
  const handleMultipleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    // Track raw file objects for upload
    setEditFiles((prev) => [...prev, ...files]);
    const newImages = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result);
        if (newImages.length === files.length) {
          setEditingPackage((prev) => ({
            ...prev,
            images: [...(prev.images || []), ...newImages],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image from gallery
  const handleRemoveImage = async (index) => {
    const updatedImages = editingPackage.images.filter((_, i) => i !== index);

    // Proactively update UI
    setEditingPackage((prev) => ({
      ...prev,
      images: updatedImages,
    }));

    // If it's an existing item, sync with server reorder/remove
    if (editingPackage.id) {
      try {
        await api.patch(`/gallery/reorder/${editingPackage.id}`, {
          imageUrls: updatedImages
        });
      } catch (err) {
        console.error("Failed to sync image removal:", err);
      }
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage({ ...pkg, images: pkg.images || [pkg.image] });
    setShowEditModal(true);
  };

  const formatDateRange = () => {
    if (!startDate && !endDate) return "Select Date Range";
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const end = new Date(endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${start} - ${end}`;
    }
    return "Select Date Range";
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setShowDatePicker(false);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 7;

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      if (currentPage <= 3) {
        buttons.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        buttons.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        buttons.push(1, "...", currentPage, "...", totalPages);
      }
    }

    return buttons;
  };

  return (
    <div className="travel-gallery-panel">
      {/* Header Controls */}
      <div className="panel-header">
        <div className="header-left">
          {/* Date Range Picker */}
          <div className="date-picker-wrapper">
            <div
              className="date-picker"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <Calendar className="icon" size={16} />
              <span>{formatDateRange()}</span>
              <svg
                className="chevron"
                width="12"
                height="12"
                viewBox="0 0 12 12"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>

            {showDatePicker && (
              <div className="date-picker-dropdown">
                <div className="date-picker-header">
                  <h4>Select Date Range</h4>
                  <button onClick={() => setShowDatePicker(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div className="date-inputs">
                  <div className="date-input-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="date-input-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                    />
                  </div>
                </div>
                <div className="date-picker-actions">
                  <button className="btn-clear" onClick={clearDateFilter}>
                    Clear
                  </button>
                  <button
                    className="btn-apply"
                    onClick={() => setShowDatePicker(false)}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Package Filter */}
          <div className="package-filter">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All Packages">All Packages</option>
              <option value="Mountain">Mountain</option>
              <option value="Beach">Beach</option>
              <option value="City">City</option>
              <option value="Safari">Safari</option>
              <option value="Cultural">Cultural</option>
              <option value="Cruise">Cruise</option>
              <option value="Island">Island</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search packages, location, etc..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery("")}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="header-right">
          {/* Sort Dropdown */}
          <div className="sort-dropdown">
            <span className="sort-label">Sort by:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <optgroup label="Name">
                <option value="name">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </optgroup>
              <optgroup label="Location">
                <option value="location">Location (A-Z)</option>
                <option value="location-desc">Location (Z-A)</option>
              </optgroup>
            </select>
          </div>

          {/* View Toggle */}
          <div className="view-toggle">
            <button
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>

          {/* Add Image Button */}
          <button
            className="add-image-btn"
            onClick={() => setShowAddModal(true)}
          >
            <Upload size={16} />
            Add Image
          </button>
        </div>
      </div>

      {/* Results Info */}
      {(searchQuery ||
        selectedCategory !== "All Packages" ||
        startDate ||
        endDate) && (
          <div className="results-info">
            <p>
              Showing <strong>{filteredPackages.length}</strong>{" "}
              {filteredPackages.length === 1 ? "package" : "packages"}
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedCategory !== "All Packages" && ` in ${selectedCategory}`}
              {startDate && endDate && ` from ${formatDateRange()}`}
            </p>
            <button
              className="clear-filters"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Packages");
                setStartDate("");
                setEndDate("");
                setCurrentPage(1);
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}

      {/* Package Gallery */}
      <div className={`package-grid ${viewMode}`}>
        {paginatedPackages.length > 0 ? (
          paginatedPackages.map((pkg, index) => (
            <div
              key={pkg.id}
              className="package-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="card-image" onClick={() => handleQuickView(pkg)}>
                <img src={pkg.image} alt={pkg.title} />
                <div className="image-overlay">
                  <button
                    className="quick-view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickView(pkg);
                    }}
                  >
                    <Eye size={16} />
                    View
                  </button>
                </div>
                <div className="card-badge">{pkg.category}</div>
              </div>
              <div className="card-content">
                <div className="card-header">
                  <h3 className="package-title">{pkg.title}</h3>
                  <button
                    className="edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(pkg);
                    }}
                    title="Edit Package"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div className="package-location">
                  <MapPin size={14} />
                  <span>{pkg.location}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <h3>No packages found</h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredPackages.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>Showing</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={36}>36</option>
              <option value={48}>48</option>
            </select>
            <span>out of {filteredPackages.length}</span>
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-nav"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {renderPaginationButtons().map((page, index) => (
              <button
                key={index}
                className={`pagination-btn ${page === currentPage ? "active" : ""
                  } ${page === "..." ? "dots" : ""}`}
                onClick={() =>
                  typeof page === "number" && handlePageChange(page)
                }
                disabled={page === "..."}
              >
                {page}
              </button>
            ))}

            <button
              className="pagination-nav"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Quick View Modal - Shows cover image + gallery */}
      {showQuickView && selectedPackage && (
        <div className="modal-overlay" onClick={() => setShowQuickView(false)}>
          <div
            className="modal-content quick-view-modal-gallery"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowQuickView(false)}
            >
              <X size={24} />
            </button>

            {/* Main Large Image */}
            <div className="modal-image-large">
              <img
                src={
                  selectedPackage.images?.[selectedImageIndex] ||
                  selectedPackage.image
                }
                alt={selectedPackage.title}
              />
            </div>

            {/* Thumbnail Gallery */}
            {selectedPackage.images && selectedPackage.images.length > 1 && (
              <div className="image-gallery-thumbnails">
                {selectedPackage.images.map((img, index) => (
                  <div
                    key={index}
                    className={`gallery-thumbnail ${index === selectedImageIndex ? "active" : ""}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={img}
                      alt={`${selectedPackage.title} ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Package Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-content add-package-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowAddModal(false)}
            >
              <X size={24} />
            </button>
            <div className="modal-body">
              <h2>Add New Image</h2>
              <form onSubmit={handleAddPackage}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Package Title *</label>
                    <input
                      type="text"
                      required
                      value={newPackage.title}
                      onChange={(e) =>
                        setNewPackage({ ...newPackage, title: e.target.value })
                      }
                      placeholder="e.g., Alpine Escape"
                    />
                  </div>
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      required
                      value={newPackage.location}
                      onChange={(e) =>
                        setNewPackage({
                          ...newPackage,
                          location: e.target.value,
                        })
                      }
                      placeholder="e.g., Swiss Alps, Switzerland"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      required
                      value={newPackage.category}
                      onChange={(e) =>
                        setNewPackage({
                          ...newPackage,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="Mountain">Mountain</option>
                      <option value="Beach">Beach</option>
                      <option value="City">City</option>
                      <option value="Safari">Safari</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Cruise">Cruise</option>
                      <option value="Island">Island</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      required
                      value={newPackage.date}
                      onChange={(e) =>
                        setNewPackage({ ...newPackage, date: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Upload Cover Image *</label>
                  <div className="image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => handleImageUpload(e, false)}
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="upload-label">
                      <Upload size={20} />
                      {newPackage.image
                        ? "Change Cover Image"
                        : "Choose Cover Image"}
                    </label>
                    {newPackage.image && (
                      <div className="image-preview">
                        <img src={newPackage.image} alt="Preview" />
                        <div className="cover-badge">Cover</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Multiple Images Upload for Add Modal */}
                <div className="form-group full-width">
                  <label>Upload Additional Images (Optional)</label>
                  <div className="image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMultipleImagesUploadForAdd}
                      id="add-multi-image-upload"
                    />
                    <label
                      htmlFor="add-multi-image-upload"
                      className="upload-label"
                    >
                      <Upload size={20} />
                      Add More Images
                    </label>
                  </div>
                </div>

                {/* Image Gallery Preview with Delete for Add Modal */}
                {newPackage.images && newPackage.images.length > 0 && (
                  <div className="form-group full-width">
                    <label>
                      Additional Images ({newPackage.images.length})
                    </label>
                    <div className="edit-image-gallery">
                      {newPackage.images.map((img, index) => (
                        <div key={index} className="edit-gallery-item">
                          <img src={img} alt={`Image ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => handleRemoveImageFromAdd(index)}
                            title="Remove Image"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <Upload size={16} />
                    Add Package
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Package Modal - With Multiple Images Upload */}
      {showEditModal && editingPackage && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content add-package-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowEditModal(false)}
            >
              <X size={24} />
            </button>
            <div className="modal-body">
              <h2>Edit Package</h2>
              <form onSubmit={handleEditPackage}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Package Title *</label>
                    <input
                      type="text"
                      required
                      value={editingPackage.title}
                      onChange={(e) =>
                        setEditingPackage({
                          ...editingPackage,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      required
                      value={editingPackage.location}
                      onChange={(e) =>
                        setEditingPackage({
                          ...editingPackage,
                          location: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      required
                      value={editingPackage.category}
                      onChange={(e) =>
                        setEditingPackage({
                          ...editingPackage,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="Mountain">Mountain</option>
                      <option value="Beach">Beach</option>
                      <option value="City">City</option>
                      <option value="Safari">Safari</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Cruise">Cruise</option>
                      <option value="Island">Island</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      required
                      value={editingPackage.date}
                      onChange={(e) =>
                        setEditingPackage({
                          ...editingPackage,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Multiple Images Upload */}
                <div className="form-group full-width">
                  <label>Upload Multiple Images</label>
                  <div className="image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMultipleImagesUpload}
                      id="edit-multi-image-upload"
                    />
                    <label
                      htmlFor="edit-multi-image-upload"
                      className="upload-label"
                    >
                      <Upload size={20} />
                      Add More Images
                    </label>
                  </div>
                </div>

                {/* Image Gallery Preview with Delete */}
                {editingPackage.images && editingPackage.images.length > 0 && (
                  <div className="form-group full-width">
                    <label>
                      Current Images ({editingPackage.images.length})
                    </label>
                    <div className="edit-image-gallery">
                      {editingPackage.images.map((img, index) => (
                        <div key={index} className="edit-gallery-item">
                          <img src={img} alt={`Image ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => handleRemoveImage(index)}
                            title="Remove Image"
                          >
                            <X size={16} />
                          </button>
                          {index === 0 && (
                            <div className="cover-badge">Cover</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <Edit2 size={16} />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelGalleryPanel;
