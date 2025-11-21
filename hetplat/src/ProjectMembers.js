import React, { useState, useEffect } from 'react';

export function ProjectMembers({ projectId, isOwner }) {
  const [members, setMembers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [error, setError] = useState('');

  const loadMembers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://localhost:7286/api/projects/${projectId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (err) {
      console.error('Error loading members:', err);
    }
  };

  useEffect(() => {
    if (isOwner) {
      loadMembers();
    }
  }, [projectId, isOwner]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://localhost:7286/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ Email: email, Role: role })
      });

      if (response.ok) {
        setEmail('');
        setRole('Member');
        setShowAddForm(false);
        loadMembers();
      } else {
        const data = await response.json();
        setError(data.message || 'Error al agregar miembro');
      }
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Error al agregar miembro');
    }
  };

  const handleRemoveMember = async (personId) => {
    if (!window.confirm('¿Remover este miembro del proyecto?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://localhost:7286/api/projects/${projectId}/members/${personId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadMembers();
      }
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  if (!isOwner) return null;

  return (
    <div style={{
    width: "50%",
    margin: "0 auto",
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginTop: '20px',
    boxShadow : '5px 10px 15px rgba(0, 0, 0, 0.3)'
  }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Miembros del Proyecto</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '8px 15px',
            backgroundColor: '#3498db',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
          {showAddForm ? 'Cancelar' : 'Invitar Miembro'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddMember} style={{ marginBottom: '15px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ marginBottom: '10px' }}>
            <label>Email del usuario</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}>
              <option value="Member">Member</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
            </select>
          </div>
          <button type="submit" style={{
            padding: '8px 15px',
            backgroundColor: '#2ecc71',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Agregar
          </button>
        </form>
      )}

      <div>
        {members.length === 0 ? (
          <p style={{ color: '#666' }}>No hay miembros adicionales</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {members.map((member) => (
              <li key={member.personId} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #eee'
              }}>
                <div>
                  <strong>{member.email}</strong>
                  <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
                    ({member.role})
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveMember(member.personId)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#e74c3c',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}