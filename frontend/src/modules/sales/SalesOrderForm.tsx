import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Grid,
  Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Autocomplete, Chip, Divider, Avatar,
  Alert, Stack, InputAdornment,
} from '@mui/material';
import {
  Add, Delete, ArrowBack, Save, Person,
  ShoppingCart, CalendarMonth, Notes, Receipt,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createOrder, fetchProducts, fetchCustomers } from './salesSlice';
import { OrderItem } from '../../types';

const orderSchema = z.object({
  customerName: z.string().min(1, 'Nama pelanggan wajib diisi'),
  customerPhone: z.string().min(1, 'No. telepon wajib diisi'),
  customerAddress: z.string().min(1, 'Alamat wajib diisi'),
  orderDate: z.string(),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const SectionHeader = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) => (
  <Box display="flex" alignItems="center" gap={1.5} mb={3}>
    <Avatar sx={{ bgcolor: '#dbeafe', width: 36, height: 36 }}>
      <Box sx={{ color: '#2563eb', display: 'flex', fontSize: 18 }}>{icon}</Box>
    </Avatar>
    <Box>
      <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Box>
  </Box>
);

const SalesOrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { products, customers } = useAppSelector((state) => state.sales);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState<number | ''>('');
  const [itemError, setItemError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { orderDate: new Date().toISOString().split('T')[0] },
  });

  const customerName = watch('customerName');

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleAddItem = () => {
    if (!selectedProduct) { setItemError('Pilih produk terlebih dahulu'); return; }
    if (!quantity || Number(quantity) <= 0) { setItemError('Jumlah harus lebih dari 0'); return; }
    setItemError('');

    const qty = Number(quantity);
    const existing = items.find(i => i.productId === selectedProduct.id);
    if (existing) {
      setItems(items.map(i => i.productId === selectedProduct.id
        ? { ...i, quantity: i.quantity + qty, subtotal: (i.quantity + qty) * i.pricePerKg }
        : i
      ));
    } else {
      setItems([...items, {
        id: Date.now().toString(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: qty,
        pricePerKg: selectedProduct.hargaPerKg,
        subtotal: qty * selectedProduct.hargaPerKg,
      }]);
    }
    setSelectedProduct(null);
    setQuantity('');
  };

  const handleRemoveItem = (itemId: string) => setItems(items.filter(i => i.id !== itemId));

  const totalAmount = items.reduce((s, i) => s + i.subtotal, 0);
  const totalKg = items.reduce((s, i) => s + i.quantity, 0);

  const onSubmit = async (data: OrderFormData) => {
    if (items.length === 0) { setItemError('Tambahkan minimal 1 produk'); return; }
    setSubmitting(true);
    try {
      await dispatch(createOrder({ ...data, items, totalAmount, status: 'PENDING' as any }));
      navigate('/sales/orders');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/sales/orders')}
          sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700}>{id ? 'Edit Pesanan' : 'Pesanan Baru'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {id ? 'Perbarui data pesanan' : 'Buat pesanan penjualan ikan baru'}
          </Typography>
        </Box>
        <Chip label="PENDING" size="small" color="warning" sx={{ fontWeight: 700 }} />
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
            {/* Customer Info */}
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
              <SectionHeader icon={<Person />} title="Data Pelanggan" subtitle="Informasi pembeli" />
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <Controller name="customerName" control={control} render={({ field }) => (
                    <Autocomplete
                      freeSolo
                      options={customers.map(c => c.name)}
                      value={field.value || ''}
                      onChange={(_, value) => {
                        field.onChange(value || '');
                        const cust = customers.find(c => c.name === value);
                        if (cust) {
                          setValue('customerPhone', cust.phone);
                          setValue('customerAddress', cust.address);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Nama Pelanggan" error={!!errors.customerName}
                          helperText={errors.customerName?.message}
                          InputProps={{ ...params.InputProps, startAdornment: <><Person sx={{ color: 'text.disabled', mr: 1, fontSize: 18 }} />{params.InputProps.startAdornment}</> }}
                        />
                      )}
                    />
                  )} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="customerPhone" control={control} render={({ field }) => (
                    <TextField {...field} label="No. Telepon" fullWidth error={!!errors.customerPhone}
                      helperText={errors.customerPhone?.message}
                      InputProps={{ startAdornment: <InputAdornment position="start"><Typography variant="body2" color="text.secondary">+62</Typography></InputAdornment> }}
                    />
                  )} />
                </Grid>
                <Grid item xs={12}>
                  <Controller name="customerAddress" control={control} render={({ field }) => (
                    <TextField {...field} label="Alamat Pengiriman" fullWidth multiline rows={2}
                      error={!!errors.customerAddress} helperText={errors.customerAddress?.message} />
                  )} />
                </Grid>
              </Grid>
            </Paper>

            {/* Products */}
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
              <SectionHeader icon={<ShoppingCart />} title="Produk Pesanan" subtitle="Tambahkan item yang dipesan" />

              {/* Add item row */}
              <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed', borderColor: 'divider', mb: 2.5 }}>
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={12} sm={5}>
                    <Autocomplete
                      options={products}
                      getOptionLabel={(o) => `${o.name} (${o.jenis})`}
                      value={selectedProduct}
                      onChange={(_, v) => { setSelectedProduct(v); setItemError(''); }}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{option.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.jenis} · Stok: {option.stokKg} Kg · {formatCurrency(option.hargaPerKg)}/Kg
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      renderInput={(params) => <TextField {...params} label="Pilih Produk" size="small" />}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField label="Jumlah (Kg)" type="number" size="small" fullWidth
                      value={quantity}
                      onChange={(e) => { setQuantity(e.target.value === '' ? '' : Number(e.target.value)); setItemError(''); }}
                      inputProps={{ min: 0.1, step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField label="Harga/Kg" size="small" fullWidth disabled
                      value={selectedProduct ? formatCurrency(selectedProduct.hargaPerKg) : '-'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button variant="contained" fullWidth startIcon={<Add />} onClick={handleAddItem}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                      Tambah
                    </Button>
                  </Grid>
                </Grid>
                {itemError && <Alert severity="error" sx={{ mt: 1.5, py: 0.5 }}>{itemError}</Alert>}
              </Box>

              {/* Items table */}
              {items.length === 0 ? (
                <Box textAlign="center" py={4} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <ShoppingCart sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary" variant="body2">Belum ada produk ditambahkan</Typography>
                </Box>
              ) : (
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        {['Produk', 'Jumlah (Kg)', 'Harga/Kg', 'Subtotal', ''].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12, py: 1.5 }}
                            align={h === 'Produk' || h === '' ? 'left' : 'right'}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, idx) => (
                        <TableRow key={item.id} sx={{ '& td': { fontSize: 13 }, bgcolor: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{item.productName}</Typography>
                          </TableCell>
                          <TableCell align="right">{item.quantity.toFixed(1)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.pricePerKg)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(item.subtotal)}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" color="error" onClick={() => handleRemoveItem(item.id)}
                              sx={{ '&:hover': { bgcolor: '#fee2e2' } }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>

            {/* Notes */}
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <SectionHeader icon={<Notes />} title="Catatan" subtitle="Instruksi khusus (opsional)" />
              <Controller name="notes" control={control} render={({ field }) => (
                <TextField {...field} fullWidth multiline rows={3} placeholder="Contoh: Kirim pagi hari, ikan harus segar..." />
              )} />
            </Paper>
          </Grid>

          {/* Right Column — Summary */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
              {/* Order Date */}
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
                <SectionHeader icon={<CalendarMonth />} title="Jadwal" />
                <Stack spacing={2.5}>
                  <Controller name="orderDate" control={control} render={({ field }) => (
                    <TextField {...field} label="Tanggal Order" type="date" fullWidth size="small"
                      InputLabelProps={{ shrink: true }} />
                  )} />
                  <Controller name="deliveryDate" control={control} render={({ field }) => (
                    <TextField {...field} label="Tanggal Pengiriman" type="date" fullWidth size="small"
                      InputLabelProps={{ shrink: true }} />
                  )} />
                </Stack>
              </Paper>

              {/* Order Summary */}
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
                <SectionHeader icon={<Receipt />} title="Ringkasan Order" />
                <Stack spacing={1.5}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Total Item</Typography>
                    <Typography variant="body2" fontWeight={600}>{items.length} produk</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Total Berat</Typography>
                    <Typography variant="body2" fontWeight={600}>{totalKg.toFixed(1)} Kg</Typography>
                  </Box>
                  {customerName && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Pelanggan</Typography>
                      <Typography variant="body2" fontWeight={600}>{customerName}</Typography>
                    </Box>
                  )}
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" fontWeight={700}>Total Pembayaran</Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main">
                      {formatCurrency(totalAmount)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Actions */}
              <Stack spacing={1.5}>
                <Button type="submit" variant="contained" size="large" fullWidth
                  startIcon={<Save />} disabled={submitting}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, py: 1.5 }}>
                  {submitting ? 'Menyimpan...' : 'Simpan Pesanan'}
                </Button>
                <Button variant="outlined" size="large" fullWidth onClick={() => navigate('/sales/orders')}
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

export default SalesOrderForm;
