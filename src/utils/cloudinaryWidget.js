import { DEFAULT_TEDDY_IMAGE } from './cloudinary';

export const uploadWithWidget = (onSuccess, onError) => {
  // Check if the Cloudinary widget script is already loaded
  if (!window.cloudinary) {
    // Add the script tag to the document
    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    
    script.onload = () => {
      initWidget(onSuccess, onError);
    };
    
    script.onerror = () => {
      console.error('Failed to load Cloudinary widget');
      onError && onError(new Error('Failed to load Cloudinary widget'));
    };
    
    document.body.appendChild(script);
  } else {
    initWidget(onSuccess, onError);
  }
};

function initWidget(onSuccess, onError) {
  try {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'davjxvz8w',
        uploadPreset: 'ml_default',
        sources: ['local', 'url', 'camera'],
        folder: 'teddy_bears',
        maxFileSize: 2000000, // 2MB
        multiple: false,
        cropping: true,
        resourceType: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('Upload widget error:', error);
          onError && onError(error);
        } else if (result && result.event === 'success') {
          console.log('Upload widget success:', result.info);
          onSuccess({
            url: result.info.secure_url,
            publicId: result.info.public_id,
            provider: 'cloudinary'
          });
        } else if (result.event === 'abort') {
          onError && onError(new Error('Upload was cancelled'));
        }
      }
    );
    
    widget.open();
  } catch (e) {
    console.error('Error initializing widget:', e);
    onError && onError(e);
  }
}

// Alternative direct upload with signed URL approach
export const uploadWithSignedUrl = async (imageFile) => {
  try {
    // 1. Request a signed URL from your server
    // This would normally hit your own backend server that would return a signed URL
    // For demo purposes, we're skipping this and going to base64 directly
    
    // Convert to base64 as a fallback that always works
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        resolve({
          url: reader.result,
          publicId: 'base64_image_' + new Date().getTime(),
          provider: 'base64'
        });
      };
      reader.onerror = () => {
        reject(new Error('Failed to convert image to base64'));
      };
      reader.readAsDataURL(imageFile);
    });
  } catch (error) {
    console.error('Error uploading with signed URL:', error);
    return {
      url: DEFAULT_TEDDY_IMAGE,
      publicId: 'default_teddy',
      provider: 'default'
    };
  }
};
