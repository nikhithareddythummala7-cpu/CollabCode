import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../services/api';

const roleOptions = ['', 'admin', 'interviewer', 'candidate'];
const statusOptions = ['', 'active', 'blocked'];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.role) params.append('role', filters.role);
        if (filters.status) params.append('status', filters.status);
        const res = await api.get(`/admin/users?${params.toString()}`);
        setUsers(res.data);
      } catch (err) {
        console.error('Error loading users', err);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleUpdate = async (id, role) => {
    try {
      const res = await api.put(`/admin/users/${id}`, { role });
      setUsers((prev) => prev.map((user) => (user._id === id ? res.data : user)));
    } catch (err) {
      console.error('Error updating role', err);
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      const status = user.status === 'active' ? 'blocked' : 'active';
      const res = await api.put(`/admin/users/${user._id}`, { status });
      setUsers((prev) => prev.map((item) => (item._id === user._id ? res.data : item)));
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      console.error('Error deleting user', err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#f8fafc', mb: 2 }}>
        User Management
      </Typography>

      <Card sx={{ bgcolor: '#111827', borderRadius: 3, boxShadow: 4, mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search users"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                sx={{ bgcolor: '#0f172a' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Role"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                sx={{ bgcolor: '#0f172a' }}
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role || 'All Roles'}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                sx={{ bgcolor: '#0f172a' }}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status || 'All Status'}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ bgcolor: '#111827', borderRadius: 3, boxShadow: 4 }}>
        <TableContainer component={Paper} sx={{ bgcolor: '#0f172a' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8' }}>Name</TableCell>
                <TableCell sx={{ color: '#94a3b8' }}>Email</TableCell>
                <TableCell sx={{ color: '#94a3b8' }}>Role</TableCell>
                <TableCell sx={{ color: '#94a3b8' }}>Status</TableCell>
                <TableCell sx={{ color: '#94a3b8' }}>Created At</TableCell>
                <TableCell sx={{ color: '#94a3b8' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell sx={{ color: '#e2e8f0' }}>{user.name}</TableCell>
                  <TableCell sx={{ color: '#cbd5e1' }}>{user.email}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      value={user.role}
                      onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                      size="small"
                      sx={{ minWidth: 140, bgcolor: '#0f172a' }}
                    >
                      {roleOptions.filter(Boolean).map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === 'active' ? 'success' : 'warning'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#cbd5e1' }}>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="contained"
                      color={user.status === 'active' ? 'warning' : 'success'}
                      sx={{ mr: 1 }}
                      onClick={() => handleStatusToggle(user)}
                    >
                      {user.status === 'active' ? 'Block' : 'Unblock'}
                    </Button>
                    <IconButton color="error" onClick={() => handleDelete(user._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ color: '#cbd5e1', textAlign: 'center', py: 4 }}>
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default AdminUsers;
