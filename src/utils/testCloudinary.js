// Simple utility to test Cloudinary configuration
export const testCloudinaryConfig = async () => {
  const CLOUDINARY_CLOUD_NAME = 'davjxvz8w';
  const UPLOAD_PRESET = 'ml_default';

  try {
    // Test if the upload preset exists and is configured for unsigned uploads
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload_presets/${UPLOAD_PRESET}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      console.log('Cloudinary upload preset is valid and accessible');
      return true;
    } else {
      console.error('Cloudinary upload preset is not accessible or does not exist');
      return false;
    }
  } catch (error) {
    console.error('Error checking Cloudinary configuration:', error);
    return false;
  }
};
