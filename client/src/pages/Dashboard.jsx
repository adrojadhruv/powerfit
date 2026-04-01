import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Dumbbell, Utensils, Zap, MessageSquare, Bell, ChevronRight, Activity, Flame, Target, Scale } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const featureCards = [
    {
        title: 'Workout Plans',
        desc: 'High-intensity training programs that adapt to your fitness level and goals.',
        icon: <Dumbbell size={24} />,
        link: '/workouts',
        cta: 'Start Training',
        color: '#dc2626',
        label: 'POPULAR'
    },
    {
        title: 'Nutrition Plans',
        desc: 'Personalized meal plans to fuel your transformation and optimize performance.',
        icon: <Utensils size={24} />,
        link: '/diets',
        cta: 'View Plans',
        color: '#ffffff',
        label: 'CURATED'
    },
    {
        title: 'AI Generator',
        desc: 'Get a hyper-personalized 6-day diet and workout regimen in seconds.',
        icon: <Zap size={24} />,
        link: '/generator',
        cta: 'Generate Now',
        color: '#dc2626',
        label: 'NEW'
    },
    {
        title: 'Trainer Chat',
        desc: 'Real-time support from certified trainers for custom guidance.',
        icon: <MessageSquare size={24} />,
        link: '/chat',
        cta: 'Open Chat',
        color: '#a3a3a3',
        label: 'LIVE'
    }
];



