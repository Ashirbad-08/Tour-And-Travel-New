import { useState, useEffect } from "react";
import BlogHero from "../components/BlogComponents/BlogHero";
import BlogCard from "../components/BlogComponents/BlogCard";
import Sidebar from "../components/BlogComponents/Sidebar";
import "./Blog.css";
import { apiUrl } from "../utils/api";

const Blog = () => {
  const [blogData, setBlogData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(apiUrl('blog/posts'));
        const json = await res.json();
        const posts = json?.data?.posts || [];
        // Map backend shape to the component's expected shape
        const mapped = posts.map((post) => ({
          id: post._id,
          image: post.featured_image?.url || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
          title: post.title,
          date: post.published_at
            ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : '',
          author: post.author?.name || 'Admin',
          desc: post.excerpt || '',
          slug: post.slug,
        }));
        setBlogData(mapped);
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <>
      <BlogHero />

      <section className="blog-wrapper">
        <div className="blog-content">
          <div className="blog-list">
            {loading ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Loading blog posts...</p>
            ) : blogData.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No blog posts found.</p>
            ) : (
              blogData.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))
            )}
          </div>
          <div className="sidebar">
          <Sidebar />
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;
