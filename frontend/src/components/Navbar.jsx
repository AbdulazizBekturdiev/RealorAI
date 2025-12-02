import { useState } from 'react';
import { AppBar, Toolbar, Box, Button, Container, Typography, Menu, MenuItem, IconButton } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import LogoIcon from '../logo.svg';

const GradientMenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Define the Brand Gradient */}
    <defs>
      <linearGradient id="brandGradientIcon" x1="0" y1="0" x2="100%" y2="0">
        <stop offset="0%" stopColor="#E1FF01" />
        <stop offset="100%" stopColor="#01F967" />
      </linearGradient>
    </defs>
    
    {/* Icon Path (uses the gradient) */}
    <path 
      d="M21 17V19H3V17H21ZM18 11V13H6V11H18ZM21 5V7H3V5H21Z" 
      fill="url(#brandGradientIcon)"
    />
  </svg>
);

const GradientLink = styled(Button)(({ theme, active }) => ({
  // Layout
  padding: '8px 12px', 
  
  // Desktop - 24px side padding
  [theme.breakpoints.up('md')]: {
    padding: '8px 24px',
  },
  px: { xs: 1.5, md: 3 },
  py: 1,
  borderRadius: '12px',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  textTransform: 'none',
  fontWeight: 600,
  
  // Default State (Gradient Text)
  background: 'transparent',
  backgroundImage: 'linear-gradient(to right, #E1FF01, #01F967)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
  
  // Hover & Active State
  '&:hover, &.active': {
    backgroundImage: 'linear-gradient(to right, #E1FF01, #01F967)',
    backgroundClip: 'border-box',
    WebkitBackgroundClip: 'border-box',
    WebkitTextFillColor: '#101D13',
    color: '#101D13',
  },
}));

const GradientText = styled(Typography)({
  background: 'linear-gradient(to right, #E1FF01, #01F967)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 800,
  fontSize: '1.5rem',
});

const Logo = () => (
  <Link
    to="/"
    style={{
      textDecoration: 'none',
      cursor: 'pointer',
      display: 'flex', // Ensures vertical alignment
      alignItems: 'center'
    }}
  >
    <Box
      component="img"
      src={LogoIcon}
      alt="RealorAI Logo"
      sx={{
        height: { xs: '32px', md: '40px' },
        width: 'auto'
      }}
    />
  </Link>
);

export default function Navbar() {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  
  const pages = [
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About Me', path: '/about' },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'transparent',
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: '1200px', mx: 'auto' }}>
        <Toolbar disableGutters sx={{ py: 2 }}>
          <Logo />
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Desktop Links Container */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5 }}>
            {pages.map((page) => (
              <GradientLink
                key={page.path}
                component={Link}
                to={page.path}
                className={location.pathname === page.path ? 'active' : ''}
              >
                {page.name}
              </GradientLink>
            ))}
          </Box>

          {/* Mobile Menu Trigger */}
          <IconButton
            onClick={handleOpen}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <GradientMenuIcon />
          </IconButton>

          {/* Mobile Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            // 1. Popup Container Styles
            PaperProps={{
              elevation: 0,
              sx: {
                backgroundColor: '#152218',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
                marginTop: '8px',
              },
            }}
            // 2. Internal Layout & Spacing
            MenuListProps={{
              sx: {
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              },
            }}
            // Ensure the popup doesn't stretch to full width unnecessarily
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {pages.map((page) => (
              <MenuItem
                key={page.name}
                component={Link}
                to={page.path}
                onClick={handleClose}
                sx={{
                  // 3. Link Container Styles
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '12px',
                  justifyContent: 'center',
                  minHeight: '44px',
                  // Active State Logic
                  ...(location.pathname === page.path
                    ? {
                        background: 'linear-gradient(to right, #E1FF01, #01F967)',
                        color: '#000',
                        fontWeight: 700,
                      }
                    : {
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                        },
                      }),
                }}
              >
                {page.name}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

