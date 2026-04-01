import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--bg)',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Background Animated Blobs Removed for B&W Theme */}

            {/* Navbar */}
            <motion.nav
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: 'relative',
                    zIndex: 10,
                    padding: '24px 40px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <div style={{
                    margin: 0,
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    background: 'var(--grad)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <Zap size={36} color="var(--primary)" />
                    PowerFit
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link
                        to="/signup"
                        style={{
                            padding: '10px 24px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            background: 'var(--surface-hover)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-full)',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--surface)'}
                        onMouseOut={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                    >
                        Create Account
                    </Link>
                    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </motion.nav>

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                position: 'relative',
                zIndex: 10
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    style={{
                        width: '100%',
                        maxWidth: '440px',
                        position: 'relative'
                    }}
                >
                    {/* Glow behind card */}
                    <div style={{
                        position: 'absolute',
                        inset: '-4px',
                        borderRadius: '32px',
                        background: 'var(--text-primary)',
                        opacity: 0.05,
                        filter: 'blur(40px)',
                        pointerEvents: 'none'
                    }} />

                    <div className="glass-panel" style={{
                        position: 'relative',
                        background: 'var(--surface)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        border: '1px solid var(--border)',
                        borderRadius: '28px',
                        padding: '48px 40px',
                        boxShadow: '0 25px 80px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
                    }}>
                        {/* Top accent line */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '40%',
                            height: '4px',
                            background: 'var(--text-primary)',
                            borderRadius: '0 0 8px 8px'
                        }} />

                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <motion.div
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'var(--surface-hover)',
                                    border: '4px solid var(--surface-hover)',
                                    borderTop: '4px solid var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px',
                                    color: 'var(--text-primary)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
                                }}
                            >
                                <Lock size={28} />
                            </motion.div>
                            <h1 style={{
                                fontSize: '1.6rem',
                                fontWeight: 800,
                                margin: '0 0 8px 0',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px'
                            }}>
                                Welcome Back
                            </h1>
                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.95rem',
                                marginBottom: '24px'
                            }}>
                                Sign in to continue your fitness journey
                            </p>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    style={{ margin: '0 0 24px 0', overflow: 'hidden' }}
                                >
                                    <div style={{
                                        background: 'rgba(255, 59, 92, 0.1)',
                                        border: '1px solid rgba(255, 59, 92, 0.2)',
                                        color: 'var(--danger)',
                                        padding: '14px 18px',
                                        borderRadius: 'var(--radius-md)',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <AlertCircle size={18} />
                                        <span>{error}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                    fontSize: '0.85rem',
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase'
                                }}>
                                    Email or Username
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="Enter your email"
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px 14px 44px',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '2px solid transparent',
                                            background: 'rgba(0,0,0,0.02)',
                                            color: 'var(--text-primary)',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
                                        }}
                                        onFocus={e => {
                                            e.target.style.borderColor = 'var(--primary)';
                                            e.target.style.background = 'var(--surface)';
                                            e.target.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)';
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = 'transparent';
                                            e.target.style.background = 'rgba(0,0,0,0.02)';
                                        }}
                                    />
                                    <Mail size={18} style={{
                                        position: 'absolute',
                                        left: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-tertiary)',
                                        pointerEvents: 'none'
                                    }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                    fontSize: '0.85rem',
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase'
                                }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Enter your password"
                                        style={{
                                            width: '100%',
                                            padding: '14px 44px 14px 44px',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '2px solid transparent',
                                            background: 'rgba(0,0,0,0.02)',
                                            color: 'var(--text-primary)',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
                                        }}
                                        onFocus={e => {
                                            e.target.style.borderColor = 'var(--primary)';
                                            e.target.style.background = 'var(--surface)';
                                            e.target.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)';
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = 'transparent';
                                            e.target.style.background = 'rgba(0,0,0,0.02)';
                                        }}
                                    />
                                    <Lock size={18} style={{
                                        position: 'absolute',
                                        left: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-tertiary)',
                                        pointerEvents: 'none'
                                    }} />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-tertiary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '6px',
                                            borderRadius: '8px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.color = 'var(--text-primary)';
                                            e.currentTarget.style.background = 'var(--surface-hover)';
                                        }}
                                        onMouseOut={e => {
                                            e.currentTarget.style.color = 'var(--text-tertiary)';
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    fontSize: '1.05rem',
                                    fontWeight: 800,
                                    borderRadius: 'var(--radius-full)',
                                    background: isLoading ? 'var(--surface-hover)' : 'var(--text-primary)',
                                    color: isLoading ? 'var(--text-tertiary)' : 'var(--bg)',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    transition: 'background 0.3s ease'
                                }}
                            >
                                {isLoading ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }} />
                                        <span>Authenticating...</span>
                                    </div>
                                ) : (
                                    <>
                                        Sign In to PowerFit
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <div style={{
                            textAlign: 'center',
                            marginTop: '32px',
                            paddingTop: '32px',
                            borderTop: '1px solid var(--border)',
                            color: 'var(--text-tertiary)',
                            fontSize: '0.95rem',
                            fontWeight: 500
                        }}>
                            New to our platform?{' '}
                            <Link
                                to="/signup"
                                style={{
                                    color: 'var(--primary)',
                                    fontWeight: 800,
                                    textDecoration: 'none',
                                    marginLeft: '4px',
                                    transition: 'color 0.2s ease'
                                }}
                                onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseOut={e => e.currentTarget.style.color = 'var(--primary)'}
                            >
                                Create an account
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
