import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Paper, Typography, Grid, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Avatar, Stack, Divider, LinearProgress, Alert,
  IconButton,
} from '@mui/material';
import {
  ArrowBack, Edit, DirectionsCar, LocalGasStation,
  Build, Route, CheckCircle, Schedule,
} from '@mui/icons-material';
import { vehicleService } from '../../services/vehicleService';
import { Vehicle } from '../../types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" py={1.5}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight={600} textAlign="right">{value}</Typography>
  </Box>
);

const EmptyState = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <Box textAlign="center" py={6}>
    <Box sx={{ color: 'text.disabled', mb: 1 }}>{icon}</Box>
    <Typography variant="body2" color="text.secondary">{text}</Typography>
  </Box>
);

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) fetchVehicle(id); }, [id]);

  const fetchVehicle = async (vehicleId: string) => {
    setLoading(true);
    try {
      const r = await vehicleService.getById(vehicleId);
      setVehicle(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return <Box p={3}><LinearProgress /></Box>;
  if (!vehicle) return <Box p={3}><Alert severity="error">Kendaraan tidak ditemukan</Alert></Box>;

  const totalFuel = vehicle.fuelLogs?.reduce((s, f) => s + f.totalBiaya, 0) || 0;
  const totalMaintenance = vehicle.maintenances?.reduce((s, m) => s + m.biaya, 0) || 0;
  const totalTrips = vehicle.tripLogs?.length || 0;
  const totalKm = vehicle.tripLogs?.reduce((s, t) => s + t.totalKm, 0) || 0;

  const TABS = [
    { label: 'Informasi', icon: <DirectionsCar sx={{ fontSize: 16 }} /> },
    { label: `Perjalanan (${totalTrips})`, icon: <Route sx={{ fontSize: 16 }} /> },
    { label: `Maintenance (${vehicle.maintenances?.length || 0})`, icon: <Build sx={{ fontSize: 16 }} /> },
    { label: `BBM (${vehicle.fuelLogs?.length || 0})`, icon: <LocalGasStation sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
        <IconButton onClick={() => navigate('/fleet')}
          sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Avatar sx={{ bgcolor: '#dbeafe', width: 48, height: 48 }}>
          <DirectionsCar sx={{ color: '#1d4ed8', fontSize: 26 }} />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'monospace', letterSpacing: 2 }}>
            {vehicle.platNomor}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {vehicle.merk} {vehicle.model} · {vehicle.tahun} · {vehicle.jenis}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            label={vehicle.statusAktif ? 'Aktif' : 'Nonaktif'}
            color={vehicle.statusAktif ? 'success' : 'default'}
            sx={{ fontWeight: 700 }}
          />
          <Button variant="contained" startIcon={<Edit />}
            onClick={() => navigate(`/fleet/${vehicle.id}/edit`)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Edit
          </Button>
        </Stack>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Perjalanan', value: totalTrips, sub: `${totalKm.toLocaleString()} km`, icon: <Route />, color: '#10b981', bg: '#d1fae5' },
          { label: 'Biaya BBM', value: formatCurrency(totalFuel), sub: `${vehicle.fuelLogs?.length || 0} pengisian`, icon: <LocalGasStation />, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Biaya Service', value: formatCurrency(totalMaintenance), sub: `${vehicle.maintenances?.length || 0} servis`, icon: <Build />, color: '#8b5cf6', bg: '#ede9fe' },
          { label: 'Kapasitas', value: `${vehicle.kapasitas} Ton`, sub: vehicle.jenis, icon: <DirectionsCar />, color: '#3b82f6', bg: '#dbeafe' },
        ].map(c => (
          <Grid item xs={6} md={3} key={c.label}>
            <Paper elevation={0} sx={{
              p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3,
              position: 'relative', overflow: 'hidden',
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: c.color },
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    {c.label}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} mt={0.5}>{c.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{c.sub}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: c.bg, width: 40, height: 40 }}>
                  <Box sx={{ color: c.color, display: 'flex' }}>{c.icon}</Box>
                </Avatar>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc', px: 1, minHeight: 48 }}>
          {TABS.map((t, i) => (
            <Tab key={i} label={t.label} icon={t.icon} iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: 13, minHeight: 48 }} />
          ))}
        </Tabs>

        <Box p={3}>
          {/* Tab 0: Info */}
          {tab === 0 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>Data Kendaraan</Typography>
                <Stack divider={<Divider />}>
                  <InfoRow label="Plat Nomor" value={<Typography fontFamily="monospace" fontWeight={700} letterSpacing={1}>{vehicle.platNomor}</Typography>} />
                  <InfoRow label="Merk" value={vehicle.merk} />
                  <InfoRow label="Model" value={vehicle.model} />
                  <InfoRow label="Tahun" value={vehicle.tahun} />
                  <InfoRow label="Jenis" value={vehicle.jenis} />
                  <InfoRow label="Kapasitas" value={`${vehicle.kapasitas} Ton`} />
                  <InfoRow label="Status" value={
                    <Chip label={vehicle.statusAktif ? 'Aktif' : 'Nonaktif'}
                      size="small" color={vehicle.statusAktif ? 'success' : 'default'}
                      sx={{ fontWeight: 700 }} />
                  } />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>Ringkasan Operasional</Typography>
                <Stack divider={<Divider />}>
                  <InfoRow label="Total Perjalanan" value={`${totalTrips} trip`} />
                  <InfoRow label="Total Jarak" value={`${totalKm.toLocaleString()} km`} />
                  <InfoRow label="Total Biaya BBM" value={formatCurrency(totalFuel)} />
                  <InfoRow label="Total Biaya Service" value={formatCurrency(totalMaintenance)} />
                  <InfoRow label="Total Biaya Operasional" value={
                    <Typography fontWeight={800} color="error.main">{formatCurrency(totalFuel + totalMaintenance)}</Typography>
                  } />
                </Stack>
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Trips */}
          {tab === 1 && (
            <Box>
              {!vehicle.tripLogs?.length ? (
                <EmptyState icon={<Route sx={{ fontSize: 40 }} />} text="Belum ada riwayat perjalanan" />
              ) : (
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        {['Tanggal', 'Tujuan', 'Muatan', 'Driver', 'Total KM', 'Status'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12, py: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vehicle.tripLogs.map(trip => (
                        <TableRow key={trip.id} hover sx={{ '& td': { fontSize: 13 } }}>
                          <TableCell>{format(new Date(trip.tanggal), 'dd MMM yyyy', { locale: idLocale })}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{trip.tujuan}</TableCell>
                          <TableCell>{trip.muatan || '-'}</TableCell>
                          <TableCell>{trip.driver?.name || '-'}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{trip.totalKm} km</TableCell>
                          <TableCell>
                            <Chip
                              icon={trip.status === 'COMPLETED' || trip.status === 'DELIVERED' ? <CheckCircle sx={{ fontSize: 12 }} /> : <Schedule sx={{ fontSize: 12 }} />}
                              label={trip.status === 'DELIVERED' ? 'Terkirim ✓' : trip.status === 'COMPLETED' ? 'Selesai' : 'Berjalan'}
                              size="small"
                              sx={{
                                bgcolor: trip.status === 'DELIVERED' ? '#d1fae5' : trip.status === 'COMPLETED' ? '#dbeafe' : '#fef3c7',
                                color: trip.status === 'DELIVERED' ? '#065f46' : trip.status === 'COMPLETED' ? '#1e40af' : '#92400e',
                                fontWeight: 600, fontSize: 10, border: 'none',
                                '& .MuiChip-icon': { color: 'inherit' },
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>
          )}

          {/* Tab 2: Maintenance */}
          {tab === 2 && (
            <Box>
              {!vehicle.maintenances?.length ? (
                <EmptyState icon={<Build sx={{ fontSize: 40 }} />} text="Belum ada riwayat maintenance" />
              ) : (
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        {['Tanggal', 'Jenis', 'Deskripsi', 'Bengkel', 'KM', 'Biaya'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12, py: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}
                            align={['KM', 'Biaya'].includes(h) ? 'right' : 'left'}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vehicle.maintenances.map(m => (
                        <TableRow key={m.id} hover sx={{ '& td': { fontSize: 13 } }}>
                          <TableCell>{format(new Date(m.tanggal), 'dd MMM yyyy', { locale: idLocale })}</TableCell>
                          <TableCell>
                            <Chip label={m.jenis} size="small" sx={{ bgcolor: '#ede9fe', color: '#5b21b6', fontWeight: 600, fontSize: 10, border: 'none' }} />
                          </TableCell>
                          <TableCell>{m.deskripsi || '-'}</TableCell>
                          <TableCell>{m.bengkel || '-'}</TableCell>
                          <TableCell align="right">{m.kilometer.toLocaleString()} km</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#8b5cf6' }}>{formatCurrency(m.biaya)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>
          )}

          {/* Tab 3: BBM */}
          {tab === 3 && (
            <Box>
              {!vehicle.fuelLogs?.length ? (
                <EmptyState icon={<LocalGasStation sx={{ fontSize: 40 }} />} text="Belum ada riwayat pengisian BBM" />
              ) : (
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        {['Tanggal', 'Liter', 'Harga/Liter', 'Total', 'KM', 'Lokasi'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12, py: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}
                            align={['Liter', 'Harga/Liter', 'Total', 'KM'].includes(h) ? 'right' : 'left'}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vehicle.fuelLogs.map(f => (
                        <TableRow key={f.id} hover sx={{ '& td': { fontSize: 13 } }}>
                          <TableCell>{format(new Date(f.tanggal), 'dd MMM yyyy', { locale: idLocale })}</TableCell>
                          <TableCell align="right">{f.jumlahLiter} L</TableCell>
                          <TableCell align="right">{formatCurrency(f.hargaPerLiter)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(f.totalBiaya)}</TableCell>
                          <TableCell align="right">{f.kilometer.toLocaleString()} km</TableCell>
                          <TableCell>{f.lokasiPengisian || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default VehicleDetail;
