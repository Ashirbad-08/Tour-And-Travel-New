import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import {
  FiFileText, FiGrid, FiTag, FiSettings, FiPlus, FiSearch,
  FiEye, FiStar, FiEdit2, FiTrash2, FiMenu, FiX, FiImage,
  FiGlobe, FiCheck, FiChevronUp, FiChevronDown, FiArrowLeft,
  FiHome, FiExternalLink, FiUpload,
} from 'react-icons/fi';
import {
  POST_STATUS, MOCK_CATEGORIES, MOCK_AUTHORS,
  INITIAL_FORM_DATA, INITIAL_CATEGORY_FORM,
  slugify, formatDate, simpleMarkdownToHtml
} from './BlogData';
import api from '../utils/api';
import '../styles/Blog.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const sparkOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: { x: { display: false }, y: { display: false } },
  elements: { point: { radius: 0 }, line: { tension: 0.45, borderWidth: 2.5 } },
};

const lineOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', align: 'end', labels: { usePointStyle: true, padding: 20, boxWidth: 8, color: '#6b7280', font: { family: 'Inter' } } },
    tooltip: { backgroundColor: '#ffffff', titleColor: '#111827', bodyColor: '#4b5563', padding: 12, displayColors: false, borderColor: '#e5e7eb', borderWidth: 1, cornerRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  },
  interaction: { intersect: false, mode: 'index' },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 11, family: 'Inter' } } },
    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#9ca3af', font: { size: 11, family: 'Inter' } } },
  },
};

const donutOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15, boxWidth: 8, color: '#6b7280', font: { family: 'Inter', size: 12 } } },
    tooltip: { backgroundColor: '#ffffff', titleColor: '#111827', bodyColor: '#4b5563', padding: 10, displayColors: false, borderColor: '#e5e7eb', borderWidth: 1, cornerRadius: 8 },
  },
  cutout: '72%',
};

