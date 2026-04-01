import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Dumbbell, Coffee, Apple, Salad, Edit3, Utensils, Lightbulb } from 'lucide-react';

// Custom Animated Loader for parsing food inputs
const AnalyzingLoader = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '40px' }}>
        <motion.div
            style={{ display: 'flex', gap: '12px' }}
            initial="initial"
            animate="animate"
            variants={{
                animate: { transition: { staggerChildren: 0.15 } }
            }}
        >
            {[
                <Leaf color="var(--green)" size={40} />,
                <Dumbbell color="var(--primary)" size={40} />,
                <Coffee color="var(--orange)" size={40} />,
                <Apple color="var(--danger)" size={40} />,
                <Salad color="var(--ok)" size={40} />
            ].map((icon, i) => (
                <motion.div
                    key={i}
                    variants={{
                        initial: { y: 0, opacity: 0.3, scale: 0.8 },
                        animate: {
                            y: [-15, 0, -15],
                            opacity: [0.3, 1, 0.3],
                            scale: [0.8, 1.2, 0.8],
                            transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                        }
                    }}
                    style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
                >
                    {icon}
                </motion.div>
            ))}
        </motion.div>
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 0.8, repeatType: 'reverse' }}
            style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
        >
            Running Nutrition Math...
        </motion.div>
    </div>
);

// Framer Motion Variants for Award-Winning feel
const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(5px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 100, damping: 15 } }
};


