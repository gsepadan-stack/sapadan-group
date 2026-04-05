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
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete, Payment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { karyawanService } from '../../services/karyawanService';
import { Karyawan } from '../../types';

const KaryawanList = () => {
  const navigate = useNavigate();
  const [karyawans, setKaryawans] = useState<Karyawan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKaryawans();
  }, []);

  const fetchKaryawans = async () => {
    try {
      const response = await karyawanService.getAll();
      setKaryawans(response.data);
    } catch (error) {
      console.error('Error fetching karyawans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus karyawan ini?')) {
      try {
        await karyawanService.delete(id);
        fetchKaryawans();
      } catch (error) {
        console.error('Error deleting karyawan:', error);
      }
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Manajemen Karyawan</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Payment />}
            onClick={() => navigate('/karyawan/payroll')}
            sx={{ mr: 1 }}
          >
            Payroll
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/karyawan/new')}
          >
            Tambah Karyawan
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nama</TableCell>
              <TableCell>Posisi</TableCell>
              <TableCell>Telepon</TableCell>
              <TableCell align="right">Gaji Pokok</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : karyawans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Belum ada data karyawan
                </TableCell>
              </TableRow>
            ) : (
              karyawans.map((karyawan) => (
                <TableRow key={karyawan.id}>
                  <TableCell>{karyawan.name}</TableCell>
                  <TableCell>{karyawan.position}</TableCell>
                  <TableCell>{karyawan.phone}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(karyawan.gajiPokok)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/karyawan/${karyawan.id}/edit`)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(karyawan.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default KaryawanList;
