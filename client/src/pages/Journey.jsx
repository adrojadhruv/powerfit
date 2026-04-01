import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { downloadTableAsPDF } from '../utils/pdfExport';

const Journey = () => {
    const { user } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const [progressList, setProgressList] = useState([]);
    const [dailyLogs, setDailyLogs] = useState([]);
    const [combinedTimeline, setCombinedTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [formData, setFormData] = useState({
        weight: '',
        bodyFat: '',
        bmi: '',
        notes: '',
        height: '',
        neck: '',
        waist: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [imageFile, setImageFile] = useState(null);
    const [submitStatus, setSubmitStatus] = useState(null); // { type: 'success' | 'error', msg: '' }

    const fetchProgress = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const queryParams = selectedUserId ? `&userId=${selectedUserId}` : '';
            // Fetch Daily Logs
            const logsRes = await axios.get(`/api/dailylogs/all?t=${Date.now()}${queryParams}`, {
                headers: { 'x-auth-token': token }
            });
            const fetchedLogs = logsRes.data;
            setDailyLogs(fetchedLogs);

            // Fetch Progress
            const res = await axios.get(`/api/progress?t=${Date.now()}${queryParams}`, {
                headers: { 'x-auth-token': token }
            });

            // Map data for chart
            const mappedData = res.data.map(item => ({
                ...item,
                type: 'progress',
                dateStr: new Date(item.date).toLocaleDateString()
            }));
            setProgressList(mappedData);

            // Create Combined Timeline
            const timelineMap = new Map();

            // Add progress entries
            mappedData.forEach(p => {
                timelineMap.set(p.date, { ...p, hasProgress: true });
            });

            // Add diet logs
            fetchedLogs.forEach(log => {
                if (log.dietTrackerData) {
                    if (timelineMap.has(log.date)) {
                        timelineMap.set(log.date, { ...timelineMap.get(log.date), dietTrackerData: log.dietTrackerData, hasDiet: true });
                    } else {
                        timelineMap.set(log.date, {
                            _id: log._id,
                            date: log.date,
                            dateStr: new Date(log.date).toLocaleDateString(),
                            type: 'diet',
                            dietTrackerData: log.dietTrackerData,
                            hasDiet: true
                        });
                    }
                }
            });

            // Sort timeline chronologically (earliest first, then timeline is reversed for render)
            const combined = Array.from(timelineMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
            setCombinedTimeline(combined);

            // Pre-fill height from last entry if available
            if (mappedData.length > 0) {
                const latest = mappedData[mappedData.length - 1];
                if (latest.height) {
                    setFormData(prev => ({ ...prev, height: latest.height }));
                }
            }
        } catch (err) {
            console.error('Error fetching progress:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'trainer') {
            const token = localStorage.getItem('token');
            axios.get('/api/users/contacts', { headers: { 'x-auth-token': token } })
                .then(res => setContacts(res.data))
                .catch(console.error);
        }
    }, [user]);

    useEffect(() => {
        fetchProgress();
    }, [selectedUserId]);

    useEffect(() => {
        // Auto-calculate BMI and Body Fat whenever weight, height, neck, waist change
        let newBmi = formData.bmi;
        let newBodyFat = formData.bodyFat;

        const w = parseFloat(formData.weight);
        const h = parseFloat(formData.height); // in cm
        const n = parseFloat(formData.neck);
        const wa = parseFloat(formData.waist);

        if (w > 0 && h > 0) {
            // BMI Calculation: weight (kg) / (height (m))^2
            const heightInMeters = h / 100;
            newBmi = (w / (heightInMeters * heightInMeters)).toFixed(1);
        }

        if (w > 0 && h > 0 && n > 0 && wa > 0) {
            // US Navy Body Fat Formula (Metric) - simplified assuming Male. 
            // Formula requires waist and neck in cm
            // % Body Fat = 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
            const diff = wa - n;
            if (diff > 0) {
                const bodyFatValue = 86.010 * Math.log10(diff) - 70.041 * Math.log10(h) + 36.76;
                // Add an adjustment for female if context provides gender
                const isFemale = user?.gender === 'female';
                // Very simplified female adjustment:
                const finalBodyFat = isFemale ? bodyFatValue + 10 : bodyFatValue;

                if (finalBodyFat > 0 && finalBodyFat < 100) {
                    newBodyFat = finalBodyFat.toFixed(1);
                }
            }
        }

        setFormData(prev => {
            if (prev.bmi === newBmi && prev.bodyFat === newBodyFat) return prev;
            return { ...prev, bmi: newBmi || '', bodyFat: newBodyFat || '' };
        });

    }, [formData.weight, formData.height, formData.neck, formData.waist, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            const token = localStorage.getItem('token');

            const submitData = new FormData();
            submitData.append('weight', formData.weight);
            submitData.append('bodyFat', formData.bodyFat);
            submitData.append('bmi', formData.bmi);
            submitData.append('notes', formData.notes);
            submitData.append('date', formData.date);
            if (formData.height) submitData.append('height', formData.height);
            if (formData.neck) submitData.append('neck', formData.neck);
            if (formData.waist) submitData.append('waist', formData.waist);

            if (imageFile) submitData.append('image', imageFile);

            await axios.post('\/api/progress', submitData, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSubmitStatus({ type: 'success', msg: 'Progress successfully recorded!' });

            // Reset form
            setFormData(prev => ({
                ...prev,
                weight: '',
                bodyFat: '',
                bmi: '',
                notes: '',
                neck: '',
                waist: '',
                date: new Date().toISOString().split('T')[0]
            }));
            setImageFile(null);
            if (document.getElementById('journeyImageUpload')) {
                document.getElementById('journeyImageUpload').value = '';
            }

            // Re-fetch
            fetchProgress();

            setTimeout(() => setSubmitStatus(null), 3000);
        } catch (err) {
            console.error(err);
            setSubmitStatus({ type: 'error', msg: 'Failed to record progress' });
            setTimeout(() => setSubmitStatus(null), 3000);
        } finally {
            setUploading(false);
        }
    };
    const [uploading, setUploading] = useState(false);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this log?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`\/api/progress/${id}`, {
                headers: { 'x-auth-token': token }
            });
            fetchProgress();
        } catch (err) {
            console.error('Error deleting progress:', err);
        }
    };

    // Calculate chart limits dynamically to make chart look better
    const minWeight = progressList.length > 0 ? Math.min(...progressList.map(p => p.weight)) - 5 : 0;
    const maxWeight = progressList.length > 0 ? Math.max(...progressList.map(p => p.weight)) + 5 : 100;

    return (
        <div style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}
            >
                <div style={{ flex: 1 }}>
                    <div className="section-eyebrow">Tracking</div>
                    <h1 className="section-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '12px', color: 'var(--text-primary)' }}>
                        {selectedUserId ? 'Client\'s Journey' : 'Your Fitness Journey'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '600px' }}>
                        Track {selectedUserId ? 'this user\'s' : 'your'} body metrics over time and visualize progress to stay motivated on {selectedUserId ? 'their' : 'your'} fitness journey.
                    </p>
                    {(user?.role === 'admin' || user?.role === 'trainer') && (
                        <div style={{ marginTop: '20px' }}>
                            <select 
                                value={selectedUserId} 
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="form-input"
                                style={{ width: '100%', maxWidth: '300px', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                            >
                                <option value="">My Journey</option>
                                {contacts.map(c => (
                                    <option key={c._id} value={c._id}>{c.username} ({c.role})</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                <motion.button
                    onClick={() => {
                        const headers = ['Date', 'Weight (kg)', 'Body Fat (%)', 'Neck (cm)', 'Waist (cm)', 'BMI', 'Notes'];
                        const data = [...progressList].reverse().map(item => [
                            item.dateStr,
                            item.weight || '-',
                            item.bodyFat || '-',
                            item.neck || '-',
                            item.waist || '-',
                            item.bmi || '-',
                            item.notes || '-'
                        ]);
                        downloadTableAsPDF('My Fitness Journey Logs', headers, data, 'MyGym_Journey_Progress');
                    }}
                    className="btn-action-outline"
                    style={{ width: 'auto', height: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 700 }}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 59, 92, 0.05)' }}
                    whileTap={{ scale: 0.95 }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    <span style={{ color: 'var(--text-primary)' }}>Export PDF</span>
                </motion.button>
            </motion.div>

            <div id="journey-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Metrics Chart Hero */}
                {(loading || progressList.length >= 2) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{
                            background: 'var(--grad-card)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '32px',
                            marginBottom: '32px',
                            minHeight: '400px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Decorative Elements */}
                        <div style={{
                            position: 'absolute', top: -100, right: -100, width: 300, height: 300,
                            background: 'radial-gradient(circle, var(--blue) 0%, transparent 70%)',
                            opacity: 0.1, filter: 'blur(40px)', pointerEvents: 'none'
                        }} />

                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--blue)' }}>◆</span> Weight Progress over Time
                        </h2>

                        {loading ? (
                            <div style={{ display: 'flex', height: '300px', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="spinner"></div>
                            </div>
                        ) : (
                            <div style={{ width: '100%', height: '320px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={progressList} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3a86ff" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3a86ff" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="dateStr" stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
                                        <YAxis domain={[Math.floor(minWeight), Math.ceil(maxWeight)]} stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dx={-10} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                                            itemStyle={{ color: 'var(--blue)', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="weight" stroke="#3a86ff" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" activeDot={{ r: 6, fill: '#3a86ff', stroke: '#fff', strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Day 1 vs Current Progress Hero */}
                {progressList.length >= 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            background: 'var(--grad-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '40px',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', marginBottom: '32px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                            <span style={{ color: 'var(--orange)' }}>◆</span> Day 1 vs Current Progress
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center', width: '100%', maxWidth: '1000px' }}>
                            {/* First Day */}
                            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>Day 1 ({progressList[0].dateStr})</div>
                                {progressList[0].imageUrl ? (
                                    <div style={{ width: '100%', height: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                        <img src={progressList[0].imageUrl} alt="Day 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ) : (
                                    <div style={{ width: '100%', height: '300px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', background: 'var(--surface)' }}>
                                        No Photo Recorded
                                    </div>
                                )}
                                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'left' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div><span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>WEIGHT</span><div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{progressList[0].weight}</div></div>
                                        {progressList[0].bodyFat && <div><span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>BODY FAT</span><div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{progressList[0].bodyFat}%</div></div>}
                                        {progressList[0].waist && <div><span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>WAIST</span><div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{progressList[0].waist}</div></div>}
                                        {progressList[0].bmi && <div><span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>BMI</span><div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{progressList[0].bmi}</div></div>}
                                    </div>
                                </div>
                            </div>

                            {/* Current Day */}
                            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ fontSize: '1rem', color: 'var(--ok)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>Current ({progressList[progressList.length - 1].dateStr})</div>
                                {progressList[progressList.length - 1].imageUrl ? (
                                    <div style={{ width: '100%', height: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--ok)', boxShadow: '0 4px 15px rgba(34, 197, 94, 0.2)' }}>
                                        <img src={progressList[progressList.length - 1].imageUrl} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ) : (
                                    <div style={{ width: '100%', height: '300px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--ok)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', background: 'var(--surface)' }}>
                                        No Photo Recorded
                                    </div>
                                )}
                                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--ok)', boxShadow: '0 4px 15px rgba(34, 197, 94, 0.1)', textAlign: 'left' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>WEIGHT</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                                {progressList[progressList.length - 1].weight}
                                                <span style={{ fontSize: '0.9rem', color: progressList[progressList.length - 1].weight <= progressList[0].weight ? 'var(--ok)' : 'var(--red)', marginLeft: '8px' }}>
                                                    {progressList[progressList.length - 1].weight < progressList[0].weight ? '↓' : (progressList[progressList.length - 1].weight > progressList[0].weight ? '↑' : '')} {progressList[progressList.length - 1].weight !== progressList[0].weight && Math.abs(progressList[progressList.length - 1].weight - progressList[0].weight).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                        {progressList[progressList.length - 1].bodyFat && (
                                            <div>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>BODY FAT</span>
                                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                                    {progressList[progressList.length - 1].bodyFat}%
                                                    {progressList[0].bodyFat && (
                                                        <span style={{ fontSize: '0.9rem', color: progressList[progressList.length - 1].bodyFat <= progressList[0].bodyFat ? 'var(--ok)' : 'var(--red)', marginLeft: '8px' }}>
                                                            {progressList[progressList.length - 1].bodyFat < progressList[0].bodyFat ? '↓' : (progressList[progressList.length - 1].bodyFat > progressList[0].bodyFat ? '↑' : '')} {progressList[progressList.length - 1].bodyFat !== progressList[0].bodyFat && Math.abs(progressList[progressList.length - 1].bodyFat - progressList[0].bodyFat).toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {progressList[progressList.length - 1].waist && (
                                            <div>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>WAIST</span>
                                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                                    {progressList[progressList.length - 1].waist}
                                                    {progressList[0].waist && (
                                                        <span style={{ fontSize: '0.9rem', color: progressList[progressList.length - 1].waist <= progressList[0].waist ? 'var(--ok)' : 'var(--red)', marginLeft: '8px' }}>
                                                            {progressList[progressList.length - 1].waist < progressList[0].waist ? '↓' : (progressList[progressList.length - 1].waist > progressList[0].waist ? '↑' : '')} {progressList[progressList.length - 1].waist !== progressList[0].waist && Math.abs(progressList[progressList.length - 1].waist - progressList[0].waist).toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {progressList[progressList.length - 1].bmi && (
                                            <div>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>BMI</span>
                                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                                    {progressList[progressList.length - 1].bmi}
                                                    {progressList[0].bmi && (
                                                        <span style={{ fontSize: '0.9rem', color: progressList[progressList.length - 1].bmi <= progressList[0].bmi ? 'var(--ok)' : 'var(--red)', marginLeft: '8px' }}>
                                                            {progressList[progressList.length - 1].bmi < progressList[0].bmi ? '↓' : (progressList[progressList.length - 1].bmi > progressList[0].bmi ? '↑' : '')} {progressList[progressList.length - 1].bmi !== progressList[0].bmi && Math.abs(progressList[progressList.length - 1].bmi - progressList[0].bmi).toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: (!selectedUserId ? 'repeat(auto-fit, minmax(350px, 1fr))' : '1fr'), gap: '24px' }}>
                    {/* Form to Add New Entry */}
                    {!selectedUserId && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            background: 'var(--grad-card)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '28px'
                        }}
                    >
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                            Add New Log
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Record your current metrics. Date and weight are required.
                        </p>

                        {submitStatus && (
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                background: submitStatus.type === 'success' ? 'rgba(56, 189, 120, 0.1)' : 'rgba(255, 59, 92, 0.1)',
                                border: `1px solid ${submitStatus.type === 'success' ? 'var(--ok)' : 'var(--red)'}`,
                                color: submitStatus.type === 'success' ? 'var(--ok)' : 'var(--red)',
                                fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                {submitStatus.type === 'success' ? '✓' : '⚠'} {submitStatus.msg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Date *</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            width: '100%', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Weight (kg/lbs) *</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. 75.5"
                                        style={{
                                            width: '100%', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Height (cm)</label>
                                    <input
                                        type="number" step="0.1" name="height" value={formData.height} onChange={handleChange}
                                        placeholder="e.g. 175"
                                        style={{ width: '100%', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Neck (cm)</label>
                                    <input
                                        type="number" step="0.1" name="neck" value={formData.neck} onChange={handleChange}
                                        placeholder="e.g. 40"
                                        style={{ width: '100%', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Waist (cm)</label>
                                    <input
                                        type="number" step="0.1" name="waist" value={formData.waist} onChange={handleChange}
                                        placeholder="e.g. 85"
                                        style={{ width: '100%', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Body Fat (%) <span style={{ color: 'var(--ok)', fontSize: '0.7rem' }}>(Auto)</span></label>
                                    <input
                                        type="number" step="0.1" name="bodyFat" value={formData.bodyFat} onChange={handleChange}
                                        placeholder="e.g. 15.2"
                                        style={{ width: '100%', padding: '12px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                                        readOnly
                                    />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>BMI <span style={{ color: 'var(--ok)', fontSize: '0.7rem' }}>(Auto)</span></label>
                                    <input
                                        type="number" step="0.1" name="bmi" value={formData.bmi} onChange={handleChange}
                                        placeholder="e.g. 23.4"
                                        style={{ width: '100%', padding: '12px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="How are you feeling? Did your diet/training change?"
                                    rows="3"
                                    style={{
                                        width: '100%', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', resize: 'none'
                                    }}
                                ></textarea>
                            </div>

                            <div className="input-group">
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Progress Photo</label>
                                <input
                                    type="file"
                                    id="journeyImageUpload"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    style={{
                                        width: '100%', padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.9rem'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                style={{
                                    width: '100%', padding: '14px',
                                    background: uploading ? 'var(--surface)' : 'var(--grad-blue)', border: 'none', borderRadius: 'var(--radius-md)',
                                    color: uploading ? 'var(--text-tertiary)' : '#fff', fontSize: '1rem', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer',
                                    marginTop: '8px', transition: 'transform 0.2s, box-shadow 0.2s',
                                    boxShadow: uploading ? 'none' : '0 4px 15px rgba(58, 134, 255, 0.3)'
                                }}
                                onMouseOver={e => { if (!uploading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(58, 134, 255, 0.4)'; } }}
                                onMouseOut={e => { if (!uploading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(58, 134, 255, 0.3)'; } }}
                            >
                                {uploading ? 'Taking Root...' : 'Save Log'}
                            </button>
                        </form>
                    </motion.div>
                    )}

                    {/* History List */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            background: 'var(--grad-card)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '28px',
                            display: 'flex', flexDirection: 'column'
                        }}
                    >
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                            Roots of Consistency
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Your journey deepening into the earth, building a strong foundation.
                        </p>

                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                            {progressList.length === 0 && !loading && (
                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0', fontStyle: 'italic' }}>
                                    No roots planted yet. Start your journey today!
                                </div>
                            )}

                            {/* Tree Root Timeline Container */}
                            <div style={{ padding: '20px 0' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 20px minmax(0, 1fr)', gap: '10px 20px', '@media (maxWidth: 768px)': { gridTemplateColumns: '20px 1fr' } }}>
                                    {[...combinedTimeline].reverse().map((item, index) => {
                                        const isLeft = index % 2 === 0;
                                        const CardContent = (
                                            <motion.div
                                                initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 + index * 0.05 }}
                                                style={{
                                                    background: 'var(--surface)',
                                                    border: '1px solid #6b442340',
                                                    borderRadius: 'var(--radius-xl)',
                                                    padding: '20px',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                    textAlign: isLeft ? 'right' : 'left',
                                                    position: 'relative'
                                                }}
                                            >
                                                {item.hasProgress && !selectedUserId && (
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        style={{
                                                            position: 'absolute', top: '10px', [isLeft ? 'left' : 'right']: '12px',
                                                            background: 'transparent', border: 'none', color: 'var(--text-tertiary)',
                                                            cursor: 'pointer', fontSize: '1.4rem'
                                                        }}
                                                        onMouseOver={e => e.currentTarget.style.color = 'var(--red)'}
                                                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                                                        title="Uproot Entry"
                                                    >×</button>
                                                )}
                                                <div style={{ fontSize: '0.9rem', color: '#8b5a2b', fontWeight: 800, marginBottom: '10px', letterSpacing: '0.05em' }}>
                                                    {item.dateStr}
                                                </div>
                                                <div style={{ display: 'flex', gap: '16px', justifyContent: isLeft ? 'flex-end' : 'flex-start', flexWrap: 'wrap', marginBottom: item.notes || item.imageUrl || item.hasDiet ? '12px' : '0' }}>
                                                    {item.hasProgress && (
                                                        <>
                                                            {item.weight && (
                                                                <div>
                                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Weight</span>
                                                                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.weight} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>kg</span></span>
                                                                </div>
                                                            )}
                                                            {item.height && (
                                                                <div>
                                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Height</span>
                                                                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.height} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>cm</span></span>
                                                                </div>
                                                            )}
                                                            {item.waist && (
                                                                <div>
                                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Waist</span>
                                                                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.waist} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>cm</span></span>
                                                                </div>
                                                            )}
                                                            {item.bodyFat && (
                                                                <div>
                                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Body Fat</span>
                                                                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.bodyFat}<span style={{ fontSize: '0.75rem', fontWeight: 500 }}>%</span></span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                {item.hasDiet && item.dietTrackerData && item.dietTrackerData.totalCalories > 0 && (
                                                    <div style={{ marginBottom: item.notes || item.imageUrl ? '12px' : '0', padding: '16px', borderRadius: '12px', background: 'var(--surface-hover)', border: '1px solid var(--border)', textAlign: 'left' }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span>🍎</span> Nutrition Logged
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                                            <div>
                                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Cals</div>
                                                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.dietTrackerData?.totalCalories || 0}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Protein</div>
                                                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3a86ff' }}>{item.dietTrackerData?.macros?.protein || 0}g</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Carbs</div>
                                                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffbe0b' }}>{item.dietTrackerData?.macros?.carbs || 0}g</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Fats</div>
                                                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ff006e' }}>{item.dietTrackerData?.macros?.fats || 0}g</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {item.notes && (
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg)', padding: '10px 14px', borderRadius: '6px', borderLeft: isLeft ? 'none' : '3px solid #8b5a2b', borderRight: isLeft ? '3px solid #8b5a2b' : 'none', fontStyle: 'italic', marginBottom: item.imageUrl ? '12px' : '0' }}>
                                                        "{item.notes}"
                                                    </div>
                                                )}

                                                {item.imageUrl && (
                                                    <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                        <img src={item.imageUrl} alt="Progress" style={{ width: '100%', display: 'block', maxHeight: '150px', objectFit: 'cover' }} />
                                                    </div>
                                                )}
                                            </motion.div>
                                        );

                                        return (
                                            <div style={{ display: 'contents' }} key={item._id}>
                                                <div style={{ justifySelf: 'end', width: '100%' }}>{isLeft && CardContent}</div>

                                                <div style={{
                                                    position: 'relative',
                                                    width: '4px',
                                                    height: '100%',
                                                    background: 'linear-gradient(to bottom, #8b5a2b, #5c3a21)',
                                                    margin: '0 auto',
                                                    borderRadius: '2px',
                                                    justifySelf: 'center',
                                                    minHeight: '100px'
                                                }}>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '20px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #8b5a2b, #5c3a21)',
                                                        border: '4px solid var(--bg)',
                                                        boxShadow: '0 0 10px rgba(139, 90, 43, 0.5)',
                                                        zIndex: 1
                                                    }} />
                                                </div>

                                                <div style={{ justifySelf: 'start', width: '100%' }}>{!isLeft && CardContent}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Journey;
