import { useEffect, useState } from 'react';
import {
  Box, Button, Paper, Typography, LinearProgress, Chip,
  Grid, Avatar, Stack, Divider, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip,
} from '@mui/material';
import {
  Add, Inventory2, Warning, CheckCircle, LocalShipping,
  Refresh, TrendingDown,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { pakanService } from '../../services/pakanService';
import { PakanStock } from '../../types';

const PakanStockPage = () => {
  const navigate = useNavigate();
  const [stock, setStock] = useState<PakanStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStock(); }, []);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const response = await pakanService.getStock();
      setStock(response.data);
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockPct = (remaining: number, purchased: number) =>
    purchased > 0 ? Math.min((remaining / purchased) * 100, 100) : 0;

  const getStockStatus = (pct: number) => {
    if (pct > 50) return { label: 'Aman', color: 'success' as const, barColor: '#10b981', bg: '#d1fae5', icon: <CheckCircle sx={{ fontSize: 16 }} /> };
    if (pct > 20) return { label: 'Menipis', color: 'warning' as const, barColor: '#f59e0b', bg: '#fef3c7', icon: <Warning sx={{ fontSize: 16 }} /> };
    return { label: 'Kritis', color: 'error' as const, barColor: '#ef4444', bg: '#fee2e2', icon: <TrendingDown sx={{ fontSize: 16 }} /> };
  };

  const totalStock = stock.reduce((s, i) => s + i.remaining, 0);
  const totalPurchased = stock.reduce((s, i) => s + i.purchased, 0);
  const totalUsed = stock.reduce((s, i) => s + i.used, 0);
  const criticalCount = stock.filter(i => getStockPct(i.remaining, i.purchased) <= 20).length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Stok Pakan</Typography>
          <Typography variant="body2" color="text.secondary">Manajemen inventaris pakan ikan</Typography>
        </Box>
        <Box display="flex" gap={1.5} flexWrap="wrap">
          <Tooltip title="Refresh data">
            <IconButton onClick={fetchStock} size="small" sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" startIcon={<LocalShipping />} onClick={() => navigate('/pakan/suppliers')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Supplier
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/pakan/purchase')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Beli Pakan
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2.5} mb={3}>
        {[
          { label: 'Total Stok Tersisa', value: `${totalStock.toFixed(0)} Kg`, icon: <Inventory2 />, color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Total Dibeli', value: `${totalPurchased.toFixed(0)} Kg`, icon: <Add />, color: '#10b981', bg: '#d1fae5' },
          { label: 'Total Digunakan', value: `${totalUsed.toFixed(0)} Kg`, icon: <TrendingDown />, color: '#8b5cf6', bg: '#ede9fe' },
          { label: 'Stok Kritis', value: criticalCount, icon: <Warning />, color: '#ef4444', bg: '#fee2e2' },
        ].map((card) => (
          <Grid item xs={6} md={3} key={card.label}>
            <Paper elevation={0} sx={{
              p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3,
              position: 'relative', overflow: 'hidden',
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: card.color },
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    {card.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} mt={0.5}>{card.value}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: card.bg, width: 44, height: 44 }}>
                  <Box sx={{ color: card.color, display: 'flex' }}>{card.icon}</Box>
                </Avatar>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Stock Cards Grid */}
      {loading ? (
        <LinearProgress sx={{ borderRadius: 1 }} />
      ) : stock.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Inventory2 sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Belum ada data stok pakan</Typography>
          <Typography variant="body2" color="text.disabled" mb={3}>Mulai dengan membeli pakan dari supplier</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/pakan/purchase')}
            sx={{ borderRadius: 2, textTransform: 'none' }}>
            Beli Pakan Sekarang
          </Button>
        </Paper>
      ) : (
        <>
          {/* Card view for each feed type */}
          <Grid container spacing={2.5} mb={3}>
            {stock.map((item) => {
              const pct = getStockPct(item.remaining, item.purchased);
              const status = getStockStatus(pct);
              return (
                <Grid item xs={12} sm={6} lg={4} key={item.jenisPakan}>
                  <Paper elevation={0} sx={{
                    p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3,
                    borderLeft: `4px solid ${status.barColor}`,
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
                  }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>{item.jenisPakan}</Typography>
                        <Typography variant="caption" color="text.secondary">Stok tersisa</Typography>
                      </Box>
                      <Chip
                        icon={status.icon}
                        label={status.label}
                        size="small"
                        color={status.color}
                        sx={{ fontWeight: 600, fontSize: 11 }}
                      />
                    </Box>

                    <Typography variant="h4" fontWeight={800} color={status.barColor} mb={0.5}>
                      {item.remaining.toFixed(1)} <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>Kg</Typography>
                    </Typography>

                    <Box mt={2} mb={1}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">Sisa stok</Typography>
                        <Typography variant="caption" fontWeight={700} color={status.barColor}>{pct.toFixed(0)}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 8, borderRadius: 4, bgcolor: '#f0f0f0',
                          '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: status.barColor },
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Stack direction="row" justifyContent="space-between">
                      <Box textAlign="center">
                        <Typography variant="caption" color="text.secondary" display="block">Dibeli</Typography>
                        <Typography variant="body2" fontWeight={600}>{item.purchased.toFixed(0)} Kg</Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="caption" color="text.secondary" display="block">Digunakan</Typography>
                        <Typography variant="body2" fontWeight={600}>{item.used.toFixed(0)} Kg</Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="caption" color="text.secondary" display="block">Sisa</Typography>
                        <Typography variant="body2" fontWeight={600} color={status.barColor}>{item.remaining.toFixed(0)} Kg</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Detail Table */}
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
            <Box px={3} py={2} borderBottom="1px solid" sx={{ borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={700}>Detail Stok</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {['Jenis Pakan', 'Dibeli (Kg)', 'Digunakan (Kg)', 'Sisa (Kg)', 'Status Stok'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12, py: 1.5 }}
                        align={h === 'Jenis Pakan' ? 'left' : h === 'Status Stok' ? 'left' : 'right'}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stock.map((item) => {
                    const pct = getStockPct(item.remaining, item.purchased);
                    const status = getStockStatus(pct);
                    return (
                      <TableRow key={item.jenisPakan} hover sx={{ '& td': { fontSize: 13 } }}>
                        <TableCell sx={{ fontWeight: 600 }}>{item.jenisPakan}</TableCell>
                        <TableCell align="right">{item.purchased.toFixed(1)}</TableCell>
                        <TableCell align="right">{item.used.toFixed(1)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: status.barColor }}>
                          {item.remaining.toFixed(1)}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5} minWidth={160}>
                            <LinearProgress variant="determinate" value={pct}
                              sx={{
                                flex: 1, height: 6, borderRadius: 3, bgcolor: '#f0f0f0',
                                '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: status.barColor },
                              }}
                            />
                            <Chip label={`${pct.toFixed(0)}%`} size="small" color={status.color}
                              sx={{ fontSize: 10, fontWeight: 700, minWidth: 48 }} />
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default PakanStockPage;
