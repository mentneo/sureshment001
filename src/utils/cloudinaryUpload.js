import imageCompression from 'browser-image-compression';

// Default fallback image URL from a public source
export const DEFAULT_TEDDY_IMAGE = 'https://res.cloudinary.com/davjxvz8w/image/upload/v1695721605/teddy_bear_defaults/default-teddy.jpg';

// Cloudinary configuration with explicit API key
const CLOUDINARY_CLOUD_NAME = 'davjxvz8w';
const UPLOAD_PRESET = 'ml_default';

/**
 * Compresses an image file before upload
 */
export const compressImage = async (file) => {
  if (!file) return null;
  
  const options = {
    maxSizeMB: 0.5, // Make it smaller - 500KB
    maxWidthOrHeight: 800, // Smaller dimensions for better reliability
    useWebWorker: true,
    initialQuality: 0.7 // Slightly lower quality for better compression
  };
  
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Error compressing image:", error);
    return file; // Return original file if compression fails
  }
};

/**
 * Uploads an image to Cloudinary with retries
 */
export const uploadToCloudinary = async (file, progressCallback = null) => {
  if (!file) return null;
  
  // Maximum number of upload attempts
  const MAX_RETRY_ATTEMPTS = 3;
  let currentAttempt = 0;
  let lastError = null;
  
  while (currentAttempt < MAX_RETRY_ATTEMPTS) {
    try {
      currentAttempt++;
      console.log(`Cloudinary upload attempt ${currentAttempt} of ${MAX_RETRY_ATTEMPTS}`);
      
      // First compress the image
      const compressedFile = await compressImage(file);
      
      // Generate a simpler filename
      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(2, 10);
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').substring(0, 20);
      
      // Create form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'teddy_bears');
      formData.append('public_id', `teddy_${timestamp}_${uniqueId}`);
      
      console.log("Starting Cloudinary upload with preset:", UPLOAD_PRESET);
      
      // Use a timeout promise to ensure the request doesn't hang
      const uploadPromise = fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      // Add a timeout to the fetch request
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload request timed out')), 30000)
      );
      
      // Race the fetch against the timeout
      const response = await Promise.race([uploadPromise, timeoutPromise]);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudinary API error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Cloudinary upload successful:", data);
      
      // Return the data with the image URL
      return {
        url: data.secure_url,
        publicId: data.public_id,
        provider: 'cloudinary',
        width: data.width,
        height: data.height
      };
      
    } catch (error) {
      lastError = error;
      console.error(`Upload attempt ${currentAttempt} failed:`, error);
      
      // If this wasn't our last attempt, wait before trying again
      if (currentAttempt < MAX_RETRY_ATTEMPTS) {
        const delay = 1000 * currentAttempt; // Increase delay with each attempt
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we've exhausted all retry attempts, throw the last error
  console.error("All upload attempts failed");
  throw lastError || new Error("Failed to upload image after multiple attempts");
};

/**
 * Fallback to direct base64 encoding
 */
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    try {
      // Check if file size is too large for base64
      if (file.size > 1024 * 1024) { // Over 1MB
        // Try to compress it first
        imageCompression(file, {
          maxSizeMB: 0.3, // Very aggressive compression
          maxWidthOrHeight: 600,
          initialQuality: 0.5
        }).then(compressedFile => {
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        }).catch(error => reject(error));
      } else {
        // Small enough for direct conversion
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Handle image upload with multiple fallbacks for reliability
 */
export const handleImageUpload = async (file, progressCallback = null) => {
  if (!file) {
    return {
      url: DEFAULT_TEDDY_IMAGE,
      publicId: 'default_teddy',
      provider: 'default'
    };
  }
  
  try {
    // First attempt to upload to Cloudinary
    const result = await uploadToCloudinary(file, progressCallback);
    
    // Verify the result has valid data
    if (!result || !result.url) {
      throw new Error("Invalid response from Cloudinary");
    }
    
    // Make sure the URL is valid
    try {
      new URL(result.url);
    } catch (urlError) {
      throw new Error("Invalid URL returned from Cloudinary");
    }
    
    console.log("Image uploaded successfully:", result.url);
    return result;
  } catch (cloudinaryError) {
    console.error("Cloudinary upload failed:", cloudinaryError);
    
    try {
      console.log("Falling back to base64 encoding...");
      const base64Data = await convertToBase64(file);
      
      // Verify the base64 data is valid
      if (!base64Data || !base64Data.startsWith('data:image/')) {
        throw new Error("Invalid base64 data");
      }
      
      return {
        url: base64Data,
        publicId: 'base64_image_' + Date.now(),
        provider: 'base64'
      };
    } catch (base64Error) {
      console.error("Base64 fallback also failed:", base64Error);
      
      // Final fallback - return default image
      console.log("Using default teddy bear image");
      return {
        url: DEFAULT_TEDDY_IMAGE,
        publicId: 'default_teddy',
        provider: 'default'
      };
    }
  }
};

/**
 * Test if an image URL is accessible
 */
export const checkImageUrl = async (url) => {
  // Skip checking base64 images
  if (url && url.startsWith('data:image/')) {
    return true;
  }
  
  try {
    if (!url) return false;
    
    // Try to fetch with a HEAD request and a short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors' // This helps with CORS issues
    });
    
    clearTimeout(timeoutId);
    return true; // If we get here without errors, the image is probably accessible
  } catch (error) {
    console.error("Error checking image URL:", error);
    return false;
  }
};
