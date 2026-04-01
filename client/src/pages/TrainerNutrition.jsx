import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { Plus, Pencil, Trash2, X, Search, Salad } from 'lucide-react';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Post-Workout'];
const DIET_PREFS = ['Non-Vegetarian', 'Vegetarian', 'Vegan'];

const MEAL_COLORS = {
    Breakfast: '#f59e0b',
    Lunch: '#10b981',
    Dinner: '#6366f1',
    Snack: '#f97316',
    'Post-Workout': '#3b82f6'
};

const PREF_COLORS = {
    'Non-Vegetarian': '#ef4444',
    Vegetarian: '#22c55e',
    Vegan: '#84cc16'
};

const EMPTY_FORM = { name: '', mealType: [], dietPref: [], calories: '', description: '' };

const Modal = ({ title, form, setForm, onSave, onClose, saving }) => {
    const inputStyle = {
        width: '100%', padding: '11px 14px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        color: 'var(--text-primary)', borderRadius: 'var(--radius-md)',
        fontSize: '0.92rem', fontFamily: 'Inter, sans-serif', outline: 'none',
        boxSizing: 'border-box'
    };
    const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
                style={{ background: 'var(--bg-2)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '520px', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>{title}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={22} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={labelStyle}>Meal Name</label>
                        <input style={inputStyle} placeholder="e.g. Grilled Chicken Salad" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Meal Type</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {MEAL_TYPES.map(m => (
                                    <button key={m} type="button" onClick={() => setForm(f => ({ ...f, mealType: f.mealType?.includes(m) ? f.mealType.filter(x => x !== m) : [...(f.mealType || []), m] }))}
                                        style={{ padding: '6px 12px', borderRadius: '4px', background: form.mealType?.includes(m) ? 'var(--text-primary)' : 'var(--surface)', color: form.mealType?.includes(m) ? 'var(--bg)' : 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Diet Preference</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {DIET_PREFS.map(d => (
                                    <button key={d} type="button" onClick={() => setForm(f => ({ ...f, dietPref: f.dietPref?.includes(d) ? f.dietPref.filter(x => x !== d) : [...(f.dietPref || []), d] }))}
                                        style={{ padding: '6px 12px', borderRadius: '4px', background: form.dietPref?.includes(d) ? 'var(--text-primary)' : 'var(--surface)', color: form.dietPref?.includes(d) ? 'var(--bg)' : 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Calories (kcal)</label>
                        <input style={inputStyle} type="number" min="0" placeholder="e.g. 450" value={form.calories}
                            onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} />
                    </div>
                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '90px' }} placeholder="Brief description of this meal…" value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600 }}>Cancel</button>
                    <button onClick={onSave} disabled={saving}
                        style={{ flex: 2, padding: '12px', background: 'var(--text-primary)', border: 'none', borderRadius: 'var(--radius-md)', cursor: saving ? 'not-allowed' : 'pointer', color: 'var(--bg)', fontWeight: 700, fontSize: '0.95rem' }}>
                        {saving ? 'Saving…' : 'Save Meal'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const TrainerNutrition = () => {
    const { user } = useContext(AuthContext);
    const getToken = () => localStorage.getItem('token');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterMeal, setFilterMeal] = useState('All');
    const [filterPref, setFilterPref] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast] = useState('');

    const headers = () => ({ 'x-auth-token': getToken() });

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const fetchItems = async (pg = 1) => {
        setLoading(true);
        try {
            const res = await axios.get('/api/dietdb', {
                headers: headers(),
                params: { page: pg, limit: 18, search: search.trim() || undefined, mealType: filterMeal !== 'All' ? filterMeal : undefined, dietPref: filterPref !== 'All' ? filterPref : undefined }
            });
            setItems(res.data.data);
            setTotalPages(res.data.meta.pages);
            setTotal(res.data.meta.total);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchItems(page); }, [page, filterMeal, filterPref]);
    useEffect(() => {
        const t = setTimeout(() => { setPage(1); fetchItems(1); }, 500);
        return () => clearTimeout(t);
    }, [search]);

    const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setModal('add'); };
    const openEdit = (item) => { setForm({ name: item.name, mealType: Array.isArray(item.mealType) ? item.mealType : [item.mealType], dietPref: Array.isArray(item.dietPref) ? item.dietPref : [item.dietPref], calories: item.calories, description: item.description }); setEditingId(item._id); setModal('edit'); };

    const handleSave = async () => {
        if (!form.name || !form.calories || !form.description) return;
        setSaving(true);
        try {
            const payload = { ...form, calories: Number(form.calories) };
            if (modal === 'add') {
                const res = await axios.post('/api/dietdb', payload, { headers: headers() });
                setItems(p => [res.data, ...p]);
                showToast('Meal added ✓');
            } else {
                const res = await axios.put(`/api/dietdb/${editingId}`, payload, { headers: headers() });
                setItems(p => p.map(i => i._id === editingId ? res.data : i));
                showToast('Meal updated ✓');
            }
            setModal(null);
        } catch (err) { showToast(err.response?.data?.msg || 'Error saving'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/dietdb/${deleteTarget}`, { headers: headers() });
            setItems(p => p.filter(i => i._id !== deleteTarget));
            showToast('Meal deleted');
            setDeleteTarget(null);
        } catch { showToast('Delete failed'); }
    };

    return (
        <div style={{ position: 'relative', padding: '48px 24px', minHeight: 'calc(100vh - 80px)' }}>
            <div className="animated-grid-bg" />
            <div className="orb orb-orange" style={{ width: '400px', height: '400px', top: '5%', right: '-5%', opacity: 0.1 }} />

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: '90px', right: '24px', zIndex: 3000, background: 'var(--text-primary)', color: 'var(--bg)', padding: '12px 20px', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="section-eyebrow">Trainer Tools</div>
                        <h1 className="section-title">Nutrition Database</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.95rem' }}>
                            {total} meals in the database — add, edit or remove anytime.
                        </p>
                    </motion.div>
                    <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="btn btn-primary" onClick={openAdd}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', width: 'auto' }}>
                        <Plus size={18} /> Add Meal
                    </motion.button>
                </div>

                {/* Filters */}
                <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '28px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1 1 260px', position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                        <input className="form-input" style={{ paddingLeft: '40px' }} placeholder="Search meals…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div style={{ flex: '0 1 180px' }}>
                        <select className="form-input" value={filterMeal} onChange={e => { setFilterMeal(e.target.value); setPage(1); }}>
                            <option value="All">All Meal Types</option>
                            {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: '0 1 180px' }}>
                        <select className="form-input" value={filterPref} onChange={e => { setFilterPref(e.target.value); setPage(1); }}>
                            <option value="All">All Preferences</option>
                            {DIET_PREFS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                {/* Cards Grid */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
                        <div className="spinner" />
                        <span style={{ color: 'var(--text-secondary)' }}>Loading meals…</span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                        <Salad size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <h3>No meals found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters or add a new meal.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
                            <AnimatePresence>
                                {items.map((item, i) => (
                                    <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.03 }}
                                        className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
                                        {/* Colored top accent per meal type */}
                                        <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: (Array.isArray(item.mealType) && item.mealType[0] ? MEAL_COLORS[item.mealType[0]] : 'var(--text-primary)'), marginBottom: '16px' }} />

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '8px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)', lineHeight: 1.3 }}>{item.name}</h3>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: (Array.isArray(item.mealType) && item.mealType[0] ? MEAL_COLORS[item.mealType[0]] : 'var(--text-primary)'), whiteSpace: 'nowrap' }}>{item.calories} kcal</span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                            {(Array.isArray(item.mealType) ? item.mealType : [item.mealType]).map(m => m && <span key={m} style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: `${MEAL_COLORS[m]}22`, color: MEAL_COLORS[m] || 'var(--text-primary)' }}>{m}</span>)}
                                            {(Array.isArray(item.dietPref) ? item.dietPref : [item.dietPref]).map(d => d && <span key={d} style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: `${PREF_COLORS[d]}22`, color: PREF_COLORS[d] || 'var(--text-secondary)' }}>{d}</span>)}
                                        </div>

                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.55, flex: 1, marginBottom: '18px' }}>{item.description}</p>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => openEdit(item)}
                                                style={{ flex: 1, padding: '8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600, fontSize: '0.82rem' }}>
                                                <Pencil size={14} /> Edit
                                            </button>
                                            <button onClick={() => setDeleteTarget(item._id)}
                                                style={{ flex: 1, padding: '8px', background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.2)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: '#ff3b5c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600, fontSize: '0.82rem' }}>
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
                                <button className="btn btn-secondary" style={{ width: 'auto', padding: '10px 20px' }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Page {page} of {totalPages}</span>
                                <button className="btn btn-secondary" style={{ width: 'auto', padding: '10px 20px' }} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {(modal === 'add' || modal === 'edit') && (
                    <Modal title={modal === 'add' ? 'Add Meal' : 'Edit Meal'} form={form} setForm={setForm} onSave={handleSave} onClose={() => setModal(null)} saving={saving} />
                )}
            </AnimatePresence>

            {/* Delete Confirm */}
            <AnimatePresence>
                {deleteTarget && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            style={{ background: 'var(--bg-2)', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%', border: '1px solid var(--border)', textAlign: 'center' }}>
                            <Trash2 size={36} style={{ color: '#ff3b5c', marginBottom: '16px' }} />
                            <h3 style={{ margin: '0 0 8px', fontFamily: 'Outfit, sans-serif' }}>Delete Meal?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>This will permanently remove it from the nutrition database.</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600 }}>Cancel</button>
                                <button onClick={handleDelete} style={{ flex: 1, padding: '12px', background: '#ff3b5c', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: '#fff', fontWeight: 700 }}>Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TrainerNutrition;
