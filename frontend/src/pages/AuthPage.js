import React, { useState, useContext } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import AuthContext from '../context/AuthContext';

const AuthPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useContext(AuthContext);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (tabValue === 0) {
        // Login
        await login(formData.email, formData.password);
        // Role-based redirect will be handled by App.js route logic
      } else {
        // Register
        await register(formData.name, formData.email, formData.password, formData.role);
        // Role-based redirect will be handled by App.js route logic
      }
      // Navigation is handled by App.js route logic based on user role
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#1e1e1e',
        p: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          display: 'flex',
          width: '100%',
          maxWidth: '900px',
          minHeight: '500px',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* Left side - Illustration */}
        <Box
          sx={{
            flex: 1,
            bgcolor: '#61dafb',
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
          }}
        >
          <Box textAlign="center">
            <Typography variant="h4" sx={{ color: '#1e1e1e', mb: 2, fontWeight: 'bold' }}>
              CollabCode
            </Typography>
            <Typography variant="h6" sx={{ color: '#1e1e1e' }}>
              Real-Time Coding Interviews
            </Typography>
            <Typography sx={{ color: '#1e1e1e', mt: 2 }}>
              Connect, Code, Collaborate
            </Typography>
          </Box>
        </Box>

        {/* Right side - Form */}
        <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: '#1e1e1e' }}>
            Welcome
          </Typography>

          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            {tabValue === 1 && (
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
                sx={{ mb: 2 }}
              />
            )}

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />

            {tabValue === 1 && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value="candidate">Candidate</MenuItem>
                  <MenuItem value="interviewer">Interviewer</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                bgcolor: '#61dafb',
                '&:hover': { bgcolor: '#21b4d6' },
              }}
              disabled={loading}
            >
              {loading ? 'Please wait...' : tabValue === 0 ? 'Login' : 'Register'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AuthPage;