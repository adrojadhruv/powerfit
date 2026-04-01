require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/diets', require('./routes/diets'));
app.use('/api/updates', require('./routes/updates'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/users', require('./routes/users'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/dailylogs', require('./routes/dailylogs'));
app.use('/api/generator', require('./routes/generator'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/dietdb', require('./routes/dietdb'));
app.use('/api/diet-tracker', require('./routes/dietTracker'));
// Basic Route
app.get('/', (req, res) => {
    res.send('MyGym MERN API is running...');
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their personal room`);
    });

    socket.on('joinAdmin', () => {
        socket.join('admin_room');
        console.log('An admin joined the admin_room for real-time monitoring');
    });

    socket.on('sendMessage', (data) => {
        // data may have a populated receiver object { _id: "..." }
        const receiverId = data.receiver?._id || data.receiver;
        io.to(receiverId).emit('receiveMessage', data);
        io.to('admin_room').emit('receiveMessage', data); // Broadcast to admins
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/mygym';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
