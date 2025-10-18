import React, { useState, useEffect } from 'react';

const ClickItemRedirect = ({ id, onClose }) => {
  const [data, setData] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetch('/data.json')
      .then((response) => response.json())
      .then((jsonData) => {
        const item = jsonData.find(item => item.id === id);
        setData(item);
      })
      .catch((error) => console.error('Error fetching data: ', error));
  }, [id]);

  const handleClose = () => {
    console.log('Cerrando popup');
    onClose();
  };

  if (!data) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      <div 
        className="popup-overlay"
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(44, 44, 40, 0.85)',
          cursor: 'pointer'
        }}
      />
      
      <div 
        className="card popup-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000
        }}
      >
        <button 
          className="popup-close-btn" 
          onClick={handleClose}
        >
          ×
        </button>
        <h1>{data.title}</h1>
        <h2>{data.description}</h2>
        
        <div className="popup-content-label">Priority</div>
        <div className="popup-content-value">{data.priority}</div>
        
        <div className="popup-content-label">Type</div>
        <div className="popup-content-value">{data.type}</div>
        
        <div className="popup-content-label">Notes</div>
        <textarea 
          className="popup-textarea"
          placeholder="Add your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ClickItemRedirect;