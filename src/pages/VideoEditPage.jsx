// src/pages/VideoEditPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, Stack, Paper, Slider, TextField, IconButton, Divider,
  Card, CardContent, Chip, Grid, Fab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SendIcon from '@mui/icons-material/Send';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import SpeedIcon from '@mui/icons-material/Speed';
import TuneIcon from '@mui/icons-material/Tune';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import DownloadIcon from '@mui/icons-material/Download';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

function VideoEditPage() {
  const { moduleId, sousMenuId } = useParams();
  const navigate = useNavigate();
  
  // États pour la vidéo
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  
  // États pour les outils d'édition
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  // États pour le chatbot
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour ! Je suis votre assistant d'édition vidéo. Comment puis-je vous aider ?", sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  
  // États pour le panneau draggable
  const [chatPosition, setChatPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user'
    };
    
    setMessages([...messages, newMessage]);
    setInputMessage('');
    
    // Placeholder pour la réponse du bot
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: "Je suis un assistant d'édition vidéo. Cette fonctionnalité sera connectée au backend prochainement.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };
  
  const handleExport = () => {
    // Placeholder pour l'export
    console.log('Export vidéo - à connecter au backend');
  };
  
  const handleDragStart = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - chatPosition.x,
      y: e.clientY - chatPosition.y
    });
  };
  
  const handleDrag = (e) => {
    if (!isDragging) return;
    setChatPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, dragOffset]);
  
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/modules/${moduleId}/sous-menus/${sousMenuId}`)}
            sx={{ color: 'text.primary' }}
          >
            Retour
          </Button>
          <Divider orientation="vertical" flexItem />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Édition vidéo
          </Typography>
          <Chip
            size="small"
            label="Vidéo générée"
            color="success"
            sx={{ fontWeight: 500, fontSize: '0.75rem' }}
          />
        </Stack>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          sx={{ height: 36 }}
        >
          Exporter
        </Button>
      </Box>
      
      {/* Zone principale */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Zone vidéo et chatbot */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3, gap: 3 }}>
          {/* Lecteur vidéo */}
          <Paper 
            sx={{ 
              flex: 1,
              bgcolor: 'black',
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <Box sx={{ color: 'white', textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Lecteur vidéo
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                URL vidéo à configurer avec le backend
              </Typography>
            </Box>
            
            {/* Contrôles de lecture (placeholder) */}
            <Box sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'rgba(0,0,0,0.7)',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <IconButton onClick={handleTogglePlay} sx={{ color: 'white' }}>
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <Typography variant="caption" sx={{ color: 'white', minWidth: 80 }}>
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </Typography>
              <Slider
                value={currentTime}
                max={duration}
                onChange={(e, value) => setCurrentTime(value)}
                sx={{ flex: 1, color: 'white' }}
                size="small"
              />
              <VolumeUpIcon sx={{ color: 'white' }} />
              <Slider
                value={volume}
                max={100}
                onChange={(e, value) => setVolume(value)}
                sx={{ width: 80, color: 'white' }}
                size="small"
              />
            </Box>
          </Paper>
        </Box>
        
        {/* Panneau d'outils d'édition (sidebar droite) */}
        <Paper sx={{ 
          width: 320, 
          ml: 3,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            bgcolor: 'grey.50'
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Outils d'édition
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <Stack spacing={3}>
              {/* Coupe/Trim */}
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <ContentCutIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Coupe / Trim
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Sélectionnez les points de début et de fin
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      label="Début"
                      placeholder="00:00"
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                    <TextField
                      size="small"
                      label="Fin"
                      placeholder="00:00"
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Box>
                </CardContent>
              </Card>
              
              {/* Vitesse */}
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <SpeedIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Vitesse de lecture
                    </Typography>
                  </Stack>
                  <Box sx={{ px: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                      {playbackSpeed}x
                    </Typography>
                    <Slider
                      value={playbackSpeed}
                      min={0.25}
                      max={2}
                      step={0.25}
                      onChange={(e, value) => setPlaybackSpeed(value)}
                      marks={[
                        { value: 0.25, label: '0.25x' },
                        { value: 0.5, label: '0.5x' },
                        { value: 1, label: '1x' },
                        { value: 1.5, label: '1.5x' },
                        { value: 2, label: '2x' }
                      ]}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
              
              {/* Filtres visuels */}
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <TuneIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Filtres visuels
                    </Typography>
                  </Stack>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                        Luminosité: {brightness}%
                      </Typography>
                      <Slider
                        value={brightness}
                        min={0}
                        max={200}
                        onChange={(e, value) => setBrightness(value)}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                        Contraste: {contrast}%
                      </Typography>
                      <Slider
                        value={contrast}
                        min={0}
                        max={200}
                        onChange={(e, value) => setContrast(value)}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                        Saturation: {saturation}%
                      </Typography>
                      <Slider
                        value={saturation}
                        min={0}
                        max={200}
                        onChange={(e, value) => setSaturation(value)}
                        size="small"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              
              {/* Texte/Overlays */}
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <TextFieldsIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Texte & Overlays
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Ajoutez du texte et des éléments graphiques
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2, borderRadius: 1.5 }}
                  >
                    Ajouter du texte
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Paper>
      </Box>
      
      {/* Icône flottante du chatbot */}
      {!chatOpen && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000
          }}
          onClick={() => setChatOpen(true)}
        >
          <ChatIcon />
        </Fab>
      )}
      
      {/* Panneau draggable du chatbot */}
      {chatOpen && (
        <Paper
          sx={{
            position: 'fixed',
            left: chatPosition.x,
            top: chatPosition.y,
            width: 350,
            height: 450,
            zIndex: 1000,
            borderRadius: 2,
            boxShadow: 4,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header draggable */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'move',
              userSelect: 'none'
            }}
            onMouseDown={handleDragStart}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Assistant d'édition
            </Typography>
            <IconButton
              size="small"
              sx={{ color: 'white' }}
              onClick={() => setChatOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {/* Zone de messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: 'grey.50' }}>
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'white',
                    color: msg.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    boxShadow: 1,
                    '&:first-of-type': { borderTopLeftRadius: msg.sender === 'user' ? 2 : 4 },
                    '&:last-of-type': { borderBottomRightRadius: msg.sender === 'user' ? 4 : 2 }
                  }}
                >
                  <Typography variant="body2">
                    {msg.text}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
          
          {/* Champ de saisie */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, bgcolor: 'white' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Posez une question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '&:disabled': { bgcolor: 'action.disabled' } }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default VideoEditPage;
