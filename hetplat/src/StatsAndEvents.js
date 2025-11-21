import React, { useState, useEffect } from 'react';

export function ProjectStats({ projectId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`https://localhost:7286/api/projects/${projectId}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, [projectId]);

  if (!stats) return <p>Cargando...</p>;

  return (
    <div style={{
      background: '#fff', border: '1px solid #ddd',
      borderRadius: '8px', padding: '20px', margin: '20px 0'
    }}>
      <h2>Estadísticas del Proyecto</h2>
      <p><strong>Total de tareas:</strong> {stats.totalTasks}</p>
      <p><strong>Tareas completadas:</strong> {stats.completedTasks}</p>
      <p><strong>Progreso:</strong> {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%</p>
      
      <h3>Por Usuario</h3>
      {stats.userStats.length === 0 ? (
        <p>No hay tareas asignadas</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {stats.userStats.map(u => (
            <li key={u.userId} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
              <strong>{u.email}</strong>: {u.completed}/{u.total} completadas
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CreateEventButton({ projectId, onEventCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    Title: '',
    Type: 'Meeting',
    StartedAt: '',
    EndedAt: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('https://localhost:7286/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, ProjectId: projectId })
      });
      if (res.ok) {
        setFormData({ Title: '', Type: 'Meeting', StartedAt: '', EndedAt: '' });
        setShowForm(false);
        if (onEventCreated) onEventCreated();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)} style={{
        padding: '10px 20px', backgroundColor: '#e74c3c', color: '#fff',
        border: 'none', borderRadius: '4px', cursor: 'pointer', margin: '10px 0'
      }}>
        {showForm ? 'Cancelar' : '+ Crear Evento'}
      </button>

      {showForm && (
        <div style={{
          background: '#f5f5f5', padding: '15px',
          borderRadius: '4px', marginTop: '10px'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Título</label>
              <input type="text" value={formData.Title}
                onChange={(e) => setFormData({...formData, Title: e.target.value})}
                required style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Tipo</label>
              <select value={formData.Type}
                onChange={(e) => setFormData({...formData, Type: e.target.value})}
                style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="Meeting">Meeting</option>
                <option value="Review">Review</option>
                <option value="Sprint">Sprint</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Inicio</label>
              <input type="datetime-local" value={formData.StartedAt}
                onChange={(e) => setFormData({...formData, StartedAt: e.target.value})}
                required style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Fin</label>
              <input type="datetime-local" value={formData.EndedAt}
                onChange={(e) => setFormData({...formData, EndedAt: e.target.value})}
                style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <button type="submit" style={{
              padding: '8px 15px', backgroundColor: '#2ecc71', color: '#fff',
              border: 'none', borderRadius: '4px', cursor: 'pointer'
            }}>Crear</button>
          </form>
        </div>
      )}
    </div>
  );
}