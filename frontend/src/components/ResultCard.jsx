import { useState } from 'react';
import { Box, Typography, Switch, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { STATUS_CONFIG } from '../utils/statusDefinitions';

const CardContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '32px',
  overflow: 'hidden',
}));

const ImageWrapper = styled(Box)(({ theme, orientation }) => ({
  position: 'relative',
  width: '100%',
  aspectRatio: orientation === 'landscape' ? '3/2' : '2/3',
  borderRadius: '32px',
  overflow: 'hidden',
  marginBottom: '24px',
}));

const ImageLayer = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
  inset: 0,
});

const TopOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 2,
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

const BottomOverlay = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  background: 'transparent',
  padding: 0,
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(2),
  zIndex: 2,
}));

const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 48,
  height: 28,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: '#101D13',
      '& + .MuiSwitch-track': {
        background: 'linear-gradient(to right, #E1FF01, #01F967)',
        opacity: 1,
        border: 0,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 24,
    height: 24,
    boxShadow: 'none',
    backgroundColor: '#101D13',
  },
  '& .MuiSwitch-switchBase:not(.Mui-checked) .MuiSwitch-thumb': {
    background: 'linear-gradient(to right, #E1FF01, #01F967)',
  },
  '& .MuiSwitch-track': {
    borderRadius: 14,
    backgroundColor: '#101D13',
    opacity: 1,
  },
}));

const ProgressCircle = ({ size, progress, status, classification }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const gradientId = `grad-${classification || 'default'}`;

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={status?.gradientStart || '#E1FF01'} />
            <stop offset="100%" stopColor={status?.gradientEnd || '#01F967'} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: size === 80 ? '18px' : '16px',
          color: '#FFFFFF',
        }}
      >
        {Math.round(progress)}%
      </Box>
    </Box>
  );
};

export default function ResultCard({ result, originalImage, orientation = 'landscape' }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showComputerVision, setShowComputerVision] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const imageSrc = showComputerVision
    ? `data:image/png;base64,${result.gradient_image}`
    : originalImage;

  const circleSize = isMobile ? 60 : 80;
  
  const classification = result.classification || 'authentic_capture';
  const statusConfig = STATUS_CONFIG[classification] || STATUS_CONFIG['authentic_capture'];

  return (
    <CardContainer orientation={orientation}>
      <ImageWrapper orientation={orientation}>
        <ImageLayer src={imageSrc} alt={showComputerVision ? 'Gradient visualization' : 'Original image'} />
        
        <TopOverlay>
          <Typography
            sx={{
              fontSize: '14px',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {showComputerVision ? 'This is what computer sees' : result.filename || 'Image'}
          </Typography>
          <CustomSwitch
            checked={showComputerVision}
            onChange={(e) => setShowComputerVision(e.target.checked)}
          />
        </TopOverlay>
      </ImageWrapper>

      <BottomOverlay>
        <ProgressCircle size={circleSize} progress={result.trust_score || 0} status={statusConfig} classification={classification} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography
            sx={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              mb: 0.5,
            }}
          >
            {statusConfig?.label || result.status || 'Unknown'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: '13px',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: 'Inter, sans-serif',
              mb: 1,
            }}
          >
            {statusConfig?.human_desc || 'No description available'}
          </Typography>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    mb: 1,
                    fontSize: '13px',
                    fontWeight: 400,
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.5,
                  }}
                >
                  {statusConfig?.tech_desc || 'Technical analysis data not available for this classification.'}
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
          <Typography
            component="button"
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
            sx={{
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              backgroundImage: 'linear-gradient(to right, #E1FF01, #01F967)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textDecoration: 'underline',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: 'transparent',
              padding: 0,
              textAlign: 'left',
              '&:hover': {
                backgroundImage: 'linear-gradient(to right, #E1FF01, #01F967)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              },
            }}
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </Typography>
        </Box>
      </BottomOverlay>
    </CardContainer>
  );
}

