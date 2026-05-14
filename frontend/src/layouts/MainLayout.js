import React from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import AuthContext from '../context/AuthContext';

const MainLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#0f172a' }}>
      <AppBar
        position="static"
        sx={{
          bgcolor: '#111827',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderBottom: '1px solid #1f2937',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                background: 'linear-gradient(135deg, #61dafb 0%, #21b4d6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#111827',
                fontSize: '1.2rem',
              }}
            >
              C
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: '#f8fafc',
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              CollabCode
            </Typography>
          </Box>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 500 }}>
                  {user.name}
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Typography>
              </Box>

              <Button
                onClick={handleMenu}
                sx={{
                  p: 0,
                  '&:hover': {
                    bgcolor: 'rgba(97, 218, 251, 0.1)',
                    borderRadius: 1,
                  },
                }}
              >
                <Avatar sx={{ bgcolor: '#61dafb', color: '#111827', fontWeight: 700 }}>
                  {user.name[0].toUpperCase()}
                </Avatar>
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    bgcolor: '#111827',
                    border: '1px solid #1f2937',
                    borderRadius: 1,
                    minWidth: 200,
                  },
                }}
              >
                <MenuItem
                  sx={{ color: '#cbd5e1', fontSize: '0.9rem' }}
                  disabled
                >
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    Logged in as
                  </Typography>
                </MenuItem>
                <MenuItem
                  sx={{ color: '#f8fafc', fontWeight: 500, fontSize: '0.9rem' }}
                  disabled
                >
                  {user.email}
                </MenuItem>
                <Divider sx={{ borderColor: '#1f2937', my: 1 }} />
                <MenuItem
                  onClick={() => {
                    navigate('/dashboard');
                    handleClose();
                  }}
                  sx={{
                    color: '#cbd5e1',
                    '&:hover': { bgcolor: '#1f2937', color: '#f8fafc' },
                  }}
                >
                  <SettingsIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                  Dashboard
                </MenuItem>
                {user.role === 'admin' && (
                  <MenuItem
                    onClick={() => {
                      navigate('/admin');
                      handleClose();
                    }}
                    sx={{
                      color: '#cbd5e1',
                      '&:hover': { bgcolor: '#1f2937', color: '#61dafb' },
                    }}
                  >
                    <SettingsIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#61dafb' }} />
                    Admin Panel
                  </MenuItem>
                )}
                <Divider sx={{ borderColor: '#1f2937', my: 1 }} />
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    color: '#ef4444',
                    '&:hover': { bgcolor: '#7f1d1d', color: '#fca5a5' },
                  }}
                >
                  <LogoutIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;