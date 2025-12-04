import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { API_URL } from '../config';

const StyledTableContainer = styled(TableContainer)({
  backgroundColor: '#152218',
  borderRadius: '16px',
  marginTop: '24px',
  '& .MuiTableCell-root': {
    color: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 700,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
});

const GradientButton = styled(Button)({
  border: '2px solid transparent',
  background: 'transparent',
  backgroundImage: 'linear-gradient(#152218, #152218), linear-gradient(to right, #E1FF01, #01F967)',
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box',
  color: 'white',
  borderRadius: '12px',
  padding: '10px 24px',
  textTransform: 'none',
  fontWeight: 700,
  '&:hover': {
    backgroundImage: 'linear-gradient(#152218, #152218), linear-gradient(to right, #E1FF01, #01F967)',
    opacity: 0.9,
  },
});

export default function Admin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/view`);
      const data = await response.json();
      
      if (data.data) {
        setRows(data.data);
      } else {
        setRows([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load feedback data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.open(`${API_URL}/admin/download?key=admin123`, '_blank');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 8, minHeight: '80vh' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            fontWeight: 700,
          }}
        >
          Feedback Data
        </Typography>
        <GradientButton onClick={handleDownload}>
          Download CSV
        </GradientButton>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress sx={{ color: '#01F967' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ backgroundColor: '#152218', color: 'white' }}>
          {error}
        </Alert>
      ) : rows.length === 0 ? (
        <Alert severity="info" sx={{ backgroundColor: '#152218', color: 'white' }}>
          No feedback collected yet.
        </Alert>
      ) : (
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  Time
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  File
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  Score
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  Verdict
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  Correction
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  Comments
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  Data?
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {new Date(row.timestamp).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.filename}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: '100px' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 0.5 }}>
                        {row.ai_score}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={row.ai_score}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(to right, #E1FF01, #01F967)',
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: row.user_verdict === 'correct' ? '#01F967' : '#FA9E00',
                        fontWeight: 600,
                      }}
                    >
                      {row.user_verdict === 'correct' ? 'Correct' : 'Incorrect'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', textTransform: 'capitalize' }}>
                      {row.actual_category || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        maxWidth: '250px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.comments || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {row.contribute_data ? 'Yes' : 'No'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}
    </Container>
  );
}

