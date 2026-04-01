import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Activity, Brain, ArrowRight, Dumbbell, Flame } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Landing = () => {
    const { user } = useContext(AuthContext);
    const { toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    // Subtle grid pattern for texture
    const GridPattern = () => (
        <div style={{
            position: 'absolute', inset: 0, opacity: 0.05, zIndex: 0,
            backgroundImage: 'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }} />
    );

    return (
        <div style={{
            minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column',
            position: 'relative', overflowX: 'hidden', background: 'var(--bg)',
            color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif'
        }}>
            {/* Global Noise */}
            <div className="noise-overlay" />

            {/* Navbar */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(var(--bg), 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--border)'
            }}>
                <div style={{
                    fontFamily: 'Outfit, Space Grotesk, sans-serif', fontSize: '1.6rem', fontWeight: 800,
                    color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <Zap size={26} color="var(--text-primary)" />
                    PowerFit
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {user ? (
                        <Link to="/dashboard" style={{
                            padding: '10px 24px', borderRadius: 'var(--radius-full)',
                            background: '#ffffff', color: 'var(--nav-bg)',
                            fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem',
                            transition: 'opacity 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.opacity = 0.9}
                        onMouseOut={e => e.currentTarget.style.opacity = 1}>
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" style={{
                                color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none',
                                padding: '10px', transition: 'color 0.2s', fontSize: '0.9rem'
                            }}
                            onMouseOver={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            onMouseOut={e => e.currentTarget.style.color = 'var(--text-primary)'}>
                                Sign In
                            </Link>
                            <Link to="/signup" style={{
                                padding: '10px 24px', borderRadius: 'var(--radius-full)',
                                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem',
                                background: 'var(--text-primary)', color: 'var(--bg)',
                                fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.opacity = 0.9}
                            onMouseOut={e => e.currentTarget.style.opacity = 1}>
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', paddingTop: '80px', paddingBottom: '80px', zIndex: 1
            }}>
                <GridPattern />

                <div style={{ zIndex: 2, textAlign: 'center', maxWidth: '900px', padding: '0 24px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-full)', marginBottom: '32px', color: 'var(--text-secondary)',
                        fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase'
                    }}>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-primary)' }} />
                        Your Personal Fitness Platform
                    </div>
                    
                    <h1 style={{
                        fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 800,
                        lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '24px', color: 'var(--text-primary)'
                    }}>
                        Track, Train, and <br />
                        <span style={{ color: 'var(--text-secondary)' }}>Transform Your Body</span>
                    </h1>

                    <p style={{
                        fontSize: '1.15rem', color: 'var(--text-tertiary)', maxWidth: '600px',
                        margin: '0 auto 48px', lineHeight: 1.6, fontWeight: 400
                    }}>
                        PowerFit provides you with all the necessary tools to reach your fitness goals. Get AI-generated plans, log your daily diet, and follow workouts curated by real trainers.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/signup" style={{
                            padding: '18px 40px', fontSize: '1rem', borderRadius: 'var(--radius-full)',
                            display: 'flex', alignItems: 'center', gap: '12px',
                            background: 'var(--text-primary)', color: 'var(--bg)',
                            fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            Start Free Trial <ArrowRight size={18} />
                        </Link>
                        <a href="#features" style={{
                            padding: '18px 40px', fontSize: '1rem', borderRadius: 'var(--radius-full)',
                            background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)',
                            textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                        onMouseOut={e => e.currentTarget.style.background = 'var(--surface)'}>
                            Explore Platform
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" style={{ padding: '120px 24px', position: 'relative', zIndex: 10, background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>Core Features</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                            Everything you need to successfully manage your daily routines.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                        {[
                            { icon: Brain, title: 'AI Plan Generator', desc: 'Generate a personalized workout and diet plan based on your age, gender, and fitness level.' },
                            { icon: Activity, title: 'Diet Tracking', desc: 'Easily track your daily meals. View detailed breakdowns for Protein, Carbs, Fats, and total KCAL.' },
                            { icon: Dumbbell, title: 'Trainer Workouts', desc: 'Access comprehensive exercises and nutrition data managed directly by our professional staff.' },
                            { icon: Flame, title: 'Progress Journey', desc: 'View your historical daily logs in one place to monitor your continuing adherence and success.' }
                        ].map((feat, i) => (
                            <div key={i} style={{
                                background: 'transparent', border: '1px solid var(--border)', borderRadius: '20px',
                                padding: '40px', transition: 'all 0.3s ease', position: 'relative'
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--text-tertiary)'}
                            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '14px', background: 'var(--surface)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
                                    border: '1px solid var(--border)'
                                }}>
                                    <feat.icon size={26} color="var(--text-primary)" />
                                </div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.01em' }}>{feat.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section style={{ padding: '100px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
                            The Protocol
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                            A systematic approach to achieving your fitness objectives through data.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', position: 'relative' }}>
                        {[
                            { step: '01', title: 'Generate Base', desc: 'Input your physical metrics and goals. Our AI immediately constructs your bespoke workout and nutritional foundation.' },
                            { step: '02', title: 'Execute & Log', desc: 'Follow the generated protocols daily. Log your macro intake and workout completions directly into your personalized dashboard.' },
                            { step: '03', title: 'Track Journey', desc: 'Monitor your adherence curve and biometric progression on the Journey page to ensure continuous adaptation.' }
                        ].map((item, i) => (
                            <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ 
                                    fontSize: '3.5rem', fontWeight: 800, color: 'transparent', WebkitTextStroke: '1px var(--border)',
                                    fontFamily: 'Outfit, sans-serif', marginBottom: '16px', lineHeight: 1 
                                }}>
                                    {item.step}
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                                    {item.title}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Platform Roles Section */}
            <section style={{ padding: '100px 24px', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    <div style={{ padding: '48px', border: '1px solid var(--border)', borderRadius: '24px', background: 'var(--surface)', position: 'relative' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>For Athletes</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '32px' }}>
                            Access a streamlined interface built for execution. Follow AI-generated plans, log daily macro targets, and participate in community chat systems.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {['Daily Macro Logging', 'AI Plan Generation', 'Progress Visualization', 'Community Chat'].map((feat, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--bg)', fontSize: '0.7rem' }}>✓</span>
                                    {feat}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ padding: '48px', border: '1px solid var(--border)', borderRadius: '24px', background: 'transparent', position: 'relative' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>For Trainers</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '32px' }}>
                            Take administrative control of the platform. Curate the central exercise and nutrition databases, interact with athletes, and manage platform standards.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {['Database Management', 'Exercise Curation', 'Nutrition Curation', 'Global Support'].map((feat, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--text-secondary)', color: 'var(--bg)', fontSize: '0.7rem' }}>✓</span>
                                    {feat}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Footer / Final CTA */}
            <footer style={{ padding: '100px 24px 60px', background: 'var(--surface)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto 80px' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                        Start Your Journey
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '40px' }}>
                        Create an account to access the platform.
                    </p>
                    <Link to="/signup" style={{
                        padding: '18px 48px', fontSize: '1rem', borderRadius: 'var(--radius-full)',
                        display: 'inline-flex', alignItems: 'center', gap: '12px',
                        background: 'var(--text-primary)', color: 'var(--bg)',
                        fontWeight: 700, textDecoration: 'none', transition: 'transform 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        Create Account
                    </Link>
                </div>

                <div style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-primary)'
                }}>
                    <Zap size={22} color="var(--text-primary)" />
                    PowerFit
                </div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                    &copy; {new Date().getFullYear()} PowerFit. Built for longevity.
                </p>
            </footer>
        </div>
    );
};

export default Landing;
