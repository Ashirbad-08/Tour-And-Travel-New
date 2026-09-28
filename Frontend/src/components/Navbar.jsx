import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  User,
  ChevronDown,
  X,
  Menu,
  Search,
  Globe,
  Bell,
  LogOut,
  Settings,
  Package,
  BookOpen,
  MapPin,
  Star,
  Trash2,
  Plus,
  Minus
} from "lucide-react";
import { useWishlistCart } from "../hooks/useWishlistCart";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef(null);

  const {
    wishlist,
    cart,
    isInWishlist,
    toggleWishlist,
    isInCart,
    toggleCart,
    updateCartQuantity,
    clearWishlist,
    clearCart,
    wishlistCount,
    cartCount,
    cartTotal
  } = useWishlistCart();

  // Helper function to extract numeric rating
  const getRatingValue = (rating) => {
    if (!rating) return null;
    if (typeof rating === "object" && rating !== null) {
      return rating.average || 0;
    }
    return Number(rating) || 0;
  };

  // Listen for storage events to update counts
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-render - state is managed by context
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("wishlistUpdated", handleStorageChange);
    window.addEventListener("cartUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("wishlistUpdated", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileCatOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleQuickAdd = (item) => {
    toggleCart(
      { preventDefault: () => { }, stopPropagation: () => { } },
      item
    );
  };

  const getItemLink = (item) => {
    if (item?.type === "package") {
      return `/packages/${item.id}`;
    }
    return `/destination/${item.id}`;
  };

  const userProfile = {
    name: "John Traveler",
    email: "john@example.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    memberSince: "2023",
    points: 1250,
    trips: 5
  };

  return (
    <>
      <nav className={`navbar-wrapper ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-content">
          <div className="logo-group">
            <NavLink to="/" className="logo-link">
              <Globe className="logo-icon" size={32} />
              <div>
                <h1
                  className={`logo-text m-0 ${scrolled ? "dark" : ""}`}
                >
                  Pacific
                </h1>
                <p className="logo-sub m-0">TRAVEL AGENCY</p>
              </div>
            </NavLink>
          </div>

          {/* DESKTOP MENU */}
          <ul className="nav-links">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                About
              </NavLink>
            </li>

            <li className="dropdown" ref={dropdownRef}>
              <button
                className="nav-item dropdown-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onMouseEnter={() => setDropdownOpen(true)}
              >
                Categories <ChevronDown size={16} />
              </button>
              <div
                className={`dropdown-menu ${dropdownOpen ? "show" : ""
                  }`}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="dropdown-grid">
                  <div className="dropdown-col">
                    <h4>Adventure</h4>
                    <ul>
                      <li>
                        <NavLink
                          to="/hiking"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <MapPin size={16} /> Hiking
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/volcanoes"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Star size={16} /> Volcanoes
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/waterfalls"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Package size={16} /> Waterfalls
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                  <div className="dropdown-col">
                    <h4>Relaxation</h4>
                    <ul>
                      <li>
                        <NavLink
                          to="/beaches"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Heart size={16} /> Beaches
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/spa"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Spa &amp; Wellness
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/cruises"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Cruises
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                  <div className="dropdown-col">
                    <h4>Bucket List</h4>
                    <ul>
                      <li>
                        <NavLink
                          to="/bucket-list"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Must-Visit Places
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/monuments"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <BookOpen size={16} /> Monuments
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/wildlife"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Wildlife
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </li>

            <li>
              <NavLink
                to="/destinations"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                Destinations
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                Services
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                Contact
              </NavLink>
            </li>
          </ul>

          {/* ICONS */}
          <div className="nav-icons">
            <button
              className="icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <button
              className="icon-btn"
              onClick={() => setWishlistOpen(true)}
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="badges">{wishlistCount}</span>
              )}
            </button>

            <button
              className="icon-btn"
              onClick={() => setCartOpen(true)}
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="badges">{cartCount}</span>
              )}
            </button>

            <button
              className="icon-btn"
              onClick={() => setProfileOpen(true)}
              aria-label="Profile"
            >
              <User size={20} />
            </button>

            <button
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          {/* Top bar with logo + close X */}
          <div className="mobile-menu-header">
            <NavLink
              to="/"
              className="mobile-logo-link"
              onClick={() => setMenuOpen(false)}
            >
              <Globe className="logo-icon" size={28} />
              <div>
                <h1 className="logo-text m-0">Pacific</h1>
                <p className="logo-sub m-0">TRAVEL AGENCY</p>
              </div>
            </NavLink>
            <button
              className="mobile-close-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <NavLink
            to="/"
            className="mobile-nav-item"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className="mobile-nav-item"
            onClick={() => setMenuOpen(false)}
          >
            About
          </NavLink>

          <div className="mobile-dropdown">
            <button
              className="mobile-nav-item dropdown-trigger"
              onClick={() => setMobileCatOpen(!mobileCatOpen)}
            >
              Categories <ChevronDown size={16} />
            </button>
            {mobileCatOpen && (
              <div className="mobile-dropdown-content">
                <div className="mobile-dropdown-section">
                  <h4>Adventure</h4>
                  <NavLink
                    to="/hiking"
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileCatOpen(false);
                    }}
                  >
                    Hiking
                  </NavLink>
                  <NavLink
                    to="/volcanoes"
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileCatOpen(false);
                    }}
                  >
                    Volcanoes
                  </NavLink>
                  <NavLink
                    to="/waterfalls"
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileCatOpen(false);
                    }}
                  >
                    Waterfalls
                  </NavLink>
                </div>
                <div className="mobile-dropdown-section">
                  <h4>Relaxation</h4>
                  <NavLink
                    to="/beaches"
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileCatOpen(false);
                    }}
                  >
                    Beaches
                  </NavLink>
                  <NavLink
                    to="/spa"
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileCatOpen(false);
                    }}
                  >
                    Spa &amp; Wellness
                  </NavLink>
                  <NavLink
                    to="/cruises"
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileCatOpen(false);
                    }}
                  >
                    Cruises
                  </NavLink>
                </div>
                <div className="mobile-dropdown-section">
                  <h4>Bucket List</h4>
                  <NavLink
                    to="/bucket-list"
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileCatOpen(false);
                    }}
                  >
                    Must-Visit Places
                  </NavLink>
                  <NavLink
                    to="/monuments"
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileCatOpen(false);
                    }}
                  >
                    Monuments
                  </NavLink>
                  <NavLink
                    to="/wildlife"
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileCatOpen(false);
                    }}
                  >
                    Wildlife
                  </NavLink>
                </div>
              </div>
            )}
          </div>

          <NavLink
            to="/destinations"
            className="mobile-nav-item"
            onClick={() => setMenuOpen(false)}
          >
            Destinations
          </NavLink>
          <NavLink
            to="/services"
            className="mobile-nav-item"
            onClick={() => setMenuOpen(false)}
          >
            Services
          </NavLink>
          <NavLink
            to="/contact"
            className="mobile-nav-item"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </NavLink>

          <div className="mobile-menu-footer">
            <button
              className="btn-secondary"
              onClick={() => {
                setMenuOpen(false);
                setWishlistOpen(true);
              }}
            >
              <Heart size={18} /> Wishlist ({wishlistCount})
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                setMenuOpen(false);
                setCartOpen(true);
              }}
            >
              <ShoppingCart size={18} /> Cart ({cartCount})
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH MODAL */}
      <div className={`search-modal ${searchOpen ? "open" : ""}`}>
        <div className="search-modal-content">
          <button
            className="search-close"
            onClick={() => setSearchOpen(false)}
          >
            <X size={24} />
          </button>
          <form onSubmit={handleSearch} className="search-form">
            <Search size={24} className="search-icon" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </form>
        </div>
      </div>

      {/* WISHLIST DRAWER */}
      <div className={`drawer ${wishlistOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h3>My Wishlist ({wishlistCount})</h3>
          <div className="drawer-header-actions">
            {wishlistCount > 0 && (
              <button className="drawer-clear" onClick={clearWishlist}>
                <Trash2 size={18} /> Clear All
              </button>
            )}
            <button
              className="drawer-close"
              onClick={() => setWishlistOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="drawer-content">
          {wishlistCount === 0 ? (
            <div className="empty-state">
              <Heart size={48} className="empty-icon" />
              <h4>Your wishlist is empty</h4>
              <p>
                Save your favorite destinations to plan your next adventure
              </p>
              <button
                className="btn-primary mt-3"
                onClick={() => {
                  setWishlistOpen(false);
                  navigate("/destinations");
                }}
              >
                Explore Destinations
              </button>
            </div>
          ) : (
            <div className="drawer-items">
              {wishlist.map((item) => {
                const ratingValue = getRatingValue(item.rating);
                return (
                  <div key={item.id} className="drawer-item">
                    <img
                      src={item.image}
                      alt={item.title || item.name}
                      className="item-image"
                      onClick={() => {
                        setWishlistOpen(false);
                        navigate(getItemLink(item));
                      }}
                    />
                    <div className="item-details">
                      <h4
                        onClick={() => {
                          setWishlistOpen(false);
                          navigate(getItemLink(item));
                        }}
                      >
                        {item.title || item.name}
                      </h4>
                      <div className="item-meta">
                        <span className="price">
                          {item.originalPrice
                            ? `$${item.originalPrice.toLocaleString()}`
                            : item.price || "Price on request"}
                        </span>
                        {ratingValue && ratingValue > 0 && (
                          <span className="rating">
                            <Star size={14} />{" "}
                            {ratingValue.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="item-actions">
                      <button
                        className="btn-primary"
                        onClick={() => handleQuickAdd(item)}
                      >
                        {isInCart(item.id) ? "Added ✓" : "Add to Cart"}
                      </button>
                      <button
                        className="btn-remove"
                        onClick={() =>
                          toggleWishlist(
                            {
                              preventDefault: () => { },
                              stopPropagation: () => { }
                            },
                            item
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CART DRAWER */}
      <div className={`drawer ${cartOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h3>Shopping Cart ({cartCount})</h3>
          <div className="drawer-header-actions">
            {cartCount > 0 && (
              <button className="drawer-clear" onClick={clearCart}>
                <Trash2 size={18} /> Clear All
              </button>
            )}
            <button
              className="drawer-close"
              onClick={() => setCartOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="drawer-content">
          {cartCount === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={48} className="empty-icon" />
              <h4>Your cart is empty</h4>
              <p>Add amazing destinations to get started</p>
              <button
                className="btn-primary mt-3"
                onClick={() => {
                  setCartOpen(false);
                  navigate("/destinations");
                }}
              >
                Browse Destinations
              </button>
            </div>
          ) : (
            <>
              <div className="drawer-items">
                {cart.map((item) => (
                  <div key={item.id} className="drawer-item">
                    <img
                      src={item.image}
                      alt={item.title || item.name}
                      className="item-image"
                      onClick={() => {
                        setCartOpen(false);
                        navigate(getItemLink(item));
                      }}
                    />
                    <div className="item-details">
                      <h4
                        onClick={() => {
                          setCartOpen(false);
                          navigate(getItemLink(item));
                        }}
                      >
                        {item.title || item.name}
                      </h4>
                      <div className="item-meta">
                        <span className="price">
                          $
                          {item.originalPrice?.toLocaleString() ??
                            "0"}
                        </span>
                        <div className="quantity-controls">
                          <button
                            className="quantity-btn"
                            onClick={() =>
                              updateCartQuantity(
                                item.id,
                                (item.quantity || 1) - 1
                              )
                            }
                          >
                            <Minus size={14} />
                          </button>
                          <span className="quantity">
                            {item.quantity || 1}
                          </span>
                          <button
                            className="quantity-btn"
                            onClick={() =>
                              updateCartQuantity(
                                item.id,
                                (item.quantity || 1) + 1
                              )
                            }
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn-remove"
                      onClick={() =>
                        toggleCart(
                          {
                            preventDefault: () => { },
                            stopPropagation: () => { }
                          },
                          item
                        )
                      }
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${cartTotal.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Tax &amp; Fees</span>
                  <span>
                    ${(cartTotal * 0.1).toLocaleString()}
                  </span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>
                    ${(cartTotal * 1.1).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="drawer-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setCartOpen(false)}
                >
                  Continue Shopping
                </button>
                <button className="btn-primary">
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* PROFILE DRAWER */}
      <div className={`drawer ${profileOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h3>My Profile</h3>
          <button
            className="drawer-close"
            onClick={() => setProfileOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        <div className="drawer-content">
          <div className="profile-header">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="profile-avatar"
            />
            <div>
              <h3>{userProfile.name}</h3>
              <p>{userProfile.email}</p>
              <p className="member-since">
                Member since {userProfile.memberSince}
              </p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-value">{userProfile.points}</div>
              <div className="stat-label">Points</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{cartCount}</div>
              <div className="stat-label">In Cart</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{wishlistCount}</div>
              <div className="stat-label">Wishlist</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{userProfile.trips}</div>
              <div className="stat-label">Trips</div>
            </div>
          </div>

          <div className="profile-menu">
            <NavLink
              to="/profile"
              className="menu-item"
              onClick={() => setProfileOpen(false)}
            >
              <User size={20} /> My Account
            </NavLink>
            <NavLink
              to="/bookings"
              className="menu-item"
              onClick={() => setProfileOpen(false)}
            >
              <Package size={20} /> My Bookings
            </NavLink>
            <button
              className="menu-item"
              onClick={() => {
                setProfileOpen(false);
                setWishlistOpen(true);
              }}
            >
              <Heart size={20} /> My Wishlist ({wishlistCount})
            </button>
            <button
              className="menu-item"
              onClick={() => {
                setProfileOpen(false);
                setCartOpen(true);
              }}
            >
              <ShoppingCart size={20} /> My Cart ({cartCount})
            </button>
            <NavLink
              to="/notifications"
              className="menu-item"
              onClick={() => setProfileOpen(false)}
            >
              <Bell size={20} /> Notifications
            </NavLink>
            <NavLink
              to="/settings"
              className="menu-item"
              onClick={() => setProfileOpen(false)}
            >
              <Settings size={20} /> Settings
            </NavLink>
          </div>

          <div className="drawer-footer">
            <button className="btn-logout-full">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      {(menuOpen || cartOpen || wishlistOpen || profileOpen || searchOpen) && (
        <div
          className="drawer-overlay"
          onClick={() => {
            setMenuOpen(false);
            setCartOpen(false);
            setWishlistOpen(false);
            setProfileOpen(false);
            setSearchOpen(false);
          }}
        />
      )}
    </>
  );
};

export default Navbar;
