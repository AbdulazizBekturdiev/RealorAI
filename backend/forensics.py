import cv2
import numpy as np
import base64


def calculate_histogram_gaps(image_rgb, gap_threshold=0):
    """
    Detect Pixel Value Gaps (The Comb Effect) to identify retouching/color-grading.
    Counts zero bins sandwiched between non-zero bins across all RGB channels.
    Returns the total gap count across all channels (sum of gaps in R, G, B).
    """
    # Handle both RGB and grayscale images
    if len(image_rgb.shape) == 3 and image_rgb.shape[2] == 3:
        # RGB image - check all channels individually
        channels = [image_rgb[:, :, 0], image_rgb[:, :, 1], image_rgb[:, :, 2]]
    else:
        # Grayscale or single channel
        channels = [image_rgb]
    
    total_gap_count = 0
    
    for channel in channels:
        # Convert to uint8 if needed
        if channel.dtype != np.uint8:
            channel_uint8 = np.clip(channel, 0, 255).astype(np.uint8)
        else:
            channel_uint8 = channel
        
        # Calculate histogram (256 bins for 0-255)
        hist = cv2.calcHist([channel_uint8], [0], None, [256], [0, 256])
        hist = hist.flatten()
        
        # Find significant gaps (zero bins between non-zero bins)
        gap_count = 0
        min_pixel_count = np.max(hist) * 0.01  # Ignore gaps if surrounding bins are too small
        
        for i in range(1, 255):  # Skip first and last bins
            # Current bin is zero
            if hist[i] == 0:
                # Check if there are non-zero bins before and after
                has_before = any(hist[max(0, i-3):i] > min_pixel_count)
                has_after = any(hist[i+1:min(256, i+4)] > min_pixel_count)
                
                # If there's a gap between populated regions, count it
                if has_before and has_after:
                    gap_count += 1
        
        # Sum gap count across all channels
        total_gap_count += gap_count
    
    # Flag as retouched if total gap count exceeds threshold
    is_retouched = total_gap_count > gap_threshold
    
    return is_retouched, total_gap_count


def calculate_ela_score(img):
    """
    Error Level Analysis (ELA) - Detects JPEG compression artifacts.
    
    Real photos have high-frequency grain that changes significantly when compressed.
    AI images often have "fake grain" that survives compression too perfectly.
    
    Args:
        img: BGR image (numpy array)
        
    Returns:
        ela_score: Mean error level (float)
    """
    # Step A: Take the original image img
    # Step B: Save it to a memory buffer as a JPEG at 90% quality
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 90]
    _, buffer = cv2.imencode('.jpg', img, encode_param)
    
    # Step C: Load it back (img_compressed)
    img_compressed = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
    
    if img_compressed is None:
        return 0.0  # Fallback if compression fails
    
    # Ensure both images have the same dimensions
    if img.shape != img_compressed.shape:
        img_compressed = cv2.resize(img_compressed, (img.shape[1], img.shape[0]))
    
    # Step D: Calculate the absolute difference
    diff = cv2.absdiff(img, img_compressed)
    
    # Step E: Calculate the Mean Error of this difference
    ela_score = np.mean(diff)
    
    return float(ela_score)


