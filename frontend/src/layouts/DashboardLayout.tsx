import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  ShoppingCart,
  Inventory,
  Pool,
  Fastfood,
  People,
  AttachMoney,
  AccessTime,
  DirectionsCar,
  LocationOn,
  Logout,
  Agriculture,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../modules/auth/authSlice';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Pemesanan Ikan', icon: <ShoppingCart />, path: '/sales/orders' },
  { text: 'Produk', icon: <Inventory />, path: '/sales/products' },
  { text: 'Manajemen Kolam', icon: <Pool />, path: '/kolam' },
  { text: 'Stok Pakan', icon: <Fastfood />, path: '/pakan' },
  { text: 'Supplier Pakan', icon: <Fastfood />, path: '/pakan/suppliers' },
  { text: 'Fleet Management', icon: <DirectionsCar />, path: '/fleet' },
  { text: 'Live Monitoring', icon: <LocationOn />, path: '/fleet/monitor' },
  { text: 'Mitra Petani', icon: <Agriculture />, path: '/mitra' },
  { text: 'Karyawan', icon: <People />, path: '/karyawan' },
  { text: 'Payroll', icon: <AttachMoney />, path: '/karyawan/payroll' },
  { text: 'Lembur', icon: <AccessTime />, path: '/karyawan/lembur' },
];

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const drawer = (
    <div>
      <Toolbar sx={{ py: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            component="img"
            src="/logofix.png"
            alt="Sapadan Fishery"
            sx={{ width: 56, height: 56, borderRadius: 2, objectFit: 'cover' }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} noWrap lineHeight={1.2}>
              Sapadan Fishery
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Management System
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleMenuClick(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sistem Manajemen Perikanan
          </Typography>
          <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
            <Avatar>{user?.name.charAt(0)}</Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">{user?.name}</Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption">{user?.role}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
