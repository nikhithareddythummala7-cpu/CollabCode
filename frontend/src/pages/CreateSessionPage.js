import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Container,
  CircularProgress,
  Chip,
  Divider,
  FormHelperText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import api from '../services/api';

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return '#10b981';
    case 'medium':
      return '#f59e0b';
    case 'hard':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const CreateSessionPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    duration: 60,
    candidateEmail: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState('');

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Problem title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Problem description is required';
    }

    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.candidateEmail)) {
      newErrors.candidateEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/sessions', {
        problem: {
          title: formData.title,
          description: formData.description,
          difficulty: formData.difficulty,
        },
        timer: {
          duration: parseInt(formData.duration),
        },
        candidateEmail: formData.candidateEmail,
      });

      setRoomId(res.data.roomId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create session');
    }
    setLoading(false);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/join-session?roomId=${roomId}`;
    navigator.clipboard.writeText(link);
  };

  const handleStartSession = () => {
    navigate(`/session/${roomId}`);
  };

  if (roomId) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            textAlign: 'center',
            bgcolor: '#111827',
            border: '1px solid #1f2937',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 35px 60px -12px rgba(0, 0, 0, 0.5)',
            },
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: '#10b981' }} />
          </Box>

          <Typography
            variant="h5"
            sx={{
              mb: 1,
              color: '#f8fafc',
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            Session Created Successfully!
          </Typography>

          <Typography sx={{ color: '#94a3b8', mb: 3 }}>
            Your interview session is ready to begin
          </Typography>

          <Divider sx={{ borderColor: '#1f2937', my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ color: '#cbd5e1', fontSize: '0.9rem', mb: 1, fontWeight: 500 }}>
              Room ID
            </Typography>
            <Chip
              label={roomId}
              sx={{
                bgcolor: '#1f2937',
                color: '#61dafb',
                fontFamily: 'monospace',
                fontWeight: 600,
                fontSize: '0.95rem',
                height: 'auto',
                padding: '8px 12px',
              }}
            />
          </Box>

          <Typography sx={{ color: '#cbd5e1', fontSize: '0.9rem', mb: 2, fontWeight: 500 }}>
            Share this link with your candidate
          </Typography>

          <Paper
            sx={{
              bgcolor: '#0f172a',
              p: 2,
              borderRadius: 2,
              mb: 4,
              border: '1px solid #1f2937',
              wordBreak: 'break-all',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: '#cbd5e1',
              }}
            >
              {`${window.location.origin}/join-session?roomId=${roomId}`}
            </Typography>
          </Paper>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyLink}
                sx={{
                  color: '#61dafb',
                  borderColor: '#61dafb',
                  fontWeight: 600,
                  borderRadius: 2,
                  py: 1.5,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(97, 218, 251, 0.1)',
                    borderColor: '#21b4d6',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(97, 218, 251, 0.2)',
                  },
                }}
              >
                Copy Link
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<PlayArrowIcon />}
                onClick={handleStartSession}
                sx={{
                  bgcolor: '#61dafb',
                  color: '#111827',
                  fontWeight: 600,
                  borderRadius: 2,
                  py: 1.5,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#21b4d6',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 16px 32px rgba(97, 218, 251, 0.4)',
                  },
                }}
              >
                Start Session
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 6 } }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            color: '#61dafb',
            fontWeight: 800,
            mb: 2,
            letterSpacing: 0.5,
          }}
        >
          Create Interview Session
        </Typography>
        <Typography sx={{ color: '#ccc', fontSize: '1.1rem' }}>
          Set up a new coding interview for your candidate
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 6 },
          borderRadius: 3,
          bgcolor: '#111827',
          border: '1px solid #1f2937',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 35px 60px -12px rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 4,
              bgcolor: '#7f1d1d',
              color: '#fca5a5',
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: '#fca5a5',
              },
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Problem Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter coding problem title"
            error={Boolean(errors.title)}
            helperText={errors.title}
            margin="none"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                backgroundColor: '#0f172a',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: '#555',
                },
                '&:hover fieldset': {
                  borderColor: '#777',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#61dafb',
                  boxShadow: '0 0 0 4px rgba(97, 218, 251, 0.15)',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#ccc',
                '&.Mui-focused': {
                  color: '#61dafb',
                },
              },
              '& .MuiFormHelperText-root': {
                color: '#ef4444',
                marginTop: '6px',
              },
            }}
          />

          <TextField
            fullWidth
            label="Problem Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the coding problem"
            error={Boolean(errors.description)}
            helperText={errors.description}
            margin="none"
            required
            multiline
            rows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                backgroundColor: '#0f172a',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: '#555',
                },
                '&:hover fieldset': {
                  borderColor: '#777',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#61dafb',
                  boxShadow: '0 0 0 4px rgba(97, 218, 251, 0.15)',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#ccc',
                '&.Mui-focused': {
                  color: '#61dafb',
                },
              },
              '& .MuiFormHelperText-root': {
                color: '#ef4444',
                marginTop: '6px',
              },
            }}
          />

          <FormControl
            fullWidth
            sx={{ mt: 1 }}
          >
            <InputLabel
              sx={{
                color: '#ccc',
                '&.Mui-focused': {
                  color: '#61dafb',
                },
              }}
            >
              Difficulty Level
            </InputLabel>
            <Select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              label="Difficulty Level"
              sx={{
                color: 'white',
                backgroundColor: '#0f172a',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#555',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#777',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#61dafb',
                  boxShadow: '0 0 0 4px rgba(97, 218, 251, 0.15)',
                },
                '& .MuiSvgIcon-root': {
                  color: '#ccc',
                },
              }}
            >
              <MenuItem value="easy">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: '#10b981',
                    }}
                  />
                  Easy
                </Box>
              </MenuItem>
              <MenuItem value="medium">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: '#f59e0b',
                    }}
                  />
                  Medium
                </Box>
              </MenuItem>
              <MenuItem value="hard">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: '#ef4444',
                    }}
                  />
                  Hard
                </Box>
              </MenuItem>
            </Select>
            <FormHelperText sx={{ color: '#ccc', marginTop: '8px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: getDifficultyColor(formData.difficulty),
                  }}
                />
                {formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1)}
              </Box>
            </FormHelperText>
          </FormControl>

          <TextField
            fullWidth
            label="Duration (minutes)"
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            placeholder="60"
            error={Boolean(errors.duration)}
            helperText={errors.duration || 'Recommended: 30-120 minutes'}
            margin="none"
            required
            inputProps={{ min: 1, max: 480 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                backgroundColor: '#0f172a',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: '#555',
                },
                '&:hover fieldset': {
                  borderColor: '#777',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#61dafb',
                  boxShadow: '0 0 0 4px rgba(97, 218, 251, 0.15)',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#ccc',
                '&.Mui-focused': {
                  color: '#61dafb',
                },
              },
              '& .MuiFormHelperText-root': {
                color: errors.duration ? '#ef4444' : '#ccc',
                marginTop: '6px',
              },
            }}
          />

          <TextField
            fullWidth
            label="Candidate Email"
            name="candidateEmail"
            type="email"
            value={formData.candidateEmail}
            onChange={handleChange}
            placeholder="candidate@example.com"
            error={Boolean(errors.candidateEmail)}
            helperText={errors.candidateEmail}
            margin="none"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                backgroundColor: '#0f172a',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: '#555',
                },
                '&:hover fieldset': {
                  borderColor: '#777',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#61dafb',
                  boxShadow: '0 0 0 4px rgba(97, 218, 251, 0.15)',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#ccc',
                '&.Mui-focused': {
                  color: '#61dafb',
                },
              },
              '& .MuiFormHelperText-root': {
                color: '#ef4444',
                marginTop: '6px',
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#61dafb',
              color: '#111827',
              fontWeight: 700,
              py: 2,
              fontSize: '1.1rem',
              textTransform: 'none',
              borderRadius: 2,
              mt: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#21b4d6',
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 40px rgba(97, 218, 251, 0.4)',
              },
              '&:disabled': {
                bgcolor: '#6b7280',
                color: '#d1d5db',
                transform: 'none',
                boxShadow: 'none',
              },
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={24} sx={{ color: 'inherit' }} />
                Creating Session...
              </Box>
            ) : (
              'Create Session'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateSessionPage;