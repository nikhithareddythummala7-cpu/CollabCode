import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  TextField,
  FormControlLabel,
  Switch,
  Button,
} from '@mui/material';
import api from '../../services/api';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    defaultTimerDuration: 60,
    registrationEnabled: true,
    supportedLanguages: ['javascript', 'python', 'java'],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setSettings(res.data);
    } catch (err) {
      console.error('Error loading settings', err);
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        supportedLanguages: settings.supportedLanguages.map((lang) => lang.trim()).filter(Boolean),
      };
      await api.put('/admin/settings', payload);
    } catch (err) {
      console.error('Error saving settings', err);
    }
    setSaving(false);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#f8fafc', mb: 2 }}>
        Settings
      </Typography>
      <Typography sx={{ color: '#94a3b8', mb: 4 }}>
        Configure platform defaults and control registration from the admin panel.
      </Typography>

      <Card sx={{ bgcolor: '#111827', borderRadius: 3, boxShadow: 4, maxWidth: 720 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#f8fafc', mb: 2 }}>
            Global Settings
          </Typography>
          <Divider sx={{ borderColor: '#334155', mb: 3 }} />

          <TextField
            fullWidth
            type="number"
            label="Default Timer Duration (minutes)"
            value={settings.defaultTimerDuration}
            onChange={(e) => handleChange('defaultTimerDuration', Number(e.target.value))}
            sx={{
              mb: 3,
              bgcolor: '#0f172a',
              input: { color: '#f8fafc' },
            }}
            InputLabelProps={{ sx: { color: '#94a3b8' } }}
            InputProps={{ sx: { color: '#f8fafc' } }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={Boolean(settings.registrationEnabled)}
                onChange={(e) => handleChange('registrationEnabled', e.target.checked)}
              />
            }
            label="Enable Registration"
            sx={{ color: '#cbd5e1', mb: 3 }}
          />

          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Supported Languages (comma separated)"
            value={settings.supportedLanguages.join(', ')}
            onChange={(e) => handleChange('supportedLanguages', e.target.value.split(','))}
            sx={{
              mb: 3,
              bgcolor: '#0f172a',
              textarea: { color: '#f8fafc' },
              input: { color: '#f8fafc' },
            }}
            InputLabelProps={{ sx: { color: '#94a3b8' } }}
            InputProps={{ sx: { color: '#f8fafc' } }}
          />

          <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminSettings;
