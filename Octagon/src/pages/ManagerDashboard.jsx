import React, { useState, useEffect } from 'react';

function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3000/api/manager/data', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch manager data');
        }
        setData(result.message);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Manager Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && <p>{data}</p>}
    </div>
  );
}

export default ManagerDashboard;