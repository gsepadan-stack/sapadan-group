import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, Chip, Avatar, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Tooltip, LinearProgress, Stack,
  InputAdornment,} from '@mui/material';
import {
  Add, Edit, Visibility, Agriculture,
  Refresh, Close, Phone,
} from '@mui/icons-material';
import { mitraService } from '../../services/mitraService';
import { MitraPetani } from '../../types';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const STATUS_CFG: Record<string, { label: string; color: 'success' | 'info' | 'default'; bg: string; text: string }> = {
  AKTIF:    { label: 'Aktif',    color: 'success', bg: '#d1fae5', text: '#065f46' },
  PANEN:    { label: 'Panen',    color: 'info',    bg: '#dbeafe', text: '#1e40af' },
  NONAKTIF: { label: 'Nonaktif', color: 'default', bg: '#f3f4f6', text: '#6b7280' },
};

const SLOT_COLORS = [
  '#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444',
  '#06b6d4','#84cc16','#f97316','#ec4899','#6366f1',
  '#14b8a6','#a855f7','#fb923c','#22c55e','#e11d48',
  '#0ea5e9','#d97706','#7c3aed','#059669','#dc2626',
];

// ── Form Dialog ──────────────────────────────────────────────────────────────
interface FormState {
  nomorSlot: string;
  name: string;
  phone: string;
  address: string;
  jenisIkan: string;
  luasKolam: string;
}

const emptyForm: FormState = { nomorSlot: '', name: '', phone: '', address: '', jenisIkan: '', luasKolam: '' };

