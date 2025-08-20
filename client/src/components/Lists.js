import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Lists = () => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await axios.get('/lists');
      setLists(response.data.lists);
    } catch (error) {
      console.error('Error fetching lists:', error);
      setError('Failed to fetch lists');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const fileInput = e.target.file;
    const file = fileInput.files[0];

    if (!file) {
      setError('Please select a file');
      return;
    }

    // Validate file type
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      setError('Only CSV, XLSX, and XLS files are allowed');
      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/lists/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(response.data.message);
      fileInput.value = ''; // Clear the file input
      fetchLists(); // Refresh the list
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const fetchListDetails = async (listId) => {
    try {
      const response = await axios.get(`/lists/${listId}`);
      setSelectedList(response.data.list);
    } catch (error) {
      console.error('Error fetching list details:', error);
      setError('Failed to fetch list details');
    }
  };

  if (loading) {
    return <div className="loading">Loading lists...</div>;
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Lists Management</h1>
        <p>Upload CSV files and distribute them among agents</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* File Upload Section */}
      <div className="card">
        <h3>Upload New List</h3>
        <form onSubmit={handleFileUpload}>
          <div className="file-upload">
            <input
              type="file"
              name="file"
              accept=".csv,.xlsx,.xls"
              required
            />
            <p>Select a CSV, XLSX, or XLS file to upload</p>
            <p><small>File should contain columns: FirstName, Phone, Notes</small></p>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload & Distribute'}
            </button>
          </div>
        </form>
      </div>

      {/* Lists Table */}
      <div className="card">
        <h3>Uploaded Lists</h3>
        {lists.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Total Items</th>
                  <th>Agents</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lists.map((list) => (
                  <tr key={list.id}>
                    <td>{list.fileName}</td>
                    <td>{list.totalItems}</td>
                    <td>{list.distributions.length}</td>
                    <td>{list.uploadedBy}</td>
                    <td>{new Date(list.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn-primary"
                        onClick={() => fetchListDetails(list.id)}
                        style={{ fontSize: '0.8rem' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No lists uploaded yet. Upload your first CSV file to get started.</p>
        )}
      </div>

      {/* List Details Modal/Section */}
      {selectedList && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Distribution Details: {selectedList.fileName}</h3>
            <button 
              className="btn-danger"
              onClick={() => setSelectedList(null)}
            >
              Close
            </button>
          </div>
          
          <p><strong>Total Items:</strong> {selectedList.totalItems}</p>
          <p><strong>Uploaded:</strong> {new Date(selectedList.createdAt).toLocaleString()}</p>
          
          <div className="distribution-grid">
            {selectedList.distributions.map((distribution, index) => (
              <div key={index} className="agent-distribution">
                <h4>{distribution.agent.name}</h4>
                <p>{distribution.agent.email}</p>
                <p><strong>Items assigned:</strong> {distribution.itemCount}</p>
                
                <div className="items-list">
                  {distribution.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="item">
                      <strong>{item.firstName}</strong>
                      <br />
                      Phone: {item.phone}
                      {item.notes && <small>Notes: {item.notes}</small>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Lists;