import React, { useState, useEffect } from 'react';

export function CreateTaskButton({ projectId, onTaskCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    Title: '',
    Description: '',
    Priority: 'Medium',
    Type: 'Task',
    StartDate: '',
    FinishDate: '',
    AssignedTo: '',
    DependsOn: []
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (showForm) {
      const token = localStorage.getItem('token');
      fetch(`https://localhost:7286/api/projects/${projectId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setMembers(data))
        .catch(err => console.error(err));
    }
  }, [showForm, projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://localhost:7286/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, ProjectId: projectId })
      });

      if (response.ok) {
        setFormData({ Title: '', Description: '', Priority: 'Medium', Type: 'Task', StartDate: '', FinishDate: '', AssignedTo: '', DependsOn: [] });
        setShowForm(false);
        if (onTaskCreated) onTaskCreated();
      } else {
        setError('Error al crear la tarea');
      }
    } catch (err) {
      setError('Error al crear la tarea');
    }
  };

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)} style={{
        padding: '10px 20px', backgroundColor: '#2ecc71', color: '#fff',
        border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px'
      }}>
        {showForm ? 'Cancelar' : '+ Crear Tarea'}
      </button>

      {showForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#fff', padding: '30px', borderRadius: '8px',
            width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2>Crear Nueva Tarea</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label>Título</label>
                <input type="text" value={formData.Title}
                  onChange={(e) => setFormData({...formData, Title: e.target.value})}
                  required style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Descripción</label>
                <textarea value={formData.Description}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                  required style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Asignar a</label>
                <select value={formData.AssignedTo}
                  onChange={(e) => setFormData({...formData, AssignedTo: e.target.value})}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="">Sin asignar</option>
                  {members.map(m => (
                    <option key={m.personId} value={m.personId}>{m.email}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Fecha Inicio</label>
                <input type="datetime-local" value={formData.StartDate}
                  onChange={(e) => setFormData({...formData, StartDate: e.target.value})}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Fecha Fin</label>
                <input type="datetime-local" value={formData.FinishDate}
                  onChange={(e) => setFormData({...formData, FinishDate: e.target.value})}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Prioridad</label>
                <select value={formData.Priority}
                  onChange={(e) => setFormData({...formData, Priority: e.target.value})}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label>Tipo</label>
                <select value={formData.Type}
                  onChange={(e) => setFormData({...formData, Type: e.target.value})}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="Task">Task</option>
                  <option value="Bug">Bug</option>
                  <option value="Feature">Feature</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{
                  flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: '#fff',
                  border: 'none', borderRadius: '4px', cursor: 'pointer'
                }}>Crear</button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: '#fff',
                  border: 'none', borderRadius: '4px', cursor: 'pointer'
                }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}