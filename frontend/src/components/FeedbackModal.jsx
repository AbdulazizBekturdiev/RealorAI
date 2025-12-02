import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Switch,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import ThumbsUpDefault from '../assets/thumb-up.svg';
import ThumbsUpActive from '../assets/thumb-up-selected.svg';
import ThumbsDownDefault from '../assets/thumb-down.svg';
import ThumbsDownActive from '../assets/thumb-down-selected.svg';
import SuccessIcon from '../assets/feedback-success.svg';

// Shared Brand Gradient
const brandGradient = 'linear-gradient(to right, #E1FF01, #01F967)';

// Gradient Close Icon Component
const GradientCloseIcon = () => {
  const gradientId = `closeGradient-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E1FF01" />
          <stop offset="100%" stopColor="#01F967" />
        </linearGradient>
      </defs>
      <path
        d="M18 6L6 18M6 6L18 18"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};









const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: 'white',
    borderRadius: '12px',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#01F967',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiInputBase-input': {
    color: 'white',
  },
});


const VerdictButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'selected',
})(({ selected }) => ({
  flex: 1,
  padding: '20px',
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '16px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '12px',
  border: selected
    ? '2px solid #01F967'
    : '1px solid rgba(255,255,255,0.2)',
  backgroundColor: selected ? 'rgba(1, 249, 103, 0.1)' : 'transparent',
  color: 'transparent', // Remove default color, handled by Typography
  '&:hover': {
    backgroundColor: selected ? 'rgba(1, 249, 103, 0.15)' : 'rgba(255, 255, 255, 0.05)',
    borderColor: selected ? '#01F967' : 'rgba(255, 255, 255, 0.3)',
  },
  '& .MuiButton-startIcon': {
    margin: 0,
    '& > *:nth-of-type(1)': {
      display: 'block', // Ensure icon has display block to avoid baseline shifts
    },
  },
}));

const GradientSwitch = styled(Switch)(({ checked }) => ({
  width: 58, // Wider track
  height: 32, // Taller track
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(26px)',
      color: '#152218', // Dark thumb when ON
      '& + .MuiSwitch-track': {
        background: brandGradient, // Gradient track when ON
        opacity: 1,
        border: 0,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 28,
    height: 28,
    // Thumb is Gradient when OFF, Dark when ON
    background: checked ? '#152218' : brandGradient,
  },
  '& .MuiSwitch-track': {
    borderRadius: 32 / 2,
    backgroundColor: '#152218', // Dark track base
    opacity: 1,
    transition: 'all 0.3s ease',
    // Border logic for OFF state if needed, or just dark track
    border: '1px solid rgba(255,255,255,0.1)',
  },
}));

const GradientSubmitButton = styled(Button)({
  background: brandGradient,
  color: '#101D13 !important', // Force dark text color
  borderRadius: '12px',
  padding: '14px 32px',
  textTransform: 'none',
  fontWeight: 700,
  width: '100%',
  fontSize: '16px',
  '&:hover': {
    background: brandGradient,
    opacity: 0.9,
    color: '#101D13 !important', // Maintain dark text on hover
  },
  '&:disabled': {
    color: '#101D13 !important', // Maintain dark text when disabled
    opacity: 0.5,
  },
});

export default function FeedbackModal({ open, onClose, file, score, classification }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [verdict, setVerdict] = useState(null);
  const [actualCategory, setActualCategory] = useState('');
  const [comments, setComments] = useState('');
  const [contributeData, setContributeData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (verdict === 'incorrect' && !actualCategory) return;
    
    setLoading(true);

    try {
      const feedbackData = {
        filename: file?.name || 'unknown.jpg',
        ai_score: score,
        user_verdict: verdict,
        actual_category: verdict === 'incorrect' ? actualCategory : null,
        comments: comments || null,
        contribute_data: contributeData,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('http://localhost:8001/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        setSuccess(true);
        // Auto-close after 8 seconds
        setTimeout(() => {
          handleCloseModal();
        }, 8000);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('Failed to submit feedback. Please try again.');
      setLoading(false);
    }
  };

  const resetModal = () => {
    setVerdict(null);
    setActualCategory('');
    setComments('');
    setContributeData(true);
    setLoading(false);
    setSuccess(false);
  };

  const handleCloseModal = () => {
    // Allow closing if not loading, or if success (for auto-close after submission)
    if (!loading || success) {
      onClose();
      resetModal();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          backgroundColor: '#101D13',
          backgroundImage: 'none',
          borderRadius: isMobile ? 0 : '32px',
          maxWidth: isMobile ? '100vw' : '600px',
          width: isMobile ? '100vw' : '600px',
          height: isMobile ? '100vh' : 'auto',
          margin: isMobile ? 0 : 'auto',
          maxHeight: isMobile ? '100vh' : '90vh',
        },
      }}
    >
      <DialogContent
        sx={{
          p: { xs: 3, sm: 4 },
          '&.MuiDialogContent-root': {
            paddingTop: { xs: 3, sm: 4 },
          },
        }}
      >
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '32px 0',
              }}
            >
              <img src={SuccessIcon} alt="Success" style={{ height: 160, mb: 2 }} />
              <Typography
                variant="h5"
                sx={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                Feedback Sent
              </Typography>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.7)',
                  textAlign: 'center',
                }}
              >
                We've logged your response. Returning to scanner...
              </Typography>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 4,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Accuracy Check
                </Typography>
                <IconButton
                  onClick={handleCloseModal}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <GradientCloseIcon />
                </IconButton>
              </Box>

              {/* Section 1: Verdict Selection */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '16px',
                    color: 'text.secondary',
                    mb: 2,
                  }}
                >
                  Do you agree with this result?
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <VerdictButton
                    selected={verdict === 'correct'}
                    onClick={() => setVerdict('correct')}
                    startIcon={
                      <Box
                        component="img"
                        src={verdict === 'correct' ? ThumbsUpActive : ThumbsUpDefault}
                        alt="Thumbs Up"
                        sx={{ width: 24, height: 24 }}
                      />
                    }
                  >
                    <Typography
                      sx={{
                        ...(verdict === 'correct' && {
                          background: brandGradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontWeight: 700,
                        }),
                        ...(verdict !== 'correct' && {
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 500,
                        }),
                      }}
                    >
                      Accurate
                    </Typography>
                  </VerdictButton>
                  <VerdictButton
                    selected={verdict === 'incorrect'}
                    onClick={() => setVerdict('incorrect')}
                    startIcon={
                      <Box
                        component="img"
                        src={verdict === 'incorrect' ? ThumbsDownActive : ThumbsDownDefault}
                        alt="Thumbs Down"
                        sx={{ width: 24, height: 24, display: 'block' }}
                      />
                    }
                  >
                    <Typography
                      sx={{
                        ...(verdict === 'incorrect' && {
                          background: brandGradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontWeight: 700,
                        }),
                        ...(verdict !== 'incorrect' && {
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 500,
                        }),
                      }}
                    >
                      Wrong
                    </Typography>
                  </VerdictButton>
                </Box>

                {/* Section 2: Detailed Feedback (Conditional) */}
                <AnimatePresence>
                  {verdict === 'incorrect' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <FormControl component="fieldset" sx={{ width: '100%', mt: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '16px',
                            color: 'text.secondary',
                            mb: { xs: 1, md: 1 },
                          }}
                        >
                          What is this image actually?
                        </Typography>
                        <RadioGroup
                          value={actualCategory}
                          onChange={(e) => setActualCategory(e.target.value)}
                          sx={{ gap: 1 }}
                        >
                          <FormControlLabel
                            value="real"
                            control={
                              <Radio
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.2)',
                                  marginLeft: '12px',
                                  '&.Mui-checked': {
                                    color: '#01F967',
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                Real Photo (Unedited)
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            value="edited"
                            control={
                              <Radio
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.2)',
                                  marginLeft: '12px',
                                  '&.Mui-checked': {
                                    color: '#01F967',
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                Real Photo (Edited)
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            value="ai"
                            control={
                              <Radio
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.2)',
                                  marginLeft: '12px',
                                  '&.Mui-checked': {
                                    color: '#01F967',
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                AI Generated
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            value="mixed"
                            control={
                              <Radio
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.2)',
                                  marginLeft: '12px',
                                  '&.Mui-checked': {
                                    color: '#01F967',
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                Mixed
                              </Typography>
                            }
                          />
                        </RadioGroup>
                      </FormControl>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>

              {/* Section 3: Inputs */}
              <Box sx={{ mb: 4 }}>
                <StyledTextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Additional comments (optional)..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  sx={{ mb: 3 }}
                />

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 0,
                    backgroundColor: 'transparent',
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '16px',
                        fontWeight: 500,
                      }}
                    >
                      Contribute to accuracy research
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '13px',
                      }}
                    >
                      We only use the mathematical data (gradients), not the image itself.
                    </Typography>
                  </Box>
                  <GradientSwitch
                    checked={contributeData}
                    onChange={(e) => setContributeData(e.target.checked)}
                  />
                </Box>
              </Box>

              {/* Submit Button */}
              <GradientSubmitButton
                onClick={handleSubmit}
                disabled={!verdict || (verdict === 'incorrect' && !actualCategory) || loading}
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </GradientSubmitButton>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}