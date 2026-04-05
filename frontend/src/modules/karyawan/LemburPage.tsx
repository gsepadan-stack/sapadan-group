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
  Chip,
  IconButton,
} from '@mui/material';
import { Add, ArrowBack, Check } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { karyawanService } from '../../services/karyawanService';
import { Lembur, Karyawan } from '../../types';

const LemburPage = () => {
  const navigate = useNavigate();
  const [lemburs, setLemburs] = useState<Lembur[]>([]);
  const [karyawans, setKaryawans] = useState<Karyawan[]>([]);
  const [dialog, setDialog] = useState(false);
  const [formData, setFormData] = useState({
    karyawanId: '',
    tanggal: new Date().toISOString().split('T')[0],
    jamMulai: '17:00',
    jamSelesai: '20:00',
    upahPerJam: 15000,
  });

  useEffect(() => {
    fetchLemburs();
    fetchKaryawans();
  }, []);

  const fetchLemburs = async () => {
    try {
      const response = await karyawanService.getLemburs();
      setLemburs(response.data);
    } catch (error) {
      console.error('Error fetching lemburs:', error);
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
      await karyawanService.createLembur(formData);
      setDialog(false);
      fetchLemburs();
      setFormData({
        karyawanId: '',
        tanggal: new Date().toISOString().split('T')[0],
        jamMulai: '17:00',
        jamSelesai: '20:00',
        upahPerJam: 15000,
      });
    } catch (error) {
      console.error('Error creating lembur:', error);
      alert('Gagal menyimpan data lembur');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await karyawanService.approveLembur(id);
      fetchLemburs();
    } catch (error) {
      console.error('Error approving lembur:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

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
        <Typography variant="h4">Lembur Karyawan</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialog(true)}
        >
          Tambah Lembur
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Karyawan</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell>Jam Mulai</TableCell>
              <TableCell>Jam Selesai</TableCell>
              <TableCell align="right">Total Jam</TableCell>
              <TableCell align="right">Upah/Jam</TableCell>
              <TableCell align="right">Total Upah</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lemburs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Belum ada data lembur
                </TableCell>
              </TableRow>
            ) : (
              lemburs.map((lembur) => (
                <TableRow key={lembur.id}>
                  <TableCell>{lembur.karyawan?.name}</TableCell>
                  <TableCell>
                    {new Date(lembur.tanggal).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell>{lembur.jamMulai}</TableCell>
                  <TableCell>{lembur.jamSelesai}</TableCell>
                  <TableCell align="right">{lembur.totalJam} jam</TableCell>
                  <TableCell align="right">
                    {formatCurrency(lembur.upahPerJam)}
                  </TableCell>
                  <TableCell align="right">
                    <strong>{formatCurrency(lembur.totalUpah)}</strong>
                  </TableCell>
                  <TableCell align="center">
                    {lembur.approved ? (
                      <Chip label="Approved" color="success" size="small" />
                    ) : (
                      <Chip label="Pending" color="warning" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {!lembur.approved && (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleApprove(lembur.id)}
                      >
                        <Check />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tambah Lembur</DialogTitle>
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Jam Mulai"
                type="time"
                value={formData.jamMulai}
                onChange={(e) =>
                  setFormData({ ...formData, jamMulai: e.target.value })
                }
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Jam Selesai"
                type="time"
                value={formData.jamSelesai}
                onChange={(e) =>
                  setFormData({ ...formData, jamSelesai: e.target.value })
                }
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Upah per Jam"
                type="number"
                value={formData.upahPerJam}
                onChange={(e) =>
                  setFormData({ ...formData, upahPerJam: Number(e.target.value) })
                }
                required
                inputProps={{ min: 0 }}
                InputProps={{ startAdornment: 'Rp ' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Batal</Button>
          <Button onClick={handleSubmit} variant="contained">
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LemburPage;
