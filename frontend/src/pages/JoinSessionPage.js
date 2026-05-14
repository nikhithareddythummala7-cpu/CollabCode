import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import socket from '../socket/socket';

const JoinSessionPage = () => {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const roomIdFromUrl = searchParams.get('roomId');
    if (roomIdFromUrl) {
      setRoomId(roomIdFromUrl);
    }
  }, [searchParams]);

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (loading) return; // ✅ prevent double click

  setLoading(true);
  setError('');

  try {
    await api.put(`/sessions/${roomId}/join`);

    // Emit join_session event to sync session for all in room
    socket.emit('join_session', roomId);

    // ✅ navigate only after join success
    navigate(`/session/${roomId}`, { replace: true });

  } catch (err) {
    setError(err.response?.data?.message || 'Failed to join session');
  } finally {
    setLoading(false);
  }
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
          p: 4,
          borderRadius: 3,
          bgcolor: '#2d2d2d',
          color: 'white',
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: '#61dafb' }}>
          Join Interview Session
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            margin="normal"
            required
            sx={{ mb: 3 }}
            InputLabelProps={{ style: { color: '#ccc' } }}
            InputProps={{ style: { color: 'white' } }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              bgcolor: '#61dafb',
              '&:hover': { bgcolor: '#21b4d6' },
            }}
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Join Session'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default JoinSessionPage;