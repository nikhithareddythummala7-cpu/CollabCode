import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Divider } from '@mui/material';
import api from '../../services/api';

const statCards = [
  { key: 'totalUsers', label: 'Total Users' },
  { key: 'totalInterviewers', label: 'Interviewers' },
  { key: 'totalCandidates', label: 'Candidates' },
  { key: 'totalSessions', label: 'Total Sessions' },
  { key: 'activeSessions', label: 'Active Sessions' },
  { key: 'completedSessions', label: 'Completed Sessions' },
];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error loading analytics', err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#f8fafc', mb: 2 }}>
        Platform Overview
      </Typography>
      <Typography sx={{ color: '#94a3b8', mb: 4 }}>
        Manage users, review live sessions, and monitor platform performance.
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.key}>
            <Card sx={{ bgcolor: '#111827', color: '#e2e8f0', borderRadius: 3, boxShadow: 4 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#94a3b8' }}>
                  {card.label}
                </Typography>
                <Typography variant="h4" sx={{ color: '#f8fafc' }}>
                  {analytics[card.key] ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 4, bgcolor: '#111827', borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#f8fafc', mb: 2 }}>
            Summary
          </Typography>
          <Divider sx={{ borderColor: '#334155', mb: 2 }} />
          <Typography sx={{ color: '#cbd5e1' }}>
            Use the admin menu to manage users, sessions, analytics, and global settings. All admin actions are secured with role-based access.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
