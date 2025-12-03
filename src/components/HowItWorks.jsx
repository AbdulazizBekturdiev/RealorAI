import { Container, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

// Import images from assets folder
import Step1Img from '../assets/step-1.jpg';
import Step2Img from '../assets/step-2.jpg';
import Step3Img from '../assets/step-3.jpg';

const STEPS = [
  {
    title: 'Luminance & Noise Extraction',
    body: 'We strip away color to analyze the raw pixel **luminance** (light intensity). This exposes the underlying digital noise patterns and sensor grain that Generative AI models (like **Midjourney** or **DALL-E**) struggle to replicate perfectly.',
    image: Step1Img,
  },
  {
    title: 'Gradient Field Analysis',
    body: 'Using **Sobel operators**, we calculate the rate of change between pixels. AI-generated images often contain "mathematically perfect" transitions or unnatural edge smoothness that differ significantly from the organic optics of a real camera lens.',
    image: Step2Img,
  },
  {
    title: 'Covariance & Classification',
    body: 'We map pixel relationships into a **Covariance Matrix** to detect statistical anomalies. By analyzing the **Eigenvalues**, our algorithm identifies the rigid, artificial correlations typical of Diffusion models and GANs, flagging them as synthetic.',
    image: Step3Img,
  },
];

const renderBody = (text) => {
  const parts = text.split('**');
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <Box component="span" key={index} sx={{ color: 'white', fontWeight: 700 }}>
        {part}
      </Box>
    ) : (
      part
    )
  );
};

export default function HowItWorks() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 8, md: 12 }}}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            color: 'text.primary',
            textAlign: 'center',
            mb: 2,
            fontWeight: 700,
          }}
        >
          How Our AI Forensics Engine Works
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            maxWidth: '600px',
            mx: 'auto',
            mb: 4,
          }}
        >
          We look beyond the pixels using advanced Computer Vision and
          Gradient Analysis to detect Generative AI artifacts.
        </Typography>
      </motion.div>

      {/* Steps Loop (Zig-Zag Layout) */}
      {STEPS.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: {
                xs: 'column',
                md: index % 2 === 0 ? 'row' : 'row-reverse',
              },
              alignItems: 'center',
              gap: { xs: 2, md: 3 }, // Responsive Gap
              mb: { xs: 4, sm: 6, md: 8 }, // Responsive Margin Bottom
            }}
          >
            {/* Image Side */}
            <Box
              sx={{
                width: { xs: '100%', md: '35%' },
                aspectRatio: '3/2',
                borderRadius: { xs: '24px', md: '32px' },
                overflow: 'hidden',
                flexShrink: 0,
                '& img': {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                },
              }}
            >
              <img src={step.image} alt={step.title} />
            </Box>

            {/* Text Side */}
            <Box
              sx={{
                width: { xs: '100%', md: 'calc(65% - 24px)' },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  mb: 2,
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                {step.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.7,
                  fontSize: { xs: '0.95rem', md: '1rem' },
                }}
              >
                {renderBody(step.body)}
              </Typography>
            </Box>
          </Box>
        </motion.div>
      ))}
    </Container>
  );
}

