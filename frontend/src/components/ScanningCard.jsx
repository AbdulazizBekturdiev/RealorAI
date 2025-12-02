import { Box, Typography, LinearProgress, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';

const CardContainer = styled(Box)(({ theme, orientation }) => ({
  width: '100%',
  height: 'auto',
  aspectRatio: orientation === 'landscape' ? '3/2' : '2/3',
  minHeight: '300px',
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  borderRadius: '32px',
  padding: theme.spacing(3), // 24px on mobile
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4), // Optional centered padding on desktop
  },
}));

const ProgressTrack = styled(Box)(({ theme, isMobile }) => ({
  width: isMobile ? '100%' : '300px',
  height: '4px',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  borderRadius: '2px',
  overflow: 'hidden',
  position: 'relative',
}));

const ProgressFill = styled(Box)(({ progress }) => ({
  width: `${progress}%`,
  height: '100%',
  background: 'linear-gradient(to right, #E1FF01, #01F967)',
  transition: 'width 0.3s ease',
}));

export default function ScanningCard({ orientation = 'landscape', progress = 0 }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <CardContainer orientation={orientation}>
      <ProgressTrack isMobile={isMobile}>
        <ProgressFill progress={progress} />
      </ProgressTrack>
      <Typography
        variant="body2"
        sx={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)',
          mt: 2,
          textAlign: 'center',
        }}
      >
        Scanning... {Math.round(progress)}%
      </Typography>
    </CardContainer>
  );
}

