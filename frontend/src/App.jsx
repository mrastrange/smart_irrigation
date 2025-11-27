import React, { useState, useEffect, useRef } from 'react';
import {
    createTheme, ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography, IconButton, Select, MenuItem,
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Grid, Card, CardContent, CircularProgress,
    Paper, Modal, Button, ToggleButtonGroup, ToggleButton, Fab, TextField, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress,
    FormControl, InputLabel, InputAdornment, Container, Chip, Avatar
} from '@mui/material';
import {
    Droplets, Cloud, TrendingUp, Calendar, Users, Settings, Bell, Menu, X, Plus, Check, AlertTriangle, Sun, Leaf,
    BarChart2, Tractor, MapPin, Camera, Upload, HelpCircle, MessageSquare, Sprout, Bot, Send, CloudRain, FlaskConical, Coins, Activity
} from 'lucide-react';

// --- THEME ---
const theme = createTheme({
    palette: { primary: { main: '#2e7d32' }, secondary: { main: '#ffc107' }, background: { default: '#f4f6f8' } },
    typography: { fontFamily: '"Inter", sans-serif', h5: { fontWeight: 600 } },
});

const API_BASE_URL = 'http://localhost:3001/api';
const api = {
    get: (ep) => fetch(`${API_BASE_URL}${ep}`).then(r => r.ok ? r.json() : Promise.reject('Error')),
    post: (ep, body) => fetch(`${API_BASE_URL}${ep}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.ok ? r.json() : Promise.reject('Error')),
    put: (ep, body) => fetch(`${API_BASE_URL}${ep}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.ok ? r.json() : Promise.reject('Error')),
};

const translations = {
    en: {
        dashboard: "Dashboard", myFarm: "My Farm", weather: "Weather", schedule: "Schedule", market: "Market", forum: "Forum",
        welcome: "Welcome", yieldForecast: "AI Yield Forecast", soilMoisture: "Soil Moisture", avgTemp: "Avg Temp", rainfall: "Rainfall",
        revenue: "Est. Revenue", ideal: "Ideal Range", historical: "Historical Avg", total: "Total",
        diseasePred: "Disease Prediction Model", uploadLeaf: "Upload Leaf Image for Analysis", analyze: "Analyze Health", result: "Diagnosis Result",
        tasks: "Farm Schedule", addTask: "Add Task", markDone: "Mark Done", community: "Farmers Community", newPost: "Ask Question",
        setupTitle: "Farm Profile Setup", enterDetails: "Enter details for AI insights", generate: "Generate Dashboard",
        risk: "Disease Risk", riskLevel: "Risk Level", nextIrrigation: "Next Irrigation", days: "Days",
        crop: "Crop Type", region: "Region", land: "Land Size", name: "Farmer Name", city: "City"
    },
    hi: {
        dashboard: "डैशबोर्ड", myFarm: "मेरा खेत", weather: "मौसम", schedule: "अनुसूची", market: "बाजार", forum: "मंच",
        welcome: "स्वागत है", yieldForecast: "AI उपज पूर्वानुमान", soilMoisture: "मिट्टी की नमी", avgTemp: "औसत तापमान", rainfall: "वर्षा",
        revenue: "अनुमानित आय", ideal: "आदर्श श्रेणी", historical: "ऐतिहासिक औसत", total: "कुल",
        diseasePred: "रोग भविष्यवाणी मॉडल", uploadLeaf: "पत्ती की छवि अपलोड करें", analyze: "विश्लेषण करें", result: "निदान परिणाम",
        tasks: "खेत की अनुसूची", addTask: "कार्य जोड़ें", markDone: "पूर्ण चिह्नित करें", community: "सामुदायिक मंच", newPost: "सवाल पूछें",
        setupTitle: "खेत प्रोफ़ाइल सेटअप", enterDetails: "AI मॉडल के लिए विवरण दर्ज करें", generate: "डैशबोर्ड बनाएं",
        risk: "रोग का खतरा", riskLevel: "जोखिम स्तर", nextIrrigation: "अगली सिंचाई", days: "दिन",
        crop: "फसल का प्रकार", region: "क्षेत्र", land: "भूमि का आकार", name: "किसान का नाम", city: "शहर"
    },
    ta: {
        dashboard: "முகப்பு", myFarm: "என் பண்ணை", weather: "வானிலை", schedule: "அட்டவணை", market: "சந்தை", forum: "மன்றம்",
        welcome: "வரவேற்பு", yieldForecast: "AI மகசூல் கணிப்பு", soilMoisture: "மண் ஈரப்பதம்", avgTemp: "சராசரி வெப்பநிலை", rainfall: "மழை",
        revenue: "வருவாய்", ideal: "சிறந்த வரம்பு", historical: "வரலாற்று சராசரி", total: "மொத்தம்",
        diseasePred: "நோய் கணிப்பு", uploadLeaf: "இலை படத்தை பதிவேற்றவும்", analyze: "பகுப்பாய்வு", result: "முடிவு",
        tasks: "பண்ணை பணிகள்", addTask: "பணி சேர்", markDone: "முடிந்தது", community: "சமூக மன்றம்", newPost: "புதிய பதிவு",
        setupTitle: "பண்ணை அமைப்பு", enterDetails: "விவரங்களை உள்ளிடவும்", generate: "உருவாக்கு",
        risk: "நோய் ஆபத்து", riskLevel: "ஆபத்து நிலை", nextIrrigation: "அடுத்த நீர்ப்பாசனம்", days: "நாட்கள்",
        crop: "பயிர் வகை", region: "பகுதி", land: "நில அளவு", name: "விவசாயி பெயர்", city: "நகரம்"
    }
};

