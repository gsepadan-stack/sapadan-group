import { useEffect, useState } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Chip, Avatar,
  InputAdornment, Tooltip, Stack, LinearProgress,
} from '@mui/material';
import {
  Add, Edit, Delete, Search, Inventory2,
  TrendingUp, Warning, Refresh, Close,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProducts } from './salesSlice';
import { salesService } from '../../services/salesService';
import { Product } from '../../types';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const FISH_COLORS: Record<string, { bg: string; color: string }> = {
  Lele:   { bg: '#dbeafe', color: '#1d4ed8' },
  Nila:   { bg: '#d1fae5', color: '#065f46' },
  Gurame: { bg: '#fef3c7', color: '#92400e' },
  Mas:    { bg: '#ede9fe', color: '#5b21b6' },
  Patin:  { bg: '#fee2e2', color: '#991b1b' },
};

const getColor = (jenis: string) =>
  FISH_COLORS[jenis] || { bg: '#f0f0f0', color: '#374151' };

const getStockStatus = (stok: number) => {
  if (stok > 100) return { label: 'Tersedia', color: 'success' as const };
  if (stok > 20)  return { label: 'Terbatas', color: 'warning' as const };
  return { label: 'Habis', color: 'error' as const };
};

const ProductList = () => {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.sales);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

  const handleOpen = (product?: Product) => {
    setEditingProduct(product || null);
    reset(product || { name: '', jenis: '', hargaPerKg: '', stokKg: '', deskripsi: '' });
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditingProduct(null); reset({}); };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const payload = { ...data, hargaPerKg: Number(data.hargaPerKg), stokKg: Number(data.stokKg) };
      if (editingProduct) {
        await salesService.updateProduct(editingProduct.id, payload);
      } else {
        await salesService.createProduct(payload);
      }
      dispatch(fetchProducts());
      handleClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      await salesService.deleteProduct(product.id);
      dispatch(fetchProducts());
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.jenis.toLowerCase().includes(search.toLowerCase())
  );

  const totalStok = products.reduce((s, p) => s + p.stokKg, 0);
  const totalValue = products.reduce((s, p) => s + p.stokKg * p.hargaPerKg, 0);
  const lowStock = products.filter(p => p.stokKg <= 20).length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Produk Ikan</Typography>
          <Typography variant="body2" color="text.secondary">Kelola katalog produk dan stok</Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <Tooltip title="Refresh">
            <IconButton onClick={() => dispatch(fetchProducts())} size="small"
              sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Tambah Produk
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Produk', value: products.length, icon: <Inventory2 />, color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Total Stok', value: `${totalStok.toFixed(0)} Kg`, icon: <TrendingUp />, color: '#10b981', bg: '#d1fae5' },
          { label: 'Nilai Stok', value: totalValue >= 1_000_000 ? `Rp ${(totalValue/1_000_000).toFixed(1)}Jt` : formatCurrency(totalValue), icon: <TrendingUp />, color: '#8b5cf6', bg: '#ede9fe' },
          { label: 'Stok Menipis', value: lowStock, icon: <Warning />, color: '#ef4444', bg: '#fee2e2' },
        ].map((c) => (
          <Grid item xs={6} md={3} key={c.label}>
            <Paper elevation={0} sx={{
              p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3,
              position: 'relative', overflow: 'hidden',
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: c.color },
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    {c.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} mt={0.5}>{c.value}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: c.bg, width: 44, height: 44 }}>
                  <Box sx={{ color: c.color, display: 'flex' }}>{c.icon}</Box>
                </Avatar>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 2 }}>
        <TextField
          placeholder="Cari produk atau jenis ikan..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}><Close fontSize="small" /></IconButton>
              </InputAdornment>
            ) : null,
          }}
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
                {['Produk', 'Jenis', 'Harga/Kg', 'Stok (Kg)', 'Nilai Stok', 'Status', 'Aksi'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12, py: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}
                    align={['Harga/Kg', 'Stok (Kg)', 'Nilai Stok'].includes(h) ? 'right' : 'left'}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Inventory2 sx={{ fontSize: 40, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography color="text.secondary">
                      {search ? 'Produk tidak ditemukan' : 'Belum ada produk'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product) => {
                  const { bg, color } = getColor(product.jenis);
                  const stockStatus = getStockStatus(product.stokKg);
                  const stockPct = Math.min((product.stokKg / 500) * 100, 100);
                  return (
                    <TableRow key={product.id} hover sx={{ '& td': { fontSize: 13, py: 1.5 } }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ bgcolor: bg, width: 36, height: 36, fontSize: 14, fontWeight: 700, color }}>
                            {product.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{product.name}</Typography>
                            {product.deskripsi && (
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                                {product.deskripsi}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={product.jenis} size="small"
                          sx={{ bgcolor: bg, color, fontWeight: 600, fontSize: 11, border: 'none' }} />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatCurrency(product.hargaPerKg)}
                      </TableCell>
                      <TableCell align="right">
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{product.stokKg.toFixed(1)}</Typography>
                          <LinearProgress variant="determinate" value={stockPct}
                            color={stockStatus.color}
                            sx={{ height: 4, borderRadius: 2, mt: 0.5, width: 60, ml: 'auto' }} />
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: '#059669' }}>
                        {formatCurrency(product.stokKg * product.hargaPerKg)}
                      </TableCell>
                      <TableCell>
                        <Chip label={stockStatus.label} size="small" color={stockStatus.color}
                          sx={{ fontWeight: 600, fontSize: 11 }} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit produk">
                            <IconButton size="small" onClick={() => handleOpen(product)}
                              sx={{ color: 'primary.main', '&:hover': { bgcolor: '#dbeafe' } }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus produk">
                            <IconButton size="small" color="error" onClick={() => setDeleteConfirm(product)}
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
              {filtered.length} produk ditampilkan
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {editingProduct ? 'Perbarui informasi produk' : 'Isi detail produk ikan'}
                </Typography>
              </Box>
              <IconButton size="small" onClick={handleClose}><Close fontSize="small" /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Controller name="name" control={control} defaultValue=""
                  rules={{ required: 'Nama wajib diisi' }}
                  render={({ field }) => (
                    <TextField {...field} label="Nama Produk" fullWidth size="small"
                      error={!!errors.name} helperText={errors.name?.message as string} />
                  )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="jenis" control={control} defaultValue=""
                  rules={{ required: 'Jenis wajib diisi' }}
                  render={({ field }) => (
                    <TextField {...field} label="Jenis Ikan" fullWidth size="small"
                      placeholder="Lele, Nila, Gurame..."
                      error={!!errors.jenis} helperText={errors.jenis?.message as string} />
                  )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="hargaPerKg" control={control} defaultValue=""
                  rules={{ required: 'Harga wajib diisi', min: { value: 1, message: 'Harga harus > 0' } }}
                  render={({ field }) => (
                    <TextField {...field} label="Harga per Kg (Rp)" type="number" fullWidth size="small"
                      InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
                      error={!!errors.hargaPerKg} helperText={errors.hargaPerKg?.message as string} />
                  )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="stokKg" control={control} defaultValue=""
                  rules={{ required: 'Stok wajib diisi', min: { value: 0, message: 'Stok tidak boleh negatif' } }}
                  render={({ field }) => (
                    <TextField {...field} label="Stok (Kg)" type="number" fullWidth size="small"
                      InputProps={{ endAdornment: <InputAdornment position="end">Kg</InputAdornment> }}
                      error={!!errors.stokKg} helperText={errors.stokKg?.message as string} />
                  )} />
              </Grid>
              <Grid item xs={12}>
                <Controller name="deskripsi" control={control} defaultValue=""
                  render={({ field }) => (
                    <TextField {...field} label="Deskripsi (opsional)" fullWidth multiline rows={2} size="small"
                      placeholder="Keterangan tambahan tentang produk..." />
                  )} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={handleClose} sx={{ borderRadius: 2, textTransform: 'none' }}>Batal</Button>
            <Button type="submit" variant="contained" disabled={saving}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, minWidth: 100 }}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 400 } }}>
        <DialogTitle>
          <Typography fontWeight={700}>Hapus Produk?</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Produk <strong>{deleteConfirm?.name}</strong> akan dihapus permanen dan tidak bisa dikembalikan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ borderRadius: 2, textTransform: 'none' }}>Batal</Button>
          <Button variant="contained" color="error" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductList;
