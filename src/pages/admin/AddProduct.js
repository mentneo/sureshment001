import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { handleImageUpload, DEFAULT_TEDDY_IMAGE } from '../../utils/cloudinaryUpload';
import { toast } from 'react-toastify';
import '../admin/Admin.css';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    size: '',
    color: '',
    inStock: true
  });
  
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const toastId = toast.loading('Processing product...');
    
    try {
      setLoading(true);
      
      // Default image data
      let imageData = {
        url: DEFAULT_TEDDY_IMAGE,
        publicId: 'default_teddy',
        provider: 'default'
      };
      
      // Handle image upload
      if (image) {
        try {
          toast.update(toastId, {
            render: 'Uploading image...',
            type: 'info',
            isLoading: true
          });
          
          console.log("Starting image upload for:", image.name);
          imageData = await handleImageUpload(image);
          
          if (imageData.provider === 'cloudinary') {
            toast.update(toastId, {
              render: 'Image uploaded to Cloudinary!',
              type: 'success',
              isLoading: false,
              autoClose: 2000
            });
          } else if (imageData.provider === 'base64') {
            toast.update(toastId, {
              render: 'Image stored as base64 data',
              type: 'info',
              isLoading: false,
              autoClose: 2000
            });
          } else {
            // Must be using the default image
            toast.update(toastId, {
              render: 'Using default image',
              type: 'warning',
              isLoading: false,
              autoClose: 2000
            });
          }
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          toast.update(toastId, {
            render: 'Image upload failed. Using default image.',
            type: 'error',
            isLoading: false,
            autoClose: 2000
          });
        }
      }
      
      // Create product in Firestore with delay to ensure toasts are visible
      setTimeout(async () => {
        try {
          toast.update(toastId, {
            render: 'Saving product to database...',
            type: 'info',
            isLoading: true
          });
          
          const productData = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category: formData.category,
            size: formData.size || '',
            color: formData.color || '',
            inStock: formData.inStock,
            imageUrl: imageData.url,
            imagePublicId: imageData.publicId || 'default_teddy',
            imageProvider: imageData.provider || 'default',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          const docRef = await addDoc(collection(db, 'products'), productData);
          console.log('Product added with ID:', docRef.id);
          
          toast.update(toastId, {
            render: `Product "${formData.name}" added successfully!`,
            type: 'success',
            isLoading: false,
            autoClose: 2000
          });
          
          // Reset form
          setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            size: '',
            color: '',
            inStock: true
          });
          setImage(null);
          setPreviewUrl('');
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
          toast.update(toastId, {
            render: 'Failed to save product. Please try again.',
            type: 'error',
            isLoading: false
          });
        } finally {
          setLoading(false);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error in product submission:', error);
      toast.update(toastId, {
        render: 'Failed to add product. Please try again.',
        type: 'error',
        isLoading: false
      });
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Add New Product</h1>
        </div>
        
        <div className="admin-content">
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Product Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description*</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Price ($)*</label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category*</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                <option value="Classic Teddy">Classic Teddy</option>
                <option value="Stuffed Animals">Stuffed Animals</option>
                <option value="Baby Teddy">Baby Teddy</option>
                <option value="Giant Teddy">Giant Teddy</option>
                <option value="Holiday Special">Holiday Special</option>
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="size">Size</label>
                <input
                  type="text"
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="color">Color</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="inStock"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
              />
              <label htmlFor="inStock">In Stock</label>
            </div>
            
            <div className="form-group">
              <label htmlFor="image">Product Image</label>
              <input
                type="file"
                id="image"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
              />
              <small>Recommended: Less than 2MB for best performance</small>
            </div>
            
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="upload-progress">
                <div className="progress-bar" style={{width: `${uploadProgress}%`}}></div>
                <span>{uploadProgress}% Completed</span>
              </div>
            )}
            
            <button 
              type="submit" 
              className="admin-button"
              disabled={loading}
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
