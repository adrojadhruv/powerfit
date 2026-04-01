import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { getRepMetaphor } from '../utils/creativeMetaphors';
import { downloadTableAsPDF } from '../utils/pdfExport';
import {
    Flame, Dumbbell, Zap, Waves, Activity, Target,
    Moon, ClipboardList, Download, Calendar, CheckCircle2
} from 'lucide-react';

const ExerciseImage = ({ src, alt, uncropped = false }) => {
    const [failed, setFailed] = useState(false);
    const [currentImageIdx, setCurrentImageIdx] = useState(0);

    useEffect(() => {
        if (!src || failed) return;

        // Only animate if it's our github images that ends with .jpg
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
                height: uncropped ? '100%' : '200px', width: '100%',
                background: 'var(--surface-hover)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '24px', border: '1px solid var(--border)', borderRadius: 'inherit'
            }}>
                <div style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '12px' }}>
                    <Dumbbell size={32} color="var(--text-tertiary)" />
                </div>
                <h3 style={{
                    color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0,
                    fontWeight: 600, fontFamily: 'Inter, sans-serif', textAlign: 'center'
                }}>{alt}</h3>
            </div>
        );
    }

    // if its a .gif or something we dont animate between 0 and 1
    const isAnimatable = src.includes('raw.githubusercontent.com') && src.endsWith('.jpg');
    const displaySrc = (isAnimatable && currentImageIdx === 1) ? src.replace('/0.jpg', '/1.jpg') : src;

    const encodedSrc = encodeURI(displaySrc);
    const encodedFallbackSrc = encodeURI(src);

    return (
        <div style={{ height: uncropped ? '100%' : '200px', width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: uncropped ? 'contain' : 'cover',
                    background: 'transparent',
                    display: 'block'
                }}
                loading="lazy"
            />
            {!uncropped && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)',
                    pointerEvents: 'none',
                    opacity: 0.8
                }} />
            )}
            {!uncropped && (
                <h3 style={{
                    position: 'absolute', bottom: '18px', left: '22px', right: '22px',
                    color: 'var(--text-primary)', fontSize: '1.2rem', margin: 0, fontWeight: 700,
                    fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em'
                }}>
                    {alt}
                </h3>
            )}
        </div>
    );
};

