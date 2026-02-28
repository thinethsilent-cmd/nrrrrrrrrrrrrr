let history = [];
let targetData = {
    time: "--:--",
    confidence: 0,
    targetMin: null
};

// DOM Elements
const clockEl = document.getElementById('clock');
const timeInput = document.getElementById('timeInput');
const oddInput = document.getElementById('oddInput');
const targetTimeEl = document.getElementById('targetTime');
const confFill = document.getElementById('confFill');
const statusText = document.getElementById('statusText');
const dashCard = document.getElementById('dashCard');
const consoleEl = document.getElementById('console');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');

function init() {
    updateClock();
    setInterval(updateClock, 1000);
    
    // Set default time to current
    const now = new Date();
    timeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Event Listeners
    calculateBtn.addEventListener('click', processData);
    resetBtn.addEventListener('click', resetData);
}

function updateClock() {
    const now = new Date();
    clockEl.innerText = now.toTimeString().split(' ')[0];
    updateEngineStatus();
}

function tToM(tStr) {
    const parts = tStr.split(':');
    if (parts.length !== 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function processData() {
    const tVal = timeInput.value;
    const oVal = parseFloat(oddInput.value);

    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(tVal) || isNaN(oVal)) {
        showToast("Invalid Telemetry Format");
        return;
    }

    history.push({ time: tVal, odd: oVal, min: tToM(tVal) });
    history.sort((a, b) => a.min - b.min);

    updateConsole();
    
    if (history.length >= 3) {
        runQuantumEngine();
    } else {
        statusText.innerText = `INSUFFICIENT DATA: NEED ${3 - history.length}`;
    }

    oddInput.value = '';
}

function runQuantumEngine() {
    const lastThree = history.slice(-3);
    let intervals = [];
    for (let i = 0; i < lastThree.length - 1; i++) {
        let diff = lastThree[i+1].min - lastThree[i].min;
        if (diff < 0) diff += 1440; 
        intervals.push(diff);
    }

    const avgGap = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const lastMin = lastThree[lastThree.length - 1].min;
    
    const mean = avgGap;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
    const volatility = Math.sqrt(variance) || 10;

    let prediction;
    let confidence;

    if (avgGap < 5) {
        prediction = lastMin + 4;
        confidence = 92 - (volatility * 2);
    } else if (avgGap > 20) {
        prediction = lastMin + Math.floor(avgGap * 0.75);
        confidence = 85 - volatility;
    } else {
        prediction = lastMin + Math.floor(avgGap + 2);
        confidence = 88 - (volatility * 1.5);
    }

    confidence = Math.max(Math.min(confidence, 98), 40);
    
    const h = Math.floor(prediction / 60) % 24;
    const m = prediction % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    targetData = {
        time: timeStr,
        confidence: confidence,
        targetMin: prediction
    };

    targetTimeEl.innerText = targetData.time;
    confFill.style.width = `${confidence}%`;
}

function updateEngineStatus() {
    if (!targetData.targetMin) return;

    const now = new Date();
    let currMin = now.getHours() * 60 + now.getMinutes();
    let diff = targetData.targetMin - currMin;

    if (diff < -1200) diff += 1440;

    dashCard.classList.remove('pulse-warning', 'pulse-execute');

    if (diff > 3) {
        statusText.innerText = "MARKET COLD... WAITING";
        statusText.style.color = "#71717a";
        dashCard.style.borderColor = "#fbbf24";
    } else if (diff >= 1 && diff <= 3) {
        statusText.innerText = "QUANTUM SPIKE: PREPARE";
        statusText.style.color = "#fbbf24";
        dashCard.classList.add('pulse-warning');
    } else if (diff >= -1 && diff < 1) {
        statusText.innerText = "EXECUTE POSITION NOW";
        statusText.style.color = "#10b981";
        dashCard.classList.add('pulse-execute');
    } else {
        statusText.innerText = "TELEMETRY EXPIRED";
        statusText.style.color = "#ef4444";
        dashCard.style.borderColor = "#fbbf24";
    }
}

function updateConsole() {
    consoleEl.innerHTML = '';
    [...history].reverse().forEach(entry => {
        const div = document.createElement('div');
        div.className = 'console-item p-3 flex justify-between items-center text-xs';
        const star = entry.odd >= 5 ? '<span class="text-yellow-400 mr-2">⭐</span>' : '<span class="mr-6"></span>';
        div.innerHTML = `
            <span class="text-yellow-500">${star}${entry.time}</span>
            <span class="text-yellow-900">MULT: <b class="text-yellow-100">${entry.odd.toFixed(2)}x</b></span>
        `;
        consoleEl.appendChild(div);
    });
}

function resetData() {
    history = [];
    targetData = { time: "--:--", confidence: 0, targetMin: null };
    targetTimeEl.innerText = "--:--";
    confFill.style.width = '0%';
    statusText.innerText = "SCANNING MARKET...";
    statusText.style.color = "#fbbf24";
    dashCard.style.borderColor = "#fbbf24";
    updateConsole();
}

function showToast(msg) {
    const original = statusText.innerText;
    statusText.innerText = `[ERROR]: ${msg}`;
    statusText.style.color = "#ef4444";
    setTimeout(() => {
        statusText.innerText = original;
        statusText.style.color = "#fbbf24";
    }, 3000);
}

init();