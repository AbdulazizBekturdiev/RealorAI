import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Button, Typography, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import ImageDefaultIcon from '../assets/image_default.svg';

const GradientButton = styled(Button)({
  background: 'linear-gradient(to right, #E1FF01, #01F967)',
  color: '#000',
  fontWeight: 700,
  padding: '12px 32px',
  borderRadius: '12px',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(to right, #E1FF01, #01F967)',
    opacity: 0.9,
  },
});

export default function UploadZone({ onFileSelect }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isHovered, setIsHovered] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    multiple: true,
  });

  const isActive = isDragActive || isHovered;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: isMobile ? '100%' : '1200px',
        margin: '0 auto',
        px: isMobile ? 2 : 0,
      }}
    >
      <Box
        {...getRootProps()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={isActive ? 'drag-active' : ''}
        sx={{
          position: 'relative',
          borderRadius: '32px',
          backgroundColor: 'transparent',
          transition: 'all 0.3s ease',
          padding: theme.spacing(4),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '450px',
          cursor: 'pointer',
          '&:hover .idle-border, &.drag-active .idle-border': {
            opacity: 0,
          },
          '&:hover, &.drag-active': {
            border: '2px solid transparent',
            backgroundImage: `linear-gradient(#101D13, #101D13), linear-gradient(to right, #E1FF01, #01F967)`,
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
          },
        }}
      >
        {/* Custom Dashed Border SVG for Idle State */}
        <svg
          className="idle-border"
          width="100%"
          height="100%"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
          }}
        >
          <rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            rx="32"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
            strokeDasharray="8 8"
          />
        </svg>

        <input {...getInputProps()} />
        <Box
          component="img"
          src={ImageDefaultIcon}
          alt="Upload Placeholder"
          sx={{
            height: '120px',
            width: 'auto',
            mb: { xs: 2, md: 3 },
          }}
        />
        <GradientButton variant="contained" size="large">
          {isDragActive ? 'Drop files now' : 'Upload Image'}
        </GradientButton>
        {!isDragActive && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.disabled',
              }}
            >
              or drag & drop images
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '12px',
                mt: 0.5,
              }}
            >
              (Max 4 images per scan)
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

