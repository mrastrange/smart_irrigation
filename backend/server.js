const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { loadDataset, generateInsights, generateSchedule } = require('./predictions');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Load Data on Start
loadDataset();

// In-memory storage for demo purposes (persists until server restart)
let userProfile = null;
let currentStats = null;
let currentSchedule = [];
let forumPosts = [
    { id: 1, user: "Ramesh", topic: "Yellowing leaves in Wheat?", replies: 3, time: "2h ago" },
    { id: 2, user: "Suresh", topic: "Best fertilizer for wheat in Punjab?", replies: 5, time: "5h ago" }
];

// --- API ENDPOINTS ---

// 1. Profile Setup & Prediction (The Critical Endpoint)
app.post('/api/setup-profile', (req, res) => {
    const inputs = req.body;
    console.log(`Setup profile request for: ${inputs.name}, ${inputs.crop}`);
    
    // Generate Insights based on inputs
    const insights = generateInsights(inputs);
    // Generate Schedule based on crop
    const schedule = generateSchedule(inputs.crop, new Date());

    if (insights) {
        // Save to memory
        userProfile = inputs;
        currentStats = insights;
        currentSchedule = schedule;
        
        // Send success response with ALL data needed for dashboard
        res.json({ 
            success: true, 
            data: {
                profile: userProfile,
                stats: currentStats,
                schedule: currentSchedule
            }
        });
    } else {
        console.error("Failed to generate insights");
        res.status(500).json({ success: false, error: "Could not generate insights" });
    }
});

// 2. Get Dashboard Data (For page reloads)
app.get('/api/dashboard-stats', (req, res) => {
    if (!userProfile) {
        // If no profile exists, return 404 so frontend knows to show setup
        return res.status(404).json({ error: "No profile" });
    }
    res.json({ 
        profile: userProfile, 
        stats: currentStats, 
        schedule: currentSchedule 
    });
});

// 3. Schedule Management
app.get('/api/schedule', (req, res) => res.json({ upcoming: currentSchedule }));
app.post('/api/schedule', (req, res) => {
    const newTask = { ...req.body, id: Date.now(), status: 'todo' };
    currentSchedule.push(newTask);
    res.json({ success: true, task: newTask });
});
app.put('/api/schedule/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    currentSchedule = currentSchedule.map(t => t.id == id ? { ...t, status } : t);
    res.json({ success: true });
});

// 4. Forum
app.get('/api/forum-posts', (req, res) => res.json(forumPosts));
app.post('/api/forum-posts', (req, res) => {
    const newPost = { ...req.body, id: Date.now(), replies: 0, time: 'Just now' };
    forumPosts.unshift(newPost);
    res.json(newPost);
});

// 5. Market (Mock)
app.get('/api/market-prices', (req, res) => {
    res.json([
        { crop: "Wheat", price: "₹2125/q", location: "Local Mandi" },
        { crop: "Rice", price: "₹2040/q", location: "Regional Hub" },
        { crop: "Cotton", price: "₹6080/q", location: "Export Zone" }
    ]);
});

// 6. Weather (Mock)
app.post('/api/weather', (req, res) => {
    res.json({ temp: 28, humidity: 60, description: 'Sunny', icon: '01d' });
});

// 7. Disease Prediction (Mock)
app.post('/api/predict-disease', (req, res) => {
    const diseases = ["Leaf Spot", "Blight", "Rust", "Healthy"];
    const result = diseases[Math.floor(Math.random() * diseases.length)];
    res.json({ prediction: result, confidence: (Math.random() * 0.2 + 0.75).toFixed(2) });
});

// 8. KrishiBot
app.post('/api/krishibot', (req, res) => {
    const { question } = req.body;
    const q = question.toLowerCase();
    let answer = "I can help you with your farm management.";
    if (q.includes('water') || q.includes('irrigate')) answer = "Based on current moisture, irrigation is recommended in 2 days.";
    else if (q.includes('fertilizer')) answer = "A balanced NPK application is recommended for this stage.";
    else if (q.includes('disease')) answer = "Please upload a leaf image in 'My Farm' for diagnosis.";
    res.json({ answer });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});