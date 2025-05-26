import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { uploadImageToCloudinary, DEFAULT_TEDDY_IMAGE } from '../../utils/cloudinary';
import { toast } from 'react-toastify';
import './Admin.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = doc(db, 'products', id);
        const docSnap = await getDoc(productDoc);
        
        if (docSnap.exists()) {
          const productData = docSnap.data();
          setFormData({
            name: productData.name || '',
            description: productData.description || '',
            price: productData.price?.toString() || '',
            category: productData.category || '',
            size: productData.size || '',
            color: productData.color || '',
            inStock: productData.inStock !== undefined ? productData.inStock : true
          });
          
          setImageUrl(productData.imageUrl || '');
          setImagePublicId(productData.imagePublicId || '');
        } else {
          toast.error('Product not found');
          navigate('/admin/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, navigate]);
  
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
    
    setImage(file);
    setImageUrl(URL.createObjectURL(file));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      let updatedImageUrl = imageUrl;
      let updatedImagePublicId = imagePublicId;
      
      // If a new image was selected, try to upload it
      if (image) {
        try {
          const toastId = toast.info('Uploading image...', { autoClose: false });
          
          const imageData = await uploadImageToCloudinary(image);
          updatedImageUrl = imageData.url;
          updatedImagePublicId = imageData.publicId;
          
          toast.update(toastId, { 
            render: `Image uploaded successfully via ${imageData.provider}`, 
            type: "success",
            autoClose: 2000
          });
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          toast.warning('Image upload failed. Using existing image instead.');
        }
      }
      
      // If no image URL exists, use default placeholder
      if (!updatedImageUrl) {
        updatedImageUrl = DEFAULT_TEDDY_IMAGE;
        updatedImagePublicId = 'default_teddy';
      }
      
      // Update product in Firestore
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        size: formData.size,
        color: formData.color,
        inStock: formData.inStock,
        imageUrl: updatedImageUrl,
        imagePublicId: updatedImagePublicId,
        updatedAt: new Date()
      });
      
      toast.success('Product updated successfully!');
      navigate('/admin/products');
      
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading product data...</div>;
  }
  
  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Edit Product</h1>
        </div>
        
        <div className="admin-content">
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
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
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
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
              <label htmlFor="category">Category</label>
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
                accept="image/*"
                onChange={handleImageChange}
              />
              <small>Leave empty to keep current image</small>
            </div>
            
            {imageUrl && (
              <div className="image-preview">
                <img src={imageUrl} alt="Product preview" />
              </div>
            )}
            
            <div className="form-buttons">
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => navigate('/admin/products')}
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                className="admin-button"
                disabled={submitting}
              >
                {submitting ? 'Updating Product...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
