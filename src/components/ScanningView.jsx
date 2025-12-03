import { Box } from '@mui/material';
import ScanningCard from './ScanningCard';

export default function ScanningView({ files = [] }) {
  return (
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
        gap: { xs: 2, md: 3 },
        alignItems: 'start',
      }}
    >
      {files.map((file, index) => (
        <ScanningCard
          key={index}
          orientation={file.orientation || 'landscape'}
          progress={file.progress || 0}
        />
      ))}
    </Box>
  );
}

