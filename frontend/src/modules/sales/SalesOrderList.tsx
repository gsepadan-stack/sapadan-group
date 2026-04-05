import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Typography, MenuItem,
  TextField, InputAdornment, Avatar, Stack, Grid, Tooltip,
  Menu, ListItemIcon, ListItemText,
} from '@mui/material';
import {
  Add, Edit, Search, FilterList, MoreVert,
  ShoppingCart, HourglassEmpty, LocalShipping,
  CheckCircle, Receipt, Refresh,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchOrders, updateOrderStatus } from './salesSlice';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; color: any; icon: React.ReactNode; bg: string; text: string }> = {
  PENDING:  { label: 'Pending',  color: 'warning', icon: <HourglassEmpty sx={{ fontSize: 14 }} />, bg: '#fef3c7', text: '#d97706' },
  DIPROSES: { label: 'Diproses', color: 'info',    icon: <Receipt sx={{ fontSize: 14 }} />,        bg: '#dbeafe', text: '#2563eb' },
  DIKIRIM:  { label: 'Dikirim',  color: 'primary', icon: <LocalShipping sx={{ fontSize: 14 }} />,  bg: '#ede9fe', text: '#7c3aed' },
  SELESAI:  { label: 'Selesai',  color: 'success', icon: <CheckCircle sx={{ fontSize: 14 }} />,    bg: '#d1fae5', text: '#059669' },
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const formatCompact = (v: number) => {
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}Jt`;
  if (v >= 1_000) return `Rp ${(v / 1_000).toFixed(0)}K`;
  return formatCurrency(v);
};

const SalesOrderList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state) => state.sales);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchOrders(undefined)); }, [dispatch]);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
    setMenuAnchor(null);
  };

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchSearch = !search ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Summary counts
  const counts = {
    ALL: orders.length,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    DIPROSES: orders.filter(o => o.status === 'DIPROSES').length,
    DIKIRIM: orders.filter(o => o.status === 'DIKIRIM').length,
    SELESAI: orders.filter(o => o.status === 'SELESAI').length,
  };

  const totalRevenue = orders.filter(o => o.status === 'SELESAI').reduce((s, o) => s + o.totalAmount, 0);
  const pendingRevenue = orders.filter(o => o.status === 'PENDING').reduce((s, o) => s + o.totalAmount, 0);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Pemesanan Ikan</Typography>
          <Typography variant="body2" color="text.secondary">Kelola semua order penjualan</Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <Tooltip title="Refresh">
            <IconButton onClick={() => dispatch(fetchOrders(undefined))} size="small"
              sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/sales/orders/new')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Tambah Pesanan
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Order', value: counts.ALL, icon: <ShoppingCart />, color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Pending', value: counts.PENDING, icon: <HourglassEmpty />, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Dalam Proses', value: counts.DIPROSES + counts.DIKIRIM, icon: <LocalShipping />, color: '#8b5cf6', bg: '#ede9fe' },
          { label: 'Selesai', value: counts.SELESAI, icon: <CheckCircle />, color: '#10b981', bg: '#d1fae5' },
          { label: 'Revenue', value: formatCompact(totalRevenue), icon: <Receipt />, color: '#10b981', bg: '#d1fae5' },
          { label: 'Pending Value', value: formatCompact(pendingRevenue), icon: <HourglassEmpty />, color: '#f59e0b', bg: '#fef3c7' },
        ].map((c) => (
          <Grid item xs={6} sm={4} md={2} key={c.label}>
            <Paper elevation={0} sx={{
              p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, textAlign: 'center',
              cursor: 'default', transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
            }}>
              <Avatar sx={{ bgcolor: c.bg, width: 36, height: 36, mx: 'auto', mb: 1 }}>
                <Box sx={{ color: c.color, display: 'flex', fontSize: 18 }}>{c.icon}</Box>
              </Avatar>
              <Typography variant="h6" fontWeight={700} lineHeight={1}>{c.value}</Typography>
              <Typography variant="caption" color="text.secondary">{c.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder="Cari order atau pelanggan..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
            sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Box display="flex" gap={1} flexWrap="wrap">
            <FilterList sx={{ color: 'text.secondary', alignSelf: 'center' }} fontSize="small" />
            {['ALL', 'PENDING', 'DIPROSES', 'DIKIRIM', 'SELESAI'].map((s) => {
              const cfg = s === 'ALL' ? null : STATUS_CONFIG[s];
              const active = statusFilter === s;
              return (
                <Chip
                  key={s}
                  label={`${s === 'ALL' ? 'Semua' : cfg?.label} (${counts[s as keyof typeof counts]})`}
                  onClick={() => setStatusFilter(s)}
                  size="small"
                  sx={{
                    fontWeight: 600, fontSize: 12, cursor: 'pointer',
                    bgcolor: active ? (cfg?.bg || '#e0e7ff') : 'transparent',
                    color: active ? (cfg?.text || '#3b82f6') : 'text.secondary',
                    border: '1px solid',
                    borderColor: active ? (cfg?.text || '#3b82f6') : 'divider',
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['No. Order', 'Pelanggan', 'Tanggal Order', 'Pengiriman', 'Total', 'Status', 'Aksi'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12, py: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}>
                        <Box sx={{ height: 16, bgcolor: '#f0f0f0', borderRadius: 1, width: j === 1 ? '80%' : '60%' }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <ShoppingCart sx={{ fontSize: 40, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography color="text.secondary">Tidak ada order ditemukan</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                  return (
                    <TableRow key={order.id} hover sx={{ '& td': { fontSize: 13, py: 1.5 } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                          {order.orderNumber || `#${order.id.slice(0, 8).toUpperCase()}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#dbeafe', color: '#2563eb', fontSize: 13, fontWeight: 700 }}>
                            {order.customerName?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{order.customerName}</Typography>
                            <Typography variant="caption" color="text.secondary">{order.customerPhone}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(order.orderDate), 'dd MMM yyyy', { locale: idLocale })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {order.deliveryDate ? (
                          <Typography variant="body2">
                            {format(new Date(order.deliveryDate), 'dd MMM yyyy', { locale: idLocale })}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.disabled">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>{formatCurrency(order.totalAmount)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={cfg.icon as any}
                          label={cfg.label}
                          size="small"
                          sx={{
                            bgcolor: cfg.bg, color: cfg.text, fontWeight: 600, fontSize: 11,
                            border: 'none', '& .MuiChip-icon': { color: cfg.text },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit order">
                            <IconButton size="small" onClick={() => navigate(`/sales/orders/${order.id}/edit`)}
                              sx={{ color: 'primary.main', '&:hover': { bgcolor: '#dbeafe' } }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ubah status">
                            <IconButton size="small"
                              onClick={(e) => { setMenuAnchor(e.currentTarget); setSelectedOrder(order.id); }}
                              sx={{ '&:hover': { bgcolor: '#f0f0f0' } }}>
                              <MoreVert fontSize="small" />
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
              Menampilkan {filtered.length} dari {orders.length} order
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Status change menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 160 } }}>
        <Box px={2} py={1}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
            Ubah Status
          </Typography>
        </Box>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <MenuItem key={key} onClick={() => selectedOrder && handleStatusChange(selectedOrder, key)}
            sx={{ gap: 1.5, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 0, color: cfg.text }}>{cfg.icon}</ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}>{cfg.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default SalesOrderList;
