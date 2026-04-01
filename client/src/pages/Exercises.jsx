import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { downloadTableAsPDF } from '../utils/pdfExport';

const ExerciseImage = ({ src, alt }) => {
    const [failed, setFailed] = useState(false);
    const [currentImageIdx, setCurrentImageIdx] = useState(0);

    useEffect(() => {
        if (!src || failed) return;
        if (src.includes('raw.githubusercontent.com') && src.endsWith('.jpg')) {
            const interval = setInterval(() => {
                setCurrentImageIdx(prev => (prev === 0 ? 1 : 0));
            }, 1000); // toggle every 1 second
            return () => clearInterval(interval);
        }
    }, [src, failed]);

    if (failed || !src) {
        return (
            <div style={{
                height: '240px', width: '100%',
                background: 'var(--grad)',
                display: 'flex', alignItems: 'flex-end',
                padding: '22px', position: 'relative'
            }}>
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -60%)',
                    fontSize: '3rem', opacity: 0.25
                }}>WEIGHT</div>
                <h3 style={{
                    color: '#fff', fontSize: '1.2rem', margin: 0,
                    fontWeight: 800, fontFamily: 'Outfit, sans-serif',
                    position: 'relative', zIndex: 1
                }}>{alt}</h3>
            </div>
        );
    }

    const isAnimatable = src.includes('raw.githubusercontent.com') && src.endsWith('.jpg');
    const displaySrc = (isAnimatable && currentImageIdx === 1) ? src.replace('/0.jpg', '/1.jpg') : src;
    const encodedSrc = encodeURI(displaySrc);
    const encodedFallbackSrc = encodeURI(src);

    return (
        <div style={{ height: '240px', width: '100%', position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <img
                key={encodedSrc}
                src={encodedSrc}
                alt={alt}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => {
                    if (isAnimatable && currentImageIdx === 1) {
                        e.target.src = encodedFallbackSrc;
                    } else {
                        setFailed(true);
                    }
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
            />
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(10,11,16,0.92) 0%, rgba(10,11,16,0.3) 50%, transparent 100%)'
            }} />
        </div>
    );
};

const Exercises = () => {
    const { token } = useContext(AuthContext);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [bodyPart, setBodyPart] = useState('All');
    const [bodyPartsList, setBodyPartsList] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchExercises = async (currentPage = 1) => {
        setLoading(true);
        try {
            const res = await axios.get('\/api/exercises', {
                headers: { 'x-auth-token': token },
                params: {
                    page: currentPage,
                    limit: 21,
                    search: search.trim() || undefined,
                    bodyPart: bodyPart !== 'All' ? bodyPart : undefined
                }
            });
            setExercises(res.data.data);
            setTotalPages(res.data.meta.pages);
            setTotalItems(res.data.meta.total);
            setBodyPartsList(res.data.meta.bodyPartsList);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchExercises(page);
        }
        // eslint-disable-next-line
    }, [token, page, bodyPart]); // re-fetch on page or dropdown change

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (token) {
                setPage(1); // reset to page 1 on new search
                fetchExercises(1);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line
    }, [search]);

    const handleExportPDF = () => {
        const exportTitle = `MyGym Exercise Encyclopedia${bodyPart !== 'All' ? ` - ${bodyPart}` : ''}`;

        // Convert to tabular data using our new pdfExport functionality
        const headers = ["Exercise Name", "Target Area", "Intensity Level", "Primary Goal"];
        const data = exercises.map(ex => [
            ex.name,
            ex.bodyPart,
            ex.level,
            ex.goal
        ]);

        downloadTableAsPDF(exportTitle, headers, data, 'exercises_catalogue');
    };

    return (
        <div style={{ position: 'relative', overflow: 'hidden', padding: '48px 24px', minHeight: 'calc(100vh - 80px)' }}>
            <div className="animated-grid-bg" />
            <div className="orb orb-purple" style={{ width: '400px', height: '400px', top: '10%', right: '-5%', opacity: 0.15 }} />
            <div className="orb orb-orange" style={{ width: '350px', height: '350px', bottom: '10%', left: '-5%', opacity: 0.1 }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', gap: '20px' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="section-eyebrow">Database Catalog</div>
                        <h1 className="section-title">The Exercise Encyclopedia</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1rem', maxWidth: '600px' }}>
                            Browse {totalItems > 0 ? totalItems : 'hundreds of'} exercises used to power your AI-generated routines.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <button
                            className="btn btn-action-outline"
                            onClick={handleExportPDF}
                            disabled={loading || exercises.length === 0}
                            style={{ width: 'auto', height: 'auto', padding: '10px 20px' }}
                        >
                            <span>📥</span>
                            Export Current Page PDF
                        </button>
                    </motion.div>
                </div>

                {/* Filters & Search */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-panel"
                    style={{
                        padding: '24px', marginBottom: '36px',
                        display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end'
                    }}
                >
                    <div style={{ flex: '1 1 300px' }}>
                        <label className="form-label">Search Exercises</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                            <input
                                type="text"
                                className="form-input"
                                style={{ paddingLeft: '44px' }}
                                placeholder="e.g., Push-ups, Squats, Downward Dog..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ flex: '1 1 200px' }}>
                        <label className="form-label">Target Body Part</label>
                        <select className="form-input" value={bodyPart} onChange={(e) => { setBodyPart(e.target.value); setPage(1); }}>
                            <option value="All">All Body Parts</option>
                            {bodyPartsList.map(bp => (
                                <option key={bp} value={bp}>{bp}</option>
                            ))}
                        </select>
                    </div>
                </motion.div>

                {/* Grid */}
                {loading ? (
                    <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        <div className="spinner" />
                        <span style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading Database...</span>
                    </div>
                ) : exercises.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '16px' }}>🔍</div>
                        <h3>No Exercises Found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search criteria or filters.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                            <AnimatePresence>
                                {exercises.map((ex, i) => (
                                    <motion.div
                                        key={ex._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="glass-panel"
                                        style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                                    >
                                        <ExerciseImage src={ex.gifUrl} alt={ex.name} />

                                        <div style={{ padding: '24px' }}>
                                            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                                                {ex.name}
                                            </h3>

                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                                <span className="badge badge-orange">{ex.bodyPart}</span>
                                                <span className="badge badge-purple">{ex.level}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '48px' }}>
                                <motion.button
                                    className="btn btn-secondary"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    whileHover={{ scale: page === 1 ? 1 : 1.05 }}
                                    style={{ width: 'auto', padding: '10px 20px' }}
                                >
                                    ← Prev
                                </motion.button>

                                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    Page {page} of {totalPages}
                                </span>

                                <motion.button
                                    className="btn btn-secondary"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    whileHover={{ scale: page === totalPages ? 1 : 1.05 }}
                                    style={{ width: 'auto', padding: '10px 20px' }}
                                >
                                    Next →
                                </motion.button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Exercises;