const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const canvasRef = useRef(null);
    const parentRef = useRef(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const imagesRef = useRef([]);
    const [updates, setUpdates] = useState([]);
    const [todayLog, setTodayLog] = useState(null);
    const [recentProgress, setRecentProgress] = useState(null);
    const [targetCalories, setTargetCalories] = useState(2500);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // Fetch updates
                axios.get('/api/updates', { headers: { 'x-auth-token': token } }).then(res => setUpdates(res.data)).catch(console.error);

                // Fetch today's diet
                axios.get('/api/diet-tracker/today', { headers: { 'x-auth-token': token } }).then(res => {
                    setTodayLog(res.data.dietTrackerData);
                    if (res.data.targetCalories) setTargetCalories(res.data.targetCalories);
                }).catch(console.error);

                // Fetch recent progress
                axios.get('/api/progress', { headers: { 'x-auth-token': token } }).then(res => {
                    if (res.data && res.data.length > 0) {
                        setRecentProgress(res.data[res.data.length - 1]);
                    }
                }).catch(console.error);

            } catch (err) {
                console.error(err);
            }
        };
        fetchDashboardData();
    }, []);

    // GSAP Image Sequence Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;

        const frameCount = 70;
        const currentFrame = index => `/frames/imgs/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`;
        let loadedCount = 0;
        let tl;

        const renderFrame = (index) => {
            const img = imagesRef.current[index];
            if (!img || !canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const newWidth = img.width * scale;
            const newHeight = img.height * scale;
            const offsetX = (canvas.width - newWidth) / 2;
            const offsetY = (canvas.height - newHeight) / 2;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, offsetX, offsetY, newWidth, newHeight);
        };

        function initGSAP() {
            renderFrame(0);
            let frameObj = { frame: 0 };
            setTimeout(() => ScrollTrigger.refresh(), 100);

            tl = gsap.timeline({
                scrollTrigger: {
                    trigger: parentRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1.5
                }
            });

            tl.to(frameObj, {
                frame: frameCount - 1,
                snap: "frame",
                ease: "none",
                onUpdate: () => renderFrame(Math.round(frameObj.frame))
            });
        }

        if (imagesRef.current.length === 0) {
            for (let i = 0; i < frameCount; i++) {
                const img = new Image();
                img.src = currentFrame(i);
                img.onload = () => {
                    loadedCount++;
                    if (loadedCount === frameCount) {
                        setImagesLoaded(true);
                        initGSAP();
                    }
                };
                imagesRef.current.push(img);
            }
        } else {
            initGSAP();
        }

        const handleResize = () => {
            if (imagesRef.current.length === frameCount) {
                renderFrame(Math.round(tl ? tl.progress() * (frameCount - 1) : 0));
            }
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (tl) tl.kill();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <div style={{ position: 'relative' }}>
            {/* HERO - GSAP Image Sequence */}
            <div ref={parentRef} style={{ width: '100%', height: '700vh', position: 'relative', backgroundColor: 'var(--bg)' }}>
                <div style={{ width: '100%', height: '100vh', position: 'sticky', top: 0, left: 0, overflow: 'hidden' }}>
                    <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />


                    {/* Welcome Overlay */}
                    <motion.div
                        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', width: '90%' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1.2 }}
                    >
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1, duration: 0.8 }}
                        >
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '6px 16px', borderRadius: '999px',
                                border: '1px solid rgba(220,38,38,0.3)',
                                background: 'rgba(220,38,38,0.1)',
                                color: 'var(--red)', fontSize: '0.75rem', fontWeight: 700,
                                letterSpacing: '0.12em', textTransform: 'uppercase',
                                marginBottom: '24px'
                            }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', animation: 'pulse 2s infinite' }} />
                                WELCOME BACK
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            style={{
                                fontSize: 'clamp(3rem, 8vw, 6rem)',
                                fontFamily: 'Outfit, sans-serif',
                                fontWeight: 900,
                                letterSpacing: '-0.04em',
                                lineHeight: 1.05,
                                color: 'var(--text-primary)',
                                textShadow: theme === 'dark' ? '0 4px 30px rgba(0,0,0,0.5)' : 'none'
                            }}
                        >
                            Hey, <span style={{ color: 'var(--red)' }}>{user?.username}</span>
                        </motion.h1>

                        <motion.p
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.5, duration: 0.8 }}
                            style={{
                                color: 'var(--text-secondary)',
                                marginTop: '16px',
                                fontSize: 'clamp(1rem, 2vw, 1.3rem)',
                                fontWeight: 400
                            }}
                        >
                            Scroll down to explore your fitness arsenal
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.5 }}
                            style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                        >
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</span>
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    width: '2px', height: '40px',
                                    background: 'linear-gradient(to bottom, var(--red), transparent)',
                                    borderRadius: '2px'
                                }}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div style={{ background: 'var(--bg)', position: 'relative', zIndex: 10, overflow: 'hidden' }}>
                {/* Background Animated Blobs */}
                <div className="orb orb-red" style={{ width: '40vw', height: '40vw', top: '5%', right: '-10%', background: 'radial-gradient(circle, rgba(220,38,38,0.05) 0%, rgba(0,0,0,0) 70%)', position: 'absolute', borderRadius: '50%', zIndex: 0 }} />
                <div className="orb orb-gray" style={{ width: '35vw', height: '35vw', bottom: '15%', left: '-5%', background: 'radial-gradient(circle, rgba(163,163,163,0.05) 0%, rgba(0,0,0,0) 70%)', position: 'absolute', borderRadius: '50%', zIndex: 0 }} />

                {/* Command Center */}
                <section style={{ padding: '80px 24px 40px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Activity color="#dc2626" size={32} /> Command Center
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '8px' }}>Your daily statistics and quick actions at a glance.</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        {/* Calorie Card */}
                        <motion.div className="glass-panel" whileHover={{ y: -5 }} style={{ padding: '30px', background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-xl)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{ padding: '12px', background: 'rgba(220,38,38,0.1)', borderRadius: '12px', color: '#dc2626' }}>
                                    <Flame size={24} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.1em' }}>Calories</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{todayLog?.totalCalories || 0}</div>
                                </div>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(((todayLog?.totalCalories || 0) / targetCalories) * 100, 100)}%` }} style={{ height: '100%', background: '#dc2626', borderRadius: '999px' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <span>0</span>
                                <span>Target: {targetCalories}</span>
                            </div>
                        </motion.div>

                        {/* Current Weight Card */}
                        <motion.div className="glass-panel" whileHover={{ y: -5 }} style={{ padding: '30px', background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-xl)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}>
                                    <Scale size={24} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.1em' }}>Weight</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{recentProgress?.weight || '--'} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>kg</span></div>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {recentProgress?.bodyFat ? `Body Fat: ${recentProgress.bodyFat}%` : 'Log your progress to see stats.'}
                            </div>
                        </motion.div>

                        {/* Quick Action Card */}
                        <motion.div className="glass-panel" whileHover={{ y: -5 }} style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(220,38,38,0.1), rgba(0,0,0,0))', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                            <Target size={32} color="#dc2626" style={{ marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Log Today's Meal</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Keep your streak alive and track your nutrition.</p>
                            <Link to="/diet-tracker" style={{ padding: '10px 24px', background: 'var(--text-primary)', color: 'var(--bg)', borderRadius: '999px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem', transition: 'transform 0.2s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>Open Tracker</Link>
                        </motion.div>
                    </div>
                </section>

                {/* Announcements */}
                {updates.length > 0 && (
                    <section style={{ padding: '80px 24px 20px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ padding: '12px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', color: '#dc2626' }}>
                                <Bell size={28} />
                            </div>
                            <div>
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 800,
                                    letterSpacing: '0.15em', textTransform: 'uppercase',
                                    color: '#dc2626'
                                }}>
                                    Live Intel
                                </span>
                                <h2 style={{
                                    fontSize: 'clamp(24px, 3vw, 36px)',
                                    fontFamily: 'Outfit, sans-serif',
                                    fontWeight: 800, marginTop: '4px',
                                    color: 'var(--text-primary)',
                                    letterSpacing: '-0.02em'
                                }}>
                                    Gym Updates & Announcements
                                </h2>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {updates.map((update, i) => (
                                <motion.div
                                    key={update._id}
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                    className="glass-panel"
                                    whileHover={{ x: 10, backgroundColor: 'var(--surface)' }}
                                    style={{
                                        padding: '24px 28px',
                                        background: 'var(--surface-hover)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-lg)',
                                        borderLeft: '4px solid #dc2626',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>{update.title}</h4>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, padding: '4px 12px', background: 'var(--bg)', borderRadius: '999px', border: '1px solid var(--border)' }}>{new Date(update.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{update.content}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
                                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #dc2626, #991b1b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold' }}>
                                            {update.createdBy?.username?.charAt(0).toUpperCase() || 'A'}
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{update.createdBy?.username || 'Admin'}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Feature Cards */}
                <section style={{ padding: 'clamp(60px, 10vw, 100px) 24px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ marginBottom: '56px', textAlign: 'center' }}>
                        <span style={{
                            fontSize: '0.75rem', fontWeight: 800,
                            letterSpacing: '0.15em', textTransform: 'uppercase',
                            color: '#a3a3a3',
                            background: 'rgba(163,163,163,0.1)',
                            padding: '6px 16px',
                            borderRadius: '999px',
                            border: '1px solid rgba(163,163,163,0.2)'
                        }}>
                            Your Arsenal
                        </span>
                        <h2 style={{
                            fontSize: 'clamp(32px, 4vw, 48px)',
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 900, marginTop: '20px',
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.02em'
                        }}>
                            Tools for Transformation
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '16px auto 0', lineHeight: 1.6 }}>
                            Everything you need to crush your goals, packed into a sleek, functional interface.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        {featureCards.map((card, i) => (
                            <motion.div
                                key={card.title}
                                className="glass-panel"
                                initial={{ y: 40, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                whileHover={{ y: -8, boxShadow: `0 20px 40px -10px ${card.color}20` }}
                                style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: '0',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                    position: 'relative'
                                }}
                            >
                                {/* Top accent line (wider, stronger presence) */}
                                <div style={{ height: '4px', background: card.color, width: '100%' }} />

                                <div style={{ padding: '32px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                        <div style={{
                                            width: '56px', height: '56px',
                                            borderRadius: '16px',
                                            background: `${card.color}15`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: card.color
                                        }}>
                                            {card.icon}
                                        </div>
                                        <span style={{
                                            fontSize: '0.65rem', fontWeight: 800,
                                            letterSpacing: '0.12em',
                                            color: card.color,
                                            padding: '6px 12px',
                                            borderRadius: '999px',
                                            border: `1px solid ${card.color}30`,
                                            background: `${card.color}10`,
                                            textTransform: 'uppercase'
                                        }}>
                                            {card.label}
                                        </span>
                                    </div>

                                    <h4 style={{
                                        fontSize: '1.4rem', fontWeight: 800,
                                        fontFamily: 'Outfit, sans-serif',
                                        marginBottom: '12px',
                                        color: 'var(--text-primary)',
                                        letterSpacing: '-0.02em'
                                    }}>
                                        {card.title}
                                    </h4>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.95rem', lineHeight: 1.6, flex: 1 }}>
                                        {card.desc}
                                    </p>
                                    <Link
                                        to={card.link}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '16px 20px',
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            color: 'var(--text-primary)',
                                            background: 'var(--surface-hover)',
                                            borderRadius: 'var(--radius-lg)',
                                            textDecoration: 'none',
                                            border: '1px solid var(--border)',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.borderColor = card.color;
                                            e.currentTarget.style.color = card.color;
                                            e.currentTarget.style.background = `${card.color}0A`;
                                        }}
                                        onMouseOut={e => {
                                            e.currentTarget.style.borderColor = 'var(--border)';
                                            e.currentTarget.style.color = 'var(--text-primary)';
                                            e.currentTarget.style.background = 'var(--surface-hover)';
                                        }}
                                    >
                                        <span>{card.cta}</span>
                                        <ChevronRight size={18} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Trainer CTA */}
                <section style={{ padding: 'clamp(60px, 10vw, 100px) 24px', position: 'relative', zIndex: 1 }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="glass-panel"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                alignItems: 'center',
                                gap: '4rem',
                                background: 'linear-gradient(135deg, rgba(220,38,38,0.05), rgba(0,0,0,0))',
                                border: '1px solid rgba(220,38,38,0.2)',
                                borderLeft: '4px solid #dc2626',
                                borderRadius: 'var(--radius-xl)',
                                padding: 'clamp(40px, 8vw, 70px) clamp(30px, 6vw, 60px)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '999px', marginBottom: '24px' }}>
                                    <Activity size={16} color="#dc2626" />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#dc2626' }}>
                                        Expert Guidance
                                    </span>
                                </div>
                                <h2 style={{
                                    fontSize: 'clamp(32px, 4.5vw, 56px)',
                                    fontFamily: 'Outfit, sans-serif',
                                    fontWeight: 900,
                                    color: 'var(--text-primary)',
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1.1
                                }}>
                                    Ready to Break<br />Your Plateaus?
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '24px', maxWidth: '45ch', fontSize: '1.1rem', lineHeight: 1.7 }}>
                                    Connect with certified trainers for personalized advice, custom workout adjustments, and elite motivation.
                                </p>
                                <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center' }}>
                                    <Link to="/chat" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '12px',
                                        padding: '16px 32px', background: '#ffffff',
                                        color: '#000000', fontWeight: 800, fontSize: '1.05rem',
                                        borderRadius: 'var(--radius-full)', textDecoration: 'none',
                                        boxShadow: '0 10px 25px -5px rgba(255,255,255,0.2)',
                                        border: '1px solid #e5e5e5',
                                        transition: 'all 0.2s ease',
                                    }}
                                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        Consult a Pro <ChevronRight size={20} />
                                    </Link>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    width: '120%', height: '120%',
                                    background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, rgba(0,0,0,0) 70%)',
                                    zIndex: -1, borderRadius: '50%'
                                }} />
                                <img src="/trainner.jpg" alt="Trainer" style={{
                                    width: '100%', height: 'auto',
                                    borderRadius: '24px',
                                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
                                    border: '1px solid var(--border)',
                                    objectFit: 'cover',
                                    aspectRatio: '1/1.05'
                                }} />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Footer */}
                <footer style={{
                    padding: '40px 24px',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--bg)'
                }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{
                            fontSize: '20px', fontWeight: 900,
                            color: '#dc2626',
                            fontFamily: 'Outfit, sans-serif',
                            letterSpacing: '-0.02em'
                        }}>
                            PowerFit
                        </div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                            &copy; 2026 PowerFit. Ignite your potential.
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Dashboard;
