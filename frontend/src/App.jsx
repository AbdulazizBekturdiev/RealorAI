import { Routes, Route } from "react-router-dom";
import { Box, Typography, Container, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import HowItWorks from "./components/HowItWorks";
import About from "./components/About";
import Admin from "./components/Admin";

const EmptyPage = () => (
  <Container sx={{ mt: 10, mb: 10, textAlign: 'center' }}>
    <Typography variant="h4" sx={{ color: 'text.secondary', mt: 2 }}>Coming soon...</Typography>
  </Container>
);

export default function App() {
  const theme = useTheme();
  const year = new Date().getFullYear();
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" sx={{ backgroundColor: '#101D13' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Navbar />
      </motion.div>
      <Box flex={1} display="flex" flexDirection="column">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Box>
      <Box
        component="footer"
        py={2}
        textAlign="center"
        sx={{ backgroundColor: '#101D13' }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          &copy; {year} RealorAI. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
