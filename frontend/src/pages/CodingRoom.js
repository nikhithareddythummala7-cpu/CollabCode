import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Send, PlayArrow, Code } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import socket from '../socket/socket';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

const CodingRoom = () => {
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const [session, setSession] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const messagesEndRef = useRef(null);

  

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/sessions/${roomId}`);
        setSession(res.data);
        setCode(res.data.code || '');
        setLanguage(res.data.language || 'javascript');
        setMessages(res.data.messages || []);
        setIsSubmitted(res.data.status === 'completed');

        if (res.data.status === 'active' && res.data.timer?.endedAt) {
          const endsAt = new Date(res.data.timer.endedAt).getTime();
          const now = Date.now();
          const remainingSeconds = Math.max(0, Math.floor((endsAt - now) / 1000));
          setTimeLeft(remainingSeconds);
        } else {
          setTimeLeft(0);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      }
    };

    const handleSessionUpdate = (data) => {
      if (data.roomId === roomId) {
        setSession(data);
        setIsSubmitted(data.status === 'completed');

        if (data.status === 'active' && data.timer?.endedAt) {
          const endsAt = new Date(data.timer.endedAt).getTime();
          const now = Date.now();
          const remainingSeconds = Math.max(0, Math.floor((endsAt - now) / 1000));
          setTimeLeft(remainingSeconds);
        } else {
          setTimeLeft(0);
        }
      }
    };

    const handleConnect = () => {
      socket.emit('join_room', roomId);
    };

    const handleCodeUpdate = (data) => {
      if (data.roomId === roomId) {
        setCode(data.code);
      }
    };

    const handleReceiveMessage = (data) => {
      if (data.roomId !== roomId) return;

      setMessages((prev) => {
        if (data._id && prev.some((msg) => msg._id?.toString() === data._id.toString())) {
          return prev;
        }
        return [...prev, data];
      });
    };

    fetchSession();

    socket.on('connect', handleConnect);
    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    socket.on('code_update', handleCodeUpdate);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('session_updated', handleSessionUpdate);
    socket.on('code_output', (data) => {
      if (data.error) {
        setCodeOutput(`Error: ${data.error}`);
      } else {
        setCodeOutput(data.output || 'Code executed successfully');
      }
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('code_update', handleCodeUpdate);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('session_updated', handleSessionUpdate);
      socket.off('code_output');
      socket.emit('leave_room', roomId);
    };
  }, [roomId]);

  // Local timer countdown
  useEffect(() => {
    if (session?.status !== 'active' || !session?.timer?.endedAt) return;

const interval = setInterval(() => {
  const endsAt = new Date(session.timer.endedAt).getTime();
  const now = Date.now();
  const remainingSeconds = Math.max(0, Math.floor((endsAt - now) / 1000));
  setTimeLeft(remainingSeconds);
}, 1000);

    return () => clearInterval(interval);
  }, [session?.status, session?.endsAt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCodeChange = (value) => {
    if (session?.status === 'completed' || isSubmitted) {
      return;
    }

    setCode(value);
    socket.emit('code_change', { roomId, code: value, language });
    api.put(`/sessions/${roomId}/code`, { code: value, language });
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const senderId = user._id || user.id;
      const messageData = {
        roomId,
        sender: senderId,
        content: newMessage,
        timestamp: new Date(),
      };

      socket.emit('send_message', messageData);
      setNewMessage('');
    }
  };

  const handleRunCode = () => {
    if (!code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setCodeOutput('Executing code...');
    socket.emit('run_code', { code, language, roomId });
  };

  const handleSubmit = async () => {
    if (isSubmitted) {
      alert('Code already submitted!');
      return;
    }

    try {
      const res = await api.post("/sessions/submit", {
        roomId: session.roomId,
        code,
        language
      });

      alert("Code submitted successfully!");
      setIsSubmitted(true);
      setSession(prev => ({ ...prev, status: 'completed' }));

    } catch (err) {
      console.error(err);
      alert("Submission failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socket.emit('code_change', { roomId, code, language: newLang });
    api.put(`/sessions/${roomId}/code`, { code, language: newLang });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#1e1e1e' }}>
      {/* Top Bar */}
      <Box sx={{ p: 2, bgcolor: '#2d2d2d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ color: '#61dafb' }}>
          Room: {roomId}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {session?.status === 'active' && session?.endsAt ? (
            <Typography sx={{ color: '#61dafb' }}>
              Time: {formatTime(timeLeft)}
            </Typography>
          ) : session?.status === 'completed' ? (
            <Typography sx={{ color: '#4caf50' }}>
              Session Completed
            </Typography>
          ) : (
            <Typography sx={{ color: '#ccc' }}>
              {session?.status === 'waiting' ? 'Waiting for candidate to join...' : 'Session not started'}
            </Typography>
          )}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: '#ccc' }}>Language</InputLabel>
            <Select
              value={language}
              onChange={handleLanguageChange}
              label="Language"
              disabled={session.status === 'completed' || isSubmitted}
              sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' } }}
            >
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="python">Python</MenuItem>
              <MenuItem value="java">Java</MenuItem>
              <MenuItem value="cpp">C++</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={handleRunCode}
            disabled={session.status === 'completed' || isSubmitted}
            sx={{ bgcolor: '#61dafb', '&:hover': { bgcolor: '#21b4d6' } }}
          >
            Run Code
          </Button>
          <Button
            variant="contained"
            startIcon={<Code />}
            onClick={handleSubmit}
            disabled={session.status === 'completed' || isSubmitted}
            sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}
          >
            Submit
          </Button>
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex' }}>
        {/* Left Panel - Problem */}
        <Box sx={{ width: '30%', p: 2, borderRight: '1px solid #444' }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#61dafb' }}>
            {session.problem.title}
          </Typography>
          <Typography sx={{ mb: 2, color: '#ccc' }}>
            Difficulty: <Chip label={session.problem.difficulty} size="small" />
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap', color: '#e5e7eb' }}>
            {session.problem.description}
          </Typography>
        </Box>

        {/* Center - Editor */}
        <Box sx={{ flex: 1, p: 2 }}>
          <Editor
            height="70%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              readOnly: session.status === 'completed' || isSubmitted,
            }}
          />
          {/* Code Output */}
          <Box sx={{ mt: 2, height: '25%', bgcolor: '#1e1e1e', border: '1px solid #444', borderRadius: 1, p: 1 }}>
            <Typography variant="subtitle2" sx={{ color: '#61dafb', mb: 1 }}>
              Output
            </Typography>
            <Typography sx={{ color: 'white', fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
              {codeOutput}
            </Typography>
          </Box>
        </Box>

        {/* Right Panel - Chat & Participants */}
        <Box sx={{ width: '25%', display: 'flex', flexDirection: 'column' }}>
          {/* Participants */}
          <Box sx={{ p: 2, borderBottom: '1px solid #444' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#61dafb' }}>
              Participants
            </Typography>
            <List dense>
              <ListItem>
                <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                  {session.interviewer?.name[0]}
                </Avatar>
                <ListItemText
                  primary={session.interviewer?.name}
                  secondary="Interviewer"
                  primaryTypographyProps={{ sx: { color: '#ffffff' } }}
                  secondaryTypographyProps={{ sx: { color: '#94a3b8' } }}
                />
              </ListItem>
              {session.candidate && (
                <ListItem>
                  <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                    {session.candidate.name[0]}
                  </Avatar>
                  <ListItemText
                    primary={session.candidate.name}
                    secondary="Candidate"
                    primaryTypographyProps={{ sx: { color: '#ffffff' } }}
                    secondaryTypographyProps={{ sx: { color: '#94a3b8' } }}
                  />
                </ListItem>
              )}
            </List>
          </Box>

          {/* Chat */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ p: 2, color: '#61dafb' }}>
              Chat
            </Typography>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
              <List dense>
                {messages.map((msg, index) => (
                  <ListItem key={index} sx={{ px: 1 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ color: '#61dafb', fontWeight: 'bold' }}>
                          {msg.sender?._id
                            ? msg.sender._id.toString() === user._id?.toString()
                              ? 'You'
                              : msg.sender.name || 'Other'
                            : msg.sender?.toString() === user._id?.toString()
                              ? 'You'
                              : msg.sender?.name || 'Other'}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ color: 'white' }}>
                          {msg.content}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <div ref={messagesEndRef} />
            </Box>
            <Box sx={{ p: 1, display: 'flex' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: '#ccc' },
                    '&:hover fieldset': { borderColor: '#61dafb' },
                  },
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                sx={{ color: '#61dafb', ml: 1 }}
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CodingRoom;