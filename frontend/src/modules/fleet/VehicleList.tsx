import { useEffect, useState } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, IconButton, Chip, Grid, Avatar,
  LinearProgress, Tooltip, Stack, InputAdornment, TextField,
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, DirectionsCar,
  LocalGasStation, Build, Route, Refresh, Search,
  CheckCircle, Cancel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { Vehicle, VehicleStats } from '../../types';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const formatCompact = (v: number) => {
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}Jt`;
  if (v >= 1_000) return `Rp ${(v / 1_000).toFixed(0)}K`;
  return formatCurrency(v);
};

const JENIS_COLOR: Record<string, { bg: string; color: string }> = {
  Truk:   { bg: '#dbeafe', color: '#1d4ed8' },
  Pickup: { bg: '#d1fae5', color: '#065f46' },
  Motor:  { bg: '#fef3c7', color: '#92400e' },
  Mobil:  { bg: '#ede9fe', color: '#5b21b6' },
};
const getJenisColor = (jenis: string) => JENIS_COLOR[jenis] || { bg: '#f3f4f6', color: '#374151' };

const VehicleList = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, sRes] = await Promise.all([vehicleService.getAll(), vehicleService.getStats()]);
      setVehicles(vRes.data);
      setStats(sRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus kendaraan ini?')) return;
    try { await vehicleService.delete(id); fetchData(); }
    catch (e) { console.error(e); }
  };

  const filtered = vehicles.filter(v =>
    v.platNomor.toLowerCase().includes(search.toLowerCase()) ||
    v.merk.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Fleet Management</Typography>
          <Typography variant="body2" color="text.secondary">Kelola armada kendaraan operasional</Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} size="small" sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/fleet/new')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Tambah Kendaraan
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={2.5} mb={3}>
          {[
            { label: 'Total Kendaraan', value: stats.totalVehicles, sub: `${stats.activeVehicles} aktif`, icon: <DirectionsCar />, color: '#3b82f6', bg: '#dbeafe' },
            { label: 'Total Perjalanan', value: stats.totalTrips, sub: `${stats.totalKm.toLocaleString()} km`, icon: <Route />, color: '#10b981', bg: '#d1fae5' },
            { label: 'Biaya BBM', value: formatCompact(stats.totalFuelCost), sub: 'total', icon: <LocalGasStation />, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Biaya Service', value: formatCompact(stats.totalMaintenanceCost), sub: 'total', icon: <Build />, color: '#8b5cf6', bg: '#ede9fe' },
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
                    <Typography variant="h5" fontWeight={700} mt={0.5}>{c.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.sub}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: c.bg, width: 44, height: 44 }}>
                    <Box sx={{ color: c.color, display: 'flex' }}>{c.icon}</Box>
                  </Avatar>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Search */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 2 }}>
        <TextField placeholder="Cari plat nomor, merk, atau model..." size="small" value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
          sx={{ minWidth: 300, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Kendaraan', 'Jenis', 'Tahun', 'Kapasitas', 'Status', 'Aksi'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12, py: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <DirectionsCar sx={{ fontSize: 40, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography color="text.secondary">Belum ada kendaraan</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(vehicle => {
                  const jColor = getJenisColor(vehicle.jenis);
                  return (
                    <TableRow key={vehicle.id} hover sx={{ '& td': { fontSize: 13, py: 1.5 } }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ bgcolor: jColor.bg, width: 38, height: 38 }}>
                            <DirectionsCar sx={{ color: jColor.color, fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', letterSpacing: 1 }}>
                              {vehicle.platNomor}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {vehicle.merk} {vehicle.model}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={vehicle.jenis} size="small"
                          sx={{ bgcolor: jColor.bg, color: jColor.color, fontWeight: 600, fontSize: 11, border: 'none' }} />
                      </TableCell>
                      <TableCell>{vehicle.tahun}</TableCell>
                      <TableCell>{vehicle.kapasitas} Ton</TableCell>
                      <TableCell>
                        <Chip
                          icon={vehicle.statusAktif ? <CheckCircle sx={{ fontSize: 14 }} /> : <Cancel sx={{ fontSize: 14 }} />}
                          label={vehicle.statusAktif ? 'Aktif' : 'Nonaktif'}
                          size="small"
                          sx={{
                            bgcolor: vehicle.statusAktif ? '#d1fae5' : '#f3f4f6',
                            color: vehicle.statusAktif ? '#065f46' : '#6b7280',
                            fontWeight: 600, fontSize: 11, border: 'none',
                            '& .MuiChip-icon': { color: vehicle.statusAktif ? '#065f46' : '#6b7280' },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Lihat detail">
                            <IconButton size="small" onClick={() => navigate(`/fleet/${vehicle.id}`)}
                              sx={{ color: 'primary.main', '&:hover': { bgcolor: '#dbeafe' } }}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => navigate(`/fleet/${vehicle.id}/edit`)}
                              sx={{ '&:hover': { bgcolor: '#f0f0f0' } }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus">
                            <IconButton size="small" color="error" onClick={() => handleDelete(vehicle.id)}
                              sx={{ '&:hover': { bgcolor: '#fee2e2' } }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {filtered.length > 0 && (
          <Box px={3} py={1.5} borderTop="1px solid" sx={{ borderColor: 'divider', bgcolor: '#f8fafc' }}>
            <Typography variant="caption" color="text.secondary">
              {filtered.length} kendaraan ditampilkan
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default VehicleList;
