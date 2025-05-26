import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './Admin.css';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get total products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const totalProducts = productsSnapshot.size;
        
        // Get orders
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const orders = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => 
          !order.status || order.status === 'pending' || order.status === 'processing'
        ).length;
        
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        // Get recent orders
        const recentOrdersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
        const recentOrdersData = recentOrdersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        
        setStats({
          totalProducts,
          totalOrders,
          pendingOrders,
          totalRevenue
        });
        
        setRecentOrders(recentOrdersData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }
  
  return (
    <div className="admin-page dashboard">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
        </div>
        
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon product-icon">🧸</div>
            <div className="stat-info">
              <h3>Products</h3>
              <p className="stat-value">{stats.totalProducts}</p>
            </div>
            <Link to="/admin/products" className="stat-link">View All</Link>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon order-icon">📦</div>
            <div className="stat-info">
              <h3>Total Orders</h3>
              <p className="stat-value">{stats.totalOrders}</p>
            </div>
            <Link to="/admin/orders" className="stat-link">View All</Link>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon pending-icon">⏳</div>
            <div className="stat-info">
              <h3>Pending Orders</h3>
              <p className="stat-value">{stats.pendingOrders}</p>
            </div>
            <Link to="/admin/orders" className="stat-link">View All</Link>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon revenue-icon">💰</div>
            <div className="stat-info">
              <h3>Total Revenue</h3>
              <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="dashboard-content">
          <div className="recent-orders-section">
            <div className="section-header">
              <h2>Recent Orders</h2>
              <Link to="/admin/orders" className="view-all">View All</Link>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="no-orders">
                <p>No recent orders.</p>
              </div>
            ) : (
              <div className="recent-orders">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td className="order-id">#{order.id.slice(-6)}</td>
                        <td className="customer-name">
                          {order.shippingInfo?.fullName || order.userEmail}
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>${order.totalAmount?.toFixed(2)}</td>
                        <td>
                          <div className={`status-cell status-${order.status || 'pending'}`}>
                            <span className="status-dot"></span>
                            {order.status || 'Pending'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="quick-actions">
          <Link to="/admin/add-product" className="quick-action-btn">
            <div className="quick-action-icon">➕</div>
            <span>Add New Product</span>
          </Link>
          
          <Link to="/admin/products" className="quick-action-btn">
            <div className="quick-action-icon">📋</div>
            <span>Manage Products</span>
          </Link>
          
          <Link to="/admin/orders" className="quick-action-btn">
            <div className="quick-action-icon">📦</div>
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
