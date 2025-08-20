import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: {
      countryCode: '+1',
      number: ''
    },
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get('/agents');
      setAgents(response.data.agents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'countryCode' || name === 'number') {
      setFormData({
        ...formData,
        mobile: {
          ...formData.mobile,
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/agents', formData);
      setSuccess(response.data.message);
      setFormData({
        name: '',
        email: '',
        mobile: {
          countryCode: '+1',
          number: ''
        },
        password: ''
      });
      setShowForm(false);
      fetchAgents(); // Refresh the list
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create agent');
    }
  };

  const handleDelete = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await axios.delete(`/agents/${agentId}`);
        setSuccess('Agent deleted successfully');
        fetchAgents(); // Refresh the list
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete agent');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading agents...</div>;
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Agents Management</h1>
        <p>Manage your agents and their information</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Agents List</h3>
          <button 
            className="btn-primary" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add New Agent'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter agent name"
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
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mobile">Mobile Number</label>
                <div className="mobile-input">
                  <select
                    name="countryCode"
                    value={formData.mobile.countryCode}
                    onChange={handleChange}
                    required
                  >
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+91">+91 (IN)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+49">+49 (DE)</option>
                  </select>
                  <input
                    type="tel"
                    name="number"
                    value={formData.mobile.number}
                    onChange={handleChange}
                    required
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter password (min 6 characters)"
                  minLength="6"
                />
              </div>
            </div>

            <button type="submit" className="btn-success">
              Create Agent
            </button>
          </form>
        )}

        {agents.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent._id}>
                    <td>{agent.name}</td>
                    <td>{agent.email}</td>
                    <td>{agent.mobile.countryCode} {agent.mobile.number}</td>
                    <td>
                      <span style={{ 
                        color: agent.isActive ? '#28a745' : '#dc3545',
                        fontWeight: 'bold'
                      }}>
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(agent.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn-danger"
                        onClick={() => handleDelete(agent._id)}
                        style={{ fontSize: '0.8rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No agents found. Add your first agent to get started.</p>
        )}
      </div>
    </div>
  );
};

export default Agents;