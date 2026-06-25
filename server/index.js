const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST", "DELETE"] }
});

// Database Setup
const startDB = async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log('MongoDB Connected (Production-Ready Memory Store)');
};
startDB();

// Schemas (Aligned with Architecture Document)
const patientSchema = new mongoose.Schema({
    token: Number,
    name: String,
    phone: String,
    issue: String,
    assignedDoctor: String,
    status: { type: String, enum: ['waiting', 'serving', 'completed'], default: 'waiting' },
    createdAt: { type: Date, default: Date.now }
});

const Patient = mongoose.model('Patient', patientSchema);

const settingsSchema = new mongoose.Schema({
    averageConsultationTime: { type: Number, default: 8 },
    lastToken: { type: Number, default: 0 }
});

const Settings = mongoose.model('Settings', settingsSchema);

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Auth Middleware
const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authorized, no token' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Not authorized, token failed' });
    }
};

// Initialize Settings & Admin User
const initDB = async () => {
    if (!(await Settings.findOne())) {
        await Settings.create({ averageConsultationTime: 8, lastToken: 0 });
    }
    
    if (!(await User.findOne({ username: 'admin' }))) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({ username: 'admin', password: hashedPassword });
        console.log('Admin user seeded (admin / password123)');
    }
};
initDB();

const emitStatus = async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const allToday = await Patient.find({ createdAt: { $gte: startOfDay } }).sort({ token: 1 });
    
    io.emit('queueUpdated', allToday.filter(p => p.status === 'waiting'));
    io.emit('statsUpdated', {
        totalToday: allToday.length,
        waitingNow: allToday.filter(p => p.status === 'waiting').length,
        completedToday: allToday.filter(p => p.status === 'completed').length,
        allToday: allToday
    });
};

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, username: user.username });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// REST API (Aligned with Architecture Document)
app.post('/patient', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').isMobilePhone().withMessage('Valid phone number required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
        const { name, phone, issue } = req.body;
        
        // Auto-assign department/consultation type based on issue
        let assignedDoctor = 'General OPD';
        const issueLower = issue.toLowerCase();
        if (issueLower.includes('fever') || issueLower.includes('flu') || issueLower.includes('cold')) {
            assignedDoctor = 'General Consultation';
        } else if (issueLower.includes('injury') || issueLower.includes('bone') || issueLower.includes('fracture')) {
            assignedDoctor = 'Orthopedic Consult';
        } else if (issueLower.includes('heart') || issueLower.includes('chest')) {
            assignedDoctor = 'Cardiac Consult';
        } else if (issueLower.includes('skin') || issueLower.includes('rash')) {
            assignedDoctor = 'Skin/Derm Consult';
        }

        const settings = await Settings.findOneAndUpdate({}, { $inc: { lastToken: 1 } }, { returnDocument: 'after', upsert: true });
        
        const patient = await Patient.create({
            token: settings.lastToken,
            name,
            phone,
            issue,
            assignedDoctor,
            status: 'waiting'
        });

        await emitStatus();
        io.emit('settingsUpdated', settings);
        res.status(201).json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/queue', async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayPatients = await Patient.find({ createdAt: { $gte: startOfDay } }).sort({ token: 1 });
        const queue = todayPatients.filter(p => p.status === 'waiting');
        const current = todayPatients.find(p => p.status === 'serving');
        const completedCount = todayPatients.filter(p => p.status === 'completed').length;
        const totalToday = todayPatients.length;

        const settings = await Settings.findOne();
        res.json({ 
            queue, 
            current, 
            settings,
            stats: {
                totalToday,
                waitingNow: queue.length,
                completedToday: completedCount
            },
            allToday: todayPatients 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/next', async (req, res) => {
    try {
        await Patient.updateMany({ status: 'serving' }, { status: 'completed' });
        const next = await Patient.findOneAndUpdate(
            { status: 'waiting' },
            { status: 'serving' },
            { sort: { token: 1 }, returnDocument: 'after' }
        );

        await emitStatus();
        io.emit('currentToken', next);
        res.json({ current: next });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/settings', [
    body('averageConsultationTime').isInt({ min: 1 }).withMessage('Must be a positive integer')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
        const { averageConsultationTime } = req.body;
        const settings = await Settings.findOneAndUpdate({}, { averageConsultationTime }, { new: true });
        await emitStatus();
        io.emit('settingsUpdated', settings);
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Added for real-world functionality
app.delete('/patient/:id', async (req, res) => {
    try {
        await Patient.findByIdAndDelete(req.params.id);
        await emitStatus();
        res.json({ message: 'Patient removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Express API running on port ${PORT}`);
});
