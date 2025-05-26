import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(ordersQuery);
        
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
      
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get filtered orders
  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });
  
  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }
  
  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Manage Orders</h1>
        </div>
        
        <div className="admin-toolbar">
          <div className="filter-dropdown">
            <label htmlFor="status-filter">Filter by status:</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="orders-count">
            {filteredOrders.length} orders
          </div>
        </div>
        
        <div className="admin-content">
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>No orders found.</p>
            </div>
          ) : (
            <div className="admin-orders">
              {filteredOrders.map(order => (
                <div 
                  key={order.id} 
                  className={`admin-order-card ${expandedOrder === order.id ? 'expanded' : ''}`}
                >
                  <div 
                    className="order-card-header"
                    onClick={() => setExpandedOrder(prev => prev === order.id ? null : order.id)}
                  >
                    <div className="order-summary">
                      <h3>Order #{order.id.slice(-6)}</h3>
                      <p>Customer: {order.shippingInfo.fullName}</p>
                      <p>Date: {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="order-details">
                      <div className="status">
                        Status: <span className={`status-${order.status || 'pending'}`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                      <div className="total">
                        ${order.totalAmount?.toFixed(2)}
                      </div>
                      <div className="arrow">
                        {expandedOrder === order.id ? '▲' : '▼'}
                      </div>
                    </div>
                  </div>
                  
                  {expandedOrder === order.id && (
                    <div className="order-card-content">
                      <div className="order-items-section">
                        <h4>Order Items</h4>
                        <div className="order-items-list">
                          {order.items.map((item, index) => (
                            <div key={index} className="order-item">
                              <div className="item-image">
                                <img src={item.imageUrl} alt={item.name} />
                              </div>
                              <div className="item-details">
                                <h5>{item.name}</h5>
                                <p>${item.price.toFixed(2)} x {item.quantity}</p>
                              </div>
                              <div className="item-total">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="customer-info-section">
                        <div className="shipping-info">
                          <h4>Shipping Information</h4>
                          <p>{order.shippingInfo.fullName}</p>
                          <p>{order.shippingInfo.email}</p>
                          <p>{order.shippingInfo.phoneNumber}</p>
                          <p>{order.shippingInfo.address}</p>
                          <p>{order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}</p>
                        </div>
                        
                        <div className="order-actions">
                          <h4>Update Status</h4>
                          <div className="status-buttons">
                            <button 
                              className={`status-btn pending ${order.status === 'pending' ? 'active' : ''}`}
                              onClick={() => handleStatusChange(order.id, 'pending')}
                            >
                              Pending
                            </button>
                            <button 
                              className={`status-btn processing ${order.status === 'processing' ? 'active' : ''}`}
                              onClick={() => handleStatusChange(order.id, 'processing')}
                            >
                              Processing
                            </button>
                            <button 
                              className={`status-btn shipped ${order.status === 'shipped' ? 'active' : ''}`}
                              onClick={() => handleStatusChange(order.id, 'shipped')}
                            >
                              Shipped
                            </button>
                            <button 
                              className={`status-btn delivered ${order.status === 'delivered' ? 'active' : ''}`}
                              onClick={() => handleStatusChange(order.id, 'delivered')}
                            >
                              Delivered
                            </button>
                            <button 
                              className={`status-btn cancelled ${order.status === 'cancelled' ? 'active' : ''}`}
                              onClick={() => handleStatusChange(order.id, 'cancelled')}
                            >
                              Cancelled
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
