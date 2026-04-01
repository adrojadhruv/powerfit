import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Flame, Dumbbell, Target, Activity,
    Battery, Gauge, Zap,
    Leaf, Salad, Utensils,
    ChevronRight, ChevronLeft, CheckCircle2
} from 'lucide-react';

const goals = [
    { name: 'Weight Loss', icon: <Flame size={24} />, desc: 'Reduce body mass and tone up' },
    { name: 'Muscle Gain', icon: <Dumbbell size={24} />, desc: 'Increase lean muscle and strength' },
    { name: 'Bulking', icon: <Activity size={24} />, desc: 'Maximize size and power metrics' },
    { name: 'Cutting', icon: <Target size={24} />, desc: 'Refine condition and lower body fat' }
];

const levels = [
    { name: 'Beginner', icon: <Battery size={24} />, desc: '0-6 months training experience' },
    { name: 'Intermediate', icon: <Gauge size={24} />, desc: '6-24 months training experience' },
    { name: 'Advanced', icon: <Zap size={24} />, desc: '2+ years consistent training' }
];

const genders = ['Male', 'Female', 'Other'];

const dietPrefs = [
    { name: 'Vegan', icon: <Leaf size={24} />, desc: 'Exclusively plant-based nutrition' },
    { name: 'Vegetarian', icon: <Salad size={24} />, desc: 'Plant-based with dairy inclusion' },
    { name: 'Non-Vegetarian', icon: <Utensils size={24} />, desc: 'Comprehensive omnivorous diet' }
];

const totalSteps = 5;

