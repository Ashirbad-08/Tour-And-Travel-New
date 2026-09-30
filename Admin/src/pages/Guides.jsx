import React, { useEffect, useState } from "react";
import api from "../utils/api";
import {
  FiMessageCircle,
  FiPhone,
  FiBriefcase,
  FiTrendingUp,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiHome,
  FiX,
  FiUpload,
  FiImage
} from "react-icons/fi";
import { BsPatchCheckFill } from "react-icons/bs";
import "../styles/Guides.css";

const API = "/guides";

function Guides() {

  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newGuide, setNewGuide] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    avatar: null
  });

  const [editGuide, setEditGuide] = useState(null);

  // ================= FETCH GUIDES =================
 // ================= FETCH GUIDES =================
const fetchGuides = async () => {
  try {
    setLoading(true);
    const res = await api.get(API);

    console.log("API RESPONSE:", res.data); // check backend response

    // Make sure guides is always an array
    const guidesArray =
      res.data.data ||
      res.data.guides ||
      (Array.isArray(res.data) ? res.data : []);

    setGuides(Array.isArray(guidesArray) ? guidesArray : []);
    setSelectedGuide(guidesArray?.[0] || null);

  } catch (err) {
    console.error(err);
    setGuides([]); // prevent crash
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchGuides();
  }, []);

  // ================= ADD GUIDE =================
  const handleAddGuide = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newGuide.name);
      formData.append("email", newGuide.email);
      formData.append("phone", newGuide.phone);
      formData.append("role", newGuide.role);
      if (newGuide.avatar) {
        formData.append("avatar", newGuide.avatar);
      }

      await api.post(API, formData);

      setShowModal(false);
      fetchGuides();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("User not logged in");
    }
  };

  // ================= UPDATE GUIDE =================
  const handleUpdateGuide = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editGuide.name);
      formData.append("email", editGuide.email);
      formData.append("phone", editGuide.phone);
      formData.append("role", editGuide.role);

      if (editGuide.avatar instanceof File) {
        formData.append("avatar", editGuide.avatar);
      }

      await api.put(`${API}/${editGuide._id}`, formData);

      setShowEditModal(false);
      fetchGuides();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error updating guide");
    }
  };

  // ================= DELETE GUIDE =================
  const handleDeleteGuide = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await api.delete(`${API}/${id}`);
      fetchGuides();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // ================= FILTER =================
 const filtered = Array.isArray(guides)
  ? guides.filter(g =>
      g.name?.toLowerCase().includes(search.toLowerCase())
    )
  : [];

  return (
    <div className="guides-wrapper">

      {/* LEFT PANEL */}
      <div className="guides-card">

        <div className="guides-header">
          <h2>Guides</h2>
          <div className="guides-controls">
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="add-btn" onClick={() => setShowModal(true)}>
              + Add Guide
            </button>
          </div>
        </div>

        {loading && <p>Loading...</p>}

        {filtered.map(guide => (
          <div
            key={guide._id}
            className={`guide-row ${selectedGuide?._id === guide._id ? "active" : ""}`}
            onClick={() => setSelectedGuide(guide)}
          >
            <img
              src={guide.avatar || "https://via.placeholder.com/100"}
              alt={guide.name}
            />
            <div className="guide-text">
              <h4>{guide.name}</h4>
              <span>{guide.email}</span>
              <span>{guide.phone}</span>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      {selectedGuide && (
        <div className="guide-details">
          <div className="details-body">

            <div className="profile-top">
              <img
                src={selectedGuide.avatar || "https://via.placeholder.com/100"}
                className="details-avatar"
                alt={selectedGuide.name}
              />

              <div className="profile-info">
                <h2>{selectedGuide.name}</h2>
                <p>{selectedGuide.role}</p>
              </div>

              <div className="profile-actions">
                <button className="icon-btn">
                  <FiMessageCircle />
                </button>
                <button className="icon-btn blue">
                  <FiPhone />
                </button>
              </div>
            </div>

            <button
              className="edit-profile"
              onClick={() => {
                setEditGuide(selectedGuide);
                setShowEditModal(true);
              }}
            >
              Edit Profile
            </button>

            <button
              className="delete-btn"
              onClick={() => handleDeleteGuide(selectedGuide._id)}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Guide</h3>

            <input
              placeholder="Name"
              onChange={(e) =>
                setNewGuide({ ...newGuide, name: e.target.value })
              }
            />
            <input
              placeholder="Email"
              onChange={(e) =>
                setNewGuide({ ...newGuide, email: e.target.value })
              }
            />
            <input
              placeholder="Phone"
              onChange={(e) =>
                setNewGuide({ ...newGuide, phone: e.target.value })
              }
            />
            <input
              placeholder="Role"
              onChange={(e) =>
                setNewGuide({ ...newGuide, role: e.target.value })
              }
            />
            <input
              type="file"
              onChange={(e) =>
                setNewGuide({ ...newGuide, avatar: e.target.files[0] })
              }
            />

            <button onClick={handleAddGuide}>Save</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editGuide && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Guide</h3>

            <input
              value={editGuide.name}
              onChange={(e) =>
                setEditGuide({ ...editGuide, name: e.target.value })
              }
            />
            <input
              value={editGuide.email}
              onChange={(e) =>
                setEditGuide({ ...editGuide, email: e.target.value })
              }
            />
            <input
              value={editGuide.phone}
              onChange={(e) =>
                setEditGuide({ ...editGuide, phone: e.target.value })
              }
            />
            <input
              value={editGuide.role}
              onChange={(e) =>
                setEditGuide({ ...editGuide, role: e.target.value })
              }
            />
            <input
              type="file"
              onChange={(e) =>
                setEditGuide({ ...editGuide, avatar: e.target.files[0] })
              }
            />

            <button onClick={handleUpdateGuide}>Update</button>
            <button onClick={() => setShowEditModal(false)}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Guides;
