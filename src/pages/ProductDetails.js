import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = doc(db, 'products', id);
        const productSnapshot = await getDoc(productDoc);
        
        if (productSnapshot.exists()) {
          setProduct({
            id: productSnapshot.id,
            ...productSnapshot.data()
          });
        } else {
          console.log('No such product!');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantity(value < 1 ? 1 : value);
  };
  
  const handleAddToCart = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    
    addToCart(product, quantity);
  };
  
  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }
  
  if (!product) {
    return (
      <div className="error-container">
        <h2>Product Not Found</h2>
        <p>Sorry, we couldn't find the teddy bear you're looking for.</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }
  
  return (
    <div className="product-details">
      <div className="container">
        <div className="product-details-content">
          <div className="product-image-container">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="product-image" 
            />
          </div>
          
          <div className="product-info-container">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-price">${product.price.toFixed(2)}</p>
            
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
            
            <div className="product-details-list">
              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{product.category}</span>
              </div>
              
              {product.size && (
                <div className="detail-item">
                  <span className="detail-label">Size:</span>
                  <span className="detail-value">{product.size}</span>
                </div>
              )}
              
              {product.color && (
                <div className="detail-item">
                  <span className="detail-label">Color:</span>
                  <span className="detail-value">{product.color}</span>
                </div>
              )}
              
              <div className="detail-item">
                <span className="detail-label">In Stock:</span>
                <span className="detail-value">{product.inStock ? 'Yes' : 'No'}</span>
              </div>
            </div>
            
            <div className="purchase-options">
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              </div>
              
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
