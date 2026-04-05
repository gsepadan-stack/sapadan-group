import { useEffect, useState, useCallback } from 'react';
import {
  Box, Paper, Typography, Grid, Chip, Avatar, Stack,
  Divider, LinearProgress, Alert, IconButton, Tooltip,
  Table, TableBody, TableCell, TableHead, TableRow, Badge,
} from '@mui/material';
import {
  DirectionsCar, LocationOn, Speed, Schedule,
  Refresh, FiberManualRecord, Route, Person,
  RadioButtonChecked, ContentCopy,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

// Fix leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom truck icon for admin map
const makeTruckIcon = (speed = 0, platNomor = '') => {
  const color = speed > 60 ? '#ef4444' : speed > 0 ? '#3b82f6' : '#10b981';
  const shadow = speed > 60 ? 'rgba(239,68,68,0.4)' : speed > 0 ? 'rgba(59,130,246,0.4)' : 'rgba(16,185,129,0.4)';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52">
    <circle cx="26" cy="26" r="24" fill="${color}" fill-opacity="0.18"/>
    <circle cx="26" cy="26" r="18" fill="${color}" stroke="white" stroke-width="2.5"/>
    <rect x="13" y="21" width="18" height="11" rx="2" fill="white"/>
    <rect x="31" y="24" width="8" height="8" rx="1.5" fill="white"/>
    <rect x="32" y="25" width="6" height="4" rx="1" fill="${color}" opacity="0.6"/>
    <circle cx="17" cy="33" r="2.5" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="27" cy="33" r="2.5" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="36" cy="33" r="2.5" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="26" cy="26" r="3" fill="white" opacity="${speed > 0 ? '0.9' : '0.4'}"/>
  </svg>`;

  const label = platNomor ? `<div style="background:${color};color:white;font-size:9px;font-weight:800;padding:2px 6px;border-radius:4px;margin-top:2px;white-space:nowrap;font-family:monospace;letter-spacing:0.5px;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.2);">${platNomor}</div>` : '';

  return L.divIcon({
    html: `<div style="text-align:center;filter:drop-shadow(0 3px 8px ${shadow});">${svg}${label}</div>`,
    className: '',
    iconSize: [52, platNomor ? 72 : 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -36],
  });
};

interface ActiveTrip {
  id: string;
  tujuan: string;
  muatan?: string;
  kmAwal: number;
  startTime?: string;
  tanggal: string;
  vehicle: {
    id: string;
    platNomor: string;
    merk: string;
    model: string;
    jenis: string;
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
  };
  locationLogs: {
    latitude: number;
    longitude: number;
    speed?: number;
    accuracy?: number;
    timestamp: string;
  }[];
}

const formatDuration = (startTime: string) => {
  const diff = Date.now() - new Date(startTime).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `${h}j ${m}m`;
  return `${m} menit`;
};

const formatCoord = (v: number) => v.toFixed(5);

const FleetMonitor = () => {
  const [trips, setTrips] = useState<ActiveTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [locLoading, setLocLoading] = useState(false);

  const fetchActiveTrips = useCallback(async () => {
    try {
      const r = await api.get('/driver/trips/active');
      setTrips(r.data);
      setLastUpdate(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLocations = async (tripId: string) => {
    setLocLoading(true);
    try {
      const r = await api.get(`/driver/trip/${tripId}/locations`);
      setLocations(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLocLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTrips();
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchActiveTrips, 15_000);
    return () => clearInterval(interval);
  }, [fetchActiveTrips]);

  useEffect(() => {
    if (selected) fetchLocations(selected);
  }, [selected]);

  const selectedTrip = trips.find(t => t.id === selected);
  const lastLoc = selectedTrip?.locationLogs?.[0];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="h5" fontWeight={700}>Live Monitoring</Typography>
            <Badge badgeContent={trips.length} color="error" max={99}>
              <Chip
                icon={<FiberManualRecord sx={{ fontSize: 10, color: '#10b981 !important', animation: trips.length > 0 ? 'pulse 2s infinite' : 'none' }} />}
                label={trips.length > 0 ? 'LIVE' : 'IDLE'}
                size="small"
                sx={{
                  bgcolor: trips.length > 0 ? '#d1fae5' : '#f3f4f6',
                  color: trips.length > 0 ? '#065f46' : '#6b7280',
                  fontWeight: 700, fontSize: 11, border: 'none',
                }}
              />
            </Badge>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Update terakhir: {format(lastUpdate, 'HH:mm:ss', { locale: idLocale })} · Auto-refresh setiap 15 detik
          </Typography>
        </Box>
        <Tooltip title="Refresh sekarang">
          <IconButton onClick={fetchActiveTrips} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {!loading && trips.length === 0 && (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <DirectionsCar sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>Tidak Ada Kendaraan Aktif</Typography>
          <Typography variant="body2" color="text.disabled" mt={1}>
            Semua kendaraan sedang tidak dalam perjalanan
          </Typography>
        </Paper>
      )}

      {trips.length > 0 && (
        <Grid container spacing={3}>
          {/* Left: Active Trip Cards */}
          <Grid item xs={12} md={5} lg={4}>
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1.5} textTransform="uppercase" letterSpacing={0.5}>
              {trips.length} Kendaraan Aktif
            </Typography>
            <Stack spacing={2}>
              {trips.map(trip => {
                const loc = trip.locationLogs?.[0];
                const isSelected = selected === trip.id;
                return (
                  <Paper
                    key={trip.id}
                    elevation={0}
                    onClick={() => setSelected(isSelected ? null : trip.id)}
                    sx={{
                      p: 2.5, border: '2px solid', cursor: 'pointer',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      borderRadius: 3, bgcolor: isSelected ? '#eff6ff' : 'white',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: 'primary.main', bgcolor: '#eff6ff' },
                    }}
                  >
                    {/* Vehicle */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: '#dbeafe', width: 40, height: 40 }}>
                          <DirectionsCar sx={{ color: '#1d4ed8', fontSize: 22 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={800} sx={{ fontFamily: 'monospace', letterSpacing: 1.5 }}>
                            {trip.vehicle.platNomor}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {trip.vehicle.merk} {trip.vehicle.model}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        icon={<RadioButtonChecked sx={{ fontSize: 12, color: '#10b981 !important' }} />}
                        label="JALAN"
                        size="small"
                        sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 700, fontSize: 10, border: 'none' }}
                      />
                    </Box>

                    <Divider sx={{ mb: 1.5 }} />

                    {/* Trip Info */}
                    <Stack spacing={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Route sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="body2" fontWeight={600}>{trip.tujuan}</Typography>
                      </Box>
                      {trip.driver && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Person sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Typography variant="body2" color="text.secondary">{trip.driver.name}</Typography>
                        </Box>
                      )}
                      {trip.startTime && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Schedule sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Typography variant="body2" color="text.secondary">
                            Berangkat {format(new Date(trip.startTime), 'HH:mm', { locale: idLocale })} · {formatDuration(trip.startTime)}
                          </Typography>
                        </Box>
                      )}
                      {loc && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Speed sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Typography variant="body2" color="text.secondary">
                            {loc.speed ? `${loc.speed} km/h` : 'Kecepatan tidak tersedia'}
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    {/* Last Location */}
                    {loc && (
                      <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                        <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                          <LocationOn sx={{ fontSize: 14, color: '#10b981' }} />
                          <Typography variant="caption" fontWeight={700} color="#065f46">Lokasi Terakhir</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatCoord(loc.latitude)}, {formatCoord(loc.longitude)}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {format(new Date(loc.timestamp), 'HH:mm:ss', { locale: idLocale })}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Stack>
          </Grid>

          {/* Right: Detail Panel */}
          <Grid item xs={12} md={7} lg={8}>
            {!selected ? (
              <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <LocationOn sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" fontWeight={600}>Pilih Kendaraan</Typography>
                <Typography variant="body2" color="text.disabled" mt={1}>
                  Klik kartu kendaraan di kiri untuk melihat detail perjalanan
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={3}>
                {/* Live Map */}
                {selectedTrip && lastLoc && (
                  <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                    <Box px={3} py={2} display="flex" justifyContent="space-between" alignItems="center"
                      sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', animation: 'pulse 1.5s infinite' }} />
                        <Typography variant="subtitle1" fontWeight={700}>Peta Live</Typography>
                        <Chip label={selectedTrip.vehicle.platNomor} size="small"
                          sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1, ml: 1 }} />
                      </Box>
                      <Box display="flex" gap={1} alignItems="center">
                        <Chip
                          label={`${locations[locations.length - 1]?.speed ?? 0} km/h`}
                          size="small"
                          sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700 }}
                        />
                        <Tooltip title="Buka di Google Maps">
                          <IconButton size="small"
                            onClick={() => window.open(`https://www.google.com/maps?q=${lastLoc.latitude},${lastLoc.longitude}`, '_blank')}>
                            <LocationOn fontSize="small" color="primary" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Box sx={{ height: 380 }}>
                      <MapContainer
                        center={[lastLoc.latitude, lastLoc.longitude]}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        key={`${lastLoc.latitude}-${lastLoc.longitude}`}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                        />
                        {/* Route line */}
                        {locations.length > 1 && (
                          <>
                            <Polyline
                              positions={locations.map(l => [l.latitude, l.longitude] as [number, number])}
                              color="#1d4ed8" weight={8} opacity={0.12}
                            />
                            <Polyline
                              positions={locations.map(l => [l.latitude, l.longitude] as [number, number])}
                              color="#3b82f6" weight={5} opacity={0.9}
                            />
                          </>
                        )}
                        {/* START marker */}
                        {locations.length > 0 && (
                          <Marker
                            position={[locations[0].latitude, locations[0].longitude]}
                            icon={L.divIcon({
                              html: `<div style="background:#10b981;color:white;font-size:10px;font-weight:800;padding:4px 8px;border-radius:6px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);white-space:nowrap;">▶ START</div>`,
                              className: '',
                              iconSize: [60, 26],
                              iconAnchor: [30, 13],
                              popupAnchor: [0, -16],
                            })}
                          >
                            <Popup>Titik Keberangkatan</Popup>
                          </Marker>
                        )}
                        {/* Truck marker */}
                        <Marker
                          position={[lastLoc.latitude, lastLoc.longitude]}
                          icon={makeTruckIcon(locations[locations.length - 1]?.speed ?? 0, selectedTrip.vehicle.platNomor)}
                        >
                          <Popup>
                            <Box sx={{ minWidth: 180, p: 0.5 }}>
                              <Typography fontWeight={800} sx={{ fontFamily: 'monospace', letterSpacing: 1, fontSize: 15 }}>
                                {selectedTrip.vehicle.platNomor}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {selectedTrip.vehicle.merk} {selectedTrip.vehicle.model}
                              </Typography>
                              <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                                <Chip label={`${locations[locations.length-1]?.speed ?? 0} km/h`} size="small" color="primary" sx={{ fontWeight: 700 }} />
                                {selectedTrip.driver?.name && <Chip label={selectedTrip.driver.name} size="small" sx={{ fontWeight: 600 }} />}
                              </Box>
                              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                🎯 {selectedTrip.tujuan}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                📍 {lastLoc.latitude.toFixed(5)}, {lastLoc.longitude.toFixed(5)}
                              </Typography>
                            </Box>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </Box>
                    {/* Share location */}
                    <Box px={3} py={1.5} sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}
                      display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {lastLoc.latitude.toFixed(6)}, {lastLoc.longitude.toFixed(6)}
                      </Typography>
                      <Tooltip title="Salin link lokasi untuk customer">
                        <Chip
                          label="Salin Link Lokasi"
                          size="small"
                          clickable
                          icon={<ContentCopy sx={{ fontSize: 12 }} />}
                          onClick={() => {
                            const url = `https://www.google.com/maps?q=${lastLoc.latitude},${lastLoc.longitude}`;
                            navigator.clipboard.writeText(url);
                          }}
                          sx={{ fontWeight: 600, cursor: 'pointer' }}
                        />
                      </Tooltip>
                    </Box>
                  </Paper>
                )}

                {/* Trip Detail */}
                <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                    <Typography variant="subtitle1" fontWeight={700}>Detail Perjalanan</Typography>
                    <Chip label={selectedTrip?.vehicle.platNomor} sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }} />
                  </Box>
                  <Grid container spacing={2}>
                    {[
                      ['Tujuan', selectedTrip?.tujuan],
                      ['Muatan', selectedTrip?.muatan || '-'],
                      ['Driver', selectedTrip?.driver?.name || '-'],
                      ['Telepon Driver', selectedTrip?.driver?.phone || '-'],
                      ['Waktu Berangkat', selectedTrip?.startTime ? format(new Date(selectedTrip.startTime), 'dd MMM yyyy HH:mm', { locale: idLocale }) : '-'],
                      ['Durasi', selectedTrip?.startTime ? formatDuration(selectedTrip.startTime) : '-'],
                      ['KM Awal', `${selectedTrip?.kmAwal?.toLocaleString()} km`],
                      ['Kendaraan', `${selectedTrip?.vehicle.merk} ${selectedTrip?.vehicle.model} (${selectedTrip?.vehicle.jenis})`],
                    ].map(([k, v]) => (
                      <Grid item xs={12} sm={6} key={k as string}>
                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5} display="block">{k}</Typography>
                          <Typography variant="body2" fontWeight={600} mt={0.5}>{v}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>

                {/* Location History */}
                <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                  <Box px={3} py={2} display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid" sx={{ borderColor: 'divider', bgcolor: '#f8fafc' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>Riwayat Lokasi GPS</Typography>
                      <Typography variant="caption" color="text.secondary">{locations.length} titik lokasi tercatat</Typography>
                    </Box>
                    <Tooltip title="Refresh lokasi">
                      <IconButton size="small" onClick={() => selected && fetchLocations(selected)}>
                        <Refresh fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {locLoading && <LinearProgress />}

                  {locations.length === 0 && !locLoading ? (
                    <Box textAlign="center" py={5}>
                      <LocationOn sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">Belum ada data lokasi GPS</Typography>
                    </Box>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                          {['#', 'Waktu', 'Latitude', 'Longitude', 'Kecepatan', 'Akurasi'].map(h => (
                            <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12, py: 1.5 }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[...locations].reverse().map((loc, idx) => (
                          <TableRow key={loc.id} hover sx={{ '& td': { fontSize: 12 } }}>
                            <TableCell>
                              {idx === 0 ? (
                                <Chip label="TERBARU" size="small" sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 700, fontSize: 9, border: 'none', height: 18 }} />
                              ) : (
                                <Typography variant="caption" color="text.disabled">{locations.length - idx}</Typography>
                              )}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>
                              {format(new Date(loc.timestamp), 'HH:mm:ss', { locale: idLocale })}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>{formatCoord(loc.latitude)}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>{formatCoord(loc.longitude)}</TableCell>
                            <TableCell>
                              {loc.speed != null ? (
                                <Chip label={`${loc.speed} km/h`} size="small"
                                  sx={{ bgcolor: loc.speed > 60 ? '#fee2e2' : '#f0fdf4', color: loc.speed > 60 ? '#991b1b' : '#065f46', fontWeight: 600, fontSize: 10, border: 'none', height: 18 }} />
                              ) : '-'}
                            </TableCell>
                            <TableCell>{loc.accuracy ? `±${loc.accuracy}m` : '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Paper>

                {/* Open in Maps */}
                {lastLoc && (
                  <Alert severity="info" sx={{ borderRadius: 2 }}
                    action={
                      <Chip
                        label="Buka Google Maps"
                        size="small"
                        clickable
                        onClick={() => window.open(`https://www.google.com/maps?q=${lastLoc.latitude},${lastLoc.longitude}`, '_blank')}
                        sx={{ fontWeight: 600, cursor: 'pointer' }}
                      />
                    }
                  >
                    Lokasi terakhir: {formatCoord(lastLoc.latitude)}, {formatCoord(lastLoc.longitude)}
                  </Alert>
                )}
              </Stack>
            )}
          </Grid>
        </Grid>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </Box>
  );
};

export default FleetMonitor;