const MitraFormDialog = ({ open, onClose, onSave, editing, usedSlots }: {
  open: boolean; onClose: () => void; onSave: (f: FormState) => Promise<void>;
  editing: MitraPetani | null; usedSlots: number[];
}) => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setForm(editing ? {
        nomorSlot: String(editing.nomorSlot),
        name: editing.name, phone: editing.phone,
        address: editing.address, jenisIkan: editing.jenisIkan,
        luasKolam: String(editing.luasKolam),
      } : emptyForm);
    }
  }, [editing, open]);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Nama petani wajib diisi'); return; }
    if (!form.phone.trim()) { setError('No. telepon wajib diisi'); return; }
    if (!form.nomorSlot) { setError('Nomor slot wajib dipilih'); return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (e: any) { setError(e?.response?.data?.message || 'Gagal menyimpan data'); }
    finally { setSaving(false); }
  };

  const availableSlots = Array.from({ length: 20 }, (_, i) => i + 1)
    .filter(s => !usedSlots.includes(s) || s === Number(form.nomorSlot));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#dbeafe', width: 44, height: 44 }}>
              <Agriculture sx={{ color: '#1d4ed8', fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {editing ? 'Edit Mitra Petani' : 'Tambah Mitra Petani'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editing ? 'Perbarui data mitra' : 'Daftarkan petani baru ke sistem kemitraan'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: '28px !important', pb: 2 }}>
        <Grid container spacing={3}>
          {/* Slot */}
          <Grid item xs={12} sm={4}>
            <TextField
              select label="Nomor Slot" value={form.nomorSlot}
              onChange={set('nomorSlot')} fullWidth
              disabled={!!editing}
              helperText="Pilih slot 1–20"
            >
              <MenuItem value="" disabled><em>Pilih slot</em></MenuItem>
              {availableSlots.map(s => (
                <MenuItem key={s} value={String(s)}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: SLOT_COLORS[s - 1] }} />
                    Slot {s}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Nama */}
          <Grid item xs={12} sm={8}>
            <TextField label="Nama Petani" value={form.name} onChange={set('name')}
              fullWidth placeholder="Masukkan nama lengkap petani"
            />
          </Grid>

          {/* Telepon */}
          <Grid item xs={12} sm={6}>
            <TextField label="No. Telepon" value={form.phone} onChange={set('phone')}
              fullWidth placeholder="08xxxxxxxxxx"
            />
          </Grid>

          {/* Jenis Ikan */}
          <Grid item xs={12} sm={6}>
            <TextField label="Jenis Ikan" value={form.jenisIkan} onChange={set('jenisIkan')}
              fullWidth placeholder="Contoh: Lele, Nila, Gurame"
            />
          </Grid>

          {/* Luas Kolam */}
          <Grid item xs={12} sm={6}>
            <TextField label="Luas Kolam (m²)" value={form.luasKolam} onChange={set('luasKolam')}
              fullWidth type="number" placeholder="0"
              InputProps={{
                endAdornment: <InputAdornment position="end">m²</InputAdornment>,
              }}
            />
          </Grid>

          {/* Status (edit only) */}
          {editing && (
            <Grid item xs={12} sm={6}>
              <TextField select label="Status" value={(form as any).status || 'AKTIF'}
                onChange={e => setForm(f => ({ ...f, status: e.target.value } as any))} fullWidth>
                <MenuItem value="AKTIF">Aktif</MenuItem>
                <MenuItem value="PANEN">Masa Panen</MenuItem>
                <MenuItem value="NONAKTIF">Nonaktif</MenuItem>
              </TextField>
            </Grid>
          )}

          {/* Alamat */}
          <Grid item xs={12}>
            <TextField label="Alamat Lengkap" value={form.address} onChange={set('address')}
              fullWidth multiline rows={3} placeholder="Jl. Contoh No. 1, Desa, Kecamatan, Kota"
            />
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Box sx={{ bgcolor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 2, px: 2, py: 1.5 }}>
                <Typography variant="body2" color="error.main" fontWeight={600}>{error}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider', gap: 1.5 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, textTransform: 'none', color: 'text.secondary' }}>
          Batal
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, minWidth: 120 }}>
          {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Mitra'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const MitraList = () => {
  const navigate = useNavigate();
  const [mitras, setMitras] = useState<MitraPetani[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MitraPetani | null>(null);

  const fetchMitras = async () => {
    setLoading(true);
    try { const r = await mitraService.getAll(); setMitras(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMitras(); }, []);

  const usedSlots = mitras.map(m => m.nomorSlot);

  const handleSave = async (form: FormState) => {
    const payload = { ...form, nomorSlot: Number(form.nomorSlot), luasKolam: Number(form.luasKolam) };
    if (editing) await mitraService.update(editing.id, payload);
    else await mitraService.create(payload);
    fetchMitras();
  };

  const aktif = mitras.filter(m => m.status === 'AKTIF').length;
  const panen = mitras.filter(m => m.status === 'PANEN').length;
  const slotTerisi = mitras.length;

  const slots = Array.from({ length: 20 }, (_, i) => {
    const slot = i + 1;
    return { slot, mitra: mitras.find(m => m.nomorSlot === slot) || null };
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Mitra Petani</Typography>
          <Typography variant="body2" color="text.secondary">Manajemen kemitraan plasma perikanan · {slotTerisi}/20 slot terisi</Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <Tooltip title="Refresh data">
            <IconButton onClick={fetchMitras} size="small"
              sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />}
            onClick={() => { setEditing(null); setDialogOpen(true); }}
            disabled={slotTerisi >= 20}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Tambah Mitra
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Slot Terisi', value: `${slotTerisi}/20`, color: '#3b82f6', bg: '#dbeafe', bar: (slotTerisi / 20) * 100 },
          { label: 'Aktif', value: aktif, color: '#10b981', bg: '#d1fae5', bar: aktif > 0 ? (aktif / slotTerisi) * 100 : 0 },
          { label: 'Masa Panen', value: panen, color: '#f59e0b', bg: '#fef3c7', bar: panen > 0 ? (panen / slotTerisi) * 100 : 0 },
          { label: 'Slot Kosong', value: 20 - slotTerisi, color: '#6b7280', bg: '#f3f4f6', bar: ((20 - slotTerisi) / 20) * 100 },
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
                  <Typography variant="h4" fontWeight={700} mt={0.5}>{c.value}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: c.bg, width: 40, height: 40 }}>
                  <Agriculture sx={{ color: c.color, fontSize: 20 }} />
                </Avatar>
              </Box>
              <LinearProgress variant="determinate" value={c.bar}
                sx={{ mt: 1.5, height: 4, borderRadius: 2, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: c.color, borderRadius: 2 } }} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* 20 Slot Grid */}
      <Grid container spacing={2}>
        {slots.map(({ slot, mitra }) => {
          const color = SLOT_COLORS[slot - 1];

          if (!mitra) {
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={slot}>
                <Paper elevation={0}
                  onClick={() => { setEditing(null); setDialogOpen(true); }}
                  sx={{
                    p: 2.5, border: '2px dashed', borderColor: '#e2e8f0', borderRadius: 3,
                    cursor: 'pointer', minHeight: 148,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5,
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: color, bgcolor: color + '08', transform: 'translateY(-1px)' },
                  }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Add sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </Box>
                  <Typography variant="caption" color="text.disabled" fontWeight={700} letterSpacing={1}>
                    SLOT {slot}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">Kosong</Typography>
                </Paper>
              </Grid>
            );
          }

          const cfg = STATUS_CFG[mitra.status] || STATUS_CFG.AKTIF;
          const totalPakan = mitra.transaksiPakan?.reduce((s, t) => s + t.totalHarga, 0) || 0;
          const totalBibit = mitra.transaksiPibit?.reduce((s, t) => s + t.totalHarga, 0) || 0;
          const totalPinjaman = mitra.transaksiPinjaman?.filter(t => !t.lunas).reduce((s, t) => s + t.jumlah, 0) || 0;
          const totalHutang = totalPakan + totalBibit + totalPinjaman;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={slot}>
              <Paper elevation={0} sx={{
                border: '1px solid', borderColor: 'divider', borderRadius: 3,
                borderTop: `3px solid ${color}`, overflow: 'hidden',
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' },
              }}>
                {/* Card Header */}
                <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ bgcolor: color + '20', color, width: 38, height: 38, fontSize: 13, fontWeight: 700 }}>
                        {slot}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700} lineHeight={1.3}>{mitra.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{mitra.jenisIkan}</Typography>
                      </Box>
                    </Box>
                    <Chip label={cfg.label} size="small"
                      sx={{ bgcolor: cfg.bg, color: cfg.text, fontWeight: 700, fontSize: 10, border: 'none', height: 20 }} />
                  </Box>
                </Box>

                {/* Hutang Info */}
                <Box sx={{ mx: 2.5, mb: 1.5, p: 1.5, bgcolor: totalHutang > 0 ? '#fff7ed' : '#f0fdf4', borderRadius: 2, border: '1px solid', borderColor: totalHutang > 0 ? '#fed7aa' : '#bbf7d0' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Total Hutang</Typography>
                    <Typography variant="caption" fontWeight={800} color={totalHutang > 0 ? '#c2410c' : '#15803d'}>
                      {totalHutang > 0 ? formatCurrency(totalHutang) : '✓ Lunas'}
                    </Typography>
                  </Box>
                  {totalHutang > 0 && (
                    <Stack direction="row" spacing={0.5} mt={0.75} flexWrap="wrap" useFlexGap>
                      {totalPakan > 0 && <Chip label={`Pakan ${(totalPakan/1000).toFixed(0)}K`} size="small" sx={{ fontSize: 9, height: 16, bgcolor: '#fef3c7', color: '#92400e', border: 'none' }} />}
                      {totalBibit > 0 && <Chip label={`Bibit ${(totalBibit/1000).toFixed(0)}K`} size="small" sx={{ fontSize: 9, height: 16, bgcolor: '#dbeafe', color: '#1e40af', border: 'none' }} />}
                      {totalPinjaman > 0 && <Chip label={`Pinjaman ${(totalPinjaman/1000).toFixed(0)}K`} size="small" sx={{ fontSize: 9, height: 16, bgcolor: '#fee2e2', color: '#991b1b', border: 'none' }} />}
                    </Stack>
                  )}
                </Box>

                {/* Phone */}
                <Box sx={{ px: 2.5, pb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                    <Phone sx={{ fontSize: 12 }} />{mitra.phone}
                  </Typography>
                </Box>

                {/* Actions */}
                <Box sx={{ px: 2, pb: 2, display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" startIcon={<Visibility />}
                    onClick={() => navigate(`/mitra/${mitra.id}`)}
                    sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontSize: 12, fontWeight: 600, py: 0.75 }}>
                    Detail
                  </Button>
                  <Tooltip title="Edit mitra">
                    <IconButton size="small" onClick={() => { setEditing(mitra); setDialogOpen(true); }}
                      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, '&:hover': { bgcolor: '#dbeafe' } }}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <MitraFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        editing={editing}
        usedSlots={usedSlots}
      />
    </Box>
  );
};

export default MitraList;
