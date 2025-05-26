import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from '../firebase/config';

const storage = getStorage(app);

// Upload image to Firebase Storage with proper path
export const uploadImageToFirebase = async (imageFile) => {
  try {
    // Create a unique name for the image
    const timestamp = new Date().getTime();
    const randomId = Math.random().toString(36).substring(2, 10);
    const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `products/${timestamp}_${randomId}_${safeFileName}`;
    
    // Create a reference to the file path
    const storageRef = ref(storage, fileName);
    
    // Upload the file with metadata
    const metadata = {
      contentType: imageFile.type,
      customMetadata: {
        'fileName': imageFile.name,
        'fileSize': imageFile.size.toString(),
        'uploadedAt': new Date().toISOString()
      }
    };
    
    const snapshot = await uploadBytes(storageRef, imageFile, metadata);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: fileName
    };
  } catch (error) {
    console.error("Error uploading image to Firebase:", error);
    throw error;
  }
};
