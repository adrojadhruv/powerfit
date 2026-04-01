import { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isTrainer = user?.role === 'trainer' || user?.role === 'admin';

    const navLinks = [
        { path: '/dashboard', label: 'Overview', icon: '◆' },
        isTrainer
            ? { path: '/trainer/exercises', label: 'Exercises Mgr', icon: '⬡' }
            : { path: '/workouts', label: 'Workouts', icon: '⬡' },
        isTrainer
            ? { path: '/trainer/nutrition', label: 'Nutrition Mgr', icon: '◎' }
            : { path: '/diets', label: 'Nutrition', icon: '◎' },
        { path: '/diet-tracker', label: 'Daily Log', icon: '📝' },
        { path: '/generator', label: 'AI Plan', icon: '⚡' },
        { path: '/chat', label: 'Chat', icon: '◈' },
        { path: '/journey', label: 'Journey', icon: '📈' },
        { path: '/profile', label: 'Profile', icon: '◉' }
    ];

    if (isTrainer) {
        navLinks.push({ path: '/admin', label: 'Admin Hub', icon: '⟐' });
    }


    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
            {/* Noise Texture */}
            <div className="noise-overlay" />

            {/* ═══ NAVIGATION ═══ */}
            <motion.nav
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '72px',
                    backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(10px)',
                    WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(10px)',
                    background: scrolled ? 'var(--nav-bg)' : 'transparent',
                    borderBottom: scrolled ? '1px solid var(--nav-border)' : '1px solid transparent',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.08)' : 'none'
                }}
            >
                <div style={{
                    maxWidth: '1400px',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0 32px',
                    alignItems: 'center'
                }}>
                    {/* Logo */}
                    <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={26} color="var(--text-primary)" strokeWidth={2.5} />
                        <span style={{ 
                            fontFamily: 'Outfit, Space Grotesk, sans-serif', fontSize: '1.6rem', fontWeight: 800, 
                            letterSpacing: '-0.02em', color: 'var(--text-primary)' 
                        }}>
                            PowerFit
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                        alignItems: 'center',
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-full)',
                        padding: '4px',
                        border: '1px solid var(--border)'
                    }}>
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    style={{
                                        position: 'relative',
                                        color: isActive ? '#fff' : 'var(--text-secondary)',
                                        textDecoration: 'none',
                                        fontWeight: isActive ? 700 : 500,
                                        fontSize: '0.85rem',
                                        padding: '8px 16px',
                                        borderRadius: 'var(--radius-full)',
                                        background: isActive ? 'var(--logo-grad)' : 'transparent',
                                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                        whiteSpace: 'nowrap',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                    onMouseOver={e => {
                                        if (!isActive) {
                                            e.currentTarget.style.color = '#fff';
                                            e.currentTarget.style.background = 'var(--logo-grad)';
                                        }
                                    }}
                                    onMouseOut={e => {
                                        if (!isActive) {
                                            e.currentTarget.style.color = 'var(--text-secondary)';
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{link.icon}</span>
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side Actions */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* User Info */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '6px 14px 6px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: user?.role === 'admin' ? 'var(--grad)' : 'var(--grad-blue)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                color: '#fff',
                                overflow: 'hidden'
                            }}>
                                {user?.profilePic ? (
                                    <img src={user.profilePic} alt={user?.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    user?.username?.[0]?.toUpperCase() || 'U'
                                )}
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                    lineHeight: 1.2
                                }}>
                                    {user?.username}
                                </div>
                                <div style={{
                                    fontSize: '0.65rem',
                                    color: 'var(--text-tertiary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    fontWeight: 700
                                }}>
                                    {user?.role}
                                </div>
                            </div>
                        </div>

                        {/* Theme Toggle */}
                        <motion.button
                            onClick={toggleTheme}
                            className="btn-action-outline"
                            aria-label="Toggle Theme"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {theme === 'dark' ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="5"></circle>
                                    <line x1="12" y1="1" x2="12" y2="3"></line>
                                    <line x1="12" y1="21" x2="12" y2="23"></line>
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                    <line x1="1" y1="12" x2="3" y2="12"></line>
                                    <line x1="21" y1="12" x2="23" y2="12"></line>
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                </svg>
                            )}
                        </motion.button>

                        {/* Logout */}
                        <motion.button
                            onClick={handleLogout}
                            className="btn-action-outline logout-btn"
                            title="Logout"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                                <line x1="12" y1="2" x2="12" y2="12"></line>
                            </svg>
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* ═══ MAIN CONTENT ═══ */}
            <main style={{
                flex: 1,
                marginTop: '72px',
                position: 'relative'
            }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Layout;