const BlogAdminPanel = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState('write');
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [catForm, setCatForm] = useState(INITIAL_CATEGORY_FORM);
  const [editingCat, setEditingCat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ siteTitle: 'Pacific Travel Blog', postsPerPage: 8, defaultStatus: POST_STATUS.DRAFT, commentsEnabled: true, moderateComments: true });

  const perPage = 8;

  // Fetch posts from backend API
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/blog/posts', { params: { limit: 100 } });
      const data = res.data?.data?.posts || res.data?.posts || [];
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories from backend API
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/admin/blog/categories');
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [fetchPosts, fetchCategories]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Stats for dashboard
  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter(p => p.status === POST_STATUS.PUBLISHED).length;
    const drafts = posts.filter(p => p.status === POST_STATUS.DRAFT).length;
    const totalViews = posts.reduce((s, p) => s + (p.view_count || 0), 0);
    return { total, published, drafts, totalViews };
  }, [posts]);

  // Filtered & sorted posts
  const processed = useMemo(() => {
    let list = [...posts];
    if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.includes(q)))
      );
    }
    list.sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (sortField === 'title') { av = av?.toLowerCase(); bv = bv?.toLowerCase(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [posts, filterStatus, searchTerm, sortField, sortDir]);

  const totalPages = Math.ceil(processed.length / perPage);
  const paginated = processed.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => sortField === field ? (sortDir === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />) : null;

  // Selection
  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedIds(prev => prev.length === paginated.length ? [] : paginated.map(p => p._id));

  // Form handlers
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleCategoryToggle = (catId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(catId) ? prev.categories.filter(c => c !== catId) : [...prev.categories, catId]
    }));
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(tag) && tag.length <= 50) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          featured_image: { ...prev.featured_image, url: reader.result, alt: file.name.split('.')[0] }
        }));
        showToast('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.title.length < 5) { showToast('Title must be at least 5 characters', 'error'); return; }
    if (!formData.content_markdown) { showToast('Content is required', 'error'); return; }

    setLoading(true);
    try {
      // Generate slug from title
      const slug = slugify(formData.title);
      // Send selected category IDs to backend
      const postData = { ...formData, slug };

      if (selectedPost) {
        await api.put(`/admin/blog/posts/${selectedPost._id}`, postData);
        showToast('Article updated successfully!');
      } else {
        await api.post('/admin/blog/posts', postData);
        showToast('Article created successfully!');
      }
      resetForm();
      setView('posts');
      await fetchPosts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save article';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setSelectedPost(post);
    setFormData({
      title: post.title || '', content_markdown: post.content_markdown || '',
      excerpt: post.excerpt || '', featured_image: post.featured_image || { url: '', alt: '', caption: '', public_id: '' },
      author: post.author || '', categories: post.categories || [],
      tags: post.tags || [], status: post.status || POST_STATUS.DRAFT,
      is_featured: post.is_featured || false, meta_title: post.meta_title || '',
      meta_description: post.meta_description || '', images_in_content: post.images_in_content || [],
    });
    setPreviewMode('write');
    setView('editor');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/blog/posts/${id}`);
      setDeleteDialog(null);
      setSelectedIds(prev => prev.filter(x => x !== id));
      showToast('Article deleted successfully!');
      await fetchPosts();
    } catch (err) {
      showToast('Failed to delete article', 'error');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/admin/blog/posts/${id}`)));
      showToast(`${selectedIds.length} articles deleted`);
      setSelectedIds([]);
      await fetchPosts();
    } catch (err) {
      showToast('Failed to delete some articles', 'error');
    }
  };

  const handleBulkStatus = async (status) => {
    try {
      await Promise.all(selectedIds.map(id => api.put(`/admin/blog/posts/${id}`, { status })));
      showToast(`${selectedIds.length} articles updated to ${status}`);
      setSelectedIds([]);
      await fetchPosts();
    } catch (err) {
      showToast('Failed to update some articles', 'error');
    }
  };

  const resetForm = () => { setFormData(INITIAL_FORM_DATA); setSelectedPost(null); setTagInput(''); setPreviewMode('write'); };

  // Category handlers
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    setLoading(true);
    try {
      if (editingCat) {
        await api.put(`/admin/blog/categories/${editingCat._id}`, catForm);
        showToast('Category updated!');
        setEditingCat(null);
      } else {
        await api.post('/admin/blog/categories', catForm);
        showToast('Category created!');
      }
      setCatForm(INITIAL_CATEGORY_FORM);
      await fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteCat = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/admin/blog/categories/${id}`);
      showToast('Category deleted!');
      await fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete category', 'error');
    }
  };

  // Chart data
  const lineChartData = {
    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    datasets: [
      { label: 'Published', data: [3, 5, 4, 7, 6, 5, 8, 4], borderColor: '#4f46e5', backgroundColor: (ctx) => { const c = ctx.chart; const { ctx: cx, chartArea: a } = c; if (!a) return null; const g = cx.createLinearGradient(0, a.top, 0, a.bottom); g.addColorStop(0, 'rgba(79,70,229,0.15)'); g.addColorStop(1, 'rgba(79,70,229,0.01)'); return g; }, fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#4f46e5', pointBorderColor: '#fff', pointBorderWidth: 2, pointHoverRadius: 5, borderWidth: 2.5 },
      { label: 'Views (K)', data: [1.2, 2.5, 1.8, 4.2, 3.5, 2.8, 5.1, 3.2], borderColor: '#059669', borderWidth: 2, borderDash: [6, 4], tension: 0.4, pointRadius: 0 },
    ],
  };

  const donutData = {
    labels: ['Published', 'Draft', 'Archived'],
    datasets: [{ data: [stats.published, stats.drafts, posts.filter(p => p.status === POST_STATUS.ARCHIVED).length], backgroundColor: ['#22c55e', '#f59e0b', '#6b7280'], borderWidth: 0, hoverOffset: 6 }],
  };

  const sparkData = (data, color) => ({ labels: data.map((_, i) => i), datasets: [{ data, borderColor: color, backgroundColor: color.replace(')', ',0.1)').replace('rgb', 'rgba'), fill: true }] });

  // Nav items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiGrid /> },
    { id: 'posts', label: 'All Posts', icon: <FiFileText />, badge: posts.length },
    { id: 'editor', label: 'New Article', icon: <FiPlus /> },
    { id: 'categories', label: 'Categories', icon: <FiTag />, badge: categories.length },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> },
  ];

  const viewTitles = { dashboard: ['BLOG', 'Overview of your content'], posts: ['All Posts', `${posts.length} articles total`], editor: [selectedPost ? 'Edit Article' : 'New Article', selectedPost ? `Editing: ${selectedPost.title}` : 'Create a new blog post'], categories: ['Categories', 'Manage blog categories'], settings: ['Settings', 'Configure blog preferences'] };

  const getAuthorName = (id) => MOCK_AUTHORS.find(a => a._id === id)?.name || 'Unknown';

  return (
    <div className="ba-admin-root">
      {/* Main */}
      <main className="ba-main-full">
        <div className="ba-topbar">
          <div className="ba-topbar-left">
            <div className="ba-topbar-title">
              <h1>{viewTitles[view]?.[0]}</h1>
              <p>{viewTitles[view]?.[1]}</p>
            </div>
          </div>

          {/* Top Navigation Tabs */}
          <div className="ba-top-nav">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`ba-tab-item ${view === item.id || (item.id === 'editor' && view === 'editor') ? 'active' : ''}`}
                onClick={() => {
                  if (item.id === 'editor') { resetForm(); }
                  setView(item.id);
                  setPage(1);
                  setSelectedIds([]);
                }}
              >
                <span className="ba-tab-icon">{item.icon}</span>
                {item.label}
                {item.badge !== undefined && <span className="ba-tab-badge">{item.badge}</span>}
              </button>
            ))}
          </div>

          <div className="ba-topbar-actions">
            {view === 'posts' && <button className="ba-btn ba-btn-primary" onClick={() => { resetForm(); setView('editor'); }}><FiPlus size={16} /> New Article</button>}
            {view === 'editor' && <button className="ba-btn ba-btn-ghost" onClick={() => { resetForm(); setView('posts'); }}><FiArrowLeft size={16} /> Back to Posts</button>}
          </div>
        </div>

        <div className="ba-content">

          {/* ═══════════ DASHBOARD ═══════════ */}
          {view === 'dashboard' && (
            <>
              <div className="ba-stats-grid">
                <div className="ba-stat-card accent">
                  <div><div className="ba-stat-label">Total Posts</div><div className="ba-stat-value">{stats.total}</div><div className="ba-stat-change positive">↑ 12%</div></div>
                  <div className="ba-stat-spark"><Line data={sparkData([3, 5, 4, 7, 6, 8, 10], 'rgb(99,102,241)')} options={sparkOpts} /></div>
                </div>
                <div className="ba-stat-card success">
                  <div><div className="ba-stat-label">Published</div><div className="ba-stat-value">{stats.published}</div><div className="ba-stat-change positive">↑ 8%</div></div>
                  <div className="ba-stat-spark"><Line data={sparkData([2, 3, 3, 5, 4, 6, 7], 'rgb(34,197,94)')} options={sparkOpts} /></div>
                </div>
                <div className="ba-stat-card warning">
                  <div><div className="ba-stat-label">Drafts</div><div className="ba-stat-value">{stats.drafts}</div><div className="ba-stat-change negative">↓ 3%</div></div>
                  <div className="ba-stat-spark"><Line data={sparkData([5, 4, 6, 3, 4, 3, 3], 'rgb(245,158,11)')} options={sparkOpts} /></div>
                </div>
                <div className="ba-stat-card info">
                  <div><div className="ba-stat-label">Total Views</div><div className="ba-stat-value">{stats.totalViews.toLocaleString()}</div><div className="ba-stat-change positive">↑ 24%</div></div>
                  <div className="ba-stat-spark"><Line data={sparkData([1.2, 2, 1.5, 3, 2.5, 4, 5], 'rgb(59,130,246)')} options={sparkOpts} /></div>
                </div>
              </div>

              <div className="ba-charts-grid">
                <div className="ba-card"><div className="ba-card-header"><span className="ba-card-title">Content & Traffic Overview</span></div><div className="ba-chart-wrapper"><Line data={lineChartData} options={lineOpts} /></div></div>
                <div className="ba-card"><div className="ba-card-header"><span className="ba-card-title">Post Status</span></div><div className="ba-chart-wrapper"><Doughnut data={donutData} options={donutOpts} /></div></div>
              </div>

              <div className="ba-card">
                <div className="ba-card-header"><span className="ba-card-title">Recent Posts</span><button className="ba-btn ba-btn-ghost ba-btn-sm" onClick={() => setView('posts')}>View All</button></div>
                <ul className="ba-recent-list">
                  {posts.slice(0, 5).map(post => (
                    <li key={post._id} className="ba-recent-item" onClick={() => handleEdit(post)}>
                      <div className="ba-recent-thumb">
                        {post.featured_image?.url ? <img src={post.featured_image.url} alt={post.featured_image.alt || ''} /> : <FiImage />}
                      </div>
                      <div className="ba-recent-info">
                        <div className="ba-recent-title">{post.title}</div>
                        <div className="ba-recent-meta">{getAuthorName(post.author)} · {formatDate(post.published_at || post.createdAt)} · {post.view_count.toLocaleString()} views</div>
                      </div>
                      <span className={`ba-status-badge ${post.status}`}><span className="ba-status-dot" />{post.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* ═══════════ ALL POSTS ═══════════ */}
          {view === 'posts' && (
            <div className="ba-card" style={{ padding: 0 }}>
              <div style={{ padding: '1.5rem 1.5rem 0' }}>
                {selectedIds.length > 0 && (
                  <div className="ba-bulk-bar">
                    <span className="ba-bulk-count">{selectedIds.length} selected</span>
                    <button className="ba-btn ba-btn-sm ba-btn-success" onClick={() => handleBulkStatus(POST_STATUS.PUBLISHED)}><FiCheck size={14} /> Publish</button>
                    <button className="ba-btn ba-btn-sm ba-btn-ghost" onClick={() => handleBulkStatus(POST_STATUS.DRAFT)}>Set Draft</button>
                    <button className="ba-btn ba-btn-sm ba-btn-danger" onClick={handleBulkDelete}><FiTrash2 size={14} /> Delete</button>
                    <button className="ba-btn ba-btn-sm ba-btn-ghost" onClick={() => setSelectedIds([])}>Cancel</button>
                  </div>
                )}
                <div className="ba-toolbar">
                  <div className="ba-toolbar-left">
                    <div className="ba-search-box"><FiSearch className="ba-search-icon" /><input placeholder="Search posts..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} /></div>
                    <div className="ba-filter-pills">
                      {['all', POST_STATUS.PUBLISHED, POST_STATUS.DRAFT, POST_STATUS.ARCHIVED].map(s => (
                        <button key={s} className={`ba-filter-pill ${filterStatus === s ? 'active' : ''}`} onClick={() => { setFilterStatus(s); setPage(1); }}>{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="ba-table-container">
                <table className="ba-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}><input type="checkbox" className="ba-checkbox" checked={paginated.length > 0 && selectedIds.length === paginated.length} onChange={toggleSelectAll} /></th>
                      <th onClick={() => toggleSort('title')} className={sortField === 'title' ? 'sorted' : ''}>Title <SortIcon field="title" /></th>
                      <th>Status</th>
                      <th onClick={() => toggleSort('view_count')} className={sortField === 'view_count' ? 'sorted' : ''}>Views <SortIcon field="view_count" /></th>
                      <th>Author</th>
                      <th onClick={() => toggleSort('createdAt')} className={sortField === 'createdAt' ? 'sorted' : ''}>Date <SortIcon field="createdAt" /></th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr><td colSpan="8"><div className="ba-empty-state"><div className="ba-empty-icon">📝</div><h3>No articles found</h3><p>Try adjusting your search or filters</p></div></td></tr>
                    ) : paginated.map(post => (
                      <tr key={post._id}>
                        <td data-label="Select"><input type="checkbox" className="ba-checkbox" checked={selectedIds.includes(post._id)} onChange={() => toggleSelect(post._id)} /></td>
                        <td data-label="Title">
                          <div className="ba-post-cell">
                            <span className="ba-post-cell-title">{post.title}</span>
                            {post.excerpt && <span className="ba-post-cell-excerpt">{post.excerpt}</span>}
                            <span className="ba-post-cell-slug">/{post.slug}</span>
                            {post.tags?.length > 0 && <div className="ba-tags-row">{post.tags.slice(0, 3).map(t => <span key={t} className="ba-tag-pill">{t}</span>)}{post.tags.length > 3 && <span className="ba-tag-pill">+{post.tags.length - 3}</span>}</div>}
                          </div>
                        </td>
                        <td data-label="Status"><span className={`ba-status-badge ${post.status}`}><span className="ba-status-dot" />{post.status}</span></td>
                        <td data-label="Views"><span className="ba-view-count"><FiEye size={14} />{post.view_count.toLocaleString()}</span></td>
                        <td data-label="Author" style={{ fontSize: '0.82rem', color: '#9ca3af' }}>{getAuthorName(post.author)}</td>
                        <td data-label="Date" style={{ fontSize: '0.82rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>{formatDate(post.published_at || post.createdAt)}</td>
                        <td data-label="Featured">{post.is_featured && <span className="ba-featured-star"><FiStar fill="#f59e0b" /></span>}</td>
                        <td data-label="Actions">
                          <div className="ba-actions-cell">
                            <button className="ba-action-btn ba-action-edit" onClick={() => handleEdit(post)}><FiEdit2 size={13} /></button>
                            <button className="ba-action-btn ba-action-delete" onClick={() => setDeleteDialog(post._id)}><FiTrash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="ba-pagination" style={{ padding: '0 1.5rem 1.25rem' }}>
                  <span className="ba-pagination-info">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, processed.length)} of {processed.length}</span>
                  <div className="ba-pagination-btns">
                    <button className="ba-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => <button key={n} className={`ba-page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>)}
                    <button className="ba-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ EDITOR ═══════════ */}
          {view === 'editor' && (
            <form onSubmit={handleSubmit}>
              <div className="ba-form-grid">
                <div className="ba-form-main">
                  {/* Title */}
                  <div className="ba-form-section">
                    <input type="text" name="title" className="ba-input ba-input-title" value={formData.title} onChange={handleInput} placeholder="Article title..." required minLength={5} maxLength={200} />
                    <div className="ba-char-count" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="ba-slug-preview">Slug: <span>/{slugify(formData.title) || '...'}</span></span>
                      <span className={formData.title.length > 180 ? (formData.title.length > 195 ? 'at-limit' : 'near-limit') : ''}>{formData.title.length}/200</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="ba-form-section">
                    <div className="ba-form-section-title"><FiFileText className="icon" /> Content</div>
                    <div className="ba-preview-toggle">
                      <button type="button" className={`ba-preview-tab ${previewMode === 'write' ? 'active' : ''}`} onClick={() => setPreviewMode('write')}>✏️ Write</button>
                      <button type="button" className={`ba-preview-tab ${previewMode === 'preview' ? 'active' : ''}`} onClick={() => setPreviewMode('preview')}>👁️ Preview</button>
                    </div>
                    {previewMode === 'write' ? (
                      <textarea name="content_markdown" className="ba-textarea ba-textarea-content" value={formData.content_markdown} onChange={handleInput} placeholder="Write your content in markdown..." required />
                    ) : (
                      <div className="ba-markdown-preview" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(formData.content_markdown) }} />
                    )}
                  </div>

                  {/* Excerpt */}
                  <div className="ba-form-section">
                    <div className="ba-form-section-title">Excerpt</div>
                    <textarea name="excerpt" className="ba-textarea ba-textarea-sm" value={formData.excerpt} onChange={handleInput} placeholder="Brief summary..." maxLength={300} rows={3} />
                    <div className={`ba-char-count ${formData.excerpt.length > 270 ? (formData.excerpt.length > 290 ? 'at-limit' : 'near-limit') : ''}`}>{formData.excerpt.length}/300</div>
                  </div>

                  {/* SEO */}
                  <div className="ba-form-section">
                    <div className="ba-form-section-title"><FiGlobe className="icon" /> SEO Settings</div>
                    <div className="ba-form-group">
                      <label className="ba-label">Meta Title</label>
                      <input type="text" name="meta_title" className="ba-input" value={formData.meta_title} onChange={handleInput} placeholder="SEO title..." maxLength={70} />
                      <div className={`ba-char-count ${formData.meta_title.length > 60 ? 'near-limit' : ''}`}>{formData.meta_title.length}/70</div>
                    </div>
                    <div className="ba-form-group">
                      <label className="ba-label">Meta Description</label>
                      <textarea name="meta_description" className="ba-textarea ba-textarea-sm" value={formData.meta_description} onChange={handleInput} placeholder="SEO description..." maxLength={160} rows={2} />
                      <div className={`ba-char-count ${formData.meta_description.length > 140 ? 'near-limit' : ''}`}>{formData.meta_description.length}/160</div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="ba-form-sidebar">
                  {/* Publish */}
                  <div className="ba-form-section">
                    <div className="ba-form-section-title">Publish</div>
                    <div className="ba-form-group">
                      <label className="ba-label">Status</label>
                      <select name="status" className="ba-select" value={formData.status} onChange={handleInput}>
                        <option value={POST_STATUS.DRAFT}>Draft</option>
                        <option value={POST_STATUS.PUBLISHED}>Published</option>
                        <option value={POST_STATUS.ARCHIVED}>Archived</option>
                      </select>
                    </div>
                    <div className="ba-form-group">
                      <label className="ba-label">Author</label>
                      <select name="author" className="ba-select" value={formData.author} onChange={handleInput}>
                        <option value="">Select author...</option>
                        {MOCK_AUTHORS.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div className="ba-toggle-group">
                      <span className="ba-toggle-label">Featured Article</span>
                      <label className="ba-toggle"><input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleInput} /><span className="ba-toggle-track" /></label>
                    </div>
                    <div className="ba-form-actions">
                      <button type="submit" className="ba-btn ba-btn-publish">{selectedPost ? '✓ Update Article' : '🚀 Publish'}</button>
                    </div>
                    <div className="ba-form-actions">
                      <button type="button" className="ba-btn ba-btn-draft" onClick={() => { setFormData(prev => ({ ...prev, status: POST_STATUS.DRAFT })); document.querySelector('form')?.requestSubmit(); }}>Save as Draft</button>
                    </div>
                  </div>

                  {/* Featured Image */}
                  <div className="ba-form-section">
                    <div className="ba-form-section-title"><FiImage className="icon" /> Featured Image</div>
                    <div className="ba-form-group">
                      <label className="ba-label">Upload Image</label>
                      <div className="ba-image-upload-wrapper">
                        <label htmlFor="featured-image-upload" className="ba-image-drop">
                          <FiUpload className="ba-image-drop-icon" />
                          <p>Click or drag image here to upload</p>
                          <span className="ba-sub-text">Supports JPG, PNG, WEBP (Max 5MB)</span>
                        </label>
                        <input
                          id="featured-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                      </div>
                      <div className="ba-separator"><span>OR</span></div>
                      <input type="url" name="featured_image.url" className="ba-input" value={formData.featured_image.url} onChange={handleInput} placeholder="Enter image URL..." />
                    </div>
                    {formData.featured_image.url && (
                      <div className="ba-image-preview">
                        <img src={formData.featured_image.url} alt="Preview" onError={e => e.target.style.display = 'none'} />
                        <button type="button" className="ba-image-preview-remove" onClick={() => setFormData(prev => ({ ...prev, featured_image: { ...prev.featured_image, url: '' } }))}>×</button>
                      </div>
                    )}
                    <div className="ba-form-group" style={{ marginTop: '0.75rem' }}>
                      <label className="ba-label">Alt Text</label>
                      <input type="text" name="featured_image.alt" className="ba-input" value={formData.featured_image.alt} onChange={handleInput} placeholder="Describe the image..." maxLength={125} />
                      <div className="ba-char-count">{formData.featured_image.alt.length}/125</div>
                    </div>
                    <div className="ba-form-group">
                      <label className="ba-label">Caption</label>
                      <input type="text" name="featured_image.caption" className="ba-input" value={formData.featured_image.caption} onChange={handleInput} placeholder="Image caption..." />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="ba-form-section">
                    <div className="ba-form-section-title"><FiTag className="icon" /> Categories</div>
                    <div className="ba-cat-list">
                      {categories.map(cat => (
                        <label key={cat._id} className="ba-cat-item">
                          <input type="checkbox" checked={formData.categories.includes(cat._id)} onChange={() => handleCategoryToggle(cat._id)} />
                          {cat.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="ba-form-section">
                    <div className="ba-form-section-title">Tags</div>
                    <div className="ba-tags-chips">
                      {formData.tags.map(tag => (
                        <span key={tag} className="ba-tag-chip">{tag}<button type="button" className="ba-tag-chip-remove" onClick={() => removeTag(tag)}>×</button></span>
                      ))}
                    </div>
                    <input type="text" className="ba-input" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Type and press Enter..." maxLength={50} />
                    <span className="ba-hint">Press Enter to add a tag (max 50 chars each)</span>
                  </div>

                  {/* Content Images */}
                  {formData.images_in_content?.length > 0 && (
                    <div className="ba-form-section">
                      <div className="ba-form-section-title"><FiImage className="icon" /> Content Images</div>
                      <div className="ba-content-images">
                        {formData.images_in_content.map((img, i) => (
                          <div key={i} className="ba-content-image-item">
                            <img src={img.url} alt={img.alt || `Image ${i + 1}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* ═══════════ CATEGORIES ═══════════ */}
          {view === 'categories' && (
            <div className="ba-category-grid">
              <div className="ba-card">
                <div className="ba-card-header"><span className="ba-card-title">{editingCat ? 'Edit Category' : 'Add Category'}</span></div>
                <form onSubmit={handleCatSubmit} className="ba-category-form">
                  <div className="ba-form-group"><label className="ba-label">Name</label><input className="ba-input" value={catForm.name} onChange={e => setCatForm(prev => ({ ...prev, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="Category name..." required /></div>
                  <div className="ba-form-group"><label className="ba-label">Slug</label><input className="ba-input" value={catForm.slug} onChange={e => setCatForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="category-slug" /></div>
                  <div className="ba-form-group"><label className="ba-label">Description</label><textarea className="ba-textarea ba-textarea-sm" value={catForm.description} onChange={e => setCatForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Brief description..." rows={2} /></div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="ba-btn ba-btn-primary">{editingCat ? 'Update' : 'Add Category'}</button>
                    {editingCat && <button type="button" className="ba-btn ba-btn-ghost" onClick={() => { setEditingCat(null); setCatForm(INITIAL_CATEGORY_FORM); }}>Cancel</button>}
                  </div>
                </form>
              </div>
              <div className="ba-card">
                <div className="ba-card-header"><span className="ba-card-title">All Categories</span></div>
                <div className="ba-table-container" style={{ border: 'none' }}>
                  <table className="ba-table ba-category-list-table">
                    <thead><tr><th>Name</th><th>Slug</th><th>Posts</th><th>Actions</th></tr></thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr key={cat._id}>
                          <td style={{ fontWeight: 600 }}>{cat.name}</td>
                          <td><span className="ba-post-cell-slug">/{cat.slug}</span></td>
                          <td><span className="ba-cat-count">{cat.postCount}</span></td>
                          <td>
                            <div className="ba-actions-cell">
                              <button className="ba-action-btn ba-action-edit" onClick={() => { setEditingCat(cat); setCatForm({ name: cat.name, slug: cat.slug, description: cat.description }); }}><FiEdit2 size={13} /></button>
                              <button className="ba-action-btn ba-action-delete" onClick={() => deleteCat(cat._id)}><FiTrash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ SETTINGS ═══════════ */}
          {view === 'settings' && (
            <div className="ba-settings-grid">
              <div className="ba-card">
                <div className="ba-card-header"><span className="ba-card-title">General Settings</span></div>
                <div className="ba-form-group"><label className="ba-label">Blog Title</label><input className="ba-input" value={settings.siteTitle} onChange={e => setSettings(prev => ({ ...prev, siteTitle: e.target.value }))} /></div>
                <div className="ba-form-group"><label className="ba-label">Posts Per Page</label><input type="number" className="ba-input" value={settings.postsPerPage} onChange={e => setSettings(prev => ({ ...prev, postsPerPage: parseInt(e.target.value) || 8 }))} min={1} max={50} /></div>
                <div className="ba-form-group"><label className="ba-label">Default Post Status</label>
                  <select className="ba-select" value={settings.defaultStatus} onChange={e => setSettings(prev => ({ ...prev, defaultStatus: e.target.value }))}>
                    <option value={POST_STATUS.DRAFT}>Draft</option>
                    <option value={POST_STATUS.PUBLISHED}>Published</option>
                  </select>
                </div>
                <button className="ba-btn ba-btn-primary" onClick={() => showToast('Settings saved!')} style={{ marginTop: '1rem' }}>Save Settings</button>
              </div>
              <div className="ba-card">
                <div className="ba-card-header"><span className="ba-card-title">Comment Settings</span></div>
                <div className="ba-toggle-group"><span className="ba-toggle-label">Enable Comments</span><label className="ba-toggle"><input type="checkbox" checked={settings.commentsEnabled} onChange={e => setSettings(prev => ({ ...prev, commentsEnabled: e.target.checked }))} /><span className="ba-toggle-track" /></label></div>
                <div className="ba-toggle-group"><span className="ba-toggle-label">Moderate Before Publishing</span><label className="ba-toggle"><input type="checkbox" checked={settings.moderateComments} onChange={e => setSettings(prev => ({ ...prev, moderateComments: e.target.checked }))} /><span className="ba-toggle-track" /></label></div>
                <button className="ba-btn ba-btn-primary" onClick={() => showToast('Comment settings saved!')} style={{ marginTop: '1rem' }}>Save</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation */}
      {deleteDialog && (
        <div className="ba-dialog-overlay" onClick={() => setDeleteDialog(null)}>
          <div className="ba-dialog" onClick={e => e.stopPropagation()}>
            <h3>Delete Article?</h3>
            <p>This action cannot be undone. The article will be permanently removed.</p>
            <div className="ba-dialog-actions">
              <button className="ba-btn ba-btn-ghost" onClick={() => setDeleteDialog(null)}>Cancel</button>
              <button className="ba-btn ba-btn-danger" onClick={() => handleDelete(deleteDialog)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`ba-toast ${toast.type}`}>{toast.type === 'success' ? '✓' : '✕'} {toast.msg}</div>}
    </div>
  );
};

export default BlogAdminPanel;
