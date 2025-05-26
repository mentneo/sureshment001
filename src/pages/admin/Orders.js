import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const ordersCollection = collection(db, 'orders');
        const snapshot = await getDocs(ordersCollection);
        
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure shippingInfo exists with default values
          shippingInfo: doc.data().shippingInfo || {
            fullName: 'Not provided',
            address: 'Not provided',
            city: 'Not provided',
            postalCode: 'Not provided',
            country: 'Not provided',
            phone: 'Not provided'
          },
          // Ensure orderItems is always an array
          orderItems: Array.isArray(doc.data().orderItems) ? doc.data().orderItems : [],
          // Ensure orderDate exists and is formatted
          orderDate: doc.data().createdAt ? new Date(doc.data().createdAt.toDate()).toLocaleDateString() : 'Unknown date',
          // Ensure status has a default
          status: doc.data().status || 'pending'
        }));
        
        // Sort by creation date (newest first)
        ordersData.sort((a, b) => {
          const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
          const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
          return dateB - dateA;
        });
        
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Update local state to reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };
  
  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
  };
  
  const calculateOrderTotal = (order) => {
    // Safe calculation of order total with fallbacks
    if (!order.orderItems || !Array.isArray(order.orderItems)) return 0;
    
    return order.orderItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };
  
  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Manage Orders</h1>
        </div>
        
        <div className="admin-content">
          <div className="admin-filters">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-dropdown"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : (
            <>
              {getFilteredOrders().length === 0 ? (
                <div className="no-orders">No orders found</div>
              ) : (
                <div className="orders-list">
                  {getFilteredOrders().map(order => (
                    <div className="order-card" key={order.id}>
                      <div className="order-header">
                        <h3>Order #{order.id.substring(0, 8)}</h3>
                        <span className={`order-status status-${order.status}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="order-details">
                        <div className="order-section">
                          <h4>Customer Details</h4>
                          <p><strong>Name:</strong> {order.shippingInfo?.fullName || 'Not provided'}</p>
                          <p><strong>Address:</strong> {order.shippingInfo?.address || 'Not provided'}</p>
                          <p><strong>City:</strong> {order.shippingInfo?.city || 'Not provided'}, {order.shippingInfo?.postalCode || 'Not provided'}</p>
                          <p><strong>Country:</strong> {order.shippingInfo?.country || 'Not provided'}</p>
                          <p><strong>Phone:</strong> {order.shippingInfo?.phone || 'Not provided'}</p>
                        </div>
                        
                        <div className="order-section">
                          <h4>Order Summary</h4>
                          <p><strong>Date:</strong> {order.orderDate || 'Unknown'}</p>
                          <p><strong>Items:</strong> {order.orderItems?.length || 0}</p>
                          <p><strong>Total:</strong> ${calculateOrderTotal(order).toFixed(2)}</p>
                          <p><strong>Payment:</strong> {order.paymentMethod || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      <div className="order-items">
                        <h4>Items</h4>
                        {Array.isArray(order.orderItems) && order.orderItems.length > 0 ? (
                          <table className="items-table">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.orderItems.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.name || 'Unknown product'}</td>
                                  <td>{item.quantity || 0}</td>
                                  <td>${(item.price || 0).toFixed(2)}</td>
                                  <td>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="no-items">No items in this order</p>
                        )}
                      </div>
                      
                      <div className="order-actions">
                        <h4>Update Status</h4>
                        <div className="status-buttons">
                          <button
                            className={`status-btn pending ${order.status === 'pending' ? 'active' : ''}`}
                            onClick={() => updateOrderStatus(order.id, 'pending')}
                            disabled={order.status === 'pending'}
                          >
                            Pending
                          </button>
                          <button
                            className={`status-btn processing ${order.status === 'processing' ? 'active' : ''}`}
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                            disabled={order.status === 'processing'}
                          >
                            Processing
                          </button>
                          <button
                            className={`status-btn shipped ${order.status === 'shipped' ? 'active' : ''}`}
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                            disabled={order.status === 'shipped'}
                          >
                            Shipped
                          </button>
                          <button
                            className={`status-btn delivered ${order.status === 'delivered' ? 'active' : ''}`}
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            disabled={order.status === 'delivered'}
                          >
                            Delivered
                          </button>
                          <button
                            className={`status-btn cancelled ${order.status === 'cancelled' ? 'active' : ''}`}
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            disabled={order.status === 'cancelled'}
                          >
                            Cancelled
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
