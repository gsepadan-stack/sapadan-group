import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './DriverApp.css';

// ── Custom truck icon ─────────────────────────────────────────────────────
const makeTruckIcon = (speed = 0) => {
  const color = speed > 60 ? '#ef4444' : speed > 0 ? '#3b82f6' : '#10b981';
  const shadow = speed > 60 ? 'rgba(239,68,68,0.4)' : speed > 0 ? 'rgba(59,130,246,0.4)' : 'rgba(16,185,129,0.4)';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52">
    <circle cx="26" cy="26" r="24" fill="${color}" fill-opacity="0.18"/>
    <circle cx="26" cy="26" r="18" fill="${color}" stroke="white" stroke-width="2.5"/>
    <!-- Truck body -->
    <rect x="13" y="21" width="18" height="11" rx="2" fill="white"/>
    <!-- Truck cab -->
    <rect x="31" y="24" width="8" height="8" rx="1.5" fill="white"/>
    <!-- Windshield -->
    <rect x="32" y="25" width="6" height="4" rx="1" fill="${color}" opacity="0.6"/>
    <!-- Wheels -->
    <circle cx="17" cy="33" r="2.5" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="27" cy="33" r="2.5" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="36" cy="33" r="2.5" fill="${color}" stroke="white" stroke-width="1.5"/>
    <!-- Speed indicator dot -->
    <circle cx="26" cy="26" r="3" fill="white" opacity="${speed > 0 ? '0.9' : '0.4'}"/>
  </svg>`;

  return L.divIcon({
    html: `<div style="filter:drop-shadow(0 3px 8px ${shadow});animation:truckBounce 2s ease-in-out infinite;">${svg}</div>`,
    className: '',
    iconSize: [52, 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -30],
  });
};

delete (L.Icon.Default.prototype as any)._getIconUrl;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Trip {
  id: string; vehicleId: string; tujuan: string; muatan?: string;
  kmAwal: number; kmAkhir?: number; totalKm?: number;
  status: string; startTime?: string; endTime?: string; tanggal: string;
  vehicle: { platNomor: string; merk: string; model: string };
  driver?: { name: string; phone: string };
}
interface LocPoint { lat: number; lng: number; speed: number; ts: number }

const MapRecenter = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng]);
  return null;
};

const formatDuration = (startTime: string) => {
  const diff = Date.now() - new Date(startTime).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  if (h > 0) return `${h}j ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const fmt = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

// ── Profile Tab Component ─────────────────────────────────────────────────
interface ProfileTabProps {
  driverName: string; driverEmail: string;
  tripHistory: Trip[]; isTracking: boolean; onLogout: () => void;
}

function ProfileTab({ driverName, driverEmail, tripHistory, isTracking, onLogout }: ProfileTabProps) {
  const [photo, setPhoto] = useState<string | null>(() => localStorage.getItem('driverPhoto'));
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('Ukuran foto maksimal 3MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhoto(result);
      localStorage.setItem('driverPhoto', result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    localStorage.removeItem('driverPhoto');
  };

  const totalKm = tripHistory.reduce((s, t) => s + (t.totalKm || 0), 0);
  const done = tripHistory.filter(t => t.status === 'COMPLETED').length;
  const lastTrip = tripHistory[0];

  return (
    <div>
      {/* Hero Card */}
      <div className="profile-hero">
        {/* Photo Upload */}
        <div className="profile-photo-wrap">
          <div className="profile-photo-ring">
            {photo ? (
              <img src={photo} alt="Foto" className="profile-photo-img" />
            ) : (
              <div className="profile-photo-placeholder">
                {driverName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <button className="profile-photo-btn" onClick={() => fileRef.current?.click()} title="Ganti foto">
            📷
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
        </div>

        <div className="profile-hero-name">{driverName}</div>
        <div className="profile-hero-email">{driverEmail}</div>

        <div className="profile-hero-badges">
          <span className="profile-badge-item green">✓ Driver Aktif</span>
          <span className={`profile-badge-item ${isTracking ? 'blue' : 'gray'}`}>
            {isTracking ? '📍 GPS ON' : '📍 GPS OFF'}
          </span>
        </div>

        {photo && (
          <button className="profile-remove-photo" onClick={removePhoto}>Hapus Foto</button>
        )}
      </div>

      {/* Stats Row */}
      <div className="profile-stats-row">
        <div className="profile-stat">
          <div className="profile-stat-value">{tripHistory.length}</div>
          <div className="profile-stat-label">Total Trip</div>
        </div>
        <div className="profile-stat-divider" />
        <div className="profile-stat">
          <div className="profile-stat-value">{done}</div>
          <div className="profile-stat-label">Selesai</div>
        </div>
        <div className="profile-stat-divider" />
        <div className="profile-stat">
          <div className="profile-stat-value">{totalKm.toLocaleString()}</div>
          <div className="profile-stat-label">Total KM</div>
        </div>
      </div>

      {/* Info Card */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-title">Informasi Akun</div>
        <div className="profile-info-row">
          <span className="profile-info-icon">👤</span>
          <div>
            <div className="profile-info-label">Nama Lengkap</div>
            <div className="profile-info-value">{driverName}</div>
          </div>
        </div>
        <div className="profile-info-divider" />
        <div className="profile-info-row">
          <span className="profile-info-icon">✉️</span>
          <div>
            <div className="profile-info-label">Email</div>
            <div className="profile-info-value">{driverEmail}</div>
          </div>
        </div>
        <div className="profile-info-divider" />
        <div className="profile-info-row">
          <span className="profile-info-icon">🏢</span>
          <div>
            <div className="profile-info-label">Perusahaan</div>
            <div className="profile-info-value">Sapadan Fishery Group</div>
          </div>
        </div>
      </div>

      {/* Last Trip */}
      {lastTrip && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-title">Perjalanan Terakhir</div>
          <div className="profile-info-row">
            <span className="profile-info-icon">🎯</span>
            <div>
              <div className="profile-info-label">Tujuan</div>
              <div className="profile-info-value">{lastTrip.tujuan}</div>
            </div>
          </div>
          <div className="profile-info-divider" />
          <div className="profile-info-row">
            <span className="profile-info-icon">📅</span>
            <div>
              <div className="profile-info-label">Tanggal</div>
              <div className="profile-info-value">{fmt(lastTrip.tanggal)}</div>
            </div>
          </div>
          {lastTrip.totalKm != null && (
            <>
              <div className="profile-info-divider" />
              <div className="profile-info-row">
                <span className="profile-info-icon">🛣️</span>
                <div>
                  <div className="profile-info-label">Jarak Tempuh</div>
                  <div className="profile-info-value">{lastTrip.totalKm} km</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <button className="btn-logout-full" onClick={onLogout}>Keluar dari Akun</button>
    </div>
  );
}

function DriverApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'trip' | 'history' | 'profile'>('trip');
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [tripHistory, setTripHistory] = useState<Trip[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLoc, setCurrentLoc] = useState<LocPoint | null>(null);
  const [locHistory, setLocHistory] = useState<LocPoint[]>([]);
  const [duration, setDuration] = useState('');
  const [showEndModal, setShowEndModal] = useState(false);
  const [showPodModal, setShowPodModal] = useState(false);
  const [podPhoto, setPodPhoto] = useState<string | null>(null);
  const [podNote, setPodNote] = useState('');
  const [podLoading, setPodLoading] = useState(false);
  const podFileRef = useRef<HTMLInputElement>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [kmAkhir, setKmAkhir] = useState('');
  const [endLoading, setEndLoading] = useState(false);
  const [vehicles, setVehicles] = useState<{id:string;platNomor:string;merk:string;model:string}[]>([]);
  const [startForm, setStartForm] = useState({ vehicleId: '', tujuan: '', kmAwal: '', muatan: '' });
  const [startLoading, setStartLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('driverToken');
    const name = localStorage.getItem('driverName');
    const em = localStorage.getItem('driverEmail');
    if (saved) {
      setToken(saved); setIsLoggedIn(true);
      if (name) setDriverName(name);
      if (em) setDriverEmail(em);
      checkActiveTrip(saved);
      fetchHistory(saved);
    }
  }, []);

  useEffect(() => {
    if (!activeTrip?.startTime) return;
    const t = setInterval(() => setDuration(formatDuration(activeTrip.startTime!)), 1000);
    return () => clearInterval(t);
  }, [activeTrip]);

  const login = async () => {
    setLoginLoading(true); setLoginError('');
    try {
      const r = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: t, user } = r.data;
      setToken(t); setDriverName(user?.name || 'Driver'); setDriverEmail(email);
      localStorage.setItem('driverToken', t);
      localStorage.setItem('driverName', user?.name || 'Driver');
      localStorage.setItem('driverEmail', email);
      setIsLoggedIn(true);
      checkActiveTrip(t); fetchHistory(t);
    } catch { setLoginError('Email atau password salah.'); }
    finally { setLoginLoading(false); }
  };

  const logout = () => {
    ['driverToken','driverName','driverEmail'].forEach(k => localStorage.removeItem(k));
    setIsLoggedIn(false); setToken(''); setDriverName(''); setDriverEmail('');
    setActiveTrip(null); setTripHistory([]); stopTracking();
  };

  const checkActiveTrip = async (t: string) => {
    try {
      const r = await axios.get(`${API_URL}/driver/trip/active`, { headers: { Authorization: `Bearer ${t}` } });
      if (r.data) { setActiveTrip(r.data); startTracking(r.data.id, t); }
    } catch (e) { console.error(e); }
    fetchVehicles(t);
  };

  const fetchHistory = async (t: string) => {
    try {
      const r = await axios.get(`${API_URL}/driver/trips`, { headers: { Authorization: `Bearer ${t}` } });
      setTripHistory(r.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchVehicles = async (t: string) => {
    try {
      const r = await axios.get(`${API_URL}/vehicles`, { headers: { Authorization: `Bearer ${t}` } });
      setVehicles(r.data || []);
    } catch (e) { console.error(e); }
  };

  const handleStartTrip = async () => {
    if (!startForm.vehicleId || !startForm.tujuan) return;
    setStartLoading(true);
    try {
      const r = await axios.post(`${API_URL}/driver/trip/start`, {
        vehicleId: startForm.vehicleId,
        tujuan: startForm.tujuan,
        kmAwal: 0,  // Admin update nanti dari dashboard
        muatan: startForm.muatan,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setActiveTrip(r.data);
      setShowStartModal(false);
      setStartForm({ vehicleId: '', tujuan: '', kmAwal: '', muatan: '' });
      startTracking(r.data.id, token);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Gagal memulai perjalanan');
    } finally { setStartLoading(false); }
  };

  const retryGps = () => {
    if (!activeTrip) return;
    setGpsError('');
    stopTracking();
    startTracking(activeTrip.id, token);
  };

  const startTracking = (tripId: string, t: string) => {
    if (!navigator.geolocation) return;
    setIsTracking(true);
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy, speed: s } = pos.coords;
        const speed = s ? Math.round(s * 3.6) : 0;
        const point: LocPoint = { lat, lng, speed, ts: Date.now() };
        setCurrentLoc(point);
        setLocHistory(prev => [...prev.slice(-99), point]);
        axios.post(`${API_URL}/driver/location`,
          { tripLogId: tripId, latitude: lat, longitude: lng, accuracy, speed },
          { headers: { Authorization: `Bearer ${t}` } }
        ).catch(() => {});
      },
      (err) => { console.error('GPS:', err); setIsTracking(false); setGpsError('GPS tidak dapat diakses. Pastikan izin lokasi diaktifkan di browser.'); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    watchIdRef.current = id;
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    setIsTracking(false);
  };

  const handleEndTrip = async () => {
    if (!activeTrip || !kmAkhir) return;
    setEndLoading(true);
    try {
      await axios.post(`${API_URL}/driver/trip/${activeTrip.id}/end`,
        { kmAkhir: parseInt(kmAkhir), catatan: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      stopTracking(); setActiveTrip(null); setLocHistory([]); setCurrentLoc(null);
      setShowEndModal(false); setKmAkhir('');
      fetchHistory(token);
    } catch { alert('Gagal mengakhiri perjalanan'); }
    finally { setEndLoading(false); }
  };

  const handlePodPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Ukuran foto maksimal 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPodPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitPOD = async () => {
    if (!activeTrip || !podPhoto) return;
    setPodLoading(true);
    try {
      await axios.post(`${API_URL}/driver/trip/${activeTrip.id}/pod`,
        { podPhoto, podNote, kmAkhir: kmAkhir || 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      stopTracking();
      setActiveTrip(null); setLocHistory([]); setCurrentLoc(null);
      setShowPodModal(false); setPodPhoto(null); setPodNote(''); setKmAkhir('');
      fetchHistory(token);
    } catch { alert('Gagal mengirim bukti pengiriman'); }
    finally { setPodLoading(false); }
  };

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <img src="/logofix.png" alt="Logo" className="login-logo"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div className="login-title">Sapadan Driver</div>
        <div className="login-subtitle">GPS Tracking & Trip Management</div>
        <div className="login-card">
          <h2>Masuk ke Akun</h2>
          {loginError && <div className="error-msg">{loginError}</div>}
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="driver@sapadan.com" value={email}
              onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
          </div>
          <button className="btn-primary" onClick={login} disabled={loginLoading}>
            {loginLoading ? 'Masuk...' : 'Masuk'}
          </button>
        </div>
      </div>
    );
  }

  const polyline = locHistory.map(p => [p.lat, p.lng] as [number, number]);

  // ── MAIN APP ──────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <img src="/logofix.png" alt="Logo" className="header-logo"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div>
            <div className="header-title">Sapadan Driver</div>
            <div className="header-sub">{driverName}</div>
          </div>
        </div>
        {activeTrip && (
          <div className={`gps-badge-mini ${isTracking ? 'active' : 'inactive'}`}>
            <div className="gps-dot" />
            {isTracking ? 'GPS ON' : 'GPS OFF'}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="app-content">

        {/* ── TAB: PERJALANAN ── */}
        {activeTab === 'trip' && (
          <>
            {activeTrip ? (
              <>
                <div className={`gps-badge ${isTracking ? 'active' : 'inactive'}`}>
                  <div className="gps-dot" />
                  {isTracking ? 'GPS Aktif — Lokasi Terkirim ke Admin' : 'GPS Tidak Aktif'}
                </div>

                {!isTracking && (
                  <div className="gps-error-box">
                    <div className="gps-error-msg">
                      {gpsError || 'GPS mati. Aktifkan izin lokasi di browser lalu tekan tombol di bawah.'}
                    </div>
                    <button className="btn-retry-gps" onClick={retryGps}>
                      📍 Aktifkan GPS Sekarang
                    </button>
                  </div>
                )}

                <div className="stats-row">
                  <div className="stat-box">
                    <div className="stat-value">{currentLoc?.speed ?? 0}</div>
                    <div className="stat-label">km/h</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{locHistory.length}</div>
                    <div className="stat-label">Titik GPS</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value" style={{ fontSize: 16 }}>{duration || '0s'}</div>
                    <div className="stat-label">Durasi</div>
                  </div>
                </div>

                {currentLoc ? (
                  <div className="map-container">
                    <MapContainer center={[currentLoc.lat, currentLoc.lng]} zoom={16}
                      style={{ height: '100%', width: '100%' }} zoomControl>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                      {/* Garis rute yang sudah dilalui */}
                      {polyline.length > 1 && (
                        <>
                          {/* Shadow garis */}
                          <Polyline positions={polyline} color="#1d4ed8" weight={8} opacity={0.15} />
                          {/* Garis utama */}
                          <Polyline positions={polyline} color="#3b82f6" weight={5} opacity={0.9}
                            pathOptions={{ dashArray: undefined }} />
                        </>
                      )}

                      {/* Marker START (titik awal) */}
                      {polyline.length > 0 && (
                        <Marker position={polyline[0]} icon={L.divIcon({
                          html: `<div style="
                            background:#10b981;color:white;
                            font-size:10px;font-weight:800;
                            padding:4px 8px;border-radius:6px;
                            border:2px solid white;
                            box-shadow:0 2px 8px rgba(0,0,0,0.25);
                            white-space:nowrap;
                          ">▶ START</div>`,
                          className: '',
                          iconSize: [60, 26],
                          iconAnchor: [30, 13],
                          popupAnchor: [0, -16],
                        })}>
                          <Popup>Titik Keberangkatan</Popup>
                        </Marker>
                      )}

                      {/* Marker truk (posisi sekarang) */}
                      <Marker position={[currentLoc.lat, currentLoc.lng]} icon={makeTruckIcon(currentLoc.speed)}>
                        <Popup>
                          <div style={{ textAlign: 'center', minWidth: 150 }}>
                            <div style={{ fontWeight: 800, fontSize: 15, fontFamily: 'monospace', letterSpacing: 1 }}>
                              {activeTrip.vehicle.platNomor}
                            </div>
                            <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                              {activeTrip.vehicle.merk} {activeTrip.vehicle.model}
                            </div>
                            <div style={{ marginTop: 8, padding: '4px 12px', background: currentLoc.speed > 60 ? '#fee2e2' : '#dbeafe', borderRadius: 8, display: 'inline-block', fontWeight: 700, fontSize: 14, color: currentLoc.speed > 60 ? '#dc2626' : '#1d4ed8' }}>
                              {currentLoc.speed} km/h
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 6 }}>
                              🎯 {activeTrip.tujuan}
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: 10, marginTop: 3 }}>
                              {locHistory.length} titik GPS tercatat
                            </div>
                          </div>
                        </Popup>
                      </Marker>

                      <MapRecenter lat={currentLoc.lat} lng={currentLoc.lng} />
                    </MapContainer>
                    <button className="map-open-btn"
                      onClick={() => window.open(`https://maps.google.com?q=${currentLoc.lat},${currentLoc.lng}`, '_blank')}>
                      Buka Maps ↗
                    </button>
                  </div>
                ) : (
                  <div className="map-placeholder-box">
                    <div className="icon">📍</div>
                    <p>Menunggu sinyal GPS...</p>
                  </div>
                )}

                {currentLoc && (
                  <div className="coords-row">
                    <div className="coord-box">
                      <div className="coord-label">Latitude</div>
                      <div className="coord-value">{currentLoc.lat.toFixed(6)}</div>
                    </div>
                    <div className="coord-box">
                      <div className="coord-label">Longitude</div>
                      <div className="coord-value">{currentLoc.lng.toFixed(6)}</div>
                    </div>
                  </div>
                )}

                <div className="card">
                  <div className="card-title">Info Perjalanan</div>
                  <div className="trip-header">
                    <div>
                      <div className="trip-plate">{activeTrip.vehicle.platNomor}</div>
                      <div className="trip-vehicle">{activeTrip.vehicle.merk} {activeTrip.vehicle.model}</div>
                    </div>
                    <div className="status-chip">JALAN</div>
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">Tujuan</div>
                      <div className="info-value">{activeTrip.tujuan}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Muatan</div>
                      <div className="info-value">{activeTrip.muatan || '-'}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">KM Awal</div>
                      <div className="info-value">{activeTrip.kmAwal.toLocaleString()}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Berangkat</div>
                      <div className="info-value">{activeTrip.startTime ? fmtTime(activeTrip.startTime) : '-'}</div>
                    </div>
                  </div>
                </div>

                <button className="btn-end" onClick={() => setShowPodModal(true)}>
                  📸 Konfirmasi Terkirim
                </button>
              </>
            ) : (
              <div className="no-trip-screen">
                <div className="no-trip-icon">🚚</div>
                <div className="no-trip-title">Tidak Ada Perjalanan Aktif</div>
                <div className="no-trip-sub">
                  Mulai perjalanan baru atau tunggu admin mengassign trip.
                </div>
                <button className="btn-start-trip" onClick={() => { fetchVehicles(token); setShowStartModal(true); }}>
                  + Mulai Perjalanan
                </button>
              </div>
            )}
          </>
        )}

        {/* ── TAB: RIWAYAT ── */}
        {activeTab === 'history' && (
          <div>
            <div className="section-title">Riwayat Perjalanan</div>
            {tripHistory.length === 0 ? (
              <div className="no-trip-screen">
                <div className="no-trip-icon">📋</div>
                <div className="no-trip-title">Belum Ada Riwayat</div>
                <div className="no-trip-sub">Riwayat perjalanan akan muncul di sini.</div>
              </div>
            ) : (
              tripHistory.map(trip => (
                <div className="history-card" key={trip.id}>
                  <div className="history-header">
                    <div>
                      <div className="history-plate">{trip.vehicle?.platNomor}</div>
                      <div className="history-date">{fmt(trip.tanggal)}</div>
                    </div>
                    <div className={`history-status ${trip.status === 'COMPLETED' ? 'done' : 'ongoing'}`}>
                      {trip.status === 'COMPLETED' ? '✓ Selesai' : '● Jalan'}
                    </div>
                  </div>
                  <div className="history-row">
                    <span>🎯 {trip.tujuan}</span>
                  </div>
                  {trip.muatan && <div className="history-row"><span>📦 {trip.muatan}</span></div>}
                  <div className="history-footer">
                    <span>KM: {trip.kmAwal.toLocaleString()} → {trip.kmAkhir?.toLocaleString() || '?'}</span>
                    {trip.totalKm != null && <span className="history-km">{trip.totalKm} km</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB: PROFIL ── */}
        {activeTab === 'profile' && (
          <ProfileTab
            driverName={driverName}
            driverEmail={driverEmail}
            tripHistory={tripHistory}
            isTracking={isTracking}
            onLogout={logout}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'trip' ? 'active' : ''}`} onClick={() => setActiveTab('trip')}>
          <div className="nav-icon">
            {activeTrip ? (
              <span className="nav-icon-live">🔴</span>
            ) : '🚚'}
          </div>
          <div className="nav-label">Perjalanan</div>
        </button>
        <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <div className="nav-icon">📋</div>
          <div className="nav-label">Riwayat</div>
        </button>
        <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <div className="nav-icon">👤</div>
          <div className="nav-label">Profil</div>
        </button>
      </nav>

      {/* Start Trip Modal */}
      {showStartModal && (
        <div className="modal-overlay" onClick={() => setShowStartModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header-row">
              <div className="modal-icon-wrap">🚚</div>
              <div>
                <div className="modal-title">Mulai Perjalanan</div>
                <div className="modal-sub">Pilih kendaraan dan tujuan pengiriman</div>
              </div>
            </div>

            {/* Kendaraan */}
            <div className="form-group">
              <label>🚛 Pilih Kendaraan</label>
              <select className="form-select" value={startForm.vehicleId}
                onChange={e => setStartForm(f => ({ ...f, vehicleId: e.target.value }))}>
                <option value="">Pilih kendaraan...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.platNomor} — {v.merk} {v.model}</option>
                ))}
              </select>
            </div>

            {/* Tujuan */}
            <div className="form-group">
              <label>📍 Tujuan Pengiriman</label>
              <input type="text" placeholder="Contoh: Pasar Ikan Muara Baru"
                value={startForm.tujuan}
                onChange={e => setStartForm(f => ({ ...f, tujuan: e.target.value }))} />
            </div>

            {/* Muatan */}
            <div className="form-group">
              <label>📦 Muatan <span className="label-optional">(opsional)</span></label>
              <input type="text" placeholder="Contoh: Ikan Lele 500 Kg"
                value={startForm.muatan}
                onChange={e => setStartForm(f => ({ ...f, muatan: e.target.value }))} />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowStartModal(false)}>Batal</button>
              <button className="btn-confirm-start" onClick={handleStartTrip}
                disabled={startLoading || !startForm.vehicleId || !startForm.tujuan}>
                {startLoading ? 'Memulai...' : '🚀 Mulai Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POD Modal - Proof of Delivery */}
      {showPodModal && (
        <div className="modal-overlay" onClick={() => setShowPodModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-icon-wrap">📸</div>
              <div>
                <div className="modal-title">Bukti Pengiriman</div>
                <div className="modal-sub">Foto barang yang sudah diterima customer</div>
              </div>
            </div>

            {/* Photo Upload */}
            <input ref={podFileRef} type="file" accept="image/*" capture="environment"
              style={{ display: 'none' }} onChange={handlePodPhotoChange} />

            {podPhoto ? (
              <div className="pod-photo-preview">
                <img src={podPhoto} alt="Bukti" className="pod-photo-img" />
                <button className="pod-retake" onClick={() => setPodPhoto(null)}>
                  🔄 Ambil Ulang
                </button>
              </div>
            ) : (
              <button className="pod-camera-btn" onClick={() => podFileRef.current?.click()}>
                <div className="pod-camera-icon">📷</div>
                <div className="pod-camera-text">Ambil Foto Bukti</div>
                <div className="pod-camera-sub">Foto barang di tangan customer</div>
              </button>
            )}

            <div className="form-group" style={{ marginTop: 16 }}>
              <label>Catatan <span className="label-optional">(opsional)</span></label>
              <input type="text" placeholder="Contoh: Diterima oleh Pak Budi"
                value={podNote} onChange={e => setPodNote(e.target.value)} />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowPodModal(false)}>Batal</button>
              <button className="btn-confirm-pod" onClick={handleSubmitPOD}
                disabled={podLoading || !podPhoto}>
                {podLoading ? 'Mengirim...' : '✓ Konfirmasi Terkirim'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Trip Modal (fallback) */}
      {showEndModal && (
        <div className="modal-overlay" onClick={() => setShowEndModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Akhiri Perjalanan</div>
            <div className="modal-sub">Masukkan KM akhir kendaraan saat ini</div>
            <div className="form-group">
              <label>KM Akhir</label>
              <input type="number" placeholder={`Min. ${activeTrip?.kmAwal}`}
                value={kmAkhir} onChange={e => setKmAkhir(e.target.value)} autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowEndModal(false)}>Batal</button>
              <button className="btn-confirm-end" onClick={handleEndTrip}
                disabled={endLoading || !kmAkhir}>
                {endLoading ? 'Menyimpan...' : 'Selesaikan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverApp;
