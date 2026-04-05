import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Paper, TextField, Typography, Grid,
  MenuItem, Switch, FormControlLabel, Avatar, Stack,
  Chip, IconButton, Divider, Alert,
} from '@mui/material';
import {
  Save, ArrowBack, DirectionsCar, Info,
  LocalShipping, Speed,
} from '@mui/icons-material';
import { vehicleService } from '../../services/vehicleService';

const JENIS_OPTIONS = [
  { value: 'Truk', label: 'Truk', desc: 'Kendaraan angkut besar' },
  { value: 'Pickup', label: 'Pickup', desc: 'Kendaraan angkut ringan' },
  { value: 'Van', label: 'Van', desc: 'Kendaraan tertutup' },
  { value: 'Mobil Box', label: 'Mobil Box', desc: 'Kendaraan box tertutup' },
  { value: 'Motor', label: 'Motor', desc: 'Kendaraan roda dua' },
];

const MERK_SUGGESTIONS = ['Mitsubishi', 'Isuzu', 'Toyota', 'Hino', 'Daihatsu', 'Suzuki', 'Honda', 'Yamaha'];

const SectionHeader = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) => (
  <Box display="flex" alignItems="center" gap={1.5} mb={3}>
    <Avatar sx={{ bgcolor: '#dbeafe', width: 38, height: 38 }}>
      <Box sx={{ color: '#2563eb', display: 'flex' }}>{icon}</Box>
    </Avatar>
    <Box>
      <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Box>
  </Box>
);

const VehicleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    platNomor: '',
    merk: '',
    model: '',
    tahun: new Date().getFullYear(),
    jenis: 'Truk',
    kapasitas: 0,
    statusAktif: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && id) fetchVehicle(id);
  }, [id, isEdit]);

  const fetchVehicle = async (vehicleId: string) => {
    try {
      const r = await vehicleService.getById(vehicleId);
      const v = r.data;
      setForm({ platNomor: v.platNomor, merk: v.merk, model: v.model, tahun: v.tahun, jenis: v.jenis, kapasitas: v.kapasitas, statusAktif: v.statusAktif });
    } catch (e) { console.error(e); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : ['tahun', 'kapasitas'].includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.platNomor.trim()) { setError('Plat nomor wajib diisi'); return; }
    if (!form.merk.trim()) { setError('Merk wajib diisi'); return; }
    if (!form.model.trim()) { setError('Model wajib diisi'); return; }
    setLoading(true);
    setError('');
    try {
      if (isEdit && id) await vehicleService.update(id, form);
      else await vehicleService.create(form);
      navigate('/fleet');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Gagal menyimpan data kendaraan');
    } finally {
      setLoading(false);
    }
  };

  const selectedJenis = JENIS_OPTIONS.find(j => j.value === form.jenis);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/fleet')}
          sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Avatar sx={{ bgcolor: '#dbeafe', width: 44, height: 44 }}>
          <DirectionsCar sx={{ color: '#1d4ed8' }} />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700}>
            {isEdit ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEdit ? 'Perbarui data kendaraan' : 'Daftarkan kendaraan operasional baru'}
          </Typography>
        </Box>
        {isEdit && (
          <Chip label="Mode Edit" color="warning" size="small" sx={{ fontWeight: 700 }} />
        )}
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
            {/* Identitas Kendaraan */}
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
              <SectionHeader icon={<Info />} title="Identitas Kendaraan" subtitle="Informasi dasar kendaraan" />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Plat Nomor" name="platNomor" value={form.platNomor}
                    onChange={handleChange} fullWidth required
                    placeholder="B 1234 ABC"
                    inputProps={{ style: { fontFamily: 'monospace', letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase' } }}
                    helperText="Format: B 1234 ABC"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select label="Jenis Kendaraan" name="jenis" value={form.jenis}
                    onChange={handleChange} fullWidth required
                  >
                    {JENIS_OPTIONS.map(j => (
                      <MenuItem key={j.value} value={j.value}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{j.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{j.desc}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Merk" name="merk" value={form.merk}
                    onChange={handleChange} fullWidth required
                    placeholder="Mitsubishi, Isuzu, Toyota..."
                    helperText="Pilih atau ketik merk kendaraan"
                  />
                  <Box display="flex" gap={0.75} flexWrap="wrap" mt={1}>
                    {MERK_SUGGESTIONS.map(m => (
                      <Chip key={m} label={m} size="small" clickable
                        variant={form.merk === m ? 'filled' : 'outlined'}
                        color={form.merk === m ? 'primary' : 'default'}
                        onClick={() => setForm(f => ({ ...f, merk: m }))}
                        sx={{ fontSize: 11 }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Model" name="model" value={form.model}
                    onChange={handleChange} fullWidth required
                    placeholder="Colt Diesel, Elf, Dyna..."
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Spesifikasi */}
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <SectionHeader icon={<Speed />} title="Spesifikasi" subtitle="Detail teknis kendaraan" />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tahun Pembuatan" name="tahun" type="number" value={form.tahun}
                    onChange={handleChange} fullWidth required
                    inputProps={{ min: 1990, max: new Date().getFullYear() + 1 }}
                    helperText={`Tahun 1990 – ${new Date().getFullYear() + 1}`}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Kapasitas Muatan" name="kapasitas" type="number" value={form.kapasitas}
                    onChange={handleChange} fullWidth required
                    inputProps={{ min: 0, step: 0.5 }}
                    InputProps={{ endAdornment: <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', pr: 1 }}>Ton</Typography> }}
                    helperText="Kapasitas maksimal muatan"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
              {/* Preview */}
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
                <SectionHeader icon={<LocalShipping />} title="Preview" />
                <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2.5, mb: 2 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: '#dbeafe', width: 48, height: 48 }}>
                      <DirectionsCar sx={{ color: '#1d4ed8', fontSize: 26 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={800} sx={{ fontFamily: 'monospace', letterSpacing: 2 }}>
                        {form.platNomor || 'B 0000 XXX'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {form.merk || 'Merk'} {form.model || 'Model'}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    {[
                      ['Jenis', selectedJenis?.label || '-'],
                      ['Tahun', form.tahun],
                      ['Kapasitas', `${form.kapasitas} Ton`],
                    ].map(([k, v]) => (
                      <Box key={k as string} display="flex" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">{k}</Typography>
                        <Typography variant="caption" fontWeight={600}>{v}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* Status Toggle */}
                <Box sx={{ p: 2, border: '1px solid', borderColor: form.statusAktif ? '#bbf7d0' : '#e5e7eb', borderRadius: 2, bgcolor: form.statusAktif ? '#f0fdf4' : '#f9fafb' }}>
                  <FormControlLabel
                    control={
                      <Switch checked={form.statusAktif} onChange={handleChange} name="statusAktif"
                        color="success" />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {form.statusAktif ? 'Kendaraan Aktif' : 'Kendaraan Nonaktif'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {form.statusAktif ? 'Siap digunakan untuk operasional' : 'Tidak tersedia untuk operasional'}
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, alignItems: 'flex-start', gap: 1 }}
                  />
                </Box>
              </Paper>

              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
              )}

              {/* Actions */}
              <Stack spacing={1.5}>
                <Button type="submit" variant="contained" size="large" fullWidth
                  startIcon={<Save />} disabled={loading}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, py: 1.5 }}>
                  {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Kendaraan'}
                </Button>
                <Button variant="outlined" size="large" fullWidth onClick={() => navigate('/fleet')}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                  Batal
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default VehicleForm;