const DietTracker = () => {
    const [foodInput, setFoodInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageInitializing, setPageInitializing] = useState(true);
    const [result, setResult] = useState(null);
    const [targetCalories, setTargetCalories] = useState(2500);
    const [error, setError] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const date = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        setCurrentDate(date.toLocaleDateString('en-US', options));

        // Fetch Today's Persisted Log
        const fetchTodayData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/diet-tracker/today?t=${Date.now()}`, {
                    headers: { 'x-auth-token': token }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.targetCalories) setTargetCalories(data.targetCalories);
                    if (data.dietTrackerData) setResult(data.dietTrackerData);
                }
            } catch (err) {
                console.error("Error fetching initial diet data", err);
            } finally {
                setPageInitializing(false);
            }
        };

        fetchTodayData();
    }, []);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setError('');

        if (!foodInput.trim()) {
            setError('Please describe your meals for today.');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('\/api/diet-tracker/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ foodInput })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.msg || 'Failed to log meals.');

            setResult(data);
            setFoodInput(''); // Clear input on success
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const macros = result?.macros || { protein: 0, carbs: 0, fats: 0 };
    const progressPercent = result ? Math.min((result.totalCalories / targetCalories) * 100, 100) : 0;

    // Determine ring color based on progress
    const ringColor = progressPercent > 100 ? 'var(--danger)' : progressPercent > 80 ? 'var(--orange)' : 'var(--ok)';

    if (pageInitializing) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ width: 50, height: 50, border: '4px solid var(--surface-hover)', borderTop: '4px solid var(--primary)', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={pageVariants}
            style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: 'calc(100vh - 72px)',
                background: 'var(--bg)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background Animated Blobs */}
            <div className="orb orb-orange" style={{ width: '50vw', height: '50vw', top: '-25%', right: '-25%', opacity: 0.1, zIndex: 0 }} />
            <div className="orb orb-purple" style={{ width: '40vw', height: '40vw', bottom: '-20%', left: '-10%', opacity: 0.1, zIndex: 0 }} />

            {/* Header Area */}
            <motion.div variants={itemVariants} style={{
                padding: '40px 40px 0',
                zIndex: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, letterSpacing: '-0.04em', background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Daily Log
                    </h1>
                    <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 500 }}>
                        {currentDate}
                    </p>
                </div>

                <motion.div
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                    style={{
                        background: 'var(--surface)',
                        padding: '12px 24px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: ringColor, boxShadow: `0 0 10px ${ringColor}` }} />
                    Target: {targetCalories} kcal
                </motion.div>
            </motion.div>

            {/* Main Interactive Space */}
            <div style={{
                display: 'flex',
                flex: 1,
                flexDirection: window.innerWidth < 1024 ? 'column' : 'row',
                padding: '40px',
                gap: '40px',
                zIndex: 1
            }}>

                {/* LEFT SIDE: The Fluid Journal Entry */}
                <motion.div variants={itemVariants} style={{
                    flex: '0 0 45%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                }}>
                    <div className="glass-panel" style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Edit3 size={28} color="var(--text-primary)" /> Log Your Meals
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
                            Type freely. Our system dynamically parses your food, estimates portions, and updates your macros.
                        </p>

                        <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{
                                flex: 1,
                                background: 'rgba(0,0,0,0.02)',
                                borderRadius: 'var(--radius-lg)',
                                border: '2px solid transparent',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s ease',
                                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)',
                                '&:focus-within': { borderColor: 'var(--primary)', background: 'var(--surface)' }
                            }}>
                                <textarea
                                    value={foodInput}
                                    onChange={(e) => setFoodInput(e.target.value)}
                                    placeholder="e.g., I had a bowl of oatmeal with blueberries for breakfast, a grilled chicken salad for lunch, and a protein shake..."
                                    style={{
                                        flex: 1,
                                        width: '100%',
                                        border: 'none',
                                        background: 'transparent',
                                        color: 'var(--text-primary)',
                                        fontSize: '1.2rem',
                                        resize: 'none',
                                        fontFamily: 'Outfit, sans-serif',
                                        lineHeight: 1.6,
                                        outline: 'none',
                                        minHeight: '200px'
                                    }}
                                />
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        key="error-message"
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        style={{
                                            color: 'var(--danger)',
                                            marginTop: '16px',
                                            fontSize: '0.95rem',
                                            padding: '16px',
                                            background: 'rgba(255, 69, 58, 0.1)',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid rgba(255, 69, 58, 0.2)',
                                            fontWeight: 600
                                        }}
                                    >
                                        ⚠ {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                                whileHover={{ scale: 1.02, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    marginTop: '24px',
                                    padding: '20px',
                                    fontSize: '1.1rem',
                                    fontWeight: 800,
                                    borderRadius: 'var(--radius-full)',
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '12px',
                                    background: loading ? 'var(--surface-hover)' : 'var(--text-primary)',
                                    color: loading ? 'var(--text-tertiary)' : 'var(--bg)',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                    border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.3s ease'
                                }}
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        Parse & Update Dashboard
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </div>
                </motion.div>

                {/* RIGHT SIDE: Animated Dashboard Dashboard */}
                <motion.div variants={itemVariants} style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: (result || loading) ? 'flex-start' : 'center',
                    alignItems: (result || loading) ? 'stretch' : 'center',
                    position: 'relative'
                }}>

                    <>
                        {!result && !loading && (
                            <motion.div
                                key="awaiting"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                style={{ textAlign: 'center', opacity: 0.6 }}
                            >
                                <div style={{ marginBottom: '20px', filter: 'grayscale(100%) opacity(50%)', display: 'flex', justifyContent: 'center' }}>
                                    <Utensils size={80} color="var(--text-tertiary)" />
                                </div>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: 800 }}>Awaiting Input</h3>
                                <p style={{ margin: 0, maxWidth: '350px', fontSize: '1.1rem' }}>Your daily nutrition visualization will appear here once you log your meals.</p>
                            </motion.div>
                        )}

                        {loading && (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', zIndex: 10, borderRadius: 'var(--radius-xl)' }}
                            >
                                <AnalyzingLoader />
                            </motion.div>
                        )}

                        {result && !loading && (
                            <motion.div
                                key="result-dashboard"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0, x: 50 },
                                    visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1 } }
                                }}
                                className="dashboard-grid"
                                style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px', width: '100%' }}
                            >
                                {/* Hero Calorie Progress Card */}
                                <motion.div variants={itemVariants} className="glass-panel" style={{
                                    gridColumn: '1 / -1',
                                    padding: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'var(--surface)',
                                    borderTop: `4px solid ${ringColor}`
                                }}>
                                    <div>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                                            Total Consumed
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                                            <span style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)', tracking: '-0.02em' }}>
                                                {result.totalCalories}
                                            </span>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>/ {targetCalories} kcal</span>
                                        </div>
                                    </div>

                                    {/* Radical Circular Progress */}
                                    <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                                            <circle cx="70" cy="70" r="60" fill="none" stroke="var(--border)" strokeWidth="12" />
                                            <motion.circle
                                                cx="70" cy="70" r="60"
                                                fill="none"
                                                stroke={ringColor}
                                                strokeWidth="12"
                                                strokeLinecap="round"
                                                strokeDasharray="377"
                                                initial={{ strokeDashoffset: 377 }}
                                                animate={{ strokeDashoffset: 377 - (377 * (progressPercent / 100)) }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                            />
                                        </svg>
                                        <div style={{ position: 'absolute', fontSize: '1.8rem', fontWeight: 800 }}>
                                            {Math.round(progressPercent)}%
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Macro Cards */}
                                {[
                                    { label: 'Protein', value: macros.protein, color: '#3a86ff', max: 200 },
                                    { label: 'Carbs', value: macros.carbs, color: '#ffbe0b', max: 300 },
                                    { label: 'Fats', value: macros.fats, color: '#ff006e', max: 100 }
                                ].map((macro, i) => (
                                    <motion.div key={macro.label} variants={itemVariants} className="glass-panel" style={{
                                        padding: '24px',
                                        gridColumn: i === 0 ? '1 / -1' : 'auto'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{macro.label}</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 800, color: macro.color }}>{macro.value}g</div>
                                        </div>
                                        <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((macro.value / macro.max) * 100, 100)}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                style={{ height: '100%', background: macro.color, borderRadius: '4px' }}
                                            />
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Logged Items Stream */}
                                <motion.div variants={itemVariants} className="glass-panel" style={{ gridColumn: '1 / -1', padding: '32px' }}>
                                    <h3 style={{ margin: '0 0 24px 0', fontSize: '1.4rem', fontWeight: 800 }}>Logged Items ({(result.foodItems || []).length})</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {(result.foodItems || []).map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ x: 10, backgroundColor: 'var(--surface)' }}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '16px 20px',
                                                    background: 'var(--surface-hover)',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: '1px solid var(--border)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '4px' }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: (item.protein !== undefined || item.carbs !== undefined || item.fats !== undefined) ? '8px' : '0' }}>{item.estimatedQuantity}</div>
                                                    {(item.protein !== undefined || item.carbs !== undefined || item.fats !== undefined) && (
                                                        <div style={{ display: 'inline-flex', gap: '12px', fontSize: '0.8rem', background: 'var(--bg)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                                            <span style={{ color: '#3a86ff', fontWeight: 700 }}>{item.protein || 0}g Prot</span>
                                                            <span style={{ color: '#ffbe0b', fontWeight: 700 }}>{item.carbs || 0}g Carb</span>
                                                            <span style={{ color: '#ff006e', fontWeight: 700 }}>{item.fats || 0}g Fat</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.4rem' }}>{item.estimatedCalories}</span>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>kcal</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Insight Bubble */}
                                    <motion.div variants={itemVariants} style={{
                                        marginTop: '32px',
                                        padding: '24px',
                                        borderRadius: 'var(--radius-lg)',
                                        background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(0,0,0,0))',
                                        border: '1px solid rgba(34,197,94,0.2)',
                                        borderLeft: '4px solid var(--ok)',
                                    }}>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Lightbulb size={20} color="var(--ok)" /> AI Insight
                                        </h4>
                                        <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            {result.recommendation}
                                        </p>
                                    </motion.div>
                                </motion.div>

                            </motion.div>
                        )}
                    </>
                </motion.div>

            </div >
        </motion.div >
    );
};

export default DietTracker;
