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
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { kolamService } from '../../services/kolamService';
import { Kolam } from '../../types';

const KolamList = () => {
  const navigate = useNavigate();
  const [kolams, setKolams] = useState<Kolam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKolams();
  }, []);

  const fetchKolams = async () => {
    try {
      const response = await kolamService.getAll();
      setKolams(response.data);
    } catch (error) {
      console.error('Error fetching kolams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus kolam ini?')) {
      try {
        await kolamService.delete(id);
        fetchKolams();
      } catch (error) {
        console.error('Error deleting kolam:', error);
      }
    }
  };

  const getMortalitasColor = (rate: number) => {
    if (rate < 5) return 'success';
    if (rate < 10) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Manajemen Kolam</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/kolam/new')}
        >
          Tambah Kolam
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nama Kolam</TableCell>
              <TableCell>Jenis Ikan</TableCell>
              <TableCell align="right">Jumlah Ikan</TableCell>
              <TableCell align="right">Mortalitas</TableCell>
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
            ) : kolams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Belum ada data kolam
                </TableCell>
              </TableRow>
            ) : (
              kolams.map((kolam) => (
                <TableRow key={kolam.id}>
                  <TableCell>{kolam.name}</TableCell>
                  <TableCell>{kolam.jenisIkan}</TableCell>
                  <TableCell align="right">
                    {kolam.jumlahIkan.toLocaleString()} ekor
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${kolam.mortalitas} ekor`}
                      color={getMortalitasColor(
                        (kolam.mortalitas / kolam.jumlahIkan) * 100
                      )}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/kolam/${kolam.id}`)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/kolam/${kolam.id}/edit`)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(kolam.id)}
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

export default KolamList;
