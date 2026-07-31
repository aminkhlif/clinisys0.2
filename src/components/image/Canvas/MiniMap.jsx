// src/components/image/Canvas/MiniMap.jsx
import { Box, Paper, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';

export default function MiniMap({ urlImage, viewportPosition, viewportSize, imageSize, onNavigate }) {
  if (!urlImage || !imageSize) return null;

  const scale = 150 / Math.max(imageSize.width, imageSize.height);
  const miniWidth = imageSize.width * scale;
  const miniHeight = imageSize.height * scale;

  const viewportX = viewportPosition.x * scale;
  const viewportY = viewportPosition.y * scale;
  const viewportW = viewportSize.width * scale;
  const viewportH = viewportSize.height * scale;

  const handleMiniMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const targetX = (x - viewportW / 2) / scale;
    const targetY = (y - viewportH / 2) / scale;
    
    onNavigate({ x: targetX, y: targetY });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Paper
        variant="outlined"
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          width: 150,
          height: 150,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          zIndex: 50,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          cursor: 'pointer',
        }}
        onClick={handleMiniMapClick}
      >
        <Tooltip title="Mini-map - Cliquez pour naviguer" arrow>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
            }}
          >
            <Box
              component="img"
              src={urlImage}
              alt="Mini-map"
              sx={{
                width: miniWidth,
                height: miniHeight,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                objectFit: 'contain',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: viewportX,
                top: viewportY,
                width: viewportW,
                height: viewportH,
                border: '2px solid',
                borderColor: 'primary.main',
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                pointerEvents: 'none',
              }}
            />
          </Box>
        </Tooltip>
      </Paper>
    </motion.div>
  );
}
