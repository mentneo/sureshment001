// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'davjxvz8w';
const UPLOAD_PRESET = 'ml_default';
const CLOUDINARY_API_KEY = '8pv6a1DTovBA8_j10TKofEHBEYs';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Default fallback image (base64 encoded small teddy bear image for immediate display)
export const DEFAULT_TEDDY_IMAGE = 'data:image/png;base64,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';

// Function to convert File object to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Upload image to Cloudinary with base64 fallback
export const uploadImageToCloudinary = async (imageFile) => {
  try {
    // Create a unique folder path based on timestamp
    const timestamp = new Date().getTime();
    const folderPath = `teddy_bears/${timestamp}`;
    
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', UPLOAD_PRESET);
    // Using timestamp as a unique identifier
    formData.append('timestamp', timestamp);
    
    // Generate signature if needed for your account (unsigned uploads may also be possible)
    // const signature = generateSignature({
    //   timestamp,
    //   folder: folderPath
    // });
    // formData.append('signature', signature);
    // formData.append('api_key', CLOUDINARY_API_KEY);
    
    // Using unsigned upload
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary Error:', errorText);
      throw new Error('Failed to upload image to Cloudinary');
    }
    
    const data = await response.json();
    console.log("Image uploaded to Cloudinary successfully:", data.secure_url);
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
      provider: 'cloudinary'
    };
  } catch (cloudinaryError) {
    console.error('Cloudinary upload failed, using base64:', cloudinaryError);
    
    // Convert to base64 as fallback
    try {
      const base64Data = await fileToBase64(imageFile);
      console.log("Image converted to base64 successfully");
      
      return {
        url: base64Data,
        publicId: 'base64_image',
        provider: 'base64'
      };
    } catch (base64Error) {
      console.error('Base64 conversion failed:', base64Error);
      
      // Return default image as last resort
      console.log("Using default image as fallback");
      return {
        url: DEFAULT_TEDDY_IMAGE,
        publicId: 'default_teddy',
        provider: 'default'
      };
    }
  }
};
