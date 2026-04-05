import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material';
import { Add, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { karyawanService } from '../../services/karyawanService';
import { Payroll, Karyawan } from '../../types';

const PayrollPage = () => {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [karyawans, setKaryawans] = useState<Karyawan[]>([]);
  const [dialog, setDialog] = useState(false);
  const [formData, setFormData] = useState({
    karyawanId: '',
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    tunjangan: 0,
    potongan: 0,
  });

  useEffect(() => {
    fetchPayrolls();
    fetchKaryawans();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await karyawanService.getPayrolls();
      setPayrolls(response.data);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
    }
  };

  const fetchKaryawans = async () => {
    try {
      const response = await karyawanService.getAll();
      setKaryawans(response.data);
    } catch (error) {
      console.error('Error fetching karyawans:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      await karyawanService.generatePayroll({
        ...formData,
        bulan: formData.bulan.toString().padStart(2, '0'),
      });
      setDialog(false);
      fetchPayrolls();
      setFormData({
        karyawanId: '',
        bulan: new Date().getMonth() + 1,
        tahun: new Date().getFullYear(),
        tunjangan: 0,
        potongan: 0,
      });
    } catch (error) {
      console.error('Error generating payroll:', error);
      alert('Gagal generate payroll');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/karyawan')}
        sx={{ mb: 2 }}
      >
        Kembali
      </Button>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Payroll</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialog(true)}
        >
          Generate Payroll
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Karyawan</TableCell>
              <TableCell>Periode</TableCell>
              <TableCell align="right">Gaji Pokok</TableCell>
              <TableCell align="right">Tunjangan</TableCell>
              <TableCell align="right">Potongan</TableCell>
              <TableCell align="right">Total Gaji</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payrolls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Belum ada data payroll
                </TableCell>
              </TableRow>
            ) : (
              payrolls.map((payroll) => (
                <TableRow key={payroll.id}>
                  <TableCell>{payroll.karyawan?.name}</TableCell>
                  <TableCell>
                    {months[parseInt(payroll.bulan) - 1]} {payroll.tahun}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(payroll.gajiPokok)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(payroll.tunjangan)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(payroll.potongan)}
                  </TableCell>
                  <TableCell align="right">
                    <strong>{formatCurrency(payroll.totalGaji)}</strong>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Payroll</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Karyawan"
                value={formData.karyawanId}
                onChange={(e) =>
                  setFormData({ ...formData, karyawanId: e.target.value })
                }
                required
              >
                {karyawans.map((k) => (
                  <MenuItem key={k.id} value={k.id}>
                    {k.name} - {k.position}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Bulan"
                value={formData.bulan}
                onChange={(e) =>
                  setFormData({ ...formData, bulan: Number(e.target.value) })
                }
                required
              >
                {months.map((month, index) => (
                  <MenuItem key={index} value={index + 1}>
                    {month}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Tahun"
                type="number"
                value={formData.tahun}
                onChange={(e) =>
                  setFormData({ ...formData, tahun: Number(e.target.value) })
                }
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Tunjangan"
                type="number"
                value={formData.tunjangan}
                onChange={(e) =>
                  setFormData({ ...formData, tunjangan: Number(e.target.value) })
                }
                inputProps={{ min: 0 }}
                InputProps={{ startAdornment: 'Rp ' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Potongan"
                type="number"
                value={formData.potongan}
                onChange={(e) =>
                  setFormData({ ...formData, potongan: Number(e.target.value) })
                }
                inputProps={{ min: 0 }}
                InputProps={{ startAdornment: 'Rp ' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Batal</Button>
          <Button onClick={handleSubmit} variant="contained">
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollPage;
