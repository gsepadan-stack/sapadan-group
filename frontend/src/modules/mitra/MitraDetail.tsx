import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, Chip, Avatar, Button, Tab, Tabs,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Stack, Divider, Alert, Tooltip, LinearProgress, InputAdornment,
} from '@mui/material';
import {
  ArrowBack, Agriculture, Grass, AccountBalance, Waves,
  Add, Delete, CheckCircle, Close, Phone, Home, WaterDrop,
} from '@mui/icons-material';
import { mitraService } from '../../services/mitraService';
import { MitraPetani, MitraSummary } from '../../types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const today = () => new Date().toISOString().split('T')[0];

// ── Add Dialog ───────────────────────────────────────────────────────────────
interface FieldDef { name: string; label: string; type?: string; sm?: number; multiline?: boolean; rows?: number; end?: string; }

const AddDialog = ({ open, onClose, onSave, title, fields, icon }: {
  open: boolean; onClose: () => void; onSave: (f: any) => Promise<void>;
  title: string; fields: FieldDef[]; icon?: React.ReactNode;
}) => {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setError(''); setForm({ tanggal: today() }); }
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (e: any) { setError(e?.response?.data?.message || 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            {icon && <Avatar sx={{ bgcolor: '#dbeafe', width: 40, height: 40 }}>{icon}</Avatar>}
            <Typography variant="h6" fontWeight={700}>{title}</Typography>
          </Box>
          <IconButton onClick={onClose}><Close /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: '24px !important', pb: 2, overflow: 'visible' }}>
        <Grid container spacing={3}>
          {fields.map(f => (
            <Grid item xs={12} sm={f.sm || 12} key={f.name}>
              <TextField label={f.label} type={f.type || 'text'} value={form[f.name] || ''} fullWidth
                multiline={f.multiline} rows={f.rows}
                InputLabelProps={f.type === 'date' ? { shrink: true } : undefined}
                InputProps={f.end ? { endAdornment: <InputAdornment position="end"><Typography variant="body2">{f.end}</Typography></InputAdornment> } : undefined}
                onChange={e => setForm((p: any) => ({ ...p, [f.name]: e.target.value }))}
              />
            </Grid>
          ))}
          {error && (
            <Grid item xs={12}>
              <Box sx={{ bgcolor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 2, px: 2, py: 1 }}>
                <Typography variant="caption" color="error.main" fontWeight={600}>{error}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider', gap: 1.5 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, textTransform: 'none' }}>Batal</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, minWidth: 120 }}>
          {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, color, sub, bg }: { label: string; value: string; color: string; sub?: string; bg: string }) => (
  <Paper elevation={0} sx={{
    p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, textAlign: 'center',
    position: 'relative', overflow: 'hidden',
    '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: color },
  }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5} display="block">{label}</Typography>
    <Typography variant="h6" fontWeight={800} mt={0.5} color={color}>{value}</Typography>
    {sub && <Chip label={sub} size="small" sx={{ mt: 0.5, fontSize: 10, height: 18, bgcolor: bg, color, border: 'none', fontWeight: 700 }} />}
  </Paper>
);

// ── Reusable Table ────────────────────────────────────────────────────────────
const TransaksiTable = ({ rows, columns, renderRow, onDelete }: {
  rows: any[]; columns: string[]; renderRow: (r: any) => React.ReactNode[]; onDelete: (id: string) => void;
}) => (
  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
    <Table size="small">
      <TableHead>
        <TableRow sx={{ bgcolor: '#f8fafc' }}>
          {[...columns, ''].map((h, i) => (
            <TableCell key={i} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12, py: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}>{h}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 5, color: 'text.secondary' }}>
              <Typography variant="body2">Belum ada data</Typography>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row: any) => (
            <TableRow key={row.id} hover sx={{ '& td': { fontSize: 13 } }}>
              {renderRow(row).map((cell, i) => <TableCell key={i}>{cell}</TableCell>)}
              <TableCell align="right">
                <IconButton size="small" color="error" onClick={() => onDelete(row.id)}
                  sx={{ '&:hover': { bgcolor: '#fee2e2' } }}>
                  <Delete fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </Box>
);

// ── Main ─────────────────────────────────────────────────────────────────────
const MitraDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mitra, setMitra] = useState<MitraPetani | null>(null);
  const [summary, setSummary] = useState<MitraSummary | null>(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [m, s] = await Promise.all([mitraService.getById(id), mitraService.getSummary(id)]);
      setMitra(m.data); setSummary(s.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [id]);

  if (loading) return <Box p={3}><LinearProgress /></Box>;
  if (!mitra) return <Box p={3}><Alert severity="error">Mitra tidak ditemukan</Alert></Box>;

  const handleDelete = async (type: string, tid: string) => {
    if (!window.confirm('Hapus transaksi ini?')) return;
    if (type === 'pakan') await mitraService.deletePakan(id!, tid);
    else if (type === 'bibit') await mitraService.deleteBibit(id!, tid);
    else if (type === 'pinjaman') await mitraService.deletePinjaman(id!, tid);
    fetchAll();
  };

  const STATUS_COLOR: Record<string, string> = { AKTIF: '#10b981', PANEN: '#3b82f6', NONAKTIF: '#6b7280' };
  const sColor = STATUS_COLOR[mitra.status] || '#6b7280';

  const TABS = [
    { label: 'Ringkasan', icon: <Agriculture sx={{ fontSize: 16 }} /> },
    { label: 'Pakan', icon: <Grass sx={{ fontSize: 16 }} /> },
    { label: 'Bibit', icon: <Waves sx={{ fontSize: 16 }} /> },
    { label: 'Pinjaman', icon: <AccountBalance sx={{ fontSize: 16 }} /> },
    { label: 'Panen', icon: <CheckCircle sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
        <IconButton onClick={() => navigate('/mitra')}
          sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Avatar sx={{ bgcolor: sColor + '20', color: sColor, fontWeight: 700, width: 48, height: 48, fontSize: 16 }}>
          {mitra.nomorSlot}
        </Avatar>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700}>{mitra.name}</Typography>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
              <WaterDrop sx={{ fontSize: 14 }} />{mitra.jenisIkan}
            </Typography>
            <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
              <Phone sx={{ fontSize: 14 }} />{mitra.phone}
            </Typography>
            <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
              <Home sx={{ fontSize: 14 }} />{mitra.address}
            </Typography>
          </Stack>
        </Box>
        <Chip label={mitra.status} size="small"
          sx={{ bgcolor: sColor + '20', color: sColor, fontWeight: 700, border: 'none' }} />
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={4} md={2}>
            <SummaryCard label="Biaya Pakan" value={formatCurrency(summary.totalPakan)} color="#f59e0b" bg="#fef3c7" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <SummaryCard label="Biaya Bibit" value={formatCurrency(summary.totalBibit)} color="#3b82f6" bg="#dbeafe" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <SummaryCard label="Pinjaman" value={formatCurrency(summary.totalPinjaman)} color="#ef4444" bg="#fee2e2" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <SummaryCard label="Total Hutang" value={formatCurrency(summary.totalHutang)} color="#dc2626" bg="#fee2e2" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <SummaryCard label="Total Panen" value={formatCurrency(summary.totalPanen)} color="#10b981" bg="#d1fae5" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <SummaryCard label="Saldo Bersih" value={formatCurrency(summary.saldoBersih)}
              color={summary.saldoBersih >= 0 ? '#059669' : '#dc2626'}
              bg={summary.saldoBersih >= 0 ? '#d1fae5' : '#fee2e2'}
              sub={summary.saldoBersih >= 0 ? 'Untung' : 'Rugi'} />
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc', px: 1, minHeight: 48 }}>
          {TABS.map((t, i) => (
            <Tab key={i} label={t.label} icon={t.icon} iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: 13, minHeight: 48, gap: 0.5 }} />
          ))}
        </Tabs>

        <Box p={3}>
          {/* Ringkasan */}
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Typography variant="subtitle2" fontWeight={700} mb={2}>Informasi Petani</Typography>
                <Stack spacing={0} divider={<Divider />}>
                  {[
                    ['Nama', mitra.name],
                    ['No. Telepon', mitra.phone],
                    ['Jenis Ikan', mitra.jenisIkan],
                    ['Luas Kolam', `${mitra.luasKolam} m²`],
                    ['Status', mitra.status],
                    ['Alamat', mitra.address],
                  ].map(([k, v]) => (
                    <Box key={k} display="flex" justifyContent="space-between" py={1.5}>
                      <Typography variant="body2" color="text.secondary">{k}</Typography>
                      <Typography variant="body2" fontWeight={600} textAlign="right" maxWidth="60%">{v}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={12} md={7}>
                <Typography variant="subtitle2" fontWeight={700} mb={2}>Riwayat Panen</Typography>
                {mitra.transaksiPanen && mitra.transaksiPanen.length > 0 ? (
                  mitra.transaksiPanen.slice(0, 5).map(p => (
                    <Paper key={p.id} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 1.5, borderLeft: `3px solid ${p.saldoBersih >= 0 ? '#10b981' : '#ef4444'}` }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" fontWeight={600}>{format(new Date(p.tanggal), 'dd MMM yyyy', { locale: idLocale })}</Typography>
                        <Chip label={p.saldoBersih >= 0 ? 'Untung' : 'Rugi'} size="small"
                          color={p.saldoBersih >= 0 ? 'success' : 'error'} sx={{ fontWeight: 700, fontSize: 10 }} />
                      </Box>
                      <Grid container spacing={1}>
                        {[
                          ['Hasil Panen', formatCurrency(p.totalHasilPanen), '#10b981'],
                          ['Total Hutang', formatCurrency(p.totalHutang), '#ef4444'],
                          ['Saldo Bersih', formatCurrency(p.saldoBersih), p.saldoBersih >= 0 ? '#059669' : '#dc2626'],
                        ].map(([label, val, color]) => (
                          <Grid item xs={4} key={label as string}>
                            <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                            <Typography variant="caption" fontWeight={700} color={color as string}>{val}</Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  ))
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                    <Agriculture sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Belum ada riwayat panen</Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}

          {/* Pakan */}
          {tab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>Transaksi Pakan</Typography>
                  <Typography variant="caption" color="text.secondary">Pakan yang diberikan ke petani</Typography>
                </Box>
                <Button size="small" variant="contained" startIcon={<Add />} onClick={() => setDialog('pakan')}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Tambah</Button>
              </Box>
              <TransaksiTable
                rows={mitra.transaksiPakan || []}
                columns={['Tanggal', 'Jenis Pakan', 'Jumlah', 'Harga/Kg', 'Total']}
                renderRow={(t: any) => [
                  format(new Date(t.tanggal), 'dd MMM yyyy', { locale: idLocale }),
                  t.jenisPakan,
                  `${t.jumlahKg} Kg`,
                  formatCurrency(t.hargaPerKg),
                  <Typography fontWeight={700} color="#f59e0b">{formatCurrency(t.totalHarga)}</Typography>,
                ]}
                onDelete={(tid) => handleDelete('pakan', tid)}
              />
            </Box>
          )}

          {/* Bibit */}
          {tab === 2 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>Transaksi Bibit</Typography>
                  <Typography variant="caption" color="text.secondary">Bibit ikan yang diberikan ke petani</Typography>
                </Box>
                <Button size="small" variant="contained" startIcon={<Add />} onClick={() => setDialog('bibit')}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Tambah</Button>
              </Box>
              <TransaksiTable
                rows={mitra.transaksiPibit || []}
                columns={['Tanggal', 'Jenis Ikan', 'Jumlah', 'Harga/Ekor', 'Total']}
                renderRow={(t: any) => [
                  format(new Date(t.tanggal), 'dd MMM yyyy', { locale: idLocale }),
                  t.jenisIkan,
                  `${t.jumlahEkor} ekor`,
                  formatCurrency(t.hargaPerEkor),
                  <Typography fontWeight={700} color="#3b82f6">{formatCurrency(t.totalHarga)}</Typography>,
                ]}
                onDelete={(tid) => handleDelete('bibit', tid)}
              />
            </Box>
          )}

          {/* Pinjaman */}
          {tab === 3 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>Transaksi Pinjaman</Typography>
                  <Typography variant="caption" color="text.secondary">Pinjaman uang ke petani</Typography>
                </Box>
                <Button size="small" variant="contained" startIcon={<Add />} onClick={() => setDialog('pinjaman')}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Tambah</Button>
              </Box>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      {['Tanggal', 'Keterangan', 'Jumlah', 'Status', 'Aksi'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12, py: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(mitra.transaksiPinjaman || []).length === 0 ? (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>Belum ada pinjaman</TableCell></TableRow>
                    ) : (
                      (mitra.transaksiPinjaman || []).map((t: any) => (
                        <TableRow key={t.id} hover sx={{ '& td': { fontSize: 13 } }}>
                          <TableCell>{format(new Date(t.tanggal), 'dd MMM yyyy', { locale: idLocale })}</TableCell>
                          <TableCell>{t.keterangan}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#ef4444' }}>{formatCurrency(t.jumlah)}</TableCell>
                          <TableCell>
                            <Chip label={t.lunas ? 'Lunas' : 'Belum Lunas'} size="small"
                              color={t.lunas ? 'success' : 'warning'} sx={{ fontWeight: 600, fontSize: 10 }} />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              {!t.lunas && (
                                <Tooltip title="Tandai Lunas">
                                  <IconButton size="small" color="success"
                                    onClick={() => mitraService.lunasPinjaman(id!, t.id).then(fetchAll)}
                                    sx={{ '&:hover': { bgcolor: '#d1fae5' } }}>
                                    <CheckCircle fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <IconButton size="small" color="error" onClick={() => handleDelete('pinjaman', t.id)}
                                sx={{ '&:hover': { bgcolor: '#fee2e2' } }}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          )}

          {/* Panen */}
          {tab === 4 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>Catat Panen</Typography>
                  <Typography variant="caption" color="text.secondary">Hutang otomatis dipotong dari hasil panen</Typography>
                </Box>
                <Button size="small" variant="contained" color="success" startIcon={<Agriculture />} onClick={() => setDialog('panen')}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Catat Panen</Button>
              </Box>
              {summary && summary.totalHutang > 0 && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  Total hutang saat ini: <strong>{formatCurrency(summary.totalHutang)}</strong> — akan dipotong otomatis saat panen dicatat
                </Alert>
              )}
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      {['Tanggal', 'Jumlah (Kg)', 'Harga/Kg', 'Hasil Panen', 'Total Hutang', 'Saldo Bersih'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12, py: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(mitra.transaksiPanen || []).length === 0 ? (
                      <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>Belum ada panen</TableCell></TableRow>
                    ) : (
                      (mitra.transaksiPanen || []).map((t: any) => (
                        <TableRow key={t.id} hover sx={{ '& td': { fontSize: 13 } }}>
                          <TableCell>{format(new Date(t.tanggal), 'dd MMM yyyy', { locale: idLocale })}</TableCell>
                          <TableCell>{t.jumlahKg} Kg</TableCell>
                          <TableCell>{formatCurrency(t.hargaPerKg)}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#10b981' }}>{formatCurrency(t.totalHasilPanen)}</TableCell>
                          <TableCell sx={{ color: '#ef4444' }}>{formatCurrency(t.totalHutang)}</TableCell>
                          <TableCell>
                            <Typography fontWeight={800} color={t.saldoBersih >= 0 ? '#059669' : '#dc2626'}>
                              {formatCurrency(t.saldoBersih)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Dialogs */}
      <AddDialog open={dialog === 'pakan'} onClose={() => setDialog(null)} title="Tambah Transaksi Pakan"
        icon={<Grass sx={{ color: '#1d4ed8', fontSize: 20 }} />}
        onSave={(form) => mitraService.addPakan(id!, form).then(fetchAll)}
        fields={[
          { name: 'tanggal', label: 'Tanggal', type: 'date', sm: 6 },
          { name: 'jenisPakan', label: 'Jenis Pakan', sm: 6 },
          { name: 'jumlahKg', label: 'Jumlah', type: 'number', sm: 6, end: 'Kg' },
          { name: 'hargaPerKg', label: 'Harga per Kg', type: 'number', sm: 6, end: 'Rp' },
          { name: 'catatan', label: 'Catatan (opsional)', multiline: true, rows: 2 },
        ]}
      />
      <AddDialog open={dialog === 'bibit'} onClose={() => setDialog(null)} title="Tambah Transaksi Bibit"
        icon={<Waves sx={{ color: '#1d4ed8', fontSize: 20 }} />}
        onSave={(form) => mitraService.addBibit(id!, form).then(fetchAll)}
        fields={[
          { name: 'tanggal', label: 'Tanggal', type: 'date', sm: 6 },
          { name: 'jenisIkan', label: 'Jenis Ikan', sm: 6 },
          { name: 'jumlahEkor', label: 'Jumlah', type: 'number', sm: 6, end: 'Ekor' },
          { name: 'hargaPerEkor', label: 'Harga per Ekor', type: 'number', sm: 6, end: 'Rp' },
          { name: 'catatan', label: 'Catatan (opsional)', multiline: true, rows: 2 },
        ]}
      />
      <AddDialog open={dialog === 'pinjaman'} onClose={() => setDialog(null)} title="Tambah Pinjaman"
        icon={<AccountBalance sx={{ color: '#1d4ed8', fontSize: 20 }} />}
        onSave={(form) => mitraService.addPinjaman(id!, form).then(fetchAll)}
        fields={[
          { name: 'tanggal', label: 'Tanggal', type: 'date', sm: 6 },
          { name: 'jumlah', label: 'Jumlah Pinjaman', type: 'number', sm: 6, end: 'Rp' },
          { name: 'keterangan', label: 'Keterangan' },
        ]}
      />
      <AddDialog open={dialog === 'panen'} onClose={() => setDialog(null)} title="Catat Panen"
        icon={<Agriculture sx={{ color: '#1d4ed8', fontSize: 20 }} />}
        onSave={(form) => mitraService.addPanen(id!, form).then(fetchAll)}
        fields={[
          { name: 'tanggal', label: 'Tanggal Panen', type: 'date', sm: 6 },
          { name: 'jumlahKg', label: 'Jumlah Panen', type: 'number', sm: 6, end: 'Kg' },
          { name: 'hargaPerKg', label: 'Harga Beli per Kg', type: 'number', sm: 6, end: 'Rp' },
          { name: 'catatan', label: 'Catatan (opsional)', multiline: true, rows: 2 },
        ]}
      />
    </Box>
  );
};

export default MitraDetail;
