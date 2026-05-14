import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StopIcon from '@mui/icons-material/Stop';
import api from '../../services/api';

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [codeDialog, setCodeDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        const res = await api.get(`/admin/sessions?${params.toString()}`);
        setSessions(res.data);
      } catch (err) {
        console.error('Error loading sessions', err);
      }
    };

    loadSessions();
  }, [search, status]);

  const fetchSessions = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      const res = await api.get(`/admin/sessions?${params.toString()}`);
      setSessions(res.data);
    } catch (err) {
      console.error('Error loading sessions', err);
    }
  };

  const handleForceEnd = async (id) => {
    if (!window.confirm('Force end this session?')) return;
    try {
      await api.put(`/admin/sessions/${id}/end`);
      fetchSessions();
    } catch (err) {
      console.error('Error ending session', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await api.delete(`/admin/sessions/${id}`);
      setSessions((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error('Error deleting session', err);
    }
  };

  const handleViewCode = (session) => {
    setSelectedSession(session);
    setCodeDialog(true);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#f8fafc', mb: 2 }}>
        Session Management
      </Typography>

      <Card sx={{ bgcolor: '#111827', borderRadius: 3, boxShadow: 4, mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search by room, title, or candidate"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ bgcolor: '#0f172a' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                sx={{ bgcolor: '#0f172a' }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="waiting">Waiting</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
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
                <TableCell sx={{ color: '#94a3b8' }}>Room ID</TableCell>
                <TableCell sx={{ color: '#94a3b8' }}>Interviewer</TableCell>
                <TableCell sx={{ color: '#94a3b8' }}>Candidate</TableCell>
                <TableCell sx={{ color: '#94a3b8' }}>Status</TableCell>
                <TableCell sx={{ color: '#94a3b8' }}>Language</TableCell>
                <TableCell sx={{ color: '#94a3b8' }}>Created</TableCell>
                <TableCell sx={{ color: '#94a3b8' }}>Started</TableCell>
                <TableCell sx={{ color: '#94a3b8' }}>Ended</TableCell>
                <TableCell sx={{ color: '#94a3b8' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session._id} hover>
                  <TableCell sx={{ color: '#e2e8f0' }}>{session.roomId}</TableCell>
                  <TableCell sx={{ color: '#cbd5e1' }}>{session.interviewer?.name || 'Unknown'}</TableCell>
                  <TableCell sx={{ color: '#cbd5e1' }}>{session.candidate?.name || session.candidateEmail}</TableCell>
                  <TableCell>
                    <Chip
                      label={session.status}
                      color={session.status === 'active' ? 'success' : session.status === 'completed' ? 'default' : 'warning'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#cbd5e1' }}>{session.language}</TableCell>
                  <TableCell sx={{ color: '#cbd5e1' }}>{new Date(session.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ color: '#cbd5e1' }}>{session.startedAt ? new Date(session.startedAt).toLocaleDateString() : '-'}</TableCell>
                  <TableCell sx={{ color: '#cbd5e1' }}>{session.endsAt ? new Date(session.endsAt).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1, borderColor: '#60a5fa', color: '#60a5fa' }}
                      onClick={() => handleViewCode(session)}
                    >
                      View Code
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="warning"
                      sx={{ mr: 1 }}
                      startIcon={<StopIcon />}
                      onClick={() => handleForceEnd(session._id)}
                    >
                      End
                    </Button>
                    <IconButton color="error" onClick={() => handleDelete(session._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ color: '#cbd5e1', textAlign: 'center', py: 4 }}>
                    No sessions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={codeDialog} onClose={() => setCodeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Session Code</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Room: {selectedSession?.roomId}
          </Typography>
          <Paper sx={{ bgcolor: '#0f172a', p: 2, minHeight: 240, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {selectedSession?.code || 'No code submitted yet.'}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCodeDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSessions;
