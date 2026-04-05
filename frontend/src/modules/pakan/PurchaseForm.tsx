import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Grid,
  MenuItem,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { pakanService } from '../../services/pakanService';
import { Supplier } from '../../types';

const PurchaseForm = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    jenisPakan: '',
    jumlahKg: 0,
    hargaPerKg: 0,
    tanggal: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await pakanService.getSuppliers();
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['jumlahKg', 'hargaPerKg'].includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pakanService.createPurchase(formData);
      navigate('/pakan');
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Gagal menyimpan pembelian pakan');
    }
  };

  const totalHarga = formData.jumlahKg * formData.hargaPerKg;

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Pembelian Pakan
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Supplier"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                required
              >
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tanggal"
                name="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Jenis Pakan"
                name="jenisPakan"
                value={formData.jenisPakan}
                onChange={handleChange}
                required
                placeholder="Contoh: Pelet 781-1, Pelet 781-2"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Jumlah (Kg)"
                name="jumlahKg"
                type="number"
                value={formData.jumlahKg}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Harga per Kg"
                name="hargaPerKg"
                type="number"
                value={formData.hargaPerKg}
                onChange={handleChange}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Harga"
                value={totalHarga.toLocaleString('id-ID')}
                disabled
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
                  onClick={() => navigate('/pakan')}
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

export default PurchaseForm;
