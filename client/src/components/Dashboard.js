import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalLists: 0,
    totalItems: 0
  });
  const [recentLists, setRecentLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [agentsRes, listsRes] = await Promise.all([
        axios.get('/agents'),
        axios.get('/lists')
      ]);

      const agents = agentsRes.data.agents;
      const lists = listsRes.data.lists;
      
      const totalItems = lists.reduce((sum, list) => sum + list.totalItems, 0);

      setStats({
        totalAgents: agents.length,
        totalLists: lists.length,
        totalItems
      });

      setRecentLists(lists.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your agent management system</p>
      </div>

      <div className="dashboard-stats">
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card">
            <h3>Total Agents</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
              {stats.totalAgents}
            </div>
          </div>
          
          <div className="card">
            <h3>Total Lists</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
              {stats.totalLists}
            </div>
          </div>
          
          <div className="card">
            <h3>Total Items</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
              {stats.totalItems}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Recent Lists</h3>
        {recentLists.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Total Items</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLists.map((list) => (
                  <tr key={list.id}>
                    <td>{list.fileName}</td>
                    <td>{list.totalItems}</td>
                    <td>{list.uploadedBy}</td>
                    <td>{new Date(list.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No lists uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;