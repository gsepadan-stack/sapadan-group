import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Grid,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { kolamService } from '../../services/kolamService';

const KolamForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    jenisIkan: '',
    jumlahIkan: 0,
    mortalitas: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      fetchKolam(id);
    }
  }, [id, isEdit]);

  const fetchKolam = async (kolamId: string) => {
    try {
      const response = await kolamService.getById(kolamId);
      const kolam = response.data;
      setFormData({
        name: kolam.name,
        jenisIkan: kolam.jenisIkan,
        jumlahIkan: kolam.jumlahIkan,
        mortalitas: kolam.mortalitas,
      });
    } catch (error) {
      console.error('Error fetching kolam:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'jumlahIkan' || name === 'mortalitas' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && id) {
        await kolamService.update(id, formData);
      } else {
        await kolamService.create(formData);
      }
      navigate('/kolam');
    } catch (error) {
      console.error('Error saving kolam:', error);
      alert('Gagal menyimpan data kolam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        {isEdit ? 'Edit Kolam' : 'Tambah Kolam'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nama Kolam"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Jenis Ikan"
                name="jenisIkan"
                value={formData.jenisIkan}
                onChange={handleChange}
                required
                placeholder="Contoh: Lele, Nila, Gurame"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Jumlah Ikan (ekor)"
                name="jumlahIkan"
                type="number"
                value={formData.jumlahIkan}
                onChange={handleChange}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mortalitas (ekor)"
                name="mortalitas"
                type="number"
                value={formData.mortalitas}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate('/kolam')}
                >
                  Batal
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default KolamForm;
