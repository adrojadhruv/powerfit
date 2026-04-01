import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { Lock, Users, Target, Zap, Dumbbell, CheckCircle2, Diamond } from 'lucide-react';

const AdminPanel = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUpdate, setNewUpdate] = useState({ title: '', content: '' });
    const [postSuccess, setPostSuccess] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('\/api/users', {
                    headers: { 'x-auth-token': token }
                });
                setUsers(res.data);
            } catch (err) {
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin' || user?.role === 'trainer') {
            fetchUsers();
        }
    }, [user]);

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to completely remove this user?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`\/api/users/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Cannot delete this user or unauthorized.');
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`\/api/users/${id}`, { role: newRole }, {
                headers: { 'x-auth-token': token }
            });
            setUsers(users.map(u => u._id === id ? res.data.user : u));
        } catch (err) {
            console.error('Error updating role:', err);
            alert('Only SuperAdmins can change roles.');
        }
    };

    const handlePostUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('\/api/updates', newUpdate, {
                headers: { 'x-auth-token': token }
            });
            setPostSuccess(true);
            setNewUpdate({ title: '', content: '' });
            setTimeout(() => setPostSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert('Failed to post announcement.');
        }
    };

    if (user?.role !== 'admin' && user?.role !== 'trainer') {
        return (
            <div style={{
                padding: '80px 40px', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
            }}>
                <Lock size={64} style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }} />
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>Access Denied</h2>
                <p style={{ color: 'var(--text-secondary)' }}>You do not have permissions to view this panel.</p>
            </div>
        );
    }

    const getRoleBadge = (role) => {
        const config = {
            admin: { class: 'badge-orange', icon: <Zap size={14} /> },
            trainer: { class: 'badge-blue', icon: <Target size={14} /> },
            user: { class: 'badge-green', icon: <Dumbbell size={14} /> }
        };
        const c = config[role] || config.user;
        return <span className={`badge ${c.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{c.icon} {role.toUpperCase()}</span>;
    };

    return (
        <div style={{ padding: '48px 24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '36px' }}
            >
                <div className="section-eyebrow">Administration</div>
                <h1 className="section-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '12px', color: 'var(--text-primary)' }}>
                    System Management
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Manage users, broadcast announcements, and oversee the platform.
                </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Users', value: users.length, icon: <Users size={20} />, color: 'var(--blue)' },
                    { label: 'Trainers', value: users.filter(u => u.role === 'trainer').length, icon: <Target size={20} />, color: 'var(--purple)' },
                    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: <Zap size={20} />, color: 'var(--orange)' }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="stat-card"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.08 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                                    {stat.label}
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: stat.color }}>
                                    {stat.value}
                                </div>
                            </div>
                            <div style={{
                                width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
                                background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: stat.color
                            }}>
                                {stat.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>

                {/* Broadcast Announcement */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        background: 'var(--grad-card)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '32px',
                        height: 'fit-content'
                    }}
                >
                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 800, fontSize: '1.3rem',
                        marginBottom: '8px', color: 'var(--text-primary)',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <Diamond size={16} style={{ color: 'var(--orange)', fill: 'var(--orange)' }} /> Broadcast
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.88rem' }}>
                        Post updates visible on every user's dashboard.
                    </p>

                    {postSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'rgba(0, 212, 170, 0.08)',
                                border: '1px solid rgba(0, 212, 170, 0.2)',
                                color: 'var(--ok)',
                                padding: '12px 16px',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                marginBottom: '20px',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <CheckCircle2 size={16} /> Announcement published successfully!
                        </motion.div>
                    )}

                    <form onSubmit={handlePostUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label className="form-label">Title</label>
                            <input
                                type="text"
                                placeholder="Announcement title..."
                                value={newUpdate.title}
                                onChange={e => setNewUpdate({ ...newUpdate, title: e.target.value })}
                                className="form-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Content</label>
                            <textarea
                                placeholder="Write the full announcement..."
                                value={newUpdate.content}
                                onChange={e => setNewUpdate({ ...newUpdate, content: e.target.value })}
                                className="form-input"
                                style={{ minHeight: '130px', resize: 'vertical' }}
                                required
                            />
                        </div>
                        <motion.button
                            type="submit"
                            className="btn btn-primary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ background: 'var(--grad-green)' }}
                        >
                            <Zap size={16} style={{ marginRight: '6px' }} /> Publish Announcement
                        </motion.button>
                    </form>
                </motion.div>

                {/* Users Management */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        background: 'var(--grad-card)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '32px',
                        overflow: 'hidden'
                    }}
                >
                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 800, fontSize: '1.3rem',
                        marginBottom: '24px', color: 'var(--text-primary)',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <Diamond size={16} style={{ color: 'var(--blue)', fill: 'var(--blue)' }} /> Member Roster
                    </h2>

                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '60px' }} />)}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
                            {users.map((u, i) => (
                                <motion.div
                                    key={u._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'var(--surface)',
                                        padding: '16px 18px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.borderColor = 'var(--border-hover)';
                                        e.currentTarget.style.background = 'var(--surface-hover)';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.background = 'var(--surface)';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{u.username}</div>
                                            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>{u.email}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {user.role === 'admin' ? (
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                disabled={u.username === 'OfficialPowerFit'}
                                                className="form-input"
                                                style={{
                                                    width: 'auto', padding: '6px 32px 6px 12px',
                                                    fontSize: '0.78rem', borderRadius: 'var(--radius-sm)',
                                                    cursor: 'pointer', fontWeight: 600,
                                                    backgroundSize: '12px', backgroundPosition: 'right 10px center'
                                                }}
                                            >
                                                <option value="user">User</option>
                                                <option value="trainer">Trainer</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        ) : (
                                            getRoleBadge(u.role)
                                        )}

                                        {user.role === 'admin' && u.username !== 'OfficialPowerFit' && u.username !== user.username && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleDeleteUser(u._id)}
                                                style={{
                                                    background: 'rgba(255, 59, 92, 0.08)',
                                                    color: 'var(--red)',
                                                    border: '1px solid rgba(255, 59, 92, 0.2)',
                                                    padding: '6px 14px',
                                                    borderRadius: 'var(--radius-sm)',
                                                    cursor: 'pointer',
                                                    fontWeight: 700,
                                                    fontSize: '0.78rem'
                                                }}
                                            >
                                                Remove
                                            </motion.button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default AdminPanel;
