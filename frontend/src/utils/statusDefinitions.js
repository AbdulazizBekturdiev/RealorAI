export const STATUS_CONFIG = {
  // --- ARTIFICIAL SPECTRUM (0-49%) ---

  "ai_generated": { 
    label: "AI Generated",
    gradientStart: "#FA1100", // Deep Red
    gradientEnd: "#FA9E00",   // Orange
    human_desc: "This image was almost certainly created by a computer model.",
    tech_desc: "High Covariance Matrix correlation detected. Pixel data follows a rigid diffusion pattern with zero optical sensor noise."
  },

  "likely_artificial": { 
    label: "Likely AI or AI Edited",
    gradientStart: "#FA9E00", // Orange
    gradientEnd: "#FFDC51",   // Soft Yellow
    human_desc: "The image is unnaturally smooth. It lacks the microscopic details captured by a real lens.",
    tech_desc: "Gradient transition rates are mathematically uniform. Low variance in the high-frequency spectrum."
  },

  "mixed_signals": { 
    label: "Ambiguous Signal",
    gradientStart: "#FFDC51", // Soft Yellow
    gradientEnd: "#E1FF01",   // Lime
    human_desc: "Parts of this image look real, but other parts look artificial. It might be a 'Generative Fill' edit.",
    tech_desc: "Inconsistent gradient fields detected. Spatial variance suggests multiple noise sources (e.g., In-painting or Photobashing)."
  },

  // --- REAL SPECTRUM (50-100%) ---

  "low_quality_compressed": { 
    label: "Low Quality / Compressed",
    gradientStart: "#FFDC51", // Soft Yellow
    gradientEnd: "#E1FF01",   // Lime
    human_desc: "The image quality is low (blurry or compressed), but the underlying patterns look real.",
    tech_desc: "Signal-to-noise ratio is low due to compression artifacts (blocking), but lacks the high-correlation signatures of AI synthesis."
  },

  "digital_processed": { 
    label: "Retouched Photo",
    gradientStart: "#E1FF01", // Lime
    gradientEnd: "#01F967",   // Neon Green (Brand)
    human_desc: "This looks like a real photo that has been edited, filtered, or color-corrected.",
    tech_desc: "Base luminance signal is organic, but local gradient smoothing suggests post-processing software (Lightroom/Photoshop)."
  },

  "authentic_capture": { 
    label: "Authentic Photo", // RENAMED
    gradientStart: "#01F967", // Neon Green
    gradientEnd: "#23CF6B",   // Deep Green
    human_desc: "This image contains the natural 'grain' and imperfections found in real camera photos.",
    tech_desc: "High-frequency Poisson-Gaussian sensor noise detected. Covariance matrix shows organic pixel distribution."
  }
};

