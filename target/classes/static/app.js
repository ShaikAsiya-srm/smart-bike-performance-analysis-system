// API Base URL
const API_BASE = 'http://localhost:8080/api';

// State Management
let bikesState = [];
let activeSection = 'dashboard';

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Initialize the Application
async function initApp() {
    await refreshBikesData();
    setupEventListeners();
    // Default load
    switchSection('dashboard');
}

// Setup listeners if any additional needed
function setupEventListeners() {
    // Dropdown change in Ride Logger table view
    const rideBikeSelect = document.getElementById('ride-bike-id');
    rideBikeSelect.addEventListener('change', (e) => {
        loadRidesForBike(e.target.value);
    });
}

// SPA Section Switcher
function switchSection(sectionId) {
    activeSection = sectionId;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNav = document.getElementById(`nav-${sectionId}`);
    if (activeNav) activeNav.classList.add('active');

    // Update visibility of sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const activeSecEl = document.getElementById(`section-${sectionId}`);
    if (activeSecEl) activeSecEl.classList.add('active');

    // Section specific titles & load operations
    const titleEl = document.getElementById('main-title');
    const subtitleEl = document.getElementById('main-subtitle');

    if (sectionId === 'dashboard') {
        titleEl.textContent = 'Telemetry & Performance Dashboard';
        subtitleEl.textContent = 'Overview of connected bikes and statistics';
        loadDashboardStats();
    } else if (sectionId === 'bikes') {
        titleEl.textContent = 'Bikes Manager';
        subtitleEl.textContent = 'Register new bikes and view database logs';
        renderBikesTable('bikes-list-table');
    } else if (sectionId === 'rides') {
        titleEl.textContent = 'Ride Logger';
        subtitleEl.textContent = 'Record new runs and analyze real-time calculations';
        populateBikeDropdowns();
        // Load rides for currently selected bike in logger dropdown (if any)
        const selectedBike = document.getElementById('ride-bike-id').value;
        if (selectedBike) {
            loadRidesForBike(selectedBike);
        } else {
            renderEmptyRidesTable();
        }
    } else if (sectionId === 'reports') {
        titleEl.textContent = 'Performance Reports';
        subtitleEl.textContent = 'Detailed diagnostic statistics per bike';
        populateBikeDropdowns();
        const selectedBike = document.getElementById('report-bike-id').value;
        if (selectedBike) {
            loadBikeReport(selectedBike);
        } else {
            document.getElementById('report-container').style.display = 'none';
            document.getElementById('report-placeholder').style.display = 'block';
        }
    }
}

// Fetch bikes list from backend
async function refreshBikesData() {
    try {
        const response = await fetch(`${API_BASE}/bikes`);
        if (!response.ok) throw new Error('Failed to fetch bikes');
        bikesState = await response.json();
    } catch (err) {
        showToast('Error connecting to backend API', 'error');
        console.error(err);
    }
}

// Populate dropdown select inputs in Ride Logger and Reports
function populateBikeDropdowns() {
    const rideSelect = document.getElementById('ride-bike-id');
    const reportSelect = document.getElementById('report-bike-id');

    // Keep active values to avoid resetting
    const activeRideVal = rideSelect.value;
    const activeReportVal = reportSelect.value;

    const optionsHTML = `
        <option value="" disabled ${!activeRideVal ? 'selected' : ''}>Choose a bike...</option>
        ${bikesState.map(bike => `<option value="${bike.id}">${bike.name} ${bike.model} (ID: ${bike.id})</option>`).join('')}
    `;

    rideSelect.innerHTML = optionsHTML;
    reportSelect.innerHTML = `
        <option value="" disabled ${!activeReportVal ? 'selected' : ''}>Choose a bike...</option>
        ${bikesState.map(bike => `<option value="${bike.id}">${bike.name} ${bike.model} (ID: ${bike.id})</option>`).join('')}
    `;

    // Restore active values if they still exist in the list
    if (bikesState.some(b => b.id == activeRideVal)) {
        rideSelect.value = activeRideVal;
    }
    if (bikesState.some(b => b.id == activeReportVal)) {
        reportSelect.value = activeReportVal;
    }
}

// Dashboard statistics compiler
async function loadDashboardStats() {
    document.getElementById('stat-total-bikes').textContent = bikesState.length;
    renderBikesTable('dashboard-bikes-table');

    if (bikesState.length === 0) {
        document.getElementById('stat-total-rides').textContent = 0;
        document.getElementById('stat-fleet-efficiency').textContent = '0 km/L';
        return;
    }

    let totalRides = 0;
    let sumDistance = 0;
    let sumFuel = 0;

    // Loop through each bike to aggregate stats from their reports
    for (const bike of bikesState) {
        try {
            const res = await fetch(`${API_BASE}/rides/bike/${bike.id}/report`);
            if (res.ok) {
                const report = await res.json();
                totalRides += report.totalRides;
                sumDistance += report.totalDistanceKm;
                sumFuel += report.totalFuelConsumedLiters;
            }
        } catch (err) {
            console.error('Error compiling dashboard stats for bike ID ' + bike.id, err);
        }
    }

    document.getElementById('stat-total-rides').textContent = totalRides;
    
    const fleetMileage = sumFuel > 0 ? (sumDistance / sumFuel) : 0.0;
    document.getElementById('stat-fleet-efficiency').textContent = `${fleetMileage.toFixed(2)} km/L`;
}