const WorkoutProgressModal = ({ exercises, initialIndex, onClose, dailyLog, toggleExercise }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [restTimer, setRestTimer] = useState(0); // 0 means not resting
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    const activeExercise = exercises[currentIndex];
    const isCompleted = dailyLog?.completedExercises?.some(e => e.name === activeExercise?.name);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let timerId = null;
        if (restTimer > 0) {
            timerId = setInterval(() => {
                setRestTimer((prev) => {
                    if (prev <= 1) {
                        // Timer finished, auto-advance
                        if (currentIndex < exercises.length - 1) {
                            setCurrentIndex(curr => curr + 1);
                        } else {
                            // finished the whole routine
                            onClose();
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerId);
    }, [restTimer, currentIndex, exercises.length, onClose]);

    const handleComplete = () => {
        if (!isCompleted) {
            toggleExercise(activeExercise?.name);
        }

        let initialRest = 60; // default 60s
        if (activeExercise?.rest) {
            const parsed = parseInt(activeExercise.rest.replace(/\D/g, ''));
            if (!isNaN(parsed) && parsed > 0) initialRest = parsed;
        }

        // Check if it's the absolute last exercise
        if (currentIndex >= exercises.length - 1) {
            onClose(); // Just close if it's the last one
        } else {
            setRestTimer(initialRest);
        }
    };

    const handleSkipRest = () => {
        setRestTimer(0);
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(curr => curr + 1);
        } else {
            onClose();
        }
    };

    // Keyboard navigation (optional enhancement for desktop users)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!activeExercise) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: 'var(--backdrop)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '32px', right: '40px',
                        background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                        width: '40px', height: '40px', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', cursor: 'pointer', zIndex: 10,
                        transition: 'all 0.2s ease', backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--text-tertiary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                    ✕
                </button>

                <motion.div
                    key={activeExercise._id || activeExercise.name}
                    initial={{ y: 30, opacity: 0, scale: 0.98 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -30, opacity: 0, scale: 0.98 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    style={{
                        width: '100%', maxWidth: '1100px', height: '85vh', maxHeight: '800px',
                        background: 'var(--bg-2)',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        boxShadow: 'var(--shadow-xl)',
                        border: '1px solid var(--border)'
                    }}
                >
                    {/* LEFT PANE: Premium Media Player */}
                    <div style={{
                        flex: '1 1 50%',
                        background: 'var(--bg-2)',
                        position: 'relative',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRight: isMobile ? 'none' : '1px solid var(--border)',
                        borderBottom: isMobile ? '1px solid var(--border)' : 'none',
                        minHeight: isMobile ? '300px' : 'auto'
                    }}>
                        <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                            <ExerciseImage src={activeExercise.gifUrl} alt={activeExercise.name} uncropped={true} />
                        </div>

                        <div style={{
                            position: 'absolute', top: '32px', left: '32px',
                            display: 'flex', gap: '12px', zIndex: 10
                        }}>
                            <span className="badge" style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: 600, fontSize: '0.7rem' }}>
                                {currentIndex + 1} / {exercises.length}
                            </span>
                            <span className="badge" style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontWeight: 600, fontSize: '0.7rem' }}>{activeExercise.bodyPart || 'Full Body'}</span>
                        </div>
                    </div>

                    {/* RIGHT PANE: Typography & Controls */}
                    <div style={{
                        flex: '1 1 50%',
                        padding: '60px 50px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        position: 'relative',
                        background: 'var(--bg-2)'
                    }}>

                        {restTimer > 0 ? (
                            // --- REST TIMER STATE ---
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%', justifyContent: 'center' }}
                            >
                                <div className="section-eyebrow" style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }}>Recovery Phase</div>

                                {/* SVG Circular Timer */}
                                <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 40px' }}>
                                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                        {/* Background Track */}
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--surface-hover)" strokeWidth="4" />
                                        {/* Progressive Ring */}
                                        <circle
                                            cx="50" cy="50" r="45"
                                            fill="none"
                                            stroke="url(#timer-grad)"
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                            strokeDasharray="283" // 2 * pi * radius (45)
                                            strokeDashoffset={283 - (283 * (restTimer / (activeExercise?.rest ? parseInt(activeExercise.rest) || 60 : 60)))}
                                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                                        />
                                        <defs>
                                            <linearGradient id="timer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="var(--text-primary)" />
                                                <stop offset="100%" stopColor="var(--text-secondary)" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div style={{
                                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexDirection: 'column'
                                    }}>
                                        <span style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>
                                            {restTimer}
                                        </span>
                                        <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>sec</span>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--bg-2)', padding: '20px 32px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '40px', width: '100%' }}>
                                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 700 }}>Up Next</div>
                                    <div style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 700 }}>{exercises[currentIndex + 1]?.name || 'Workout Complete'}</div>
                                </div>

                                <button
                                    className="btn btn-secondary"
                                    onClick={handleSkipRest}
                                    style={{ padding: '16px 40px', width: '100%', fontSize: '1.05rem', fontWeight: 600, borderRadius: '12px', background: 'var(--bg-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                                >
                                    Skip Rest ⏭
                                </button>
                            </motion.div>
                        ) : (
                            // --- ACTIVE EXERCISE STATE ---
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}
                            >
                                <div>
                                    <h2 style={{ fontSize: 'clamp(1.8rem, 2.5vw, 2.5rem)', lineHeight: 1.1, color: 'var(--text-primary)', fontWeight: 800, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
                                        {activeExercise.name}
                                    </h2>

                                    <div style={{
                                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
                                        marginTop: '48px', marginBottom: '48px'
                                    }}>
                                        <div style={{ background: 'var(--bg-3)', padding: '20px 24px', borderRadius: '12px', border: '1px solid var(--border-hover)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '8px' }}>
                                                Target
                                            </div>
                                            <div style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>
                                                {activeExercise.sets}<span style={{ color: 'var(--text-tertiary)', fontSize: '1.1rem', margin: '0 6px', fontWeight: 500 }}>×</span>{activeExercise.reps !== 0 ? activeExercise.reps : 'Time'}
                                            </div>
                                        </div>
                                        <div style={{ background: 'var(--bg-3)', padding: '20px 24px', borderRadius: '12px', border: '1px solid var(--border-hover)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '8px' }}>
                                                Rest
                                            </div>
                                            <div style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>
                                                {activeExercise.rest || '60s'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleComplete}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: '100%', padding: '18px', fontSize: '1.1rem', borderRadius: '12px',
                                        background: isCompleted ? 'var(--ok)' : 'var(--text-primary)',
                                        boxShadow: isCompleted ? '0 8px 20px rgba(0, 200, 83, 0.2)' : 'var(--shadow-xl)',
                                        border: 'none',
                                        color: isCompleted ? '#ffffff' : 'var(--bg)',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {isCompleted ? '✓ Completed (Next)' : 'Mark Complete & Rest'}
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const WorkoutPlanViewer = ({ plan, dailyLog, toggleExercise }) => {
    const grouped = plan.exercises?.reduce((acc, ex) => {
        let day = 'Exercises';
        let name = ex.name;
        const match = name.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun):\s*(.*)/);
        if (match) {
            const dayMap = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
            day = dayMap[match[1]] || match[1] + 'day';
            name = match[2];
        } else if (name.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*(.*)/)) {
            const match2 = name.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*(.*)/);
            day = match2[1];
            name = match2[2];
        }
        if (!acc[day]) acc[day] = [];
        acc[day].push({ ...ex, name });
        return acc;
    }, {});

    const days = Object.keys(grouped || {});

    // Determine the current real-world day (e.g., 'Monday', 'Tuesday')
    const todayObject = new Date();
    const currentRealDay = todayObject.toLocaleDateString('en-US', { weekday: 'long' });

    // Sort logic to prefer opening today's tab if it exists, else the first valid tab
    const initialDay = days.includes(currentRealDay) ? currentRealDay : (days[0] || 'Exercises');
    const [activeDay, setActiveDay] = useState(initialDay);
    const [activeWorkoutIndex, setActiveWorkoutIndex] = useState(null); // null means modal closed, number means index


    return (
        <motion.div
            style={{
                width: '100%',
                marginBottom: '40px',
                overflow: 'hidden',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                background: 'var(--grad-card)',
                backdropFilter: 'blur(20px)'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Full Screen Interactive Modal */}
            {activeWorkoutIndex !== null && grouped[activeDay] && (
                <WorkoutProgressModal
                    exercises={grouped[activeDay]}
                    initialIndex={activeWorkoutIndex}
                    onClose={() => setActiveWorkoutIndex(null)}
                    dailyLog={dailyLog}
                    toggleExercise={toggleExercise}
                />
            )}

            {/* Hero Banner Minimalist Professional */}
            <div style={{
                background: 'var(--surface)',
                padding: '40px 44px',
                position: 'relative',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {plan.category || 'TRAINING'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Activity size={14} /> AI Generated
                    </span>
                </div>
                <h2 style={{
                    fontSize: '2rem',
                    color: 'var(--text-primary)', fontWeight: 700,
                    margin: 0,
                    letterSpacing: '-0.02em'
                }}>
                    {plan.title.replace('AI Plan:', '').trim() || plan.title}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5, maxWidth: '800px' }}>
                    {plan.description}
                </p>
            </div>

            {/* Day Tabs */}
            <div style={{
                background: 'var(--bg-2)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                overflowX: 'auto',
                padding: '0',
                scrollbarWidth: 'none'
            }}>
                {days.map(day => (
                    <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        style={{
                            padding: '18px 28px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeDay === day ? '3px solid var(--ok)' : '3px solid transparent',
                            color: activeDay === day ? 'var(--ok)' : 'var(--text-secondary)',
                            fontWeight: activeDay === day ? 800 : 500,
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                            whiteSpace: 'nowrap',
                            fontFamily: 'Inter, sans-serif'
                        }}
                    >
                        {day}
                    </button>
                ))}
            </div>

            {/* Exercise Cards */}
            <div style={{ padding: '36px', background: 'rgba(0,0,0,0.08)' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeDay}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '1000px', margin: '0 auto' }}
                    >
                        {grouped[activeDay]?.map((ex, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ x: 4, background: 'var(--surface-hover)' }}
                                onClick={() => {
                                    if (activeDay === currentRealDay || activeDay === 'Exercises') {
                                        setActiveWorkoutIndex(i);
                                    } else {
                                        alert(`You can only start exercises on the actual day they are scheduled (${currentRealDay}).`);
                                    }
                                }}
                                style={{
                                    background: 'var(--surface)',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border)',
                                    borderLeft: `4px solid var(--primary)`,
                                    display: 'flex',
                                    padding: '20px',
                                    alignItems: 'center',
                                    gap: '24px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                {/* Thumbnail */}
                                <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                                    <ExerciseImage src={ex.gifUrl} alt={ex.name} uncropped={true} />
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0', fontFamily: 'Inter, sans-serif' }}>{ex.name}</h3>
                                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Dumbbell size={12} color="var(--text-tertiary)" />
                                            </div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                {ex.sets} Sets × {ex.reps !== 0 ? ex.reps : 'Time'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Zap size={12} color="var(--text-tertiary)" />
                                            </div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                {ex.rest} Rest
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div style={{ paddingRight: '12px' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (activeDay === currentRealDay || activeDay === 'Exercises') {
                                                toggleExercise(ex.name);
                                            } else {
                                                alert(`You can only mark exercises complete on the actual day they are scheduled (${currentRealDay}).`);
                                            }
                                        }}
                                        style={{
                                            width: '32px', height: '32px', borderRadius: '8px',
                                            background: dailyLog?.completedExercises?.some(e => e.name === ex.name) ? 'var(--ok)' : 'transparent',
                                            border: dailyLog?.completedExercises?.some(e => e.name === ex.name) ? 'none' : '1px solid var(--border)',
                                            color: dailyLog?.completedExercises?.some(e => e.name === ex.name) ? 'var(--bg)' : 'transparent',
                                            fontSize: '1rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: (activeDay === currentRealDay || activeDay === 'Exercises') ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.2s ease',
                                            opacity: (activeDay === currentRealDay || activeDay === 'Exercises') ? 1 : 0.4
                                        }}
                                        title={
                                            (activeDay !== currentRealDay && activeDay !== 'Exercises')
                                                ? `Only available on ${activeDay}`
                                                : dailyLog?.completedExercises?.some(e => e.name === ex.name) ? "Mark Incomplete" : "Mark Complete"
                                        }
                                    >
                                        <CheckCircle2 size={18} color={dailyLog?.completedExercises?.some(e => e.name === ex.name) ? '#fff' : 'var(--text-tertiary)'} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const WorkoutPlans = () => {
    const { user } = useContext(AuthContext);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dailyLog, setDailyLog] = useState({ completedExercises: [], completedMeals: [] });
    const todayStr = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // Fetch Plans
                const plansRes = await axios.get('\/api/workouts', {
                    headers: { 'x-auth-token': token }
                });
                setPlans(plansRes.data);

                // Fetch Daily Log
                const logRes = await axios.get(`\/api/dailylogs/${todayStr}`, {
                    headers: { 'x-auth-token': token }
                });
                if (logRes.data) {
                    setDailyLog(logRes.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [todayStr]);

    const toggleExercise = async (exerciseName) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`\/api/dailylogs/exercise`, {
                date: todayStr,
                exerciseName
            }, { headers: { 'x-auth-token': token } });
            setDailyLog(res.data);
        } catch (err) { console.error(err); }
    };

    return (
        <div style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}
            >
                <div>
                    <div className="section-eyebrow">Training</div>
                    <h1 className="section-title" style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        marginTop: '12px',
                        color: 'var(--text-primary)'
                    }}>
                        Workout Plans
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1rem' }}>
                        Your AI-generated training programs, organized by day.
                    </p>
                </div>
                {plans.length > 0 && (
                    <motion.button
                        onClick={() => {
                            const headers = ['Day', 'Exercise', 'Sets', 'Reps/Time', 'Rest'];
                            const data = [];

                            plans.forEach(plan => {
                                plan.exercises.forEach(ex => {
                                    // Parse day
                                    let day = 'Any';
                                    let name = ex.name;
                                    const match = name.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun):\s*(.*)/);
                                    if (match) {
                                        day = match[1];
                                        name = match[2];
                                    } else if (name.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*(.*)/)) {
                                        const match2 = name.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*(.*)/);
                                        day = match2[1];
                                        name = match2[2];
                                    }

                                    data.push([
                                        day,
                                        name,
                                        ex.sets,
                                        ex.reps !== 0 ? ex.reps : 'Timed',
                                        ex.rest
                                    ]);
                                });
                            });

                            downloadTableAsPDF('My Workout Plan', headers, data, 'MyGym_Workout_Plan');
                        }}
                        className="btn-action-outline"
                        style={{ width: 'auto', height: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Download size={16} color="var(--text-primary)" />
                        <span style={{ color: 'var(--text-primary)' }}>Export PDF</span>
                    </motion.button>
                )}
            </motion.div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[1, 2].map(i => (
                        <div key={i} className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-xl)' }} />
                    ))}
                </div>
            ) : (
                <div id="workout-plan-content" style={{ display: 'flex', flexDirection: 'column' }}>
                    {plans.map((plan) => (
                        <WorkoutPlanViewer key={plan._id} plan={plan} dailyLog={dailyLog} toggleExercise={toggleExercise} />
                    ))}
                    {plans.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                padding: '60px 40px',
                                textAlign: 'center',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '16px'
                            }}
                        >
                            <Calendar size={48} color="var(--text-tertiary)" />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                                No Active Training Protocols
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '400px', margin: 0, lineHeight: 1.5 }}>
                                Navigate to the AI Architect to generate your personalized training configuration.
                            </p>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkoutPlans;
