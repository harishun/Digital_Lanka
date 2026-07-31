import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="placeholder-container">
      <div className="placeholder-icon-wrapper" style={{ color: 'var(--danger)', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
        <AlertCircle size={48} />
      </div>
      <h1 style={{ color: 'var(--danger)' }}>Access Denied</h1>
      <p>You do not have the required permissions to view this resource.</p>
      <button onClick={() => navigate('/')} className="btn btn-primary">
        Back to Dashboard
      </button>
    </div>
  );
};

export default Unauthorized;
