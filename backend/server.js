const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const https = require('https');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// --- IN-MEMORY DATABASE (COFFEE ESTATE THEME) ---
let db = {
    dashboardStats: {
        soilMoisture: 68,
        temperature: 24, // Ideal for coffee
        humidity: 75, // Ideal for coffee
        rainfall: 5, // in mm for the day
        nextFertilizerDays: 12
    },
    farmOverview: {
        estateName: "Western Ghats Coffee Estate",
        variety: "Arabica",
        status: "Currently in berry development stage. Shade management is crucial."
    },
    soilData: { ph: 6.2, n: 130, p: 60, k: 85 },
    weather: { // Fallback data
        forecast: [
            { day: 'Today', condition: 'Light Showers', temp: '21°C - 26°C', rain: '60%' },
            { day: 'Tomorrow', condition: 'Partly Cloudy', temp: '22°C - 27°C', rain: '20%' },
            { day: 'Day after', condition: 'Sunny', temp: '22°C - 28°C', rain: '10%' }
        ],
    },
    schedule: {
        upcoming: [
            { id: 1, task: "Fertilizer Application", details: "Post-blossom NPK application", date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: "todo" },
            { id: 2, task: "Pruning", details: "Light pruning and handling of new shoots.", date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: "todo" },
        ]
    },
    marketPrices: [
        { crop: 'Coffee (Arabica)', price: '₹7500/50kg', location: 'Chikmagalur' },
        { crop: 'Coffee (Robusta)', price: '₹6800/50kg', location: 'Coorg' },
        { crop: 'Pepper', price: '₹550/kg', location: 'Sakleshpur' }
    ],
    forumPosts: [
        { id: 1, user: 'Anand Kumar', topic: 'Best practices for controlling coffee rust', replies: 18, time: '3h ago' },
        { id: 2, user: 'Sunita Gowda', topic: 'Effective shade management for Arabica', replies: 32, time: '8h ago' }
    ],
    settings: { irrigationMode: 'auto' },
    cropHealthLog: [],
    solutions: {
        "Coffee Leaf Rust": {
            description: "A common fungal disease in coffee, appearing as yellow-orange powdery spots on the underside of leaves.",
            steps: ["Remove and destroy infected leaves.", "Ensure proper pruning for air circulation.", "Apply a timely copper-based fungicide spray (e.g., Bordeaux mixture).", "Plant rust-resistant varieties if replanting."]
        },
        "Healthy": {
            description: "The plant appears to be in good health.",
            steps: ["Continue regular monitoring.", "Maintain optimal nutrition and irrigation.", "Ensure good farm sanitation."]
        }
    },
    // --- KRISHIBOT KNOWLEDGE BASE (COFFEE) ---
    krishiBotQA: {
        "irrigate": "For coffee, irrigation is crucial during the berry development stage, especially if rainfall is low. With current soil moisture at 68% and 5mm of recent rainfall, you can likely wait another 3-4 days before the next irrigation cycle. Always check the soil before watering.",
        "rust": "Coffee leaf rust is a serious issue. You should immediately remove and burn any infected leaves. Increase air circulation by pruning. Applying a Bordeaux mixture spray is a common and effective treatment. For future prevention, consider planting rust-resistant cultivars.",
        "fertilizer": "The next fertilizer application is due in about 12 days. For the current berry development stage, a fertilizer mix with higher potassium (K) is recommended to support bean size and quality. Check the advisory for specific NPK ratios.",
        "weather": "The weather in the Western Ghats region looks favorable. We're seeing light showers today, which is good for soil moisture, followed by partly cloudy and sunny days. Ideal conditions for coffee.",
        "default": "I'm not sure about that. For specific queries about coffee cultivation, asking the community in the Farmers Forum might provide more detailed insights from experienced growers."
    }
};

// --- API ROUTES ---
app.get('/api/dashboard-stats', (req, res) => res.json(db.dashboardStats));
app.get('/api/farm-overview', (req, res) => res.json(db.farmOverview));
app.get('/api/schedule', (req, res) => res.json(db.schedule));
app.get('/api/market-prices', (req, res) => res.json(db.marketPrices));
app.get('/api/forum-posts', (req, res) => res.json(db.forumPosts));
app.get('/api/settings', (req, res) => res.json(db.settings));
app.get('/api/solutions', (req, res) => res.json(db.solutions));
app.get('/api/soil-data', (req, res) => res.json(db.soilData));
app.post('/api/schedule', (req, res) => { db.schedule.upcoming.push(req.body); res.status(201).json(req.body); });
app.put('/api/schedule/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const { status } = req.body;
    const taskIndex = db.schedule.upcoming.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        db.schedule.upcoming[taskIndex].status = status;
        res.json(db.schedule.upcoming[taskIndex]);
    } else {
        res.status(404).send('Task not found');
    }
});
app.post('/api/market-prices', (req, res) => { db.marketPrices.push(req.body); res.status(201).json(req.body); });
app.post('/api/forum-posts', (req, res) => { db.forumPosts.unshift(req.body); res.status(201).json(req.body); });
app.post('/api/settings', (req, res) => { db.settings = req.body; res.json(db.settings); });
app.post('/api/crop-health-log', (req, res) => { db.cropHealthLog.push({ ...req.body, timestamp: new Date().toISOString() }); res.status(201).json(req.body); });
app.post('/api/soil-data', (req, res) => { db.soilData = req.body; res.json(db.soilData); });

