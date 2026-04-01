import { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    Dumbbell, Apple, Clock, Trophy,
    Camera, Shield, User, Mail,
    ArrowRight, Activity, Zap, MessageSquare,
    TrendingUp
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const [workoutCount, setWorkoutCount] = useState(0);
    const [dietCount, setDietCount] = useState(0);
    const [daysActive, setDaysActive] = useState(1);
    const [achievement, setAchievement] = useState('Newbie');
    const [activityItems, setActivityItems] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [joinedDate, setJoinedDate] = useState(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('\/api/users/profile-stats', { headers: { 'x-auth-token': token } });

                setWorkoutCount(res.data.workoutCount);
                setDietCount(res.data.dietCount);
                setDaysActive(res.data.daysActive);
                setAchievement(res.data.achievement);
                setActivityItems(res.data.recentActivity || []);
                setJoinedDate(res.data.joinedDate);
            } catch (err) {
                console.error('Error fetching profile stats:', err);
            }
        };
        fetchStats();
    }, []);

    const profileStats = [
        { label: 'Workout Plans', value: workoutCount, icon: <Dumbbell size={20} />, color: 'var(--primary)' },
        { label: 'Diet Plans', value: dietCount, icon: <Apple size={20} />, color: 'var(--ok)' },
        { label: 'Days Active', value: daysActive, icon: <Clock size={20} />, color: 'var(--blue)' },
        { label: 'Achievement', value: achievement, icon: <Trophy size={20} />, color: 'var(--yellow)', isText: true }
    ];

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const token = localStorage.getItem('token');
            const res = await axios.post('\/api/users/profile-pic', formData, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            updateUser(res.data);
        } catch (err) {
            console.error('Error uploading profile picture:', err);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '40px' }}
            >
                <div className="section-eyebrow">Account</div>
                <h1 className="section-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '12px', color: 'var(--text-primary)' }}>
                    Your Profile
                </h1>
            </motion.div>

            {/* Profile Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    marginBottom: '32px',
                    position: 'relative',
                    boxShadow: 'var(--shadow-sm)'
                }}
            >
                {/* Banner */}
                <div style={{
                    height: '140px',
                    background: 'var(--bg-3)',
                    position: 'relative',
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <div className="animated-grid-bg" style={{ opacity: 0.2 }} />
                </div>

                {/* Profile Content */}
                <div style={{ padding: '0 40px 40px', position: 'relative' }}>
                    {/* Avatar Container */}
                    <div style={{ position: 'relative', width: 'fit-content' }}>
                        <div style={{
                            width: '120px', height: '120px',
                            borderRadius: '24px',
                            background: 'var(--bg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-primary)',
                            fontFamily: 'Inter, sans-serif',
                            marginTop: '-60px',
                            border: '4px solid var(--bg-2)',
                            boxShadow: 'var(--shadow-lg)',
                            position: 'relative',
                            zIndex: 2,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease'
                        }}>
                            {uploading ? (
                                <div className="spinner" style={{ width: '30px', height: '30px', borderWidth: '3px' }}></div>
                            ) : user?.profilePic ? (
                                <img src={user.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                user?.username?.[0]?.toUpperCase() || 'U'
                            )}
                        </div>

                        {/* Edit Button Overlay */}
                        <button
                            onClick={() => document.getElementById('profilePicUpload').click()}
                            style={{
                                position: 'absolute', bottom: '-10px', right: '-10px',
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'var(--surface)', border: '1px solid var(--border)',
                                color: 'var(--text-primary)', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', cursor: 'pointer', zIndex: 3,
                                backdropFilter: 'blur(10px)', transition: 'all 0.2s ease',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
                        >
                            <Camera size={18} />
                        </button>
                        <input
                            type="file"
                            id="profilePicUpload"
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
                        <div>
                            <h2 style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '2.2rem', fontWeight: 800,
                                color: 'var(--text-primary)',
                                letterSpacing: '-0.03em',
                                marginBottom: '8px',
                                lineHeight: 1
                            }}>
                                {user?.username}
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {user?.email}</div>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-tertiary)' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} /> {user?.role}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', textTransform: 'uppercase' }}>
                                    Member since {new Date(joinedDate || user?.createdAt || Date.now()).getFullYear()}
                                </span>
                                <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, background: 'var(--primary)', color: 'var(--bg)', border: 'none', textTransform: 'uppercase' }}>
                                    PRO
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            {user?.age && (
                                <div style={{
                                    padding: '16px 24px',
                                    background: 'var(--bg-3)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '16px',
                                    textAlign: 'center',
                                    minWidth: '100px'
                                }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Age</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>{user.age}</div>
                                </div>
                            )}
                            {user?.gender && (
                                <div style={{
                                    padding: '16px 24px',
                                    background: 'var(--bg-3)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '16px',
                                    textAlign: 'center',
                                    minWidth: '100px'
                                }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Gender</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                                        {user.gender === 'male' ? '♂' : '♀'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {profileStats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.08 }}
                        style={{
                            background: 'var(--bg-2)',
                            borderRadius: '20px',
                            padding: '24px',
                            border: '1px solid var(--border)',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                borderRadius: '10px',
                                background: 'var(--bg-3)',
                                border: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: stat.color
                            }}>
                                {stat.icon}
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                                    {stat.label}
                                </div>
                                <div style={{
                                    fontSize: stat.isText ? '1.1rem' : '1.8rem',
                                    fontWeight: 800,
                                    fontFamily: 'Inter, sans-serif',
                                    color: 'var(--text-primary)',
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1
                                }}>
                                    {stat.value}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Activity & Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        background: 'var(--bg-2)',
                        border: '1px solid var(--border)',
                        borderRadius: '24px',
                        padding: '32px',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h3 style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '1.2rem', fontWeight: 800,
                            color: 'var(--text-primary)',
                            display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            <Activity size={20} style={{ color: 'var(--primary)' }} /> Recent Activity
                        </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activityItems.length === 0 ? (
                            <div style={{ padding: '24px', borderRadius: '12px', background: 'var(--bg-3)', color: 'var(--text-tertiary)', textAlign: 'center', fontSize: '0.9rem' }}>
                                Your recent gym activities will appear here.
                            </div>
                        ) : activityItems.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.05 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px',
                                    background: 'var(--bg-3)',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{
                                    width: '40px', height: '40px',
                                    borderRadius: '10px',
                                    background: 'var(--bg-2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.1rem', color: 'var(--text-primary)', border: '1px solid var(--border)'
                                }}>
                                    <Activity size={18} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                                        {item.action}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <TrendingUp size={12} /> {item.time}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Account Info & Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{
                        background: 'var(--bg-2)',
                        border: '1px solid var(--border)',
                        borderRadius: '24px',
                        padding: '32px',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <h3 style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '1.2rem', fontWeight: 800,
                        color: 'var(--text-primary)',
                        marginBottom: '24px',
                        display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <Zap size={20} style={{ color: 'var(--yellow)' }} /> Shortcuts
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { label: 'AI Plan Generator', desc: 'Create a personalized training program', icon: <Zap size={18} />, href: '/generator', color: 'var(--primary)' },
                            { label: 'Workout Dashboard', desc: 'Access your active workout plans', icon: <Dumbbell size={18} />, href: '/workouts', color: 'var(--blue)' },
                            { label: 'Nutrition & Diets', desc: 'Review your personalized diet tracking', icon: <Apple size={18} />, href: '/diets', color: 'var(--ok)' },
                            { label: 'Training Advisor', desc: 'Get expert advice in the trainer chat', icon: <MessageSquare size={18} />, href: '/chat', color: 'var(--purple-light)' }
                        ].map((action, i) => (
                            <motion.a
                                key={action.label}
                                href={action.href}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + i * 0.05 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-3)',
                                    textDecoration: 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.background = 'var(--surface)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.background = 'var(--bg-3)';
                                }}
                            >
                                <div style={{
                                    width: '40px', height: '40px',
                                    borderRadius: '10px',
                                    background: 'var(--bg-2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: action.color, border: '1px solid var(--border)', flexShrink: 0
                                }}>
                                    {action.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{action.label}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{action.desc}</div>
                                </div>
                                <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                            </motion.a>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
