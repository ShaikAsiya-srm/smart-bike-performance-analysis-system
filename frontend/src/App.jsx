import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080/api';
const BIKE_NAME_OPTIONS = [
  'Royal Enfield',
  'Yamaha',
  'Honda',
  'Hero',
  'Bajaj',
  'TVS',
  'KTM',
  'Suzuki',
  'Others'
];

function App() {
  // Navigation State
  const [activeSection, setActiveSection] = useState('dashboard');

  // Core Data States
  const [bikes, setBikes] = useState([]);
  const [rides, setRides] = useState([]);
  const [selectedBikeIdForRides, setSelectedBikeIdForRides] = useState('');
  const [selectedBikeIdForReport, setSelectedBikeIdForReport] = useState('');
  const [report, setReport] = useState(null);

  // Form States - Register Bike
  const [bikeForm, setBikeForm] = useState({
    name: '',
    customName: '',
    model: '',
    fuelType: 'Petrol',
    tankCapacity: ''
  });

  // Form States - Log Ride
  const [rideForm, setRideForm] = useState({
    distance: '',
    durationHours: '',
    fuelConsumed: '',
    fuelPricePerLiter: '',
    maxSpeed: ''
  });

  // Fleet Statistics States (computed dynamically)
  const [dashboardStats, setDashboardStats] = useState({
    totalBikes: 0,
    totalRides: 0,
    fleetMileage: 0
  });

  // Toast notification state
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  // Load bikes list on startup
  useEffect(() => {
    fetchBikes();
  }, []);

  // Compute overall stats whenever the list of bikes changes
  useEffect(() => {
    calculateDashboardStats();
  }, [bikes]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3500);
  };

  // API Call: Retrieve All Bikes
  const fetchBikes = async () => {
    try {
      const res = await fetch(`${API_BASE}/bikes`);
      if (!res.ok) throw new Error('Could not fetch bikes');
      const data = await res.json();
      setBikes(data);
    } catch (err) {
      showToast('Error connecting to backend API', 'error');
      console.error(err);
    }
  };

  // API Call: Retrieve Rides Log for a specific Bike
  const fetchRidesForBike = async (bikeId) => {
    if (!bikeId) return;
    try {
      const res = await fetch(`${API_BASE}/rides/bike/${bikeId}`);
      if (!res.ok) throw new Error('Could not fetch rides');
      const data = await res.json();
      setRides(data);
    } catch (err) {
      showToast('Error retrieving rides log', 'error');
      console.error(err);
    }
  };

  // API Call: Fetch Report details for a specific Bike
  const fetchReportForBike = async (bikeId) => {
    if (!bikeId) return;
    try {
      const res = await fetch(`${API_BASE}/rides/bike/${bikeId}/report`);
      if (!res.ok) throw new Error('Could not generate report');
      const data = await res.json();
      setReport(data);
    } catch (err) {
      showToast('Error generating report statistics', 'error');
      console.error(err);
    }
  };

  // Calculate fleet-wide dynamic aggregates
  const calculateDashboardStats = async () => {
    if (bikes.length === 0) {
      setDashboardStats({ totalBikes: 0, totalRides: 0, fleetMileage: 0 });
      return;
    }

    let totalRuns = 0;
    let sumDistance = 0;
    let sumFuel = 0;

    for (const bike of bikes) {
      try {
        const res = await fetch(`${API_BASE}/rides/bike/${bike.id}/report`);
        if (res.ok) {
          const reportData = await res.json();
          totalRuns += reportData.totalRides;
          sumDistance += reportData.totalDistanceKm;
          sumFuel += reportData.totalFuelConsumedLiters;
        }
      } catch (err) {
        console.error('Error compiling aggregates for bike ' + bike.id, err);
      }
    }

    const mileage = sumFuel > 0 ? (sumDistance / sumFuel) : 0.0;

    setDashboardStats({
      totalBikes: bikes.length,
      totalRides: totalRuns,
      fleetMileage: mileage
    });
  };

  // Handle Form Submit: Add Bike
  const handleBikeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/bikes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bikeForm.name === 'Others' ? bikeForm.customName.trim() : bikeForm.name,
          model: bikeForm.model,
          fuelType: bikeForm.fuelType,
          tankCapacity: parseFloat(bikeForm.tankCapacity)
        })
      });

      if (!res.ok) throw new Error('Failed to register bike');
      const savedBike = await res.json();

      showToast(`${savedBike.name} ${savedBike.model} registered successfully!`, 'success');
      setBikeForm({ name: '', customName: '', model: '', fuelType: 'Petrol', tankCapacity: '' });
      fetchBikes();
    } catch (err) {
      showToast('Failed to add bike.', 'error');
      console.error(err);
    }
  };

  // Handle Form Submit: Log Ride
  const handleRideSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBikeIdForRides) {
      showToast('Please select a bike to log this ride.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/rides/bike/${selectedBikeIdForRides}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distance: parseFloat(rideForm.distance),
          durationHours: parseFloat(rideForm.durationHours),
          fuelConsumed: parseFloat(rideForm.fuelConsumed),
          fuelPricePerLiter: parseFloat(rideForm.fuelPricePerLiter),
          maxSpeed: parseFloat(rideForm.maxSpeed)
        })
      });

      if (!res.ok) throw new Error('Failed to log ride details');

      showToast('Ride telemetry logged and analyzed!', 'success');
      setRideForm({ distance: '', durationHours: '', fuelConsumed: '', fuelPricePerLiter: '', maxSpeed: '' });
      fetchRidesForBike(selectedBikeIdForRides);
      fetchBikes(); // Recalculate dashboard aggregates
    } catch (err) {
      showToast('Failed to log ride details.', 'error');
      console.error(err);
    }
  };

  // Jump from Dashboard to report for a specific bike
  const handleViewReportDirectly = (bikeId) => {
    setSelectedBikeIdForReport(bikeId);
    fetchReportForBike(bikeId);
    setActiveSection('reports');
  };

  // Handle section switcher
  const handleSectionSwitch = (sectionId) => {
    setActiveSection(sectionId);
    if (sectionId === 'dashboard') {
      calculateDashboardStats();
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">B</div>
          <div className="logo-text">BIKE STATS</div>
        </div>

        <ul className="nav-menu">
          <li 
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleSectionSwitch('dashboard')}
          >
            <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span>Dashboard</span>
          </li>
          <li 
            className={`nav-item ${activeSection === 'bikes' ? 'active' : ''}`}
            onClick={() => handleSectionSwitch('bikes')}
          >
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            <span>Bikes Manager</span>
          </li>
          <li 
            className={`nav-item ${activeSection === 'rides' ? 'active' : ''}`}
            onClick={() => handleSectionSwitch('rides')}
          >
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            <span>Ride Logger</span>
          </li>
          <li 
            className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`}
            onClick={() => handleSectionSwitch('reports')}
          >
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
            <span>Reports</span>
          </li>
        </ul>

        <div className="sidebar-footer">
          <p>Smart Bike System v1.0.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <h1 className="page-title">
            {activeSection === 'dashboard' && 'Telemetry & Performance Dashboard'}
            {activeSection === 'bikes' && 'Bikes Manager'}
            {activeSection === 'rides' && 'Ride Logger'}
            {activeSection === 'reports' && 'Performance Reports'}
          </h1>
          <p className="page-subtitle">
            {activeSection === 'dashboard' && 'Overview of connected bikes and statistics'}
            {activeSection === 'bikes' && 'Register new bikes and view database logs'}
            {activeSection === 'rides' && 'Record new runs and analyze real-time calculations'}
            {activeSection === 'reports' && 'Detailed diagnostic statistics per bike'}
          </p>
        </header>

        {/* SECTION: DASHBOARD */}
        {activeSection === 'dashboard' && (
          <div className="content-section">
            <div className="summary-grid">
              <div className="summary-card">
                <div className="card-icon-wrapper">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
                <div className="card-title">Registered Bikes</div>
                <div className="card-value">{dashboardStats.totalBikes}</div>
                <div className="card-desc">Connected smart bikes</div>
              </div>

              <div className="summary-card">
                <div className="card-icon-wrapper" style={{ color: 'var(--accent-purple)' }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="card-title">Total Rides Logged</div>
                <div className="card-value">{dashboardStats.totalRides}</div>
                <div className="card-desc">Total runs across fleet</div>
              </div>

              <div className="summary-card">
                <div className="card-icon-wrapper" style={{ color: 'var(--accent-emerald)' }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <div className="card-title">Fleet Efficiency</div>
                <div className="card-value">{dashboardStats.fleetMileage.toFixed(2)} km/L</div>
                <div className="card-desc">Average fleet mileage</div>
              </div>
            </div>

            <div className="panel-card" style={{ marginTop: '2rem' }}>
              <div className="panel-header">
                <span>Fleet Standings</span>
              </div>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Bike Name</th>
                      <th>Model</th>
                      <th>Fuel Type</th>
                      <th>Tank Capacity (L)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bikes.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                          No bikes registered yet. Add a bike to get started!
                        </td>
                      </tr>
                    ) : (
                      bikes.map(bike => (
                        <tr key={bike.id}>
                          <td>{bike.id}</td>
                          <td><strong>{bike.name}</strong></td>
                          <td>{bike.model}</td>
                          <td><span className="badge-petrol">{bike.fuelType}</span></td>
                          <td>{bike.tankCapacity} L</td>
                          <td>
                            <button 
                              className="btn-primary" 
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: 'auto' }}
                              onClick={() => handleViewReportDirectly(bike.id)}
                            >
                              View Report
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: BIKES MANAGER */}
        {activeSection === 'bikes' && (
          <div className="content-section">
            <div className="panel-grid">
              <div className="panel-card">
                <div className="panel-header">Register New Bike</div>
                <form onSubmit={handleBikeSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="bike-name">Bike/Manufacturer Name</label>
                    <select
                      className="form-select"
                      id="bike-name"
                      value={bikeForm.name}
                      onChange={(e) => setBikeForm({ ...bikeForm, name: e.target.value, customName: '' })}
                      required
                    >
                      <option value="" disabled>Choose a bike name...</option>
                      {BIKE_NAME_OPTIONS.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  {bikeForm.name === 'Others' && (
                    <div className="form-group">
                      <label className="form-label" htmlFor="bike-custom-name">Other Bike/Manufacturer Name</label>
                      <input
                        className="form-input"
                        type="text"
                        id="bike-custom-name"
                        placeholder="Enter bike name"
                        value={bikeForm.customName}
                        onChange={(e) => setBikeForm({ ...bikeForm, customName: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label" htmlFor="bike-model">Model Name</label>
                    <input 
                      className="form-input" 
                      type="text" 
                      id="bike-model" 
                      placeholder="e.g. Classic 350, FZ-S"
                      value={bikeForm.model}
                      onChange={(e) => setBikeForm({ ...bikeForm, model: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="bike-fuel-type">Fuel Type</label>
                    <select 
                      className="form-select" 
                      id="bike-fuel-type"
                      value={bikeForm.fuelType}
                      onChange={(e) => setBikeForm({ ...bikeForm, fuelType: e.target.value })}
                      required
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Electric">Electric</option>
                      <option value="Diesel">Diesel</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="bike-tank-capacity">Tank Capacity (Liters)</label>
                    <input 
                      className="form-input" 
                      type="number" 
                      step="0.1" 
                      id="bike-tank-capacity" 
                      placeholder="e.g. 13.5"
                      value={bikeForm.tankCapacity}
                      onChange={(e) => setBikeForm({ ...bikeForm, tankCapacity: e.target.value })}
                      required 
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                    Add Bike
                  </button>
                </form>
              </div>

              <div className="panel-card">
                <div className="panel-header">Registered Bikes</div>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Model</th>
                        <th>Fuel Type</th>
                        <th>Tank Capacity (L)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bikes.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No bikes found.</td>
                        </tr>
                      ) : (
                        bikes.map(bike => (
                          <tr key={bike.id}>
                            <td>{bike.id}</td>
                            <td>{bike.name}</td>
                            <td>{bike.model}</td>
                            <td><span className="badge-petrol">{bike.fuelType}</span></td>
                            <td>{bike.tankCapacity} L</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: RIDE LOGGER */}
        {activeSection === 'rides' && (
          <div className="content-section">
            <div className="panel-grid">
              <div className="panel-card">
                <div className="panel-header">Record Ride Data</div>
                <form onSubmit={handleRideSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ride-bike-id">Select Bike</label>
                    <select 
                      className="form-select" 
                      id="ride-bike-id"
                      value={selectedBikeIdForRides}
                      onChange={(e) => {
                        setSelectedBikeIdForRides(e.target.value);
                        fetchRidesForBike(e.target.value);
                      }}
                      required
                    >
                      <option value="" disabled>Choose a bike...</option>
                      {bikes.map(bike => (
                        <option key={bike.id} value={bike.id}>{bike.name} {bike.model} (ID: {bike.id})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ride-distance">Distance Travelled (km)</label>
                    <input 
                      className="form-input" 
                      type="number" 
                      step="0.01" 
                      id="ride-distance" 
                      placeholder="e.g. 150.5"
                      value={rideForm.distance}
                      onChange={(e) => setRideForm({ ...rideForm, distance: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ride-duration">Duration (hours)</label>
                    <input 
                      className="form-input" 
                      type="number" 
                      step="0.01" 
                      id="ride-duration" 
                      placeholder="e.g. 3.5"
                      value={rideForm.durationHours}
                      onChange={(e) => setRideForm({ ...rideForm, durationHours: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ride-fuel">Fuel Consumed (Liters)</label>
                    <input 
                      className="form-input" 
                      type="number" 
                      step="0.01" 
                      id="ride-fuel" 
                      placeholder="e.g. 4.2"
                      value={rideForm.fuelConsumed}
                      onChange={(e) => setRideForm({ ...rideForm, fuelConsumed: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ride-fuel-price">Fuel Price per Liter</label>
                    <input 
                      className="form-input" 
                      type="number" 
                      step="0.01" 
                      id="ride-fuel-price" 
                      placeholder="e.g. 105.50"
                      value={rideForm.fuelPricePerLiter}
                      onChange={(e) => setRideForm({ ...rideForm, fuelPricePerLiter: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ride-max-speed">Max Speed Reached (km/h)</label>
                    <input 
                      className="form-input" 
                      type="number" 
                      step="0.1" 
                      id="ride-max-speed" 
                      placeholder="e.g. 95.0"
                      value={rideForm.maxSpeed}
                      onChange={(e) => setRideForm({ ...rideForm, maxSpeed: e.target.value })}
                      required 
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    Log Ride
                  </button>
                </form>
              </div>

              <div className="panel-card">
                <div className="panel-header">Ride Telemetry Log</div>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Bike</th>
                        <th>Distance (km)</th>
                        <th>Speed (Avg/Max)</th>
                        <th>Mileage (km/L)</th>
                        <th>Fuel Cost</th>
                        <th>Cost/km</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!selectedBikeIdForRides ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            Select a bike in the drop-down to view its ride logs.
                          </td>
                        </tr>
                      ) : rides.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            No rides logged for this bike yet.
                          </td>
                        </tr>
                      ) : (
                        rides.map(ride => (
                          <tr key={ride.id}>
                            <td>{ride.id}</td>
                            <td>{ride.bike.name} {ride.bike.model}</td>
                            <td>{ride.distance} km</td>
                            <td>
                              {ride.averageSpeed} / <strong>{ride.maxSpeed}</strong> <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>km/h</span>
                            </td>
                            <td>{ride.mileage} km/L</td>
                            <td>₹{ride.fuelCost.toFixed(2)}</td>
                            <td>₹{ride.costPerKm.toFixed(2)} / km</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: REPORTS */}
        {activeSection === 'reports' && (
          <div className="content-section">
            <div className="panel-card" style={{ marginBottom: '2rem', maxWidth: '450px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="report-bike-id">Select Bike for Analysis</label>
                <select 
                  className="form-select" 
                  id="report-bike-id"
                  value={selectedBikeIdForReport}
                  onChange={(e) => {
                    setSelectedBikeIdForReport(e.target.value);
                    fetchReportForBike(e.target.value);
                  }}
                >
                  <option value="" disabled>Choose a bike...</option>
                  {bikes.map(bike => (
                    <option key={bike.id} value={bike.id}>{bike.name} {bike.model} (ID: {bike.id})</option>
                  ))}
                </select>
              </div>
            </div>

            {report ? (
              <div id="report-container">
                <div className="report-header-panel">
                  <div className="report-title-desc">
                    <h2>{report.bikeName} {report.bikeModel}</h2>
                    <p>Bike Database Reference ID: {report.bikeId}</p>
                  </div>
                  <div className="report-badge">{report.totalRides} Rides Logged</div>
                </div>

                <div className="stats-grid">
                  <div className="stat-card-premium cyan">
                    <div className="stat-icon">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    </div>
                    <div className="stat-lbl">Average Mileage</div>
                    <div className="stat-val">{report.averageMileageKmPerLiter.toFixed(2)} km/L</div>
                  </div>

                  <div className="stat-card-premium emerald">
                    <div className="stat-icon">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <div className="stat-lbl">Average Cost Per KM</div>
                    <div className="stat-val">₹{report.averageCostPerKm.toFixed(2)}</div>
                  </div>

                  <div className="stat-card-premium">
                    <div className="stat-icon">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    <div className="stat-lbl">Maximum Speed</div>
                    <div className="stat-val">{report.maxSpeedKmPerHour.toFixed(2)} km/h</div>
                  </div>

                  <div className="stat-card-premium cyan">
                    <div className="stat-icon">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div className="stat-lbl">Overall Average Speed</div>
                    <div className="stat-val">{report.averageSpeedKmPerHour.toFixed(2)} km/h</div>
                  </div>

                  <div className="stat-card-premium">
                    <div className="stat-icon">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                    </div>
                    <div className="stat-lbl">Total Distance Covered</div>
                    <div className="stat-val">{report.totalDistanceKm.toFixed(2)} km</div>
                  </div>

                  <div className="stat-card-premium emerald">
                    <div className="stat-icon">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    </div>
                    <div className="stat-lbl">Total Fuel Expenses</div>
                    <div className="stat-val">₹{report.totalFuelCost.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div id="report-placeholder" style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
                <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: '1rem', opacity: 0.5 }}>
                  <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p>Please select a bike above to view its detailed performance statistics.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Toast Notification Banner */}
      <div className={`toast ${toast.visible ? 'show' : ''} ${toast.type}`}>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

export default App;