// --- FERTILIZER ADVISORY "MODEL" (COFFEE) ---
app.post('/api/fertilizer-recommendation', (req, res) => {
    const { stage } = req.body; // Crop is always coffee
    let recommendation = { npk: 'Balanced (17:17:17)', amount: '150 kg/ha', advice: 'General application for maintenance.', next_due_days: 30 };
    
    if (stage === 'flowering') {
        recommendation = { npk: 'High Phosphorus (13:26:26)', amount: '120 kg/ha', advice: 'To support blossom and fruit set.', next_due_days: 25 };
    } else if (stage === 'berry_development') {
        recommendation = { npk: 'High Potassium (19:19:19)', amount: '180 kg/ha', advice: 'Crucial for bean size and quality. Apply in splits.', next_due_days: 20 };
    } else if (stage === 'harvesting') {
         recommendation = { npk: 'Low Nitrogen (10:20:20)', amount: '100 kg/ha', advice: 'Post-harvest application to replenish nutrients.', next_due_days: 45 };
    }
    
    db.dashboardStats.nextFertilizerDays = recommendation.next_due_days;
    res.json(recommendation);
});

// --- KRISHIBOT AI ENDPOINT (COFFEE CONTEXT) ---
app.post('/api/krishibot', async (req, res) => {
    const { question } = req.body;
    const farmContext = `Current coffee estate status in the Western Ghats: - Soil Moisture: ${db.dashboardStats.soilMoisture}% - Temperature: ${db.dashboardStats.temperature}°C - Rainfall today: ${db.dashboardStats.rainfall}mm - Next fertilizer application is in ${db.dashboardStats.nextFertilizerDays} days.`;
    const systemPrompt = `You are KrishiBot, an expert AI assistant for coffee growers in India's Western Ghats. Provide concise, practical advice. Use the provided real-time estate data. If you don't know, advise them to ask the Farmers Forum. Today is ${new Date().toDateString()}. ${farmContext}`;
    
    // Check for keywords for rule-based response
    const lowerCaseQuestion = question.toLowerCase();
    if (lowerCaseQuestion.includes('irrigate') || lowerCaseQuestion.includes('water')) {
        return res.json({ answer: db.krishiBotQA.irrigate });
    }
    if (lowerCaseQuestion.includes('rust') || lowerCaseQuestion.includes('disease')) {
        return res.json({ answer: db.krishiBotQA.rust });
    }
     if (lowerCaseQuestion.includes('fertilizer') || lowerCaseQuestion.includes('nutrient')) {
        return res.json({ answer: db.krishiBotQA.fertilizer });
    }

    // Fallback to generative AI if no keywords match
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: question }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, };

    try {
        const apiRes = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!apiRes.ok) throw new Error(`API request failed with status ${apiRes.status}`);
        const result = await apiRes.json();
        const botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (botResponse) res.json({ answer: botResponse });
        else throw new Error("Invalid response structure.");
    } catch (error) {
        console.error("Error calling AI model:", error);
        res.status(500).json({ answer: db.krishiBotQA.default });
    }
});


// --- REAL-TIME WEATHER ENDPOINT (WESTERN GHATS) ---
app.get('/api/weather', (req, res) => {
    const apiKey = 'YOUR_API_KEY_HERE';
    const lat = 13.3165; const lon = 75.7721; // Chikmagalur, Karnataka
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    if (apiKey === 'YOUR_API_KEY_HERE') {
        return res.json({ current: null, forecast: db.weather.forecast });
    }
    
    https.get(url, (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => { data += chunk; });
        apiRes.on('end', () => {
            try {
                const weatherData = JSON.parse(data);
                if (weatherData.cod !== 200) throw new Error(weatherData.message);
                const response = {
                    current: { city: weatherData.name, temp: Math.round(weatherData.main.temp), feels_like: Math.round(weatherData.main.feels_like), description: weatherData.weather[0].description, icon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png` },
                    forecast: db.weather.forecast
                };
                res.json(response);
            } catch (e) { res.status(500).json({ current: null, forecast: db.weather.forecast }); }
        });
    }).on('error', () => res.status(500).json({ current: null, forecast: db.weather.forecast }));
});


app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});

