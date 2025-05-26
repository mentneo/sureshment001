import imageCompression from 'browser-image-compression';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

// Default teddy bear image URL
export const DEFAULT_TEDDY_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/suresh-teddy-bears-shop.appspot.com/o/defaults%2Fdefault-teddy.jpg?alt=media';

/**
 * Compresses an image file
 */
export const compressImage = async (file) => {
  if (!file) return null;
  
  const options = {
    maxSizeMB: 0.5, // Compress to 500KB
    maxWidthOrHeight: 800,
    useWebWorker: true
  };
  
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Error compressing image:", error);
    return file; // Return original file if compression fails
  }
};

/**
 * Uploads an image to Firebase Storage
 */
export const uploadToFirebase = async (file, progressCallback = null) => {
  if (!file) return null;
  
  try {
    // First compress the image
    const compressedFile = await compressImage(file);
    
    // Generate a unique path in storage
    const timestamp = new Date().getTime();
    const fileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const storagePath = `products/${timestamp}_${fileName}`;
    const storageRef = ref(storage, storagePath);
    
    // Upload to Firebase Storage with progress monitoring
    const uploadTask = uploadBytesResumable(storageRef, compressedFile);
    
    // Return a promise that resolves when upload is complete
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed', 
        // Progress handler
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progressCallback) {
            progressCallback(progress);
          }
        },
        // Error handler
        (error) => {
          console.error("Upload error:", error);
          reject(error);
        },
        // Complete handler
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Return the image data
            resolve({
              url: downloadURL,
              publicId: storagePath,
              provider: 'firebase',
              size: compressedFile.size
            });
          } catch (urlError) {
            reject(urlError);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error in upload process:", error);
    throw error;
  }
};

/**
 * Handle image upload with fallbacks
 */
export const handleImageUpload = async (file, progressCallback = null) => {
  if (!file) {
    return {
      url: DEFAULT_TEDDY_IMAGE,
      publicId: 'default-teddy',
      provider: 'default'
    };
  }
  
  try {
    // Try Firebase Storage upload
    return await uploadToFirebase(file, progressCallback);
  } catch (error) {
    console.error("Firebase upload failed:", error);
    
    // Return the default image if all fails
    return {
      url: DEFAULT_TEDDY_IMAGE,
      publicId: 'default-teddy',
      provider: 'default'
    };
  }
};
