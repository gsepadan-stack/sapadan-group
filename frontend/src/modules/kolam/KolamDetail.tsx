import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';
import { kolamService } from '../../services/kolamService';
import { Kolam } from '../../types';

const KolamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kolam, setKolam] = useState<Kolam | null>(null);
  const [feedingDialog, setFeedingDialog] = useState(false);
  const [healthDialog, setHealthDialog] = useState(false);

  const [feedingForm, setFeedingForm] = useState({
    jumlahKg: 0,
    jenisPakan: '',
    tanggal: new Date().toISOString().split('T')[0],
    catatan: '',
  });

  const [healthForm, setHealthForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kondisi: '',
    catatan: '',
  });

  useEffect(() => {
    if (id) fetchKolam(id);
  }, [id]);

  const fetchKolam = async (kolamId: string) => {
    try {
      const response = await kolamService.getById(kolamId);
      setKolam(response.data);
    } catch (error) {
      console.error('Error fetching kolam:', error);
    }
  };

  const handleAddFeeding = async () => {
    if (!id) return;
    try {
      await kolamService.addFeeding(id, feedingForm);
      setFeedingDialog(false);
      fetchKolam(id);
      setFeedingForm({
        jumlahKg: 0,
        jenisPakan: '',
        tanggal: new Date().toISOString().split('T')[0],
        catatan: '',
      });
    } catch (error) {
      console.error('Error adding feeding log:', error);
    }
  };

  const handleAddHealth = async () => {
    if (!id) return;
    try {
      await kolamService.addHealth(id, healthForm);
      setHealthDialog(false);
      fetchKolam(id);
      setHealthForm({
        tanggal: new Date().toISOString().split('T')[0],
        kondisi: '',
        catatan: '',
      });
    } catch (error) {
      console.error('Error adding health log:', error);
    }
  };

  if (!kolam) return <div>Loading...</div>;

  const mortalitasRate = ((kolam.mortalitas / kolam.jumlahIkan) * 100).toFixed(2);

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/kolam')}
        sx={{ mb: 2 }}
      >
        Kembali
      </Button>

      <Typography variant="h4" mb={3}>
        Detail Kolam: {kolam.name}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Informasi Kolam
            </Typography>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Jenis Ikan
              </Typography>
              <Typography variant="h6" mb={2}>
                {kolam.jenisIkan}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Jumlah Ikan
              </Typography>
              <Typography variant="h6" mb={2}>
                {kolam.jumlahIkan.toLocaleString()} ekor
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Mortalitas
              </Typography>
              <Typography variant="h6" color="error">
                {kolam.mortalitas} ekor ({mortalitasRate}%)
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Log Pemberian Pakan</Typography>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={() => setFeedingDialog(true)}
              >
                Tambah
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Jenis</TableCell>
                    <TableCell align="right">Jumlah (Kg)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {kolam.feedingLogs?.slice(0, 5).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.tanggal).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>{log.jenisPakan}</TableCell>
                      <TableCell align="right">{log.jumlahKg}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Log Kesehatan</Typography>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={() => setHealthDialog(true)}
              >
                Tambah
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Kondisi</TableCell>
                    <TableCell>Catatan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {kolam.healthLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.tanggal).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>{log.kondisi}</TableCell>
                      <TableCell>{log.catatan || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Feeding Dialog */}
      <Dialog open={feedingDialog} onClose={() => setFeedingDialog(false)}>
        <DialogTitle>Tambah Log Pemberian Pakan</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Tanggal"
              type="date"
              value={feedingForm.tanggal}
              onChange={(e) =>
                setFeedingForm({ ...feedingForm, tanggal: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Jenis Pakan"
              value={feedingForm.jenisPakan}
              onChange={(e) =>
                setFeedingForm({ ...feedingForm, jenisPakan: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Jumlah (Kg)"
              type="number"
              value={feedingForm.jumlahKg}
              onChange={(e) =>
                setFeedingForm({ ...feedingForm, jumlahKg: Number(e.target.value) })
              }
              inputProps={{ min: 0, step: 0.1 }}
            />
            <TextField
              fullWidth
              label="Catatan"
              multiline
              rows={2}
              value={feedingForm.catatan}
              onChange={(e) =>
                setFeedingForm({ ...feedingForm, catatan: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedingDialog(false)}>Batal</Button>
          <Button onClick={handleAddFeeding} variant="contained">
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Health Dialog */}
      <Dialog open={healthDialog} onClose={() => setHealthDialog(false)}>
        <DialogTitle>Tambah Log Kesehatan</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Tanggal"
              type="date"
              value={healthForm.tanggal}
              onChange={(e) =>
                setHealthForm({ ...healthForm, tanggal: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Kondisi"
              value={healthForm.kondisi}
              onChange={(e) =>
                setHealthForm({ ...healthForm, kondisi: e.target.value })
              }
              placeholder="Contoh: Sehat, Sakit, Stress"
            />
            <TextField
              fullWidth
              label="Catatan"
              multiline
              rows={3}
              value={healthForm.catatan}
              onChange={(e) =>
                setHealthForm({ ...healthForm, catatan: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHealthDialog(false)}>Batal</Button>
          <Button onClick={handleAddHealth} variant="contained">
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KolamDetail;
