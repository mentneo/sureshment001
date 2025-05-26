import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import './Checkout.css';

const Checkout = () => {
  const { currentUser } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: currentUser?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a well-structured order object with all required fields
      const orderData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        orderItems: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.imageUrl
        })),
        shippingInfo: {
          fullName: formData.fullName || 'Not provided',
          address: formData.address || 'Not provided',
          city: formData.city || 'Not provided',
          postalCode: formData.zipCode || 'Not provided',
          country: formData.state || 'Not provided',
          phone: formData.phoneNumber || 'Not provided'
        },
        status: 'pending',
        total: totalPrice,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add order to Firestore
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      toast.success('Order placed successfully!');
      clearCart();
      navigate('/orders', { state: { newOrderId: orderRef.id } });
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <div className="shipping-form">
            <h2>Shipping Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="place-order-btn"
                disabled={loading || cart.length === 0}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>
          
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="order-items">
              {cart.map(item => (
                <div key={item.id} className="order-item">
                  <div className="item-image">
                    <img src={item.imageUrl} alt={item.name} />
                  </div>
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p className="item-price">${item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                  <div className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>
              <div className="summary-total">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