// Render Bikes into specified table element
function renderBikesTable(tableId) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    if (bikesState.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--color-text-muted);">No bikes registered yet. Add a bike to get started!</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = bikesState.map(bike => `
        <tr>
            <td>${bike.id}</td>
            <td><strong>${bike.name}</strong></td>
            <td>${bike.model}</td>
            <td><span class="badge-petrol">${bike.fuelType}</span></td>
            <td>${bike.tankCapacity} L</td>
            ${tableId === 'dashboard-bikes-table' ? `
                <td>
                    <button class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto;" onclick="viewBikeReportDirectly(${bike.id})">View Report</button>
                </td>
            ` : ''}
        </tr>
    `).join('');
}

// Quick action from dashboard to jump to reports page for a bike
function viewBikeReportDirectly(bikeId) {
    switchSection('reports');
    document.getElementById('report-bike-id').value = bikeId;
    loadBikeReport(bikeId);
}

// Add/Register Bike Handler
async function handleBikeSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('bike-name').value;
    const model = document.getElementById('bike-model').value;
    const fuelType = document.getElementById('bike-fuel-type').value;
    const tankCapacity = parseFloat(document.getElementById('bike-tank-capacity').value);

    try {
        const response = await fetch(`${API_BASE}/bikes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, model, fuelType, tankCapacity })
        });

        if (!response.ok) throw new Error('Registration failed');

        showToast(`${name} ${model} registered successfully!`, 'success');
        document.getElementById('add-bike-form').reset();
        
        await refreshBikesData();
        renderBikesTable('bikes-list-table');
        populateBikeDropdowns();
    } catch (err) {
        showToast('Failed to add bike.', 'error');
        console.error(err);
    }
}

// Log a Ride Handler
async function handleRideSubmit(event) {
    event.preventDefault();
    const bikeId = document.getElementById('ride-bike-id').value;
    const distance = parseFloat(document.getElementById('ride-distance').value);
    const durationHours = parseFloat(document.getElementById('ride-duration').value);
    const fuelConsumed = parseFloat(document.getElementById('ride-fuel').value);
    const fuelPricePerLiter = parseFloat(document.getElementById('ride-fuel-price').value);
    const maxSpeed = parseFloat(document.getElementById('ride-max-speed').value);

    try {
        const response = await fetch(`${API_BASE}/rides/bike/${bikeId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ distance, durationHours, fuelConsumed, fuelPricePerLiter, maxSpeed })
        });

        if (!response.ok) throw new Error('Failed to log ride');

        showToast('Ride telemetry logged & analyzed!', 'success');
        document.getElementById('add-ride-form').reset();
        
        // Refresh rides list for the current bike
        loadRidesForBike(bikeId);
    } catch (err) {
        showToast('Failed to log ride details.', 'error');
        console.error(err);
    }
}

// Fetch and load rides table for a bike
async function loadRidesForBike(bikeId) {
    const tableBody = document.querySelector('#rides-list-table tbody');
    if (!bikeId) {
        renderEmptyRidesTable();
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/rides/bike/${bikeId}`);
        if (!response.ok) throw new Error('Failed to fetch rides');
        const rides = await response.json();

        if (rides.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: var(--color-text-muted);">No rides logged for this bike yet.</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = rides.map(ride => `
            <tr>
                <td>${ride.id}</td>
                <td>${ride.bike.name} ${ride.bike.model}</td>
                <td>${ride.distance} km</td>
                <td>${ride.averageSpeed} / <strong>${ride.maxSpeed}</strong> <span style="font-size: 0.75rem; color: var(--color-text-muted);">km/h</span></td>
                <td>${ride.mileage} km/L</td>
                <td>₹${ride.fuelCost.toFixed(2)}</td>
                <td>₹${ride.costPerKm.toFixed(2)} / km</td>
            </tr>
        `).join('');
    } catch (err) {
        showToast('Error loading rides log', 'error');
        console.error(err);
    }
}

// Render clean empty ride log
function renderEmptyRidesTable() {
    const tableBody = document.querySelector('#rides-list-table tbody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; color: var(--color-text-muted);">Select a bike above to view its ride logs.</td>
        </tr>
    `;
}

// Fetch and render complete bike performance report
async function loadBikeReport(bikeId) {
    if (!bikeId) return;

    try {
        const response = await fetch(`${API_BASE}/rides/bike/${bikeId}/report`);
        if (!response.ok) throw new Error('Failed to fetch report');
        const report = await response.json();

        // Reveal report panel
        document.getElementById('report-placeholder').style.display = 'none';
        document.getElementById('report-container').style.display = 'block';

        // Update Header
        document.getElementById('report-bike-name').textContent = `${report.bikeName} ${report.bikeModel}`;
        document.getElementById('report-bike-meta').textContent = `Bike Database Reference ID: ${report.bikeId}`;
        document.getElementById('report-total-rides').textContent = `${report.totalRides} Rides Logged`;

        // Update Statistics
        document.getElementById('report-avg-mileage').textContent = `${report.averageMileageKmPerLiter.toFixed(2)} km/L`;
        document.getElementById('report-avg-cost-km').textContent = `₹${report.averageCostPerKm.toFixed(2)}`;
        document.getElementById('report-max-speed').textContent = `${report.maxSpeedKmPerHour.toFixed(2)} km/h`;
        document.getElementById('report-avg-speed').textContent = `${report.averageSpeedKmPerHour.toFixed(2)} km/h`;
        document.getElementById('report-total-distance').textContent = `${report.totalDistanceKm.toFixed(2)} km`;
        document.getElementById('report-total-fuel-cost').textContent = `₹${report.totalFuelCost.toFixed(2)}`;

    } catch (err) {
        showToast('Failed to load performance report', 'error');
        console.error(err);
    }
}

// Toast alerts helper
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    const msgEl = document.getElementById('toast-message');

    msgEl.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}
