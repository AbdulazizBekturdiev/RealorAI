import { useState, useEffect } from 'react';
import { Typography, Container, Alert, Snackbar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import UploadZone from './UploadZone';
import ScanningView from './ScanningView';
import ResultsView from './ResultsView';
import { API_URL } from '../config';

const getImageOrientation = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const orientation = img.width > img.height ? 'landscape' : 'portrait';
        resolve(orientation);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanningFiles, setScanningFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const getImageUrl = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files) => {
    setError('');
    setResults([]);
    if (!files || files.length === 0) return;

    // Validate and limit to 4 files
    let filesToProcess = Array.isArray(files) ? files : [files];
    
    if (filesToProcess.length > 4) {
      setShowLimitWarning(true);
      filesToProcess = filesToProcess.slice(0, 4);
    }

    // Filter valid image files
    const validFiles = filesToProcess.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      setError('No valid image files selected.');
      return;
    }

    if (validFiles.length < filesToProcess.length) {
      setError('Some files were not images and were skipped.');
    }

    // Process all valid files
    const filesWithOrientation = await Promise.all(
      validFiles.map(async (file) => {
        const [orientation, imageUrl] = await Promise.all([
          getImageOrientation(file),
          getImageUrl(file),
        ]);
        return {
          file,
          orientation,
          progress: 0,
          originalImage: imageUrl,
        };
      })
    );

    setSelectedFile(validFiles[0]); // Keep first file for backward compatibility
    setScanningFiles(filesWithOrientation);
    
    // Start loading and analyze all files sequentially
    setLoading(true);
    setError('');
    
    const resultsArray = [];
    for (let i = 0; i < filesWithOrientation.length; i++) {
      const fileWithOrientation = filesWithOrientation[i];
      const result = await handleAnalyzeSingle(fileWithOrientation.file, fileWithOrientation, i);
      if (result) {
        resultsArray.push({
          result,
          originalImage: fileWithOrientation.originalImage,
          orientation: fileWithOrientation.orientation,
        });
      }
    }
    
    setLoading(false);
    
    if (resultsArray.length > 0) {
      setResults(resultsArray);
    }
  };

  const handleStartOver = () => {
    setSelectedFile(null);
    setScanningFiles([]);
    setResults([]);
    setError('');
    setLoading(false);
  };

  // Simulate progress during scanning
  useEffect(() => {
    if (loading && scanningFiles.length > 0) {
      const interval = setInterval(() => {
        setScanningFiles((prev) =>
          prev.map((f) => ({
            ...f,
            progress: Math.min(f.progress + 2, 100),
          }))
        );
      }, 100);

      return () => clearInterval(interval);
    }
  }, [loading, scanningFiles.length]);

  const handleAnalyzeSingle = async (file, fileWithOrientation, index) => {
    // Update progress for this specific file to 0
    setScanningFiles((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, progress: 0 } : f
      )
    );
    
    const formData = new FormData();
    formData.append('file', file);
    try {
      const resp = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || 'Something went wrong.');
        // Mark this file as failed (keep progress at 0)
        return null;
      } else {
        // Complete progress for this file
        setScanningFiles((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, progress: 100 } : f
          )
        );
        return data;
      }
    } catch (e) {
      setError('Could not connect to backend.');
      return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <AnimatePresence>
        {!loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h3"
              component="h1"
              sx={{
                color: 'text.primary',
                textAlign: 'center',
                mb: 6,
                fontWeight: 700,
              }}
            >
              Image Analyzer
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {loading && scanningFiles.length > 0 ? (
          <ScanningView files={scanningFiles} />
        ) : results.length > 0 ? (
          <ResultsView results={results} onStartOver={handleStartOver} />
        ) : (
          <UploadZone onFileSelect={handleFileSelect} />
        )}
      </motion.div>

      {error && (
        <Alert severity="error" sx={{ mt: 4, maxWidth: 800, mx: 'auto' }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={showLimitWarning}
        autoHideDuration={8000}
        onClose={() => setShowLimitWarning(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowLimitWarning(false)}
          severity="warning"
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: '12px',
            // Gradient Background
            background: 'linear-gradient(to right, #FA9E00, #FFDC51)',
            color: '#000', // Black Text
            fontWeight: 600,
            border: 'none',
            // Force Icon Color to Black
            '& .MuiAlert-icon': {
              color: '#000'
            },
            // Override default action button color if needed
            '& .MuiAlert-action': {
              color: '#000'
            }
          }}
        >
          Limit reached. Analyzing the first 4 images only.
        </Alert>
      </Snackbar>
    </Container>
  );
}

