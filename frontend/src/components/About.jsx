import { Container, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// TODO: Add profile image to ../assets/ and uncomment this import
// import ProfileImg from '../assets/profile.jpg';

// Temporary placeholder - Replace with actual import above when image is added
import ProfileImg from '../assets/profile.jpg';

const GradientBorderButton = styled(Button)({
  position: 'relative',
  background: 'transparent',
  color: 'transparent',
  borderRadius: '12px',
  padding: '12px 32px',
  textTransform: 'none',
  fontWeight: 600,
  border: 'none',
  zIndex: 1,
  // Gradient Text
  backgroundImage: 'linear-gradient(to right, #E1FF01, #01F967)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    padding: '2px',
    background: 'linear-gradient(to right, #E1FF01, #01F967)',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    zIndex: -1,
  },
});

const SolidGradientButton = styled(Button)({
  background: 'linear-gradient(to right, #E1FF01, #01F967)',
  color: '#000',
  borderRadius: '12px',
  padding: '12px 32px',
  textTransform: 'none',
  fontWeight: 700,
  '&:hover': {
    background: 'linear-gradient(to right, #E1FF01, #01F967)',
    opacity: 0.9,
  },
});

export default function About() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 12 }, Height: '100%', display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          display: { xs: 'flex', md: 'grid' },
          flexDirection: { xs: 'column' },
          gridTemplateColumns: { md: '1fr 2fr' },
          gap: { xs: 3, md: 4 },
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* Image Side */}
        <Box
          sx={{
            width: '100%',
            aspectRatio: { xs: '3/2', md: '2/3' },
            borderRadius: { xs: '24px', md: '32px' },
            overflow: 'hidden',
          }}
        >
          <img
            src={ProfileImg}
            alt="Profile"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>

        {/* Info Side */}
        <Box
          sx={{ textAlign: 'left' }}
        >
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
            }}
          >
            Design Integrity in the Age of Artificial Synthesis
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.8,
              mb: 4,
            }}
          >
            I'm a computer vision engineer and digital forensics researcher focused on detecting AI-generated imagery. 
            This project uses signal analysis techniques—gradient covariance matrices, eigenvalue decomposition, and 
            compression artifact detection—to distinguish authentic photographs from synthetic media.
            <br /><br />
            Unlike deep learning approaches that require massive datasets, our method analyzes the mathematical 
            fingerprints left by camera sensors versus diffusion models. Every real photo contains microscopic 
            noise patterns (Poisson-Gaussian grain) that AI generators struggle to replicate perfectly.
            <br /><br />
            The goal is transparency: helping users understand when they're viewing authentic content versus 
            algorithmically generated imagery in an era where the line between real and synthetic is increasingly blurred.
          </Typography>

          {/* CTA Buttons */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3,
              width: '100%',
              mt: 4,
            }}
          >
            <GradientBorderButton
              component="a"
              href="https://www.linkedin.com/in/abdulazizbekturdiev"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ flex: 1, width: '100%' }}
            >
              My LinkedIn
            </GradientBorderButton>

            <SolidGradientButton
              component={Link}
              to="/"
              sx={{ flex: 1, width: '100%' }}
            >
              Scan Images
            </SolidGradientButton>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

