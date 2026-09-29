import { useParams, useLocation, Link } from "react-router-dom";
import { getGroupedDestinations } from "../data/destinations";
import Instagram from "../components/Instagram";
import Newsletter from "../components/Newsletter";
import "../CSS/Categorypage.css";
import ActionButtons from "../components/ActionButtons";
import { useWishlistCart } from "../hooks/useWishlistCart";

// Category configuration
const categoryConfig = {
    beaches: {
        title: "Beaches",
        banner: "/images/categories/Beaches.png"
    },
    "bucket-list": {
        title: "Bucket List",
        banner: "/images/categories/Bucketlist.png"
    },
    bucketlist: {
        title: "Bucket List",
        banner: "/images/categories/Bucketlist.png"
    },
    hiking: {
        title: "Hiking",
        banner: "/images/categories/Hiking.png"
    },
    waterfalls: {
        title: "Waterfalls",
        banner: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80"
    },
    volcanoes: {
        title: "Volcanoes",
        banner: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80"
    },
    monuments: {
        title: "Monuments",
        banner: "https://images.unsplash.com/photo-1548013146-72479768bada"
    }
};

export default function CategoryPage() {
    const { category } = useParams();
    const location = useLocation();

    const {
        isInWishlist,
        toggleWishlist,
        isInCart,
        toggleCart
    } = useWishlistCart();

    // Determine category from URL - either from params or from pathname
    let currentCategory = category;
    if (!currentCategory) {
        const path = location.pathname.replace(/^\//, '');
        currentCategory = path;
    }

    // Convert bucket-list to bucketlist for data lookup
    const dataCategory = currentCategory === "bucket-list" ? "bucketlist" : currentCategory;

    const sections = getGroupedDestinations(dataCategory);
    const config = categoryConfig[currentCategory] || { title: "Destinations", banner: "" };

    return (
        <>
            {/* BANNER */}
            <section
                className="category-banner"
                style={{ backgroundImage: `url(${config.banner})` }}
            >
                <div className="category-banner-overlay">
                    <h1>{config.title}</h1>
                </div>
            </section>

            {/* CONTENT */}
            <section className="category-content">
                {sections.map((group, i) => (
                    <div className="category-grid" key={i}>
                        {group.map((item) => (
                            <Link
                                to={`/destination/${item.id}`}
                                className="category-card-link"
                                key={item.id}
                            >
                                <div className="category-card">
                                    <div className="category-card-image">
                                        <img src={item.image} alt={item.title} />

                                        <ActionButtons
                                            item={item}
                                            isInWishlist={isInWishlist(item.id)}
                                            isInCart={isInCart(item.id)}
                                            onWishlistClick={toggleWishlist}
                                            onCartClick={toggleCart}
                                            className="category-actions"
                                        />
                                    </div>
                                    <div className="category-card-content">
                                        <p className="category-card-meta">{item.category}</p>
                                        <h4 className="category-card-title">{item.title}</h4>
                                        <span className="category-title-line"></span>
                                        <p className="category-card-desc">{item.description}</p>
                                        <button className="category-read-more">READ MORE »</button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ))}

                {/* PAGINATION */}
                <div className="category-pagination">
                    <span className="pagination-page active">1</span>
                    <span className="pagination-page">2</span>
                    <span className="pagination-page">3</span>
                    <span className="pagination-page">…</span>
                    <span className="pagination-page">6</span>
                    <span className="pagination-page next">›</span>
                </div>

                <Instagram />
                <Newsletter />
            </section>
        </>
    );
}