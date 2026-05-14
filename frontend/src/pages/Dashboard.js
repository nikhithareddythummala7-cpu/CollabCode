import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Container,
  Paper,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'waiting':
      return 'warning';
    case 'completed':
      return 'default';
    default:
      return 'default';
  }
};

const ActionCard = ({ title, description, onClick, icon: Icon }) => (
  <Card
    sx={{
      bgcolor: '#111827',
      borderRadius: 2,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid #1f2937',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 12px 24px rgba(97, 218, 251, 0.15)',
        borderColor: '#61dafb',
        transform: 'translateY(-2px)',
      },
    }}
  >
    <CardContent sx={{ textAlign: 'center', p: 3 }}>
      {Icon && <Icon sx={{ fontSize: 40, color: '#61dafb', mb: 2 }} />}
      <Typography variant="h6" sx={{ mb: 1, color: '#f8fafc', fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography sx={{ mb: 3, color: '#cbd5e1', fontSize: '0.95rem' }}>
        {description}
      </Typography>
      <Button
        variant="contained"
        fullWidth
        onClick={onClick}
        sx={{
          bgcolor: '#61dafb',
          color: '#111827',
          fontWeight: 600,
          '&:hover': { bgcolor: '#21b4d6' },
        }}
      >
        {title}
      </Button>
    </CardContent>
  </Card>
);

const SessionCard = ({ session, isCandidate, onView, onJoin }) => (
  <Card
    sx={{
      bgcolor: '#111827',
      borderRadius: 2,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid #1f2937',
      transition: 'all 0.3s ease',
      mb: 2,
      '&:hover': {
        boxShadow: '0 8px 24px rgba(97, 218, 251, 0.1)',
        borderColor: '#61dafb',
      },
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 600, mb: 1 }}>
            {session.problem.title}
          </Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', mb: 2 }}>
            {formatDate(session.createdAt)}
          </Typography>
        </Box>
        <Chip
          label={session.status}
          color={getStatusColor(session.status)}
          size="small"
          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
        />
      </Box>

      <Divider sx={{ borderColor: '#1f2937', my: 2 }} />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} md={3}>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mb: 0.5 }}>
            Interviewer
          </Typography>
          <Typography sx={{ color: '#cbd5e1', fontWeight: 500 }}>
            {session.interviewer?.name || 'Unknown'}
          </Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mb: 0.5 }}>
            {isCandidate ? 'Candidate' : 'Candidate'}
          </Typography>
          <Typography sx={{ color: '#cbd5e1', fontWeight: 500 }}>
            {isCandidate ? (session.candidate ? session.candidate.name : 'Waiting to join') : (session.candidate?.name || session.candidateEmail || 'Not Joined Yet')}
          </Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mb: 0.5 }}>
            Difficulty
          </Typography>
          <Typography sx={{ color: '#cbd5e1', fontWeight: 500, textTransform: 'capitalize' }}>
            {session.problem.difficulty}
          </Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mb: 0.5 }}>
            Duration
          </Typography>
          <Typography sx={{ color: '#cbd5e1', fontWeight: 500 }}>
            {session.timer.duration}m
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ borderColor: '#1f2937', my: 2 }} />

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        {isCandidate ? (
          <>
            {!session.candidate ? (
              <Button
                variant="contained"
                size="small"
                startIcon={<LoginIcon />}
                sx={{
                  bgcolor: '#61dafb',
                  color: '#111827',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#21b4d6' },
                }}
                onClick={() => onJoin(session.roomId)}
              >
                Join Now
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                startIcon={<PlayArrowIcon />}
                sx={{
                  bgcolor: '#10b981',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#059669' },
                }}
                onClick={() => onView(session.roomId)}
              >
                Open Room
              </Button>
            )}
          </>
        ) : (
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayArrowIcon />}
            sx={{
              bgcolor: session.status === 'active' ? '#10b981' : '#6b7280',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                bgcolor: session.status === 'active' ? '#059669' : '#4b5563',
              },
            }}
            onClick={() => onView(session.roomId)}
          >
            View
          </Button>
        )}
      </Box>
    </CardContent>
  </Card>
);

const EmptyState = ({ icon: Icon, title, description }) => (
  <Paper
    sx={{
      bgcolor: '#111827',
      border: '2px dashed #1f2937',
      borderRadius: 2,
      p: 6,
      textAlign: 'center',
    }}
  >
    {Icon && <Icon sx={{ fontSize: 64, color: '#61dafb', mb: 2, opacity: 0.5 }} />}
    <Typography variant="h6" sx={{ color: '#cbd5e1', mb: 1, fontWeight: 600 }}>
      {title}
    </Typography>
    <Typography sx={{ color: '#94a3b8' }}>{description}</Typography>
  </Paper>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const handleCreateSession = () => {
    navigate('/create-session');
  };

  const handleJoinSession = () => {
    navigate('/join-session');
  };

  const handleJoinSessionById = async (roomId) => {
    try {
      await api.put(`/sessions/${roomId}/join`);
      navigate(`/session/${roomId}`);
    } catch (err) {
      console.error('Error joining session:', err);
      alert(err.response?.data?.message || 'Failed to join session');
    }
  };

  const handleViewSession = (roomId) => {
    navigate(`/session/${roomId}`);
  };

  const isInterviewer = user?.role === 'interviewer';
  const isCandidate = user?.role === 'candidate';

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh', bgcolor: '#0f172a' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#f8fafc', fontWeight: 700, mb: 1 }}>
          {isCandidate ? 'Your Interview Sessions' : 'Interview Dashboard'}
        </Typography>
        <Typography sx={{ color: '#94a3b8' }}>
          {isCandidate
            ? 'View and manage your assigned coding interviews'
            : 'Create, manage, and review your coding interview sessions'}
        </Typography>
      </Box>

      {/* Action Cards for Interviewers */}
      {isInterviewer && (
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={4}>
            <ActionCard
              title="Create Interview"
              description="Start a new coding interview session"
              onClick={handleCreateSession}
              icon={AddIcon}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ActionCard
              title="Join Interview"
              description="Join an existing interview session"
              onClick={handleJoinSession}
              icon={LoginIcon}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                bgcolor: '#111827',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #1f2937',
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#61dafb', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, color: '#f8fafc', fontWeight: 600 }}>
                  Session History
                </Typography>
                <Typography sx={{ mb: 3, color: '#cbd5e1', fontSize: '0.95rem' }}>
                  View your session statistics
                </Typography>
                <Typography variant="h4" sx={{ color: '#61dafb', fontWeight: 700 }}>
                  {sessions.length}
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', mt: 1 }}>
                  Total Sessions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Sessions List */}
      <Box>
        <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 600, mb: 3 }}>
          {isCandidate ? 'Your Assigned Interviews' : 'Recent Sessions'}
        </Typography>

        {sessions.length === 0 ? (
          <EmptyState
            icon={CheckCircleIcon}
            title={isCandidate ? 'No interviews assigned' : 'No sessions created yet'}
            description={
              isCandidate
                ? 'You will see interview sessions here once interviewers assign them to you'
                : 'Create your first coding interview session to get started'
            }
          />
        ) : (
          <Grid container spacing={0}>
            {(isCandidate ? sessions : sessions.slice(0, 10)).map((session) => (
              <Grid item xs={12} key={session._id}>
                <SessionCard
                  session={session}
                  isCandidate={isCandidate}
                  onView={handleViewSession}
                  onJoin={handleJoinSessionById}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};;

export default Dashboard;