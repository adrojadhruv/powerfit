import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { getCalorieMetaphor } from '../utils/creativeMetaphors';
import { downloadTableAsPDF } from '../utils/pdfExport';
import {
    Coffee, Salad, Utensils, Apple, Droplet, CheckCircle2,
    Calendar, Download, Activity, Leaf
} from 'lucide-react';

const DietPlanViewer = ({ plan, dailyLog, toggleMeal }) => {
    const grouped = plan.meals?.reduce((acc, meal) => {
        let day = 'Meals';
        let name = meal.name;
        const match = name.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(.*)/);
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
        acc[day].push({ ...meal, displayName: name });
        return acc;
    }, {});

    const days = Object.keys(grouped || {});

    // Determine the current real-world day (e.g., 'Monday', 'Tuesday')
    const todayObject = new Date();
    const currentRealDay = todayObject.toLocaleDateString('en-US', { weekday: 'long' });

    // Sort logic to prefer opening today's tab if it exists, else the first valid tab
    const initialDay = days.includes(currentRealDay) ? currentRealDay : (days[0] || 'Meals');
    const [activeDay, setActiveDay] = useState(initialDay);

    const getMealIcon = (name) => {
        if (name.includes('Breakfast')) return <Coffee size={24} />;
        if (name.includes('Lunch')) return <Salad size={24} />;
        if (name.includes('Dinner')) return <Utensils size={24} />;
        if (name.includes('Snack')) return <Apple size={24} />;
        if (name.includes('Post-Workout')) return <Droplet size={24} />;
        return <Utensils size={24} />;
    };

    const getMealType = (name) => {
        const types = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Post-Workout'];
        for (const t of types) {
            if (name.includes(t)) return t;
        }
        return 'Meal';
    };

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
        >
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
                        {plan.category}
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
                    {plan.title.replace('AI Diet:', '').trim() || plan.title}
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

            {/* Meals */}
            <div style={{ padding: '36px', background: 'rgba(0,0,0,0.08)' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeDay}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px', margin: '0 auto' }}
                    >
                        {grouped[activeDay]?.map((meal, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ x: 6 }}
                                style={{
                                    background: 'var(--grad-card)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 'var(--radius-lg)',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'stretch',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {/* Meal type indicator */}
                                <div style={{
                                    minWidth: '100px',
                                    background: 'var(--surface-hover)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '24px 16px',
                                    borderRight: '1px solid var(--border)',
                                    gap: '12px'
                                }}>
                                    <div style={{ color: 'var(--text-secondary)' }}>
                                        {getMealIcon(meal.name)}
                                    </div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {meal.time || getMealType(meal.name)}
                                    </span>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '24px 28px', flex: 1, position: 'relative' }}>

                                    <button
                                        onClick={() => {
                                            if (activeDay === currentRealDay || activeDay === 'Meals') {
                                                toggleMeal(meal.name);
                                            } else {
                                                alert(`You can only mark meals complete on the actual day they are scheduled (${currentRealDay}).`);
                                            }
                                        }}
                                        style={{
                                            position: 'absolute', top: '16px', right: '16px',
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '8px 12px', borderRadius: '6px',
                                            background: dailyLog?.completedMeals?.some(m => m.name === meal.name) ? 'var(--primary)' : 'transparent',
                                            border: `1px solid ${dailyLog?.completedMeals?.some(m => m.name === meal.name) ? 'var(--primary)' : 'var(--border)'}`,
                                            color: dailyLog?.completedMeals?.some(m => m.name === meal.name) ? 'var(--bg)' : 'var(--text-secondary)',
                                            fontSize: '0.8rem', fontWeight: 500,
                                            cursor: (activeDay === currentRealDay || activeDay === 'Meals') ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.15s ease',
                                            opacity: (activeDay === currentRealDay || activeDay === 'Meals') ? 1 : 0.4
                                        }}
                                        title={
                                            (activeDay !== currentRealDay && activeDay !== 'Meals')
                                                ? `Only available on ${activeDay}`
                                                : dailyLog?.completedMeals?.some(m => m.name === meal.name) ? "Mark Incomplete" : "Mark Complete"
                                        }
                                    >
                                        <CheckCircle2 size={16} />
                                        {dailyLog?.completedMeals?.some(m => m.name === meal.name) ? 'Logged' : 'Log Meal'}
                                    </button>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', paddingRight: '40px' }}>
                                        <h3 style={{
                                            margin: 0, fontSize: '1.4rem',
                                            color: 'var(--text-primary)', fontWeight: 800,
                                            fontFamily: 'Outfit, sans-serif',
                                            letterSpacing: '-0.01em',
                                            textDecoration: dailyLog?.completedMeals?.some(m => m.name === meal.name) ? 'line-through' : 'none',
                                            opacity: dailyLog?.completedMeals?.some(m => m.name === meal.name) ? 0.6 : 1
                                        }}>
                                            {meal.displayName.replace('Breakfast', '').replace('Lunch', '').replace('Dinner', '').replace('Snack', '').trim() || meal.displayName}
                                        </h3>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                            <div style={{
                                                display: 'flex', alignItems: 'baseline', gap: '4px',
                                                background: 'var(--surface)',
                                                padding: '6px 14px',
                                                borderRadius: 'var(--radius-full)',
                                                border: '1px solid var(--border)'
                                            }}>
                                                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--blue)', fontFamily: 'Outfit, sans-serif' }}>
                                                    {meal.calories}
                                                </span>
                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                    kcal
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 700 }}>
                                                {getCalorieMetaphor(meal.calories)}
                                            </div>
                                        </div>
                                    </div>

                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '14px' }}>
                                        {meal.description}
                                    </p>

                                    <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                                        Portion: {meal.quantity}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const DietPlans = () => {
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
                const plansRes = await axios.get('\/api/diets', {
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

    const toggleMeal = async (mealName) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`\/api/dailylogs/meal`, {
                date: todayStr,
                mealName
            }, { headers: { 'x-auth-token': token } });
            setDailyLog(res.data);
        } catch (err) { console.error(err); }
    };

    return (
        <div style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative' }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}
            >
                <div>
                    <div className="section-eyebrow">Nutrition</div>
                    <h1 className="section-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '12px', color: 'var(--text-primary)' }}>
                        Diet & Nutrition
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1rem' }}>
                        Your personalized meal plans, designed by AI for optimal results.
                    </p>
                </div>
                {plans.length > 0 && (
                    <motion.button
                        onClick={() => {
                            const headers = ['Day', 'Meal', 'Items', 'Portion', 'Calories'];
                            const data = [];

                            plans.forEach(plan => {
                                plan.meals.forEach(meal => {
                                    // Parse day
                                    let day = 'Any';
                                    let name = meal.name;
                                    const match = name.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(.*)/);

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
                                        name.replace('Breakfast', '').replace('Lunch', '').replace('Dinner', '').replace('Snack', '').replace('Post-Workout', '').trim() || name,
                                        meal.description,
                                        meal.quantity,
                                        `${meal.calories} kcal`
                                    ]);
                                });
                            });

                            downloadTableAsPDF('My Diet Plan', headers, data, 'MyGym_Diet_Plan');
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
                        <div key={i} className="skeleton" style={{ height: '250px', borderRadius: 'var(--radius-xl)' }} />
                    ))}
                </div>
            ) : (
                <div id="diet-plan-content" style={{ display: 'flex', flexDirection: 'column' }}>
                    {plans.map((plan) => (
                        <DietPlanViewer key={plan._id} plan={plan} dailyLog={dailyLog} toggleMeal={toggleMeal} />
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
                                No Active Nutrition Protocols
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '400px', margin: 0, lineHeight: 1.5 }}>
                                Navigate to the AI Architect to generate your personalized nutrition configuration.
                            </p>
                        </motion.div>
                    )}
                </div>
            )
            }
        </div >
    );
};

export default DietPlans;
