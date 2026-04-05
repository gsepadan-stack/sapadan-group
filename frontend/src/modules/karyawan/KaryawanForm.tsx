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
import { karyawanService } from '../../services/karyawanService';

const KaryawanForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    position: '',
    gajiPokok: 0,
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchKaryawan(id);
    }
  }, [id, isEdit]);

  const fetchKaryawan = async (karyawanId: string) => {
    try {
      const response = await karyawanService.getById(karyawanId);
      const karyawan = response.data;
      setFormData({
        name: karyawan.name,
        phone: karyawan.phone,
        address: karyawan.address,
        position: karyawan.position,
        gajiPokok: karyawan.gajiPokok,
      });
    } catch (error) {
      console.error('Error fetching karyawan:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'gajiPokok' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && id) {
        await karyawanService.update(id, formData);
      } else {
        await karyawanService.create(formData);
      }
      navigate('/karyawan');
    } catch (error) {
      console.error('Error saving karyawan:', error);
      alert('Gagal menyimpan data karyawan');
    }
  };

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        {isEdit ? 'Edit Karyawan' : 'Tambah Karyawan'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nama Lengkap"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telepon"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alamat"
                name="address"
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={2}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Posisi/Jabatan"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                placeholder="Contoh: Supervisor, Staff Kolam"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Gaji Pokok"
                name="gajiPokok"
                type="number"
                value={formData.gajiPokok}
                onChange={handleChange}
                required
                inputProps={{ min: 0 }}
                InputProps={{
                  startAdornment: 'Rp ',
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button type="submit" variant="contained" startIcon={<Save />}>
                  Simpan
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate('/karyawan')}
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

export default KaryawanForm;