// Clean Corporate Loader
const GenerationLoader = () => {
    const messages = ['Analyzing profile data...', 'Computing metabolic rates...', 'Structuring regimens...', 'Finalizing generation...'];
    const [msgIdx, setMsgIdx] = useState(0);

    useEffect(() => {
        const int = setInterval(() => {
            setMsgIdx(prev => (prev + 1) % messages.length);
        }, 1200);
        return () => clearInterval(int);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    border: '2px solid var(--border)',
                    borderTop: '2px solid var(--text-primary)',
                    marginBottom: '24px'
                }}
            />
            <AnimatePresence mode="wait">
                <motion.div
                    key={msgIdx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}
                >
                    {messages[msgIdx]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// SelectionCard - Clean, bordered, flat design
const SelectionCard = ({ item, isSelected, onClick }) => (
    <div
        onClick={onClick}
        style={{
            padding: '20px',
            cursor: 'pointer',
            borderRadius: '8px',
            border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border)',
            background: isSelected ? 'var(--surface-hover)' : 'var(--surface)',
            transition: 'all 0.15s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '12px'
        }}
    >
        <div style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {item.icon}
        </div>
        <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {item.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>
                {item.desc}
            </div>
        </div>
    </div>
);

const PlanGenerator = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        goal: '', level: '', weight: '', height: '',
        age: '', gender: '', targetWeight: '', targetBodyFat: '', dietPref: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [plan, setPlan] = useState(null);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const generatePlan = async () => {
        setIsGenerating(true);
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const headers = { 'x-auth-token': token };
                const res = await axios.post('\/api/generator/generate', formData, { headers });
                setTimeout(() => {
                    setPlan(res.data);
                    setIsGenerating(false);
                    setStep(6);
                }, 3000); // 3 seconds to show off the loader
            }
        } catch (err) {
            console.error("Failed to generate AI plans via DB:", err);
            setIsGenerating(false);
            alert("Error generating plan.");
        }
    };

    const progressWidth = `${((step > 5 ? 5 : step) / totalSteps) * 100}%`;

    return (
        <div style={{
            position: 'relative',
            minHeight: 'calc(100vh - 80px)',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'var(--bg)',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>

            <div style={{ width: '100%', maxWidth: '800px', padding: '60px 24px', zIndex: 1 }}>

                {/* Header Subdued & Professional */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        margin: '0 0 12px 0',
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                        fontFamily: 'Outfit, sans-serif'
                    }}>
                        Build Your Fitness Plan
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.5 }}>
                        Tell us about your body and goals, and our AI will build a personalized, data-driven regimen.
                    </p>
                </div>

                {/* Progress Bar - Thin, crisp lines */}
                {step <= 5 && !isGenerating && (
                    <div style={{ marginBottom: '48px', maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Phase {step} of {totalSteps}
                            </span>
                        </div>
                        <div style={{ height: '2px', background: 'var(--surface)', width: '100%', position: 'relative' }}>
                            <motion.div
                                animate={{ width: progressWidth }}
                                transition={{ ease: "easeInOut", duration: 0.3 }}
                                style={{ height: '100%', background: 'var(--text-primary)', position: 'absolute', top: 0, left: 0 }}
                            />
                        </div>
                    </div>
                )}

                {/* Wizard Canvas - Minimal outlines */}
                <div style={{ position: 'relative', minHeight: '400px', maxWidth: '600px', margin: '0 auto' }}>
                    <AnimatePresence mode="wait">
                        {isGenerating ? (
                            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                <GenerationLoader />
                            </motion.div>
                        ) : step === 1 ? (
                            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                                style={{ padding: '40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                <h2 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Primary Objective</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.9rem' }}>Select the primary goal governing your configuration.</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                    {goals.map(g => <SelectionCard key={g.name} item={g} isSelected={formData.goal === g.name} onClick={() => handleChange('goal', g.name)} />)}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
                                    <button
                                        style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 500, background: 'var(--text-primary)', color: 'var(--bg)', border: 'none', borderRadius: '6px', cursor: formData.goal ? 'pointer' : 'not-allowed', opacity: formData.goal ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '8px' }}
                                        onClick={nextStep} disabled={!formData.goal}
                                    >
                                        Continue <ChevronRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ) : step === 2 ? (
                            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                                style={{ padding: '40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                <h2 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Experience Level</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.9rem' }}>Specify your consistent training tenure.</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {levels.map(l => <SelectionCard key={l.name} item={l} isSelected={formData.level === l.name} onClick={() => handleChange('level', l.name)} />)}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                                    <button style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={prevStep}>
                                        <ChevronLeft size={16} /> Back
                                    </button>
                                    <button
                                        style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 500, background: 'var(--text-primary)', color: 'var(--bg)', border: 'none', borderRadius: '6px', cursor: formData.level ? 'pointer' : 'not-allowed', opacity: formData.level ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '8px' }}
                                        onClick={nextStep} disabled={!formData.level}
                                    >
                                        Continue <ChevronRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ) : step === 3 ? (
                            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                                style={{ padding: '40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                <h2 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Biometric Data</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.9rem' }}>Input precise metrics for metabolic calibration.</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Gender</label>
                                        <select className="form-input" style={{ background: 'var(--bg)' }} value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}>
                                            <option value="">Select gender</option>
                                            {genders.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Age (Years)</label>
                                        <input type="number" style={{ padding: '12px 16px', fontSize: '0.95rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }} value={formData.age} onChange={(e) => handleChange('age', e.target.value)} placeholder="e.g. 28" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Current Weight (kg)</label>
                                        <input type="number" style={{ padding: '12px 16px', fontSize: '0.95rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }} value={formData.weight} onChange={(e) => handleChange('weight', e.target.value)} placeholder="e.g. 80" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Height (cm)</label>
                                        <input type="number" style={{ padding: '12px 16px', fontSize: '0.95rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }} value={formData.height} onChange={(e) => handleChange('height', e.target.value)} placeholder="e.g. 180" />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                                    <button style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={prevStep}>
                                        <ChevronLeft size={16} /> Back
                                    </button>
                                    <button
                                        style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 500, background: 'var(--text-primary)', color: 'var(--bg)', border: 'none', borderRadius: '6px', cursor: (!formData.gender || !formData.age || !formData.weight || !formData.height) ? 'not-allowed' : 'pointer', opacity: (!formData.gender || !formData.age || !formData.weight || !formData.height) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                                        onClick={nextStep} disabled={!formData.gender || !formData.age || !formData.weight || !formData.height}
                                    >
                                        Continue <ChevronRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ) : step === 4 ? (
                            <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                                style={{ padding: '40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                <h2 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Target Parameters</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.9rem' }}>Set your intended physiological shift.</p>
                                <div style={{ maxWidth: '100%' }}>
                                    {(formData.goal === 'Weight Loss' || formData.goal === 'Muscle Gain' || formData.goal === 'Bulking') && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Target Body Weight (kg)</label>
                                            <input type="number" style={{ padding: '12px 16px', fontSize: '0.95rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }} value={formData.targetWeight} onChange={(e) => handleChange('targetWeight', e.target.value)} placeholder="e.g. 75" />
                                        </motion.div>
                                    )}
                                    {formData.goal === 'Cutting' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Target Body Fat (%)</label>
                                            <input type="number" style={{ padding: '12px 16px', fontSize: '0.95rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }} value={formData.targetBodyFat} onChange={(e) => handleChange('targetBodyFat', e.target.value)} placeholder="e.g. 12" />
                                        </motion.div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                                    <button style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={prevStep}>
                                        <ChevronLeft size={16} /> Back
                                    </button>
                                    <button
                                        style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 500, background: 'var(--text-primary)', color: 'var(--bg)', border: 'none', borderRadius: '6px', cursor: (!formData.targetWeight && !formData.targetBodyFat) ? 'not-allowed' : 'pointer', opacity: (!formData.targetWeight && !formData.targetBodyFat) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                                        onClick={nextStep} disabled={!formData.targetWeight && !formData.targetBodyFat}
                                    >
                                        Continue <ChevronRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ) : step === 5 ? (
                            <motion.div key="step5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                                style={{ padding: '40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                <h2 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Dietary Framework</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.9rem' }}>Select your baseline nutritional constraint.</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {dietPrefs.map(d => <SelectionCard key={d.name} item={d} isSelected={formData.dietPref === d.name} onClick={() => handleChange('dietPref', d.name)} />)}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                                    <button style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={prevStep}>
                                        <ChevronLeft size={16} /> Back
                                    </button>
                                    <button
                                        style={{ padding: '12px 32px', fontSize: '0.9rem', fontWeight: 500, background: 'var(--text-primary)', color: 'var(--bg)', border: 'none', borderRadius: '6px', cursor: !formData.dietPref ? 'not-allowed' : 'pointer', opacity: !formData.dietPref ? 0.5 : 1 }}
                                        onClick={generatePlan}
                                        disabled={!formData.dietPref}
                                    >
                                        Generate Regimen
                                    </button>
                                </div>
                            </motion.div>
                        ) : step === 6 && plan ? (
                            <motion.div key="step6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                                style={{ width: '100%' }}>

                                <div style={{ padding: '40px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', boxSizing: 'border-box' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                        <CheckCircle2 size={32} color="var(--primary)" />
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                            Your Plan is Ready
                                        </h2>
                                    </div>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.6 }}>
                                        Your custom blueprint for <strong>{plan.goal}</strong> has been generated successfully. We've assigned you a daily intake goal of <strong>{plan.targetCalories} kcal</strong>.
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                                        {[
                                            { label: 'Protein Target', value: `${plan.macros.p}g` },
                                            { label: 'Carbs Target', value: `${plan.macros.c}g` },
                                            { label: 'Fats Target', value: `${plan.macros.f}g` },
                                        ].map((m, i) => (
                                            <div key={m.label} style={{ background: 'var(--bg)', padding: '20px', borderRadius: '8px', border: `1px solid var(--border)` }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{m.label}</div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}
                                        onClick={() => { setStep(1); setFormData({ goal: '', level: '', weight: '', height: '', age: '', gender: '', targetWeight: '', targetBodyFat: '', dietPref: '' }); }}>
                                        Reconfigure Parameters
                                    </button>
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PlanGenerator;
