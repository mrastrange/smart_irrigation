const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

let cropData = [];

// Load Dataset on Start
const loadDataset = () => {
    const datasetPath = path.join(__dirname, '../ml-models/Smart_Farming_Crop_Yield_2024.csv');
    if (!fs.existsSync(datasetPath)) {
        console.error(`Error: Dataset file not found at ${datasetPath}`);
        return;
    }
    fs.createReadStream(datasetPath)
        .pipe(csv())
        .on('data', (row) => cropData.push(row))
        .on('end', () => console.log(`Dataset loaded: ${cropData.length} records ready.`));
};

// Core Prediction Function
const generateInsights = (inputs) => {
    const { region, crop, landSize, soilMoisture, soilPH, temp, humidity, rainfall, ndvi } = inputs;

    // Default fallback if dataset isn't loaded or empty
    if (cropData.length === 0) return getDefaultInsights(crop, landSize);

    // 1. Filter for Relevant Historical Data
    let matches = cropData.filter(d => 
        d.region && d.region.toLowerCase().includes(region.toLowerCase()) && 
        d.crop_type && d.crop_type.toLowerCase() === crop.toLowerCase()
    );
    
    // Fallback: Match crop only if region data is sparse
    if (matches.length < 5) {
        matches = cropData.filter(d => d.crop_type && d.crop_type.toLowerCase() === crop.toLowerCase());
    }

    // If absolutely no data matches, use defaults
    if (matches.length === 0) return getDefaultInsights(crop, landSize);

    // 2. Calculate "Optimal" Averages from Historical Data
    const avg = (field) => {
        const sum = matches.reduce((acc, curr) => acc + parseFloat(curr[field] || 0), 0);
        return (sum / matches.length);
    };

    const optimalMoisture = avg('soil_moisture_%');
    const optimalTemp = avg('temperature_C');
    const optimalPH = avg('soil_pH');
    const avgYieldPerHa = avg('yield_kg_per_hectare');

    // 3. Calculate "Farm Score" (0-100)
    let score = 100;
    const moistureDiff = Math.abs(parseFloat(soilMoisture) - optimalMoisture);
    if (moistureDiff > 10) score -= 10;
    if (moistureDiff > 20) score -= 15;

    const tempDiff = Math.abs(parseFloat(temp) - optimalTemp);
    if (tempDiff > 5) score -= 10;

    const phDiff = Math.abs(parseFloat(soilPH) - optimalPH);
    if (phDiff > 0.5) score -= 5;

    // NDVI is critical for health
    if (parseFloat(ndvi) < 0.6) score -= 20;

    score = Math.max(0, Math.round(score));

    // 4. Predict Yield Range based on Score
    // Better score = Closer to (or above) historical average
    const performanceFactor = score / 100;
    const predictedYieldPerHa = (avgYieldPerHa * performanceFactor).toFixed(0);
    
    const rangeLow = (predictedYieldPerHa * 0.9).toFixed(0);
    const rangeHigh = (predictedYieldPerHa * 1.1).toFixed(0);
    
    // Total Yield for User's Land (1 Acre = 0.4047 Ha)
    const totalYield = (predictedYieldPerHa * parseFloat(landSize) * 0.4047).toFixed(0);

    // 5. Generate Recommendations
    const recommendations = [];
    if (moistureDiff > 15) recommendations.push(`Irrigation: Moisture is off by ${moistureDiff.toFixed(1)}%. Adjust schedule.`);
    if (phDiff > 0.8) recommendations.push(`Nutrients: Soil pH ${soilPH} is suboptimal. Apply amendments.`);
    if (parseFloat(ndvi) < 0.5) recommendations.push("Health Alert: Very low NDVI. Inspect for pests immediately.");
    if (recommendations.length === 0) recommendations.push("Conditions are optimal. Maintain current practices.");

    // 6. Disease Risk Analysis
    let diseaseRisk = "Low";
    if (parseFloat(humidity) > 80 && parseFloat(temp) > 25) diseaseRisk = "High (Fungal)";
    else if (parseFloat(ndvi) < 0.6) diseaseRisk = "Moderate (Stress)";

    return {
        prediction: {
            yieldPerHa: predictedYieldPerHa,
            range: `${rangeLow} - ${rangeHigh}`,
            totalYield: totalYield,
            score: score,
            comparison: score > 80 ? "Above Average" : "Below Average"
        },
        metrics: {
            waterStress: (moistureDiff / 50).toFixed(2),
            tempDeviation: tempDiff.toFixed(1),
            diseaseRisk: diseaseRisk
        },
        conditions: {
            current: { soilMoisture, temp, humidity, rainfall, ph: soilPH, ndvi },
            optimal: { soilMoisture: optimalMoisture.toFixed(1), temp: optimalTemp.toFixed(1), ph: optimalPH.toFixed(1) }
        },
        recommendations,
        market: {
            // Mock price calculation based on yield
            estimatedRevenue: (totalYield * 40).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        }
    };
};

// Scheduler Logic (Rule-Based)
const generateSchedule = (crop, sowingDate) => {
    const start = new Date(sowingDate);
    const schedule = [];
    const addDays = (d, days) => { const date = new Date(d); date.setDate(date.getDate() + days); return date.toISOString().split('T')[0]; };

    schedule.push({ id: 1, task: "Soil Prep", date: addDays(start, -2), status: "done", details: "Ploughing & Basal Fertilizer" });
    schedule.push({ id: 2, task: "Sowing", date: addDays(start, 0), status: "done", details: "Seed sowing" });
    
    if (crop.toLowerCase() === 'wheat') {
        schedule.push({ id: 3, task: "CRI Irrigation", date: addDays(start, 21), status: "todo", details: "Crown Root Initiation - Critical" });
        schedule.push({ id: 4, task: "Nitrogen Top Dressing", date: addDays(start, 35), status: "todo", details: "Apply Urea" });
    } else if (crop.toLowerCase() === 'rice') {
        schedule.push({ id: 3, task: "Transplanting", date: addDays(start, 25), status: "todo", details: "Move seedlings to main field" });
        schedule.push({ id: 4, task: "Water Level Check", date: addDays(start, 30), status: "todo", details: "Maintain 5cm standing water" });
    } else {
        schedule.push({ id: 3, task: "First Irrigation", date: addDays(start, 15), status: "todo", details: "Ensure adequate moisture" });
        schedule.push({ id: 4, task: "Weeding", date: addDays(start, 25), status: "todo", details: "Remove weeds" });
    }
    return schedule;
};

const getDefaultInsights = (crop, landSize) => {
    return {
        prediction: { yieldPerHa: 3000, range: "2500-3500", totalYield: (3000 * landSize * 0.4047).toFixed(0), score: 50, comparison: "Avg" },
        metrics: { waterStress: 0.5, tempDeviation: 0, diseaseRisk: "Unknown" },
        conditions: { current: {}, optimal: {} },
        recommendations: ["Data insufficient for specific insights."],
        market: { estimatedRevenue: "N/A" }
    };
}

module.exports = { loadDataset, generateInsights, generateSchedule };