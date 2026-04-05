import { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, ToggleButton, ToggleButtonGroup,
  Chip, Avatar, Table, TableBody, TableCell, TableHead, TableRow,
  LinearProgress, Divider, Stack, Button, Popover,
} from '@mui/material';
import {
  TrendingUp, ShoppingCart, AttachMoney, HourglassEmpty,
  ArrowUpward, ArrowDownward, Inventory, CalendarMonth, Close,
} from '@mui/icons-material';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/id';
import api from '../../services/api';

type Period = 'daily' | 'weekly' | 'monthly' | 'custom';

interface PeriodStats {
  totalPenjualan: number;
  totalProfit: number;
  totalOrder: number;
  pendingOrder: number;
}

interface DashboardData {
  period: Period;
  periodStats: PeriodStats;
  allTime: PeriodStats;
  mortalitasRate: number;
  biayaPakan: number;
  chartData: { label: string; penjualan: number; profit: number; order: number }[];
  recentOrders: any[];
  topProducts: any[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const formatCompact = (value: number) => {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}Jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}K`;
  return formatCurrency(value);
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: number;
}

const StatCard = ({ title, value, subtitle, icon, color, bgColor, trend }: StatCardProps) => (
  <Paper elevation={0} sx={{
    p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%',
    position: 'relative', overflow: 'hidden',
    '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: color, borderRadius: '12px 12px 0 0' },
  }}>
    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
      <Box flex={1}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700} mt={0.5}>{value}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary" mt={0.5} display="block">{subtitle}</Typography>}
        {trend !== undefined && (
          <Box display="flex" alignItems="center" gap={0.5} mt={1}>
            {trend >= 0 ? <ArrowUpward sx={{ fontSize: 14, color: 'success.main' }} /> : <ArrowDownward sx={{ fontSize: 14, color: 'error.main' }} />}
            <Typography variant="caption" color={trend >= 0 ? 'success.main' : 'error.main'} fontWeight={600}>
              {Math.abs(trend)}% vs periode lalu
            </Typography>
          </Box>
        )}
      </Box>
      <Avatar sx={{ bgcolor: bgColor, width: 52, height: 52 }}>
        <Box sx={{ color }}>{icon}</Box>
      </Avatar>
    </Box>
  </Paper>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, minWidth: 180 }}>
      <Typography variant="caption" fontWeight={700} color="text.secondary">{label}</Typography>
      {payload.map((entry: any) => (
        <Box key={entry.name} display="flex" justifyContent="space-between" gap={2} mt={0.5}>
          <Typography variant="caption" sx={{ color: entry.color }}>{entry.name}</Typography>
          <Typography variant="caption" fontWeight={600}>
            {entry.name === 'order' ? entry.value : formatCompact(entry.value)}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

const DashboardPage = () => {
  const [period, setPeriod] = useState<Period>('monthly');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Date range state
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [tempStart, setTempStart] = useState<Dayjs | null>(dayjs().startOf('month'));
  const [tempEnd, setTempEnd] = useState<Dayjs | null>(dayjs());

  useEffect(() => {
    if (period !== 'custom') {
      fetchData(period);
    }
  }, [period]);

  const fetchData = async (p: Period, sd?: Dayjs | null, ed?: Dayjs | null) => {
    setLoading(true);
    try {
      let url = `/dashboard/stats?period=${p}`;
      if (p === 'custom' && sd && ed) {
        url += `&startDate=${sd.format('YYYY-MM-DD')}&endDate=${ed.format('YYYY-MM-DD')}`;
      }
      const res = await api.get(url);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (_: any, v: Period) => {
    if (!v) return;
    if (v === 'custom') {
      setAnchorEl(null);
    }
    setPeriod(v);
  };

  const handleOpenDatePicker = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setAnchorEl(e.currentTarget);
  };

  const handleApplyDate = () => {
    setStartDate(tempStart);
    setEndDate(tempEnd);
    setPeriod('custom');
    setAnchorEl(null);
    fetchData('custom', tempStart, tempEnd);
  };

  const handleClearCustom = () => {
    setPeriod('monthly');
    setStartDate(dayjs().startOf('month'));
    setEndDate(dayjs());
  };

  const ps = data?.periodStats;

  const getPeriodLabel = () => {
    if (period === 'custom' && startDate && endDate) {
      return `${startDate.format('D MMM YYYY')} – ${endDate.format('D MMM YYYY')}`;
    }
    const labels: Record<string, string> = { daily: 'Hari Ini', weekly: 'Minggu Ini', monthly: 'Bulan Ini', custom: 'Custom' };
    return labels[period] || '';
  };

  const getChartSubtitle = () => {
    if (period === 'custom') return `${startDate?.format('D MMM')} – ${endDate?.format('D MMM YYYY')}`;
    return { daily: '7 hari terakhir', weekly: '4 minggu terakhir', monthly: '6 bulan terakhir' }[period] || '';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>

        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">Sapadan Fishery Management System</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            {/* Quick period toggle */}
            <ToggleButtonGroup
              value={period !== 'custom' ? period : null}
              exclusive
              onChange={handlePeriodChange}
              size="small"
              sx={{
                bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: 2,
                '& .MuiToggleButton-root': {
                  border: 'none', px: 2, py: 0.75, fontWeight: 600, fontSize: 13,
                  '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } },
                },
              }}
            >
              <ToggleButton value="daily">Harian</ToggleButton>
              <ToggleButton value="weekly">Mingguan</ToggleButton>
              <ToggleButton value="monthly">Bulanan</ToggleButton>
            </ToggleButtonGroup>

            {/* Custom date range button */}
            <Button
              variant={period === 'custom' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<CalendarMonth />}
              onClick={handleOpenDatePicker}
              sx={{ borderRadius: 2, fontWeight: 600, fontSize: 13, textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              {period === 'custom'
                ? `${startDate?.format('D MMM')} – ${endDate?.format('D MMM YY')}`
                : 'Pilih Tanggal'}
            </Button>

            {period === 'custom' && (
              <Button size="small" color="error" onClick={handleClearCustom} sx={{ minWidth: 0, p: 0.5 }}>
                <Close fontSize="small" />
              </Button>
            )}
          </Box>
        </Box>

        {/* Date Range Popover */}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { p: 3, borderRadius: 3, mt: 1, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}
        >
          <Typography variant="subtitle2" fontWeight={700} mb={2}>Pilih Rentang Tanggal</Typography>
          <Stack spacing={2}>
            <DatePicker
              label="Tanggal Mulai"
              value={tempStart}
              onChange={(v) => setTempStart(v)}
              maxDate={tempEnd || dayjs()}
              slotProps={{ textField: { size: 'small', sx: { width: 200 } } }}
            />
            <DatePicker
              label="Tanggal Selesai"
              value={tempEnd}
              onChange={(v) => setTempEnd(v)}
              minDate={tempStart || undefined}
              maxDate={dayjs()}
              slotProps={{ textField: { size: 'small', sx: { width: 200 } } }}
            />

            {/* Quick presets */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>Preset Cepat</Typography>
              <Box display="flex" flexWrap="wrap" gap={0.75}>
                {[
                  { label: '7 Hari', days: 7 },
                  { label: '30 Hari', days: 30 },
                  { label: '90 Hari', days: 90 },
                  { label: 'Bulan Ini', start: dayjs().startOf('month'), end: dayjs() },
                  { label: 'Bulan Lalu', start: dayjs().subtract(1, 'month').startOf('month'), end: dayjs().subtract(1, 'month').endOf('month') },
                  { label: 'Tahun Ini', start: dayjs().startOf('year'), end: dayjs() },
                ].map((preset) => (
                  <Chip
                    key={preset.label}
                    label={preset.label}
                    size="small"
                    clickable
                    variant="outlined"
                    onClick={() => {
                      if ('days' in preset && preset.days !== undefined) {
                        setTempStart(dayjs().subtract(preset.days - 1, 'day'));
                        setTempEnd(dayjs());
                      } else if ('start' in preset) {
                        setTempStart(preset.start as Dayjs);
                        setTempEnd(preset.end as Dayjs);
                      }
                    }}
                    sx={{ fontSize: 11 }}
                  />
                ))}
              </Box>
            </Box>

            <Box display="flex" gap={1} justifyContent="flex-end" pt={1}>
              <Button size="small" onClick={() => setAnchorEl(null)}>Batal</Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleApplyDate}
                disabled={!tempStart || !tempEnd}
              >
                Terapkan
              </Button>
            </Box>
          </Stack>
        </Popover>

        {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

        {/* Stat Cards */}
        <Grid container spacing={2.5} mb={3}>
          {[
            { title: `Total Penjualan — ${getPeriodLabel()}`, value: formatCompact(ps?.totalPenjualan || 0), subtitle: formatCurrency(ps?.totalPenjualan || 0), icon: <AttachMoney />, color: '#10b981', bgColor: '#d1fae5' },
            { title: `Total Profit — ${getPeriodLabel()}`, value: formatCompact(ps?.totalProfit || 0), subtitle: 'Margin ~30%', icon: <TrendingUp />, color: '#3b82f6', bgColor: '#dbeafe' },
            { title: `Total Order — ${getPeriodLabel()}`, value: ps?.totalOrder || 0, subtitle: 'order masuk', icon: <ShoppingCart />, color: '#8b5cf6', bgColor: '#ede9fe' },
            { title: `Pending Order — ${getPeriodLabel()}`, value: ps?.pendingOrder || 0, subtitle: 'menunggu proses', icon: <HourglassEmpty />, color: '#f59e0b', bgColor: '#fef3c7' },
          ].map((card) => (
            <Grid item xs={12} sm={6} lg={3} key={card.title}>
              <StatCard {...card} />
            </Grid>
          ))}
        </Grid>

        {/* Charts */}
        <Grid container spacing={2.5} mb={3}>
          <Grid item xs={12} lg={8}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>Grafik Penjualan & Profit</Typography>
                  <Typography variant="caption" color="text.secondary">{getChartSubtitle()}</Typography>
                </Box>
                <Chip label={getPeriodLabel()} size="small" color="primary" variant="outlined" sx={{ maxWidth: 180 }} />
              </Box>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data?.chartData || []} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradPenjualan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 11 }} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="penjualan" name="Penjualan" stroke="#3b82f6" strokeWidth={2} fill="url(#gradPenjualan)" />
                  <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fill="url(#gradProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
              <Typography variant="subtitle1" fontWeight={700} mb={0.5}>Jumlah Order</Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={2.5}>{getChartSubtitle()}</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data?.chartData || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="order" name="order" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Bottom Row */}
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={7}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Order Terbaru</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 12, borderBottom: '2px solid', borderColor: 'divider' } }}>
                    <TableCell>ID Order</TableCell>
                    <TableCell>Dibuat Oleh</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.recentOrders || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>Belum ada order</TableCell>
                    </TableRow>
                  ) : (
                    data?.recentOrders.map((order: any) => (
                      <TableRow key={order.id} hover sx={{ '& td': { fontSize: 13 } }}>
                        <TableCell sx={{ fontFamily: 'monospace', color: 'primary.main' }}>#{order.id.slice(0, 8).toUpperCase()}</TableCell>
                        <TableCell>{order.createdByUser?.name || '-'}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCompact(order.totalAmount)}</TableCell>
                        <TableCell align="center">
                          <Chip label={order.status} size="small"
                            color={order.status === 'SELESAI' ? 'success' : order.status === 'PENDING' ? 'warning' : 'default'}
                            sx={{ fontSize: 11, fontWeight: 600 }} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Stack spacing={2.5}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Inventory sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight={700}>Produk Terlaris</Typography>
                </Box>
                {(data?.topProducts || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>Belum ada data</Typography>
                ) : (
                  data?.topProducts.map((p: any, idx: number) => {
                    const maxVal = data.topProducts[0]?._sum?.subtotal || 1;
                    const pct = ((p._sum?.subtotal || 0) / maxVal) * 100;
                    return (
                      <Box key={idx} mb={1.5}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="caption" fontWeight={600}>{p.productName}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatCompact(p._sum?.subtotal || 0)}</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={pct}
                          sx={{ height: 6, borderRadius: 3, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { borderRadius: 3 } }} />
                      </Box>
                    );
                  })
                )}
              </Paper>

              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>Statistik Operasional</Typography>
                <Stack divider={<Divider />} spacing={1.5}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Mortalitas Ikan</Typography>
                    <Chip label={`${data?.mortalitasRate || 0}%`} size="small"
                      color={(data?.mortalitasRate || 0) > 5 ? 'error' : 'success'} sx={{ fontWeight: 700 }} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Biaya Pakan (Bulan Ini)</Typography>
                    <Typography variant="body2" fontWeight={700}>{formatCompact(data?.biayaPakan || 0)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Total Order (All Time)</Typography>
                    <Typography variant="body2" fontWeight={700}>{data?.allTime?.totalOrder || 0}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Total Penjualan (All Time)</Typography>
                    <Typography variant="body2" fontWeight={700}>{formatCompact(data?.allTime?.totalPenjualan || 0)}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default DashboardPage;