def analyze_image(image_bytes):
    # 1. Decode Image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Could not decode image")

    # 2. Resize for consistent analysis (Standard Sina Method Baseline)
    # We resize to ensure the eigenvalue scale is consistent across 12MP vs 48MP cameras
    target_dim = 2048
    h, w = img.shape[:2]
    scale = target_dim / max(h, w)
    if scale < 1.0:
        img = cv2.resize(img, (int(w * scale), int(h * scale)))

    # 3. Convert to Grayscale (Luminance)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 4. Gradient Extraction (Sobel)
    # This detects the "Rate of Change" in pixel intensity
    g_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    g_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)

    # 5. Covariance Matrix Calculation
    # We flatten gradients to create a Feature Vector
    g_x_flat = g_x.flatten()
    g_y_flat = g_y.flatten()

    # Stack them: M = [Gx, Gy]
    M = np.vstack((g_x_flat, g_y_flat)).T
    
    # Calculate Covariance: C = (M.T * M) / N
    # This measures how chaotic the texture is globally.
    cov_matrix = np.cov(M.T)
    
    # 6. Eigenvalues
    # eigenvalues[0] is usually the smaller one (noise floor)
    # eigenvalues[1] is the larger one (edge strength)
    eigenvalues, _ = np.linalg.eig(cov_matrix)
    eigenvalues = np.sort(eigenvalues) # Sort ascending
    
    val_1 = eigenvalues[0]
    val_2 = eigenvalues[1]

    # 7. The Scoring Logic (The Authenticity Index)
    # Real cameras produce chaotic noise -> Higher Eigenvalues
    # AI models produce smooth gradients -> Lower Eigenvalues
    
    # This divisor is the "Calibration". 
    # Adjust this if Real images are scoring too low.
    # 2000.0 is a good baseline for 2048px images.
    base_score = (val_1 / 2000.0) * 100 
    
    # 5. Final Scoring & Retouching Cap
    final_score = base_score
    
    # Metric 1: Channel-Wise Histogram Gaps ("The Comb Effect")
    # Check Red, Green, and Blue channels individually.
    # Boosting a "Sunset" often stretches the Red channel specifically, leaving gaps there
    # even if the global luminance looks fine.
    img_uint8 = np.clip(img, 0, 255).astype(np.uint8)
    # Convert BGR to RGB for channel-wise analysis
    img_rgb = cv2.cvtColor(img_uint8, cv2.COLOR_BGR2RGB)
    is_retouched, total_channel_gaps = calculate_histogram_gaps(img_rgb, gap_threshold=0)
    is_edited_histogram = total_channel_gaps > 5
    
    # Metric 2: RMS Contrast Check
    # Calculate the standard deviation of pixel intensities (img.std()).
    # Raw camera sensor data is usually "flat" (Low/Medium contrast).
    # Highly processed "Instagram-ready" photos have high contrast.
    gray_uint8 = gray.astype(np.uint8)
    contrast = float(np.std(gray_uint8))
    is_high_contrast = contrast > 75
    
    # The "Authenticity Gate" (The Fix)
    # If it looks real (High Score) BUT shows signs of editing:
    if base_score > 85:
        if is_edited_histogram or is_high_contrast:
            # Force it down to "Retouched" category (Green)
            # Cap at 80 (or 75 if both checks fail)
            final_score = 80
    
    # Compression Artifact Check (ELA)
    # Real Photos: High ELA Score (> 2.0). The high-frequency grain changes significantly when compressed.
    # AI Images: Low ELA Score (< 1.5). The "fake grain" often survives compression too perfectly.
    ela_score = calculate_ela_score(img)
    
    # If ela_score < 1.5 (Suspiciously resilient to compression):
    # Cap Score at 45% (Ambiguous/AI).
    # Override: Even if Entropy is high (100%), if ELA is low, it's likely a high-quality AI generation.
    if ela_score < 1.5:
        final_score = min(final_score, 45.0)  # Cap at 45% (Ambiguous/AI)
    
    # Ensure bounds
    final_score = max(0, min(100, int(final_score)))
    trust_score = final_score
    
    # Debug Print
    print(f"DEBUG: Contrast: {contrast:.1f} | RGB Gaps: {total_channel_gaps} | Base: {base_score} -> Final: {final_score}")

    # 8. Generate Visual (Gradient Magnitude)
    magnitude = cv2.magnitude(g_x, g_y)
    # Normalize for display
    magnitude = cv2.normalize(magnitude, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
    _, buffer = cv2.imencode('.jpg', magnitude)
    gradient_base64 = base64.b64encode(buffer).decode('utf-8')

    # Return Data
    return {
        "trust_score": int(trust_score),
        "gradient_image": gradient_base64,
        "meta": {
            "eigenvalues": eigenvalues.tolist()
        }
    }