import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import BookingForm from "../components/Booking/BookingForm";
import "../CSS/PackageDetails.css";

export default function PackageDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadPackage = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/packages/${id}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Unable to fetch package details");
        }
        const result = await response.json();
        if (isMounted) {
          setPkg(result?.data || null);
        }
      } catch (err) {
        if (isMounted) {
          setError("We could not load this package right now. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPackage();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  const packageDestination = useMemo(() => {
    if (!pkg) return null;
    return {
      title: pkg.title || "Tour Package",
      content: {
        price: pkg.price ? `$${pkg.price}` : "$0",
        duration: `${pkg.durationDays || 1} Days / ${pkg.durationNights || 0} Nights`,
        location: pkg.destination || "Unknown Destination"
      },
      description: pkg.description || ""
    };
  }, [pkg]);

  useEffect(() => {
    if (location.state?.openBooking && packageDestination) {
      const modal = document.getElementById("bookingModal");
      if (modal && typeof modal.showModal === "function") {
        modal.showModal();
      }
    }
  }, [location.state, packageDestination]);

  const handleBookingComplete = (bookingData) => {
    setBookingEmail(bookingData.email);
    const modal = document.getElementById("bookingModal");
    if (modal && typeof modal.close === "function") {
      modal.close();
    }
  };

  if (loading) {
    return (
      <div className="package-details-page">
        <div className="package-details-card">
          <div className="package-loading">Loading package details...</div>
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="package-details-page">
        <div className="package-details-card">
          <div className="package-error">
            <h2>Package unavailable</h2>
            <p>{error || "This package could not be found."}</p>
            <Link to="/" className="package-link">Return to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="package-details-page">
      <div className="package-details-card">
        <div className="package-hero">
          <div className="package-hero-image">
            <img
              src={pkg.thumbnailImage}
              alt={pkg.title}
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
              }}
            />
          </div>
          <div className="package-hero-content">
            <div className="package-breadcrumbs">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/destinations">Destinations</Link>
              <span>/</span>
              <span>{pkg.title}</span>
            </div>

            <h1>{pkg.title}</h1>
            <p className="package-location">{pkg.destination}</p>

            <div className="package-stats">
              <div className="package-stat">
                <span className="stat-label">Duration</span>
                <span className="stat-value">{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
              </div>
              <div className="package-stat">
                <span className="stat-label">Category</span>
                <span className="stat-value">{pkg.category}</span>
              </div>
              <div className="package-stat">
                <span className="stat-label">Max Guests</span>
                <span className="stat-value">{pkg.maxPerson}</span>
              </div>
            </div>

            <div className="package-price">From ${pkg.price?.toLocaleString() || "0"} per person</div>

            {pkg.description && (
              <p className="package-description">{pkg.description}</p>
            )}
          </div>
        </div>

        <div className="package-body">
          <div className="package-overview">
            <h2>Package Overview</h2>
            <p>
              {pkg.description ||
                "This package blends comfort, culture, and curated experiences for a memorable trip."}
            </p>

            <div className="package-lists">
              <div>
                <h3>Included</h3>
                <ul>
                  {(pkg.includes || []).length > 0
                    ? pkg.includes.map((item, index) => (
                      <li key={`include-${index}`}>{item}</li>
                    ))
                    : ["Guided experiences", "Selected meals", "Local transfers"].map((item, index) => (
                      <li key={`include-fallback-${index}`}>{item}</li>
                    ))}
                </ul>
              </div>
              <div>
                <h3>Not Included</h3>
                <ul>
                  {(pkg.excludes || []).length > 0
                    ? pkg.excludes.map((item, index) => (
                      <li key={`exclude-${index}`}>{item}</li>
                    ))
                    : ["Flights", "Personal expenses", "Travel insurance"].map((item, index) => (
                      <li key={`exclude-fallback-${index}`}>{item}</li>
                    ))}
                </ul>
              </div>
            </div>

            {bookingEmail && (
              <div className="package-confirmation">
                Confirmation details sent to {bookingEmail}
              </div>
            )}
          </div>

          <div className="package-booking">
            {packageDestination && (
              <BookingForm
                destination={packageDestination}
                onBookingComplete={handleBookingComplete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
