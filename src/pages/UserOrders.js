import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './UserOrders.css';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const userOrders = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Ensure these properties exist
            orderItems: data.orderItems || [],
            shippingInfo: data.shippingInfo || {},
            orderDate: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : 'Unknown date',
            status: data.status || 'pending'
          };
        });
        
        setOrders(userOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [currentUser]);
  
  // Helper function to calculate order total
  const calculateOrderTotal = (order) => {
    if (!order.orderItems || !Array.isArray(order.orderItems)) return 0;
    
    return order.orderItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };
  
  return (
    <div className="user-orders-page">
      <div className="container">
        <h1>My Orders</h1>
        
        {loading ? (
          <div className="loading">Loading your orders...</div>
        ) : (
          <div className="orders-container">
            {orders.length === 0 ? (
              <div className="no-orders">
                <p>You haven't placed any orders yet.</p>
                <Link to="/" className="shop-now-btn">Shop Now</Link>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-id">
                      <h2>Order #{order.id.substring(0, 8)}</h2>
                      <p className="order-date">{order.orderDate}</p>
                    </div>
                    <span className={`order-status ${order.status}`}>{order.status}</span>
                  </div>
                  
                  <div className="order-info">
                    <div className="shipping-info">
                      <h3>Shipping Address</h3>
                      <p>{order.shippingInfo?.fullName || 'Not provided'}</p>
                      <p>{order.shippingInfo?.address || 'Not provided'}</p>
                      <p>{order.shippingInfo?.city || 'Not provided'}, {order.shippingInfo?.postalCode || 'Not provided'}</p>
                      <p>{order.shippingInfo?.country || 'Not provided'}</p>
                    </div>
                    
                    <div className="payment-info">
                      <h3>Payment Info</h3>
                      <p><strong>Method:</strong> {order.paymentMethod || 'Not provided'}</p>
                      <p><strong>Total:</strong> ${calculateOrderTotal(order).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="order-items">
                    <h3>Order Items</h3>
                    {Array.isArray(order.orderItems) && order.orderItems.length > 0 ? (
                      <div className="items-container">
                        {order.orderItems.map((item, index) => (
                          <div key={index} className="order-item">
                            <div className="item-image">
                              <img 
                                src={item.image || 'https://res.cloudinary.com/davjxvz8w/image/upload/v1695721605/teddy_bear_defaults/default-teddy.jpg'} 
                                alt={item.name || 'Product'} 
                                onError={(e) => {
                                  e.target.onerror = null; 
                                  e.target.src = 'https://res.cloudinary.com/davjxvz8w/image/upload/v1695721605/teddy_bear_defaults/default-teddy.jpg';
                                }}
                              />
                            </div>
                            <div className="item-details">
                              <h4>{item.name || 'Unknown Product'}</h4>
                              <p>
                                ${(item.price || 0).toFixed(2)} x {item.quantity || 0} = 
                                ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No items in this order</p>
                    )}
                  </div>
                  
                  <div className="order-footer">
                    <p><strong>Order Status:</strong> {order.status}</p>
                    {order.status === 'delivered' && (
                      <button className="leave-review-btn">Leave a Review</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;
