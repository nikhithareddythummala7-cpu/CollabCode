import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
} from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import api from '../../services/api';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({ sessionsPerDay: [], userGrowth: [] });

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
        Analytics
      </Typography>
      <Typography sx={{ color: '#94a3b8', mb: 4 }}>
        Visualize platform growth, active sessions, and user behavior over time.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#111827', borderRadius: 3, boxShadow: 4, minHeight: 420 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#f8fafc', mb: 2 }}>
                Sessions Per Day
              </Typography>
              <Divider sx={{ borderColor: '#334155', mb: 2 }} />
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={analytics.sessionsPerDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="_id" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#111827', borderRadius: 3, boxShadow: 4, minHeight: 420 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#f8fafc', mb: 2 }}>
                User Growth
              </Typography>
              <Divider sx={{ borderColor: '#334155', mb: 2 }} />
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analytics.userGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="_id" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                  <Legend />
                  <Bar dataKey="count" fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminAnalytics;
