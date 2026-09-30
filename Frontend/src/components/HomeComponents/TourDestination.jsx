import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./TourDestination.css";
import destinations from "../../data/destinations";
import ActionButtons from "../ActionButtons";
import { useWishlistCart } from "../../hooks/useWishlistCart";
import { apiUrl } from "../../utils/api";

export default function TourDestination() {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [displayedTours, setDisplayedTours] = useState([]);
  const [priceFilter, setPriceFilter] = useState("All");
  const [daysFilter, setDaysFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const {
    isInWishlist,
    toggleWishlist,
    isInCart,
    toggleCart
  } = useWishlistCart();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const mapDestinationToTour = (dest) => {
    const days = parseInt(dest.content?.duration?.split(" ")[0]) ||
      parseInt(dest.duration?.split(" ")[0]) || 7;
    const location = dest.content?.location || dest.location || dest.title || "Unknown Location";
    const image = dest.image || "/images/default-tour.png";
    const priceString = dest.content?.price || dest.price || "$1000";
    const price = priceString.includes("/person") ? priceString : priceString + "/person";
    const numericPrice = parseFloat(priceString.replace(/[^0-9.-]+/g, "")) || 0;
    const tourType = dest.type || "specific";
    const countryCode = dest.content?.countryCode || dest.countryCode || "WW";
    const rating = dest.content?.rating || dest.rating || 4.5;
    const description = dest.description || dest.content?.details || `Explore ${dest.title || "this destination"}`;
    const categoryLabel = dest.category || tourType || "General";
    const durationString = dest.content?.duration || dest.duration || "7 Days";

    const amenities = {
      baths: Math.floor(Math.random() * 3) + 1,
      beds: Math.floor(Math.random() * 4) + 2,
      near: ["Mountain", "Beach", "City", "Forest", "Lake"][Math.floor(Math.random() * 5)]
    };

    return {
      id: dest.id,
      image: image,
      days: durationString.toUpperCase(),
      title: dest.title || "Unnamed Tour",
      location: location,
      price: price,
      originalPrice: numericPrice,
      durationDays: days,
      durationNights: Math.max(days - 1, 0),
      rating: rating,
      description: description,
      type: tourType,
      countryCode: countryCode,
      category: categoryLabel,
      filterCategory: tourType,
      maxPerson: dest.content?.participants || 10,
      meta: [
        `\uD83D\uDEBB ${amenities.baths}`,
        `\uD83D\uDECF ${amenities.beds}`,
        `\uD83D\uDCCD Near ${amenities.near}`
      ],
      destinationData: dest
    };
  };

  const mapPackageToTour = (pkg) => {
    const durationDays = Number(pkg.durationDays) || 1;
    const durationNights = Number(pkg.durationNights) || Math.max(durationDays - 1, 0);
    const priceValue = Number(pkg.price) || 0;
    const priceLabel = priceValue > 0
      ? `$${priceValue.toLocaleString()}/person`
      : "Price on request";

    return {
      id: pkg._id || pkg.id,
      image: pkg.thumbnailImage || "/images/default-tour.png",
      days: `${durationDays} Days / ${durationNights} Nights`.toUpperCase(),
      title: pkg.title || "Untitled Package",
      location: pkg.destination || "Unknown Destination",
      price: priceLabel,
      originalPrice: priceValue,
      durationDays: durationDays,
      durationNights: durationNights,
      rating: 4.7,
      description: pkg.description || `Experience ${pkg.title || "this tour"} with curated highlights.`,
      type: "package",
      countryCode: "PKG",
      category: pkg.category || "General",
      filterCategory: pkg.category || "General",
      maxPerson: pkg.maxPerson || 1,
      meta: [
        `\uD83D\uDC65 Max ${pkg.maxPerson || 1}`,
        `\uD83C\uDF19 ${durationNights} Nights`,
        pkg.category || "General"
      ],
      includes: pkg.includes || [],
      excludes: pkg.excludes || [],
      source: "api"
    };
  };

  // Initialize tours from API packages, fallback to destinations
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadPackages = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiUrl("packages"), { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Failed to fetch packages");
        }
        const result = await response.json();
        const packages = Array.isArray(result?.data) ? result.data : null;
        if (!packages) {
          throw new Error("Invalid packages response");
        }
        const transformed = packages.map(mapPackageToTour);
        if (isMounted) {
          setTours(transformed);
          setFilteredTours(transformed);
          const initialDisplayCount = window.innerWidth < 768 ? 2 : 6;
          setDisplayedTours(transformed.slice(0, initialDisplayCount));
        }
        return;
      } catch (error) {
        // Fallback handled below
      }

      const fallbackTours = destinations.map(mapDestinationToTour);
      if (isMounted) {
        setTours(fallbackTours);
        setFilteredTours(fallbackTours);
        const initialDisplayCount = window.innerWidth < 768 ? 2 : 6;
        setDisplayedTours(fallbackTours.slice(0, initialDisplayCount));
      }
    };

    loadPackages().finally(() => {
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Update displayed tours when showAll changes or window resizes
  useEffect(() => {
    if (showAll) {
      setDisplayedTours(filteredTours);
    } else {
      const displayCount = isMobile ? 2 : 6;
      setDisplayedTours(filteredTours.slice(0, displayCount));
    }
  }, [showAll, filteredTours, isMobile]);

  // Apply filters when filter states change
  useEffect(() => {
    let result = [...tours];

    if (priceFilter !== "All") {
      switch (priceFilter) {
        case "Under $1000":
          result = result.filter(tour => tour.originalPrice < 1000);
          break;
        case "$1000 - $2000":
          result = result.filter(tour => tour.originalPrice >= 1000 && tour.originalPrice <= 2000);
          break;
        case "$2000 - $3000":
          result = result.filter(tour => tour.originalPrice > 2000 && tour.originalPrice <= 3000);
          break;
        case "Above $3000":
          result = result.filter(tour => tour.originalPrice > 3000);
          break;
        default:
          break;
      }
    }

    if (daysFilter !== "All") {
      switch (daysFilter) {
        case "Under 7 Days":
          result = result.filter(tour => tour.durationDays < 7);
          break;
        case "7-10 Days":
          result = result.filter(tour => tour.durationDays >= 7 && tour.durationDays <= 10);
          break;
        case "11-14 Days":
          result = result.filter(tour => tour.durationDays >= 11 && tour.durationDays <= 14);
          break;
        case "Over 14 Days":
          result = result.filter(tour => tour.durationDays > 14);
          break;
        default:
          break;
      }
    }

    if (categoryFilter !== "All") {
      result = result.filter(tour => tour.filterCategory === categoryFilter);
    }

    setFilteredTours(result);
    setShowAll(false);
  }, [priceFilter, daysFilter, categoryFilter, tours]);

  const resetFilters = () => {
    setPriceFilter("All");
    setDaysFilter("All");
    setCategoryFilter("All");
    setShowAll(false);
  };

  const handleToggleViewAll = () => {
    setShowAll((prev) => !prev);
  };

  const getTourLink = (tour) => {
    if (tour.type === "package") {
      return `/packages/${tour.id}`;
    }
    return `/destination/${tour.id}`;
  };

  const handleCardClick = (tour) => {
    navigate(getTourLink(tour));
  };

  const handleViewDetails = (e, tour) => {
    e.stopPropagation();
    navigate(getTourLink(tour));
  };

  const handleBookNow = (e, tour) => {
    e.stopPropagation();
    const target = getTourLink(tour);
    navigate(target, { state: { openBooking: true } });
  };

  const priceOptions = [
    "All",
    "Under $1000",
    "$1000 - $2000",
    "$2000 - $3000",
    "Above $3000"
  ];

  const daysOptions = [
    "All",
    "Under 7 Days",
    "7-10 Days",
    "11-14 Days",
    "Over 14 Days"
  ];

  const categoryOptions = useMemo(() => {
    const unique = new Set(
      tours
        .map((tour) => tour.filterCategory)
        .filter((value) => value && value !== "General")
    );
    return ["All", ...Array.from(unique)];
  }, [tours]);

  const formatCategoryLabel = (value) => {
    if (!value) return "Category";
    return value
      .split(/[-\s_]+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  return (
    <section className="tour-section">
      {/* HEADER */}
      <div className="tour-header">
        <p className="badge-title">Discover Your Next Adventure</p>
        <h2 className="tour-title">Popular Tour Packages</h2>
      </div>

      {/* FILTERS */}
      <div className="tour-filters">
        <div className="filters-container">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="price-filter" className="filter-label">
                <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" />
                </svg>
                Price:
              </label>
              <div className="filter-dropdown">
                <select
                  id="price-filter"
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="filter-select"
                >
                  {priceOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="days-filter" className="filter-label">
                <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Duration:
              </label>
              <div className="filter-dropdown">
                <select
                  id="days-filter"
                  value={daysFilter}
                  onChange={(e) => setDaysFilter(e.target.value)}
                  className="filter-select"
                >
                  {daysOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="type-filter" className="filter-label">
                <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                Category:
              </label>
              <div className="filter-dropdown">
                <select
                  id="type-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Categories</option>
                  {categoryOptions.filter(t => t !== "All").map((option, index) => (
                    <option key={index} value={option}>
                      {formatCategoryLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-results">
              <span className="results-count">{filteredTours.length}</span>
              <span className="results-text">Tours Found</span>
            </div>
          </div>

          <div className="filter-row">
            {(priceFilter !== "All" || daysFilter !== "All" || categoryFilter !== "All") && (
              <button className="reset-filters-btn" onClick={resetFilters}>
                <svg className="reset-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(priceFilter !== "All" || daysFilter !== "All" || categoryFilter !== "All") && (
        <div className="active-filters">
          <div className="active-filters-container">
            <span className="active-filters-label">Active Filters:</span>
            <div className="active-filter-tags">
              {priceFilter !== "All" && (
                <span className="active-filter-tag">
                  Price: {priceFilter}
                  <button onClick={() => setPriceFilter("All")} className="remove-filter">x</button>
                </span>
              )}
              {daysFilter !== "All" && (
                <span className="active-filter-tag">
                  Days: {daysFilter}
                  <button onClick={() => setDaysFilter("All")} className="remove-filter">x</button>
                </span>
              )}
              {categoryFilter !== "All" && (
                <span className="active-filter-tag">
                  Category: {formatCategoryLabel(categoryFilter)}
                  <button onClick={() => setCategoryFilter("All")} className="remove-filter">x</button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tours Grid */}
      <div className="tour-grid">
        {loading ? (
          <div className="no-tours-found">
            <svg className="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <h3>Loading tour packages</h3>
            <p>Please wait while we fetch the latest packages.</p>
          </div>
        ) : displayedTours.length > 0 ? (
          displayedTours.map((tour) => (
            <div
              className="tour-card"
              key={tour.id}
              onClick={() => handleCardClick(tour)}
              style={{ cursor: 'pointer' }}
            >
              <div className="tour-image">
                <img
                  src={tour.image}
                  alt={tour.title}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                  }}
                />

                <ActionButtons
                  item={tour}
                  isInWishlist={isInWishlist(tour.id)}
                  isInCart={isInCart(tour.id)}
                  onWishlistClick={toggleWishlist}
                  onCartClick={toggleCart}
                />

                <div className="tour-price">{tour.price}</div>
                <div className="tour-rating">
                  <svg className="star-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>{tour.rating}</span>
                </div>
                <div className="tour-type-badge">
                  {tour.type.charAt(0).toUpperCase() + tour.type.slice(1)}
                </div>
                {tour.category && tour.category !== "general" && (
                  <div className="tour-category-badge">
                    {tour.category}
                  </div>
                )}
              </div>

              <div className="tour-info">
                <div className="tour-header-info">
                  <span className="tour-days">{tour.days}</span>
                  <span className="tour-country-code">{tour.category || tour.countryCode}</span>
                </div>
                <h3>{tour.title}</h3>
                <p className="tour-location">{tour.location}</p>

                <div className="tour-meta">
                  {tour.meta.map((item, index) => (
                    <span key={`${tour.id}-${index}`}>{item}</span>
                  ))}
                </div>

                <p className="tour-description">
                  {tour.description.length > 100
                    ? tour.description.substring(0, 100) + "..."
                    : tour.description}
                </p>

                <div className="tour-actions">
                  <button
                    className="tour-details-btn"
                    onClick={(e) => handleViewDetails(e, tour)}
                  >
                    View Details
                  </button>
                  <button
                    className="tour-book-btn"
                    onClick={(e) => handleBookNow(e, tour)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-tours-found">
            <svg className="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <h3>No tours found</h3>
            <p>Try changing your filter criteria</p>
            <button className="reset-filters-btn" onClick={resetFilters}>
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* View All Button */}
      <div className="container">
        <div className="d-flex justify-content-end py-5">
          <button className="view-all-btn" onClick={handleToggleViewAll}>
            {showAll ? "Show Fewer Packages" : "View All Packages ->"}
          </button>
        </div>
      </div>
    </section>
  );
}