// --- SUB-COMPONENTS ---

const StatCard = ({ icon, title, value, subtext, color }) => (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 1 }}>
        <CardContent>
            <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase">{title}</Typography>
                {icon}
            </Box>
            <Typography variant="h5" fontWeight="bold" color={color || "text.primary"}>{value}</Typography>
            {subtext && <Typography variant="caption" color="text.secondary">{subtext}</Typography>}
        </CardContent>
    </Card>
);

const DashboardView = ({ data, t }) => {
    // Safety check: Ensure data exists before rendering
    if (!data || !data.stats || !data.profile) return <Box p={3}>Generating Insights...</Box>;

    const { stats, profile } = data;
    return (
        <Grid container spacing={3}>
            {/* Hero: Yield & Score */}
            <Grid item xs={12} md={8}>
                <Card sx={{ height: '100%', borderRadius: 3, background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)', color: 'white' }}>
                    <CardContent>
                        <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12} sm={8}>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>PROJECTED YIELD</Typography>
                                <Typography variant="h2" fontWeight="bold">{stats.prediction.totalYield} kg</Typography>
                                <Box mt={1} display="flex" gap={2}>
                                    <Chip label={`Range: ${stats.prediction.range} kg/ha`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                                    <Chip label={stats.prediction.comparison} size="small" color={stats.prediction.comparison.includes('+') ? 'success' : 'warning'} />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4} textAlign="center">
                                <Box position="relative" display="inline-flex">
                                    <CircularProgress variant="determinate" value={parseInt(stats.prediction.score)} size={100} thickness={4} sx={{ color: 'white' }} />
                                    <Box top={0} left={0} bottom={0} right={0} position="absolute" display="flex" alignItems="center" justifyContent="center">
                                        <Typography variant="h4" component="div" fontWeight="bold">{stats.prediction.score}</Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" mt={1}>{t.score}</Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* Financials */}
            <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', borderRadius: 3 }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" gap={1} mb={2} color="secondary.dark">
                            <Coins />
                            <Typography variant="h6" fontWeight="bold">{t.revenue}</Typography>
                        </Box>
                        <Typography variant="h3" fontWeight="bold" color="text.primary">{stats.market.estimatedRevenue}</Typography>
                        <Typography variant="body2" color="text.secondary" mt={1}>Based on current market rates for {profile.crop}.</Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* Metrics Grid */}
            <Grid item xs={6} md={3}><StatCard icon={<Leaf color="#2e7d32" />} title={t.soilMoisture} value={`${stats.conditions.current.soilMoisture}%`} subtext={`Optimal: ${stats.conditions.optimal.soilMoisture}%`} /></Grid>
            <Grid item xs={6} md={3}><StatCard icon={<Sun color="#ff9800" />} title={t.avgTemp} value={`${stats.conditions.current.temp}°C`} subtext={`Optimal: ${stats.conditions.optimal.temp}°C`} /></Grid>
            <Grid item xs={6} md={3}><StatCard icon={<AlertTriangle color={stats.metrics.diseaseRisk === 'High' ? 'red' : 'green'} />} title={t.risk} value={stats.metrics.diseaseRisk} subtext="Based on humidity" color={stats.metrics.diseaseRisk === 'High' ? 'error.main' : 'success.main'} /></Grid>
            <Grid item xs={6} md={3}><StatCard icon={<Activity color="#2196f3" />} title="Water Stress" value={stats.metrics.waterStress} subtext={stats.metrics.waterStress > 0.2 ? "High" : "Normal"} /></Grid>

            {/* Recommendations */}
            <Grid item xs={12}>
                <Card sx={{ borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold">AI Recommendations</Typography>
                        <Grid container spacing={2}>
                            {stats.recommendations.map((rec, i) => (
                                <Grid item xs={12} md={4} key={i}>
                                    <Paper variant="outlined" sx={{ p: 2, borderLeft: '4px solid #2e7d32' }}>
                                        <Typography variant="body2" fontWeight="medium">{rec}</Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

const MyFarmView = ({ t }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    
    const handleAnalyze = () => {
        setLoading(true);
        setTimeout(() => {
            // Simulated AI call
            api.post('/predict-disease', {}).then(res => {
                setResult(res);
                setLoading(false);
            });
        }, 1500);
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                         <Camera color="#2e7d32" />
                        <Typography variant="h6" fontWeight="bold">{t.diseasePred}</Typography>
                    </Box>
                    <Box border="2px dashed #ccc" borderRadius={2} height={200} display="flex" alignItems="center" justifyContent="center" flexDirection="column" color="text.secondary" bgcolor="#fafafa">
                        <Upload size={48} style={{opacity: 0.5}} />
                        <Typography mt={1}>{t.uploadLeaf}</Typography>
                    </Box>
                    <Button variant="contained" fullWidth sx={{ mt: 3, py: 1.5 }} onClick={handleAnalyze} disabled={loading}>
                        {loading ? "Analyzing Image..." : t.analyze}
                    </Button>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                {result ? (
                    <Card sx={{ p: 3, borderRadius: 3, height: '100%', bgcolor: result.prediction === 'Healthy' ? '#e8f5e9' : '#ffebee' }}>
                        <Typography variant="h6" color="text.secondary">{t.result}</Typography>
                        <Typography variant="h2" fontWeight="bold" color={result.prediction === 'Healthy' ? 'success.main' : 'error.main'} mt={2}>{result.prediction}</Typography>
                        <Typography variant="h5" mt={1}>Confidence: {(result.confidence * 100).toFixed(1)}%</Typography>
                        <Box mt={3}>
                            <Typography variant="body1" fontWeight="bold">Recommendations:</Typography>
                            <Typography variant="body2">{result.prediction === 'Healthy' ? "Continue monitoring. Crop looks good." : "Consult an expert immediately. Isolate affected plants."}</Typography>
                        </Box>
                    </Card>
                ) : (
                    <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                        <Typography color="text.secondary">Analysis results will appear here.</Typography>
                    </Card>
                )}
            </Grid>
        </Grid>
    );
};

const ScheduleView = ({ t }) => {
    const [tasks, setTasks] = useState([]);
    const [open, setOpen] = useState(false);
    const [newTask, setNewTask] = useState({ task: '', date: '', details: '' });

    useEffect(() => { api.get('/schedule').then(d => setTasks(d.upcoming)); }, []);

    const handleAddTask = () => {
        api.post('/schedule', newTask).then(res => {
            setTasks([...tasks, res.task]);
            setOpen(false);
        });
    };

    const handleDone = (id) => {
        api.put(`/schedule/${id}`, { status: 'done' }).then(() => {
            setTasks(tasks.filter(t => t.id !== id));
        });
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">{t.tasks}</Typography>
                <Button startIcon={<Plus />} variant="contained" onClick={() => setOpen(true)}>{t.addTask}</Button>
            </Box>
            <Grid container spacing={2}>
                {tasks.filter(t => t.status !== 'done').map(task => (
                    <Grid item xs={12} key={task.id}>
                        <Paper sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '6px solid #2e7d32', borderRadius: 2 }}>
                            <Box>
                                <Typography variant="h6">{task.task}</Typography>
                                <Typography variant="body2" color="text.secondary" mb={1}>{task.details}</Typography>
                                <Chip label={new Date(task.date).toDateString()} size="small" color="primary" variant="outlined" icon={<Calendar size={14}/>} />
                            </Box>
                            <Button variant="outlined" color="success" onClick={() => handleDone(task.id)} startIcon={<Check />}>{t.markDone}</Button>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>{t.addTask}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Task Name" fullWidth onChange={e => setNewTask({...newTask, task: e.target.value})} />
                    <TextField margin="dense" label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} onChange={e => setNewTask({...newTask, date: e.target.value})} />
                    <TextField margin="dense" label="Details" fullWidth onChange={e => setNewTask({...newTask, details: e.target.value})} />
                </DialogContent>
                <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleAddTask} variant="contained">Add</Button></DialogActions>
            </Dialog>
        </Box>
    );
};

const ForumView = ({ t }) => {
    const [posts, setPosts] = useState([]);
    const [open, setOpen] = useState(false);
    const [newPost, setNewPost] = useState('');

    useEffect(() => { api.get('/forum-posts').then(setPosts); }, []);

    const handlePost = () => {
        api.post('/forum-posts', { user: 'Me', topic: newPost }).then(res => {
            setPosts([res, ...posts]);
            setOpen(false);
        });
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">{t.community}</Typography>
                <Button startIcon={<MessageSquare />} variant="contained" onClick={() => setOpen(true)}>{t.newPost}</Button>
            </Box>
            <Grid container spacing={2}>
                {posts.map(post => (
                    <Grid item xs={12} key={post.id}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Box display="flex" gap={2}>
                                    <Avatar sx={{ bgcolor: 'secondary.main' }}>{post.user[0]}</Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">{post.topic}</Typography>
                                        <Typography variant="caption" color="text.secondary">Posted by {post.user} • {post.time}</Typography>
                                    </Box>
                                </Box>
                                <Box mt={2} display="flex" gap={1}>
                                    <Chip label={`${post.replies} Replies`} size="small" />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>{t.newPost}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Ask your question..." fullWidth multiline rows={3} onChange={e => setNewPost(e.target.value)} />
                </DialogContent>
                <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handlePost} variant="contained">Post</Button></DialogActions>
            </Dialog>
        </Box>
    );
};

const MarketView = ({ t }) => {
    const [prices, setPrices] = useState([]);
    useEffect(() => { api.get('/market-prices').then(setPrices); }, []);
    return (
        <Grid container spacing={3}>
            {prices.map((item, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                    <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
                        <CardContent>
                            <Typography variant="h6" color="primary.main">{item.crop}</Typography>
                            <Typography variant="h3" fontWeight="bold">{item.price}</Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}><MapPin size={14} style={{verticalAlign: 'middle'}} /> {item.location}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

const KrishiBotModal = ({ t, show, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (show && messages.length === 0) {
            setMessages([{ sender: 'bot', text: "Hello! I am KrishiBot. Ask me anything about your farm." }]);
        }
    }, [show]);

    const handleSend = () => {
        if(!input.trim()) return;
        const newMsg = { sender: 'user', text: input };
        setMessages([...messages, newMsg]);
        setInput('');
        
        api.post('/krishibot', { question: input, context: { crop: "Wheat" } }).then(res => {
             setMessages(prev => [...prev, { sender: 'bot', text: res.answer }]);
        });
    };

    return (
        <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{display:'flex', alignItems:'center', gap:1}}><Bot color="green"/> KrishiBot</DialogTitle>
            <DialogContent dividers sx={{height: 400, display:'flex', flexDirection:'column'}}>
                <Box flexGrow={1} overflow="auto" mb={2}>
                    {messages.map((m, i) => (
                        <Box key={i} display="flex" justifyContent={m.sender === 'user' ? 'flex-end' : 'flex-start'} mb={1}>
                            <Paper sx={{ p: 1.5, bgcolor: m.sender === 'user' ? 'primary.main' : 'grey.100', color: m.sender === 'user' ? 'white' : 'text.primary', borderRadius: 2 }}>
                                {m.text}
                            </Paper>
                        </Box>
                    ))}
                    <div ref={messagesEndRef} />
                </Box>
                <Box display="flex" gap={1}>
                    <TextField fullWidth size="small" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." onKeyPress={(e) => e.key === 'Enter' && handleSend()}/>
                    <IconButton color="primary" onClick={handleSend}><Send /></IconButton>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

// --- MAIN APP SHELL ---
const SmartIrrigationApp = () => {
    const [view, setView] = useState('setup');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lang, setLang] = useState('en');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showKrishiBot, setShowKrishiBot] = useState(false);

    // Setup Form State (Extensive inputs)
    const [formData, setFormData] = useState({
        name: '', region: 'North India', city: '', crop: 'Wheat', landSize: '',
        soilMoisture: '23', soilPH: '6.2', temp: '24', humidity: '45', rainfall: '35',
        ndvi: '0.68', growingDays: '85', fertilizer: 'Urea', pesticide: 'Low'
    });

    const t = translations[lang];

    const handleSetup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/setup-profile', formData);
            console.log("Backend Response:", res); // DEBUGGING

            if (res && res.success && res.data) {
                setDashboardData(res.data);
                setView('dashboard'); // Switch view ONLY on success
            } else {
                console.error("Invalid response structure:", res);
                alert("Backend returned an error. Check console.");
            }
        } catch (err) {
            console.error("API Request Failed:", err);
            alert("Failed to connect to backend. Ensure server is running on port 3001.");
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardView data={dashboardData} t={t} />;
            case 'myFarm': return <MyFarmView t={t} />;
            case 'schedule': return <ScheduleView t={t} />;
            case 'market': return <MarketView t={t} />;
            case 'forum': return <ForumView t={t} />;
            default: return <Box p={3}>Coming Soon</Box>;
        }
    };

    // --- VIEW 1: SETUP ---
    if (view === 'setup') {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Paper elevation={6} sx={{ p: 5, width: '100%', borderRadius: 4, textAlign: 'center', overflowY: 'auto', maxHeight: '90vh' }}>
                        <Box mb={4}>
                            <Box display="inline-flex" p={2} bgcolor="green.50" borderRadius="50%" mb={2}>
                                <Sprout size={48} color="#2e7d32" />
                            </Box>
                            <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>SmartFarm AI</Typography>
                            <Typography color="text.secondary">{t.enterDetails}</Typography>
                        </Box>
                        
                        <form onSubmit={handleSetup}>
                            <Grid container spacing={3} textAlign="left">
                                <Grid item xs={12}><Typography variant="h6" color="primary">Basic Info</Typography></Grid>
                                <Grid item xs={6}><TextField fullWidth label={t.name} name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></Grid>
                                <Grid item xs={6}><TextField fullWidth label={t.city} name="city" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required /></Grid>
                                <Grid item xs={4}><FormControl fullWidth><InputLabel>{t.region}</InputLabel><Select value={formData.region} label={t.region} onChange={e => setFormData({...formData, region: e.target.value})}><MenuItem value="North India">North India</MenuItem><MenuItem value="South India">South India</MenuItem><MenuItem value="East India">East India</MenuItem><MenuItem value="West India">West India</MenuItem></Select></FormControl></Grid>
                                <Grid item xs={4}><FormControl fullWidth><InputLabel>{t.crop}</InputLabel><Select value={formData.crop} label={t.crop} onChange={e => setFormData({...formData, crop: e.target.value})}><MenuItem value="Wheat">Wheat</MenuItem><MenuItem value="Rice">Rice</MenuItem><MenuItem value="Cotton">Cotton</MenuItem></Select></FormControl></Grid>
                                <Grid item xs={4}><TextField fullWidth label={t.land} type="number" required InputProps={{endAdornment: <InputAdornment position="end">Ac</InputAdornment>}} value={formData.landSize} onChange={e => setFormData({...formData, landSize: e.target.value})} /></Grid>

                                <Grid item xs={12}><Typography variant="h6" color="primary" mt={2}>Conditions (Simulated Inputs)</Typography></Grid>
                                <Grid item xs={3}><TextField fullWidth label="Temp (°C)" type="number" value={formData.temp} onChange={e => setFormData({...formData, temp: e.target.value})} /></Grid>
                                <Grid item xs={3}><TextField fullWidth label="Humidity (%)" type="number" value={formData.humidity} onChange={e => setFormData({...formData, humidity: e.target.value})} /></Grid>
                                <Grid item xs={3}><TextField fullWidth label="Moisture (%)" type="number" value={formData.soilMoisture} onChange={e => setFormData({...formData, soilMoisture: e.target.value})} /></Grid>
                                <Grid item xs={3}><TextField fullWidth label="NDVI (0-1)" type="number" step="0.01" value={formData.ndvi} onChange={e => setFormData({...formData, ndvi: e.target.value})} /></Grid>
                            </Grid>
                            
                            <Box mt={3} display="flex" justifyContent="center">
                                <FormControl sx={{ minWidth: 120 }}>
                                    <Select value={lang} size="small" onChange={(e) => setLang(e.target.value)}>
                                        <MenuItem value="en">🇺🇸 English</MenuItem>
                                        <MenuItem value="hi">🇮🇳 Hindi</MenuItem>
                                        <MenuItem value="ta">🇮🇳 Tamil</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.5, borderRadius: 2 }} disabled={loading}>
                                {loading ? <CircularProgress size={24} color="inherit" /> : t.generate}
                            </Button>
                        </form>
                    </Paper>
                </Container>
            </ThemeProvider>
        );
    }

    // --- VIEW 2: DASHBOARD ---
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box display="flex" height="100vh" overflow="hidden">
                <Box width={240} bgcolor="white" borderRight={1} borderColor="divider" display={{ xs: 'none', md: 'flex' }} flexDirection="column">
                    <Toolbar><Sprout color="#2e7d32" size={32} style={{marginRight: 10}}/><Typography variant="h6" color="primary" fontWeight="bold">SmartFarm</Typography></Toolbar>
                    <List>{['Dashboard', 'My Farm', 'Weather', 'Schedule', 'Market', 'Forum'].map((text, i) => (
                        <ListItem key={text} disablePadding><ListItemButton selected={activeTab === text.toLowerCase().replace(' ', '')} onClick={() => setActiveTab(text.toLowerCase().replace(' ', ''))}><ListItemIcon>{[<BarChart2/>, <Tractor/>, <Cloud/>, <Calendar/>, <TrendingUp/>, <Users/>][i]}</ListItemIcon><ListItemText primary={t[text.toLowerCase().replace(' ', '')]} /></ListItemButton></ListItem>
                    ))}</List>
                </Box>
                <Box flexGrow={1} bgcolor="background.default" overflow="auto">
                    <Toolbar sx={{ display: { md: 'none' } }}><IconButton edge="start" onClick={() => setMobileOpen(true)}><Menu /></IconButton></Toolbar>
                    <Box p={3}>{renderContent()}</Box>
                </Box>
                <Fab color="primary" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => setShowKrishiBot(true)}><Bot /></Fab>
            </Box>
            <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
                <Box width={240} p={2}>
                    <List>{['Dashboard', 'My Farm', 'Weather', 'Schedule', 'Market', 'Forum'].map((text, i) => (
                        <ListItem key={text} disablePadding><ListItemButton onClick={() => {setActiveTab(text.toLowerCase().replace(' ', '')); setMobileOpen(false);}}><ListItemIcon>{[<BarChart2/>, <Tractor/>, <Cloud/>, <Calendar/>, <TrendingUp/>, <Users/>][i]}</ListItemIcon><ListItemText primary={t[text.toLowerCase().replace(' ', '')]} /></ListItemButton></ListItem>
                    ))}</List>
                </Box>
            </Drawer>
            <KrishiBotModal t={t} show={showKrishiBot} onClose={() => setShowKrishiBot(false)} />
        </ThemeProvider>
    );
};

export default SmartIrrigationApp;