import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { Search, Send, MessageSquare, User, Shield, Zap, ArrowLeft, MoreVertical, SendHorizontal } from 'lucide-react';

const Chat = () => {
    const { user } = useContext(AuthContext);
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await axios.get('\/api/users/contacts');
                setContacts(res.data);
            } catch (err) { console.error(err); }
        };
        fetchContacts();
    }, []);

    useEffect(() => {
        if (!selectedUser) return;
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`\/api/chat/${selectedUser._id}`);
                setMessages(res.data);
            } catch (err) { console.error(err); }
        };
        fetchMessages();
    }, [selectedUser]);

    const selectedUserRef = useRef(null);
    useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

    useEffect(() => {
        socketRef.current = io('/');
        if (user) {
            if (user.role === 'admin') socketRef.current.emit('joinAdmin');
            else socketRef.current.emit('join', user.id);
        }
        socketRef.current.on('receiveMessage', (message) => {
            const currentSelected = selectedUserRef.current;
            if (!currentSelected) return;
            const senderId = message.sender._id || message.sender;
            const receiverId = message.receiver._id || message.receiver;
            if (user.role === 'admin') {
                if (senderId === currentSelected._id || receiverId === currentSelected._id) setMessages((prev) => [...prev, message]);
            } else {
                if (senderId === currentSelected._id) setMessages((prev) => [...prev, message]);
            }
        });
        return () => { socketRef.current.disconnect(); };
    }, [user]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;
        const messageData = { receiver: selectedUser._id, content: newMessage, sender: user.id };
        try {
            const res = await axios.post('\/api/chat', messageData);
            socketRef.current.emit('sendMessage', res.data);
            setMessages((prev) => [...prev, res.data]);
            setNewMessage('');
        } catch (err) { console.error(err); }
    };

    const filteredContacts = contacts.filter(c =>
        c.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTimeStr = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ padding: '24px 32px', maxWidth: 'none', margin: '0', width: '100%', height: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '24px', flexShrink: 0 }}
            >
                <div style={{
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '8px',
                    fontFamily: 'Inter, sans-serif'
                }}>Communication Center</div>
                <h1 style={{
                    fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                    fontWeight: 900,
                    color: 'var(--text-primary)',
                    margin: 0,
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '-1px'
                }}>
                    Trainer <span style={{ color: 'var(--primary)' }}>Chat</span>
                </h1>
            </motion.div>

            {/* Chat Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="chat-container"
            >
                {/* Sidebar */}
                <div className="chat-sidebar">
                    {/* Search */}
                    <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'var(--bg-3)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    padding: '12px 16px 12px 42px',
                                    fontSize: '0.88rem',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'Inter, sans-serif',
                                    transition: 'all 0.2s ease',
                                    outline: 'none'
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                            <Search size={18} style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-tertiary)',
                                pointerEvents: 'none'
                            }} />
                        </div>
                    </div>

                    {/* Contact List */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                        <AnimatePresence>
                            {filteredContacts.map((contact, i) => (
                                <motion.div
                                    key={contact._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    onClick={() => setSelectedUser(contact)}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        marginBottom: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        background: selectedUser?._id === contact._id
                                            ? 'var(--surface)'
                                            : 'transparent',
                                        border: '1px solid',
                                        borderColor: selectedUser?._id === contact._id
                                            ? 'var(--primary)'
                                            : 'transparent',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                    onMouseEnter={e => {
                                        if (selectedUser?._id !== contact._id) {
                                            e.currentTarget.style.background = 'var(--bg-3)';
                                            e.currentTarget.style.borderColor = 'var(--border)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (selectedUser?._id !== contact._id) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.borderColor = 'transparent';
                                        }
                                    }}
                                >
                                    <div style={{
                                        width: '44px', height: '44px',
                                        borderRadius: '12px',
                                        background: contact.role === 'admin' ? 'var(--primary)' : contact.role === 'trainer' ? 'var(--blue)' : 'var(--bg-3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.9rem', fontWeight: 800, color: contact.role === 'user' ? 'var(--text-primary)' : '#fff',
                                        flexShrink: 0,
                                        border: contact.role === 'user' ? '1px solid var(--border)' : 'none'
                                    }}>
                                        {contact.username?.[0]?.toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                            color: 'var(--text-primary)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            marginBottom: '2px'
                                        }}>
                                            {contact.username}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                color: contact.role === 'trainer' ? 'var(--blue)' : contact.role === 'admin' ? 'var(--primary)' : 'var(--text-tertiary)',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {contact.role}
                                            </span>
                                            <div style={{
                                                width: '4px', height: '4px', borderRadius: '50%',
                                                background: 'var(--ok)', opacity: 0.8
                                            }} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {filteredContacts.length === 0 && (
                            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}>
                                    No contacts found
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="chat-main" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-2)', borderLeft: '1px solid var(--border)' }}>
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'var(--bg-2)',
                                flexShrink: 0,
                                zIndex: 10
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '12px',
                                        background: selectedUser.role === 'admin' ? 'var(--primary)' : 'var(--blue)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.9rem', fontWeight: 800, color: '#fff'
                                    }}>
                                        {selectedUser.username?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                                            {user.role === 'admin' ? `${selectedUser.username}'s Chat` : selectedUser.username}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ok)' }} />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                                                {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button style={{
                                        width: '36px', height: '36px', borderRadius: '10px',
                                        border: '1px solid var(--border)', background: 'transparent',
                                        color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}>
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                minHeight: 0,
                                background: 'var(--bg-1)'
                            }}>
                                {messages.map((msg, index) => {
                                    const senderId = msg.sender._id || msg.sender;
                                    const alignRight = user.role === 'admin'
                                        ? senderId === selectedUser._id
                                        : senderId === user.id;

                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                            style={{
                                                alignSelf: alignRight ? 'flex-end' : 'flex-start',
                                                maxWidth: '75%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: alignRight ? 'flex-end' : 'flex-start'
                                            }}
                                        >
                                            {user.role === 'admin' && (
                                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                                                    {msg.sender?.username || 'Unknown'} → {msg.receiver?.username || 'Unknown'}
                                                </div>
                                            )}
                                            <div style={{
                                                background: alignRight ? 'var(--primary)' : 'var(--bg-2)',
                                                border: alignRight ? 'none' : '1px solid var(--border)',
                                                padding: '12px 18px',
                                                borderRadius: '16px',
                                                borderBottomRightRadius: alignRight ? '4px' : '16px',
                                                borderBottomLeftRadius: !alignRight ? '4px' : '16px',
                                                wordBreak: 'break-word',
                                                boxShadow: alignRight ? '0 4px 12px rgba(255, 107, 53, 0.15)' : 'none',
                                                color: alignRight ? '#fff' : 'var(--text-primary)',
                                                fontSize: '0.92rem',
                                                lineHeight: 1.55,
                                                fontFamily: 'Inter, sans-serif'
                                            }}>
                                                {msg.content}
                                            </div>
                                            <div style={{
                                                fontSize: '0.68rem',
                                                fontWeight: 600,
                                                color: 'var(--text-tertiary)',
                                                marginTop: '6px',
                                                fontFamily: 'Inter, sans-serif',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                {getTimeStr(msg.createdAt)}
                                                {alignRight && <Zap size={10} style={{ color: 'var(--yellow)' }} />}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                {messages.length === 0 && (
                                    <div style={{
                                        margin: 'auto',
                                        textAlign: 'center',
                                        padding: '40px'
                                    }}>
                                        <div style={{
                                            width: '64px', height: '64px', borderRadius: '20px',
                                            background: 'var(--bg-2)', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', margin: '0 auto 20px', border: '1px solid var(--border)'
                                        }}>
                                            <MessageSquare size={32} style={{ color: 'var(--text-tertiary)' }} />
                                        </div>
                                        <div style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>
                                            No messages yet
                                        </div>
                                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', maxWidth: '200px', margin: '0 auto' }}>
                                            Start your professional consultation today.
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            {user.role !== 'admin' && (
                                <form onSubmit={handleSendMessage} style={{
                                    padding: '20px 24px',
                                    borderTop: '1px solid var(--border)',
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'center',
                                    background: 'var(--bg-2)',
                                    flexShrink: 0
                                }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Message..."
                                            style={{
                                                width: '100%',
                                                background: 'var(--bg-3)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '12px',
                                                padding: '14px 20px',
                                                fontSize: '0.92rem',
                                                color: 'var(--text-primary)',
                                                fontFamily: 'Inter, sans-serif',
                                                outline: 'none',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                        />
                                    </div>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '14px',
                                            background: 'var(--primary)',
                                            color: '#fff',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.2)',
                                            flexShrink: 0
                                        }}
                                    >
                                        <SendHorizontal size={20} />
                                    </motion.button>
                                </form>
                            )}
                        </>
                    ) : (
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            height: '100%', flexDirection: 'column', gap: '24px',
                            background: 'var(--bg-1)', textAlign: 'center', padding: '40px'
                        }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '24px',
                                background: 'var(--bg-2)', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', border: '1px solid var(--border)',
                                color: 'var(--primary)', boxShadow: 'var(--shadow-sm)'
                            }}>
                                <MessageSquare size={40} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                                    Your Converstations
                                </h2>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem', fontWeight: 500, fontFamily: 'Inter, sans-serif', maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}>
                                    Select a professional trainer or user from the sidebar to start a secure chat session.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Chat;
