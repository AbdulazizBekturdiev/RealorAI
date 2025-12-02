import { useState } from 'react';
import { Box, Button, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import ResultCard from './ResultCard';
import FeedbackModal from './FeedbackModal';

const GradientBorderButton = styled(Button)({
  position: 'relative',
  background: 'transparent',
  // Gradient Text Styles
  backgroundImage: 'linear-gradient(to right, #E1FF01, #01F967)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  color: 'transparent',
  borderRadius: '12px',
  padding: '12px 32px',
  textTransform: 'none',
  fontWeight: 700,
  border: 'none',
  zIndex: 1,
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

const GradientButton = styled(Button)({
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

export default function ResultsView({ results = [], onStartOver }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  const handleOpenFeedback = () => {
    // Use the first result for feedback, or allow user to select
    if (results.length > 0) {
      setSelectedResult(results[0]);
      setFeedbackOpen(true);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
          },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {results.map((result, index) => (
          <ResultCard
            key={index}
            result={result.result}
            originalImage={result.originalImage}
            orientation={result.orientation}
          />
        ))}
      </Box>

      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          mx: 'auto',
          mt: 12,
          display: 'flex',
          gap: 3,
        }}
      >
        <GradientBorderButton
          variant="outlined"
          onClick={onStartOver}
          sx={{ flex: 1, width: '50%' }}
        >
          Start Over
        </GradientBorderButton>
        <GradientButton
          variant="contained"
          sx={{ flex: 1, width: '50%' }}
          onClick={handleOpenFeedback}
        >
          Leave Feedback
        </GradientButton>
      </Box>

      {selectedResult && (
        <FeedbackModal
          open={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          file={{ name: selectedResult.result.filename || 'image.jpg' }}
          score={selectedResult.result.trust_score}
          classification={selectedResult.result.classification}
        />
      )}
    </Box>
  );
}

