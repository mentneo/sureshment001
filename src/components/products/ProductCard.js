import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_TEDDY_IMAGE, checkImageUrl } from '../../utils/cloudinaryUpload';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState(product.imageUrl || DEFAULT_TEDDY_IMAGE);
  
  // Check if the image URL is a base64 string
  const isBase64Image = imageUrl && imageUrl.startsWith('data:image');
  
  useEffect(() => {
    // Verify that the product image URL works
    const verifyImage = async () => {
      if (product.imageUrl && !isBase64Image) {
        try {
          const isAccessible = await checkImageUrl(product.imageUrl);
          if (!isAccessible) {
            console.warn("Image URL is not accessible:", product.imageUrl);
            setImageUrl(DEFAULT_TEDDY_IMAGE);
          }
        } catch (error) {
          console.error("Error verifying image:", error);
          setImageUrl(DEFAULT_TEDDY_IMAGE);
        }
      }
    };
    
    verifyImage();
  }, [product.imageUrl, isBase64Image]);
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      navigate('/login', { state: { from: `/product/${product.id}` } });
      return;
    }
    
    addToCart(product, 1);
  };
  
  const handleImageError = () => {
    console.error("Failed to load image:", imageUrl);
    setImageError(true);
    setImageLoaded(true);
    setImageUrl(DEFAULT_TEDDY_IMAGE);
  };
  
  const handleImageLoad = () => {
    console.log("Image loaded successfully:", imageUrl);
    setImageLoaded(true);
  };
  
  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image">
          {!imageLoaded && (
            <div className="image-placeholder">
              <div className="spinner"></div>
            </div>
          )}
          
          <img 
            src={imageError ? DEFAULT_TEDDY_IMAGE : imageUrl} 
            alt={product.name}
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoaded ? 'block' : 'none' }}
            className={isBase64Image ? 'base64-image' : ''}
          />
        </div>
        
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">${(product.price || 0).toFixed(2)}</p>
          <p className="product-description">
            {product.description ? 
              (product.description.length > 60 ? 
                `${product.description.substring(0, 60)}...` : 
                product.description) : 
              'No description available'}
          </p>
        </div>
      </Link>
      
      <button 
        className="add-to-cart-btn"
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
