import { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Calendar, Zap, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        age: '',
        gender: 'male',
        role: 'user'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { signup } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    // canvas background particles removed for B&W theme

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 1) {
            if (formData.username && formData.email && formData.password) {
                setStep(2);
            }
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await signup(formData.username, formData.email, formData.password, formData.age, formData.gender, formData.role);
            navigate('/generator');
        } catch (err) {
            setError(err.response?.data?.msg || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 18px',
        paddingLeft: '44px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.95rem',
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.3s ease',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        fontSize: '0.82rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase'
    };

    const iconStyle = {
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-tertiary)',
        fontSize: '1rem',
        pointerEvents: 'none'
    };

    return (
        <div style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {/* Orbs removed */}

            {/* Nav */}
            <motion.nav
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative', zIndex: 10, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div style={{ fontFamily: 'Outfit, Space Grotesk, sans-serif', fontSize: '1.6rem', fontWeight: 800, background: 'var(--text-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={28} color="var(--text-primary)" />
                    PowerFit
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link to="/login" className="btn btn-secondary" style={{ width: 'auto', padding: '10px 24px', fontSize: '0.85rem' }}>
                        Sign In
                    </Link>
                    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </motion.nav>

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', position: 'relative', zIndex: 10 }}>
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    style={{ width: '100%', maxWidth: '520px', position: 'relative' }}
                >
                    {/* Card glow */}
                    <div style={{ position: 'absolute', inset: '-2px', borderRadius: '32px', background: 'var(--text-primary)', opacity: 0.05, filter: 'blur(30px)', pointerEvents: 'none' }} />

                    <div style={{
                        position: 'relative',
                        background: 'var(--grad-card)',
                        backdropFilter: 'blur(40px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                        border: '1px solid var(--border)',
                        borderRadius: '28px',
                        padding: '44px 40px',
                        boxShadow: '0 25px 80px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
                    }}>
                        {/* Top accent */}
                        <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '3px', background: 'var(--text-primary)', borderRadius: '0 0 4px 4px' }} />

                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                                style={{
                                    width: '56px', height: '56px', borderRadius: '16px',
                                    background: 'var(--surface-hover)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 20px', fontSize: '1.5rem',
                                    border: '4px solid var(--surface-hover)',
                                    borderTop: '4px solid var(--text-primary)',
                                    color: 'var(--text-primary)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
                                }}
                            >
                                <User size={28} />
                            </motion.div>
                            <h1 style={{ fontFamily: 'Outfit, Space Grotesk, sans-serif', fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                                Create Account
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                                Join the fitness revolution today
                            </p>

                            {/* Step indicator */}
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
                                {[1, 2].map(s => (
                                    <div
                                        key={s}
                                        style={{
                                            width: s === step ? '32px' : '10px',
                                            height: '4px',
                                            borderRadius: '4px',
                                            background: s === step ? 'var(--text-primary)' : 'var(--border)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: 'rgba(255, 59, 92, 0.08)',
                                    border: '1px solid rgba(255, 59, 92, 0.2)',
                                    color: 'var(--red)',
                                    padding: '14px 18px',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'center',
                                    marginBottom: '24px',
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <span>⚠</span> {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="s1"
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -30 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div style={{ marginBottom: '18px' }}>
                                            <label style={labelStyle}>Username</label>
                                            <div style={{ position: 'relative' }}>
                                                <input id="signup-username" type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="Choose a username" style={inputStyle}
                                                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)'; }}
                                                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                />
                                                <User size={18} style={iconStyle} />
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '18px' }}>
                                            <label style={labelStyle}>Email</label>
                                            <div style={{ position: 'relative' }}>
                                                <input id="signup-email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" style={inputStyle}
                                                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)'; }}
                                                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                />
                                                <Mail size={18} style={iconStyle} />
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={labelStyle}>Password</label>
                                            <div style={{ position: 'relative' }}>
                                                <input id="signup-password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required placeholder="Create strong password" style={inputStyle}
                                                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)'; }}
                                                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                />
                                                <Lock size={18} style={iconStyle} />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    tabIndex="-1"
                                                    style={{
                                                        position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                                        background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px'
                                                    }}
                                                    onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                                    onMouseOut={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <motion.button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            disabled={!formData.username || !formData.email || !formData.password}
                                            whileHover={{ scale: (!formData.username || !formData.email || !formData.password) ? 1 : 1.02 }}
                                            whileTap={{ scale: (!formData.username || !formData.email || !formData.password) ? 1 : 0.98 }}
                                            style={{ 
                                                width: '100%', padding: '16px', fontSize: '1.05rem', fontWeight: 800,
                                                borderRadius: 'var(--radius-full)',
                                                border: 'none',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                background: (!formData.username || !formData.email || !formData.password) ? 'var(--surface-hover)' : 'var(--text-primary)',
                                                color: (!formData.username || !formData.email || !formData.password) ? 'var(--text-tertiary)' : '#000000',
                                                cursor: (!formData.username || !formData.email || !formData.password) ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            Continue <span style={{ fontSize: '1.2rem' }}>→</span>
                                        </motion.button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="s2"
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -30 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                                            <div>
                                                <label style={labelStyle}>Age</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="25" style={inputStyle}
                                                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)'; }}
                                                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                    />
                                                    <Calendar size={18} style={iconStyle} />
                                                </div>
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Gender</label>
                                                <select className="form-input" name="gender" value={formData.gender} onChange={handleChange}
                                                    style={{ paddingLeft: '18px', cursor: 'pointer' }}
                                                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)'; }}
                                                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                >
                                                    <option value="male" style={{ background: 'var(--bg-2)' }}>Male</option>
                                                    <option value="female" style={{ background: 'var(--bg-2)' }}>Female</option>
                                                </select>
                                            </div>
                                        </div>



                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <motion.button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                style={{ 
                                                    flex: 1, padding: '16px', fontSize: '1rem', fontWeight: 800,
                                                    borderRadius: 'var(--radius-full)', border: '1px solid var(--border)',
                                                    background: 'var(--surface)', color: 'var(--text-primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ← Back
                                            </motion.button>
                                            <motion.button
                                                type="submit"
                                                disabled={isLoading}
                                                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                                style={{ 
                                                    flex: 2, padding: '16px', fontSize: '1rem', fontWeight: 800,
                                                    borderRadius: 'var(--radius-full)', border: 'none',
                                                    background: isLoading ? 'var(--surface-hover)' : 'var(--text-primary)',
                                                    color: isLoading ? 'var(--text-tertiary)' : '#000000',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                    cursor: isLoading ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {isLoading ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                                        <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                                                        Creating...
                                                    </div>
                                                ) : (
                                                    <>Create Account 🚀</>
                                                )}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: '28px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.88rem' }}>Already have an account? </span>
                            <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.88rem' }}
                                onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
                            >
                                Sign in →
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--text-primary)', opacity: 0.1, zIndex: 10 }} />
        </div>
    );
};

export default Signup;
