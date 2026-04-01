import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { Plus, Pencil, Trash2, X, Search, Dumbbell } from 'lucide-react';


const GH_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

const BODY_PARTS = ['Cardio', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const GOALS = ['Weight Loss', 'Muscle Gain', 'Bulking', 'Cutting'];

const ExerciseImage = ({ src, alt }) => {
    const [failed, setFailed] = useState(false);
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        if (!src || failed) return;
        if (src.includes('raw.githubusercontent.com') && src.endsWith('.jpg')) {
            const iv = setInterval(() => setIdx(p => p === 0 ? 1 : 0), 1000);
            return () => clearInterval(iv);
        }
    }, [src, failed]);

    if (failed || !src) {
        return (
            <div style={{ height: '180px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
                <Dumbbell size={40} style={{ opacity: 0.2 }} />
            </div>
        );
    }

    const isAnim = src.includes('raw.githubusercontent.com') && src.endsWith('.jpg');
    const displaySrc = (isAnim && idx === 1) ? src.replace('/0.jpg', '/1.jpg') : src;

    return (
        <div style={{ height: '180px', overflow: 'hidden', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', position: 'relative' }}>
            <img
                key={displaySrc}
                src={encodeURI(displaySrc)}
                alt={alt}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={() => { if (idx === 1) setIdx(0); else setFailed(true); }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }}
                loading="lazy"
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
        </div>
    );
};

const EMPTY_FORM = { name: '', bodyPart: [], level: [], goal: [], gifUrl: '' };

const Modal = ({ title, form, setForm, onSave, onClose, saving }) => {
    const inputStyle = {
        width: '100%', padding: '11px 14px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        color: 'var(--text-primary)', borderRadius: 'var(--radius-md)',
        fontSize: '0.92rem', fontFamily: 'Inter, sans-serif', outline: 'none',
        boxSizing: 'border-box'
    };
    const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' };

    // Auto-generate gifUrl from exercise name
    const autoFill = () => {
        if (!form.name) return;
        const slug = form.name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '');
        setForm(f => ({ ...f, gifUrl: `${GH_BASE}/${slug}/0.jpg` }));
    };

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
                        <label style={labelStyle}>Exercise Name</label>
                        <input style={inputStyle} placeholder="e.g. Barbell Bench Press" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Body Part</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {BODY_PARTS.map(b => (
                                    <button key={b} type="button" onClick={() => setForm(f => ({ ...f, bodyPart: f.bodyPart?.includes(b) ? f.bodyPart.filter(x => x !== b) : [...(f.bodyPart || []), b] }))}
                                        style={{ padding: '6px 12px', borderRadius: '4px', background: form.bodyPart?.includes(b) ? 'var(--text-primary)' : 'var(--surface)', color: form.bodyPart?.includes(b) ? 'var(--bg)' : 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Level</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {LEVELS.map(l => (
                                    <button key={l} type="button" onClick={() => setForm(f => ({ ...f, level: f.level?.includes(l) ? f.level.filter(x => x !== l) : [...(f.level || []), l] }))}
                                        style={{ padding: '6px 12px', borderRadius: '4px', background: form.level?.includes(l) ? 'var(--text-primary)' : 'var(--surface)', color: form.level?.includes(l) ? 'var(--bg)' : 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Goal</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {GOALS.map(g => (
                                    <button key={g} type="button" onClick={() => setForm(f => ({ ...f, goal: f.goal?.includes(g) ? f.goal.filter(x => x !== g) : [...(f.goal || []), g] }))}
                                        style={{ padding: '6px 12px', borderRadius: '4px', background: form.goal?.includes(g) ? 'var(--text-primary)' : 'var(--surface)', color: form.goal?.includes(g) ? 'var(--bg)' : 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Image URL (gifUrl)</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input style={{ ...inputStyle, flex: 1 }} placeholder={`${GH_BASE}/Exercise_Name/0.jpg`}
                                value={form.gifUrl} onChange={e => setForm(f => ({ ...f, gifUrl: e.target.value }))} />
                            <button onClick={autoFill} title="Auto-fill from name"
                                style={{ padding: '0 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                Auto
                            </button>
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: '0.73rem', color: 'var(--text-tertiary)' }}>
                            Format: <code>…/Exercise_Name/0.jpg</code> — click Auto to generate from name
                        </p>
                    </div>

                    {form.gifUrl && (
                        <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '140px' }}>
                            <img src={encodeURI(form.gifUrl)} alt="preview" referrerPolicy="no-referrer" crossOrigin="anonymous"
                                style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                                onError={e => { e.target.style.display = 'none'; }} />
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600 }}>Cancel</button>
                    <button onClick={onSave} disabled={saving}
                        style={{ flex: 2, padding: '12px', background: 'var(--text-primary)', border: 'none', borderRadius: 'var(--radius-md)', cursor: saving ? 'not-allowed' : 'pointer', color: 'var(--bg)', fontWeight: 700, fontSize: '0.95rem' }}>
                        {saving ? 'Saving…' : 'Save Exercise'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const TrainerExercises = () => {
    const { user } = useContext(AuthContext);
    const getToken = () => localStorage.getItem('token');
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterBodyPart, setFilterBodyPart] = useState('All');
    const [filterLevel, setFilterLevel] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [modal, setModal] = useState(null); // null | 'add' | 'edit'
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast] = useState('');

    const headers = () => ({ 'x-auth-token': getToken() });

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const fetchExercises = async (pg = 1) => {
        setLoading(true);
        try {
            const res = await axios.get('/api/exercises', {
                headers: headers(),
                params: { page: pg, limit: 18, search: search.trim() || undefined, bodyPart: filterBodyPart !== 'All' ? filterBodyPart : undefined, level: filterLevel !== 'All' ? filterLevel : undefined }
            });
            setExercises(res.data.data);
            setTotalPages(res.data.meta.pages);
            setTotal(res.data.meta.total);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchExercises(page); }, [page, filterBodyPart, filterLevel]);
    useEffect(() => {
        const t = setTimeout(() => { setPage(1); fetchExercises(1); }, 500);
        return () => clearTimeout(t);
    }, [search]);

    const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setModal('add'); };
    const openEdit = (ex) => { setForm({ name: ex.name, bodyPart: Array.isArray(ex.bodyPart) ? ex.bodyPart : [ex.bodyPart], level: Array.isArray(ex.level) ? ex.level : [ex.level], goal: Array.isArray(ex.goal) ? ex.goal : [ex.goal], gifUrl: ex.gifUrl }); setEditingId(ex._id); setModal('edit'); };

    const handleSave = async () => {
        if (!form.name || !form.gifUrl) return;
        setSaving(true);
        try {
            if (modal === 'add') {
                const res = await axios.post('/api/exercises', form, { headers: headers() });
                setExercises(p => [res.data, ...p]);
                showToast('Exercise added ✓');
            } else {
                const res = await axios.put(`/api/exercises/${editingId}`, form, { headers: headers() });
                setExercises(p => p.map(e => e._id === editingId ? res.data : e));
                showToast('Exercise updated ✓');
            }
            setModal(null);
        } catch (err) { showToast(err.response?.data?.msg || 'Error saving'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/exercises/${deleteTarget}`, { headers: headers() });
            setExercises(p => p.filter(e => e._id !== deleteTarget));
            showToast('Exercise deleted');
            setDeleteTarget(null);
        } catch (err) { showToast('Delete failed'); }
    };

    return (
        <div style={{ position: 'relative', padding: '48px 24px', minHeight: 'calc(100vh - 80px)' }}>
            <div className="animated-grid-bg" />
            <div className="orb orb-purple" style={{ width: '400px', height: '400px', top: '5%', right: '-5%', opacity: 0.12 }} />

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
                        <h1 className="section-title">Exercise Database</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.95rem' }}>
                            {total} exercises in the database — add, edit or remove anytime.
                        </p>
                    </motion.div>
                    <motion.button
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="btn btn-primary"
                        onClick={openAdd}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', width: 'auto' }}
                    >
                        <Plus size={18} /> Add Exercise
                    </motion.button>
                </div>

                {/* Filters */}
                <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '28px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1 1 260px', position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                        <input className="form-input" style={{ paddingLeft: '40px' }} placeholder="Search exercises…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div style={{ flex: '0 1 180px' }}>
                        <select className="form-input" value={filterBodyPart} onChange={e => { setFilterBodyPart(e.target.value); setPage(1); }}>
                            <option value="All">All Body Parts</option>
                            {BODY_PARTS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: '0 1 160px' }}>
                        <select className="form-input" value={filterLevel} onChange={e => { setFilterLevel(e.target.value); setPage(1); }}>
                            <option value="All">All Levels</option>
                            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
                        <div className="spinner" />
                        <span style={{ color: 'var(--text-secondary)' }}>Loading exercises…</span>
                    </div>
                ) : exercises.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                        <Dumbbell size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <h3>No exercises found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters or add a new exercise.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            <AnimatePresence>
                                {exercises.map((ex, i) => (
                                    <motion.div key={ex._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.03 }}
                                        className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                                        <ExerciseImage src={ex.gifUrl} alt={ex.name} />
                                        <div style={{ padding: '18px' }}>
                                            <h3 style={{ margin: '0 0 10px', fontSize: '1.05rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>{ex.name}</h3>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                                                {(Array.isArray(ex.bodyPart) ? ex.bodyPart : [ex.bodyPart]).map(bp => bp && <span key={bp} className="badge badge-orange">{bp}</span>)}
                                                {(Array.isArray(ex.level) ? ex.level : [ex.level]).map(l => l && <span key={l} className="badge badge-purple">{l}</span>)}
                                                {(Array.isArray(ex.goal) ? ex.goal : [ex.goal]).map(g => g && <span key={g} className="badge">{g}</span>)}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => openEdit(ex)}
                                                    style={{ flex: 1, padding: '8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600, fontSize: '0.82rem' }}>
                                                    <Pencil size={14} /> Edit
                                                </button>
                                                <button onClick={() => setDeleteTarget(ex._id)}
                                                    style={{ flex: 1, padding: '8px', background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.2)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--red, #ff3b5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600, fontSize: '0.82rem' }}>
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
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
                    <Modal title={modal === 'add' ? 'Add Exercise' : 'Edit Exercise'} form={form} setForm={setForm} onSave={handleSave} onClose={() => setModal(null)} saving={saving} />
                )}
            </AnimatePresence>

            {/* Delete Confirm */}
            <AnimatePresence>
                {deleteTarget && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            style={{ background: 'var(--bg-2)', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%', border: '1px solid var(--border)', textAlign: 'center' }}>
                            <Trash2 size={36} style={{ color: 'var(--red, #ff3b5c)', marginBottom: '16px' }} />
                            <h3 style={{ margin: '0 0 8px', fontFamily: 'Outfit, sans-serif' }}>Delete Exercise?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>This will permanently remove it from the database.</p>
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

export default TrainerExercises;
