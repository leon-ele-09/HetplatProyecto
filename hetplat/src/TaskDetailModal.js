import React, { useState, useEffect } from 'react';

export function TaskDetailModal({ taskId, projectId, onClose, onUpdate }) {
  const [task, setTask] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedDeps, setSelectedDeps] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    Promise.all([
      fetch(`https://localhost:7286/api/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      fetch(`https://localhost:7286/api/tasks?projectId=${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      fetch(`https://localhost:7286/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json())
    ])
    .then(([taskData, tasksData, projectData]) => {
      setTask(taskData);
      setAllTasks(tasksData.filter(t => t.id !== taskId));
      setSelectedDeps(taskData.dependsOn || []);
      setIsOwner(projectData.isOwner);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [taskId, projectId]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://localhost:7286/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...task,
          DependsOn: selectedDeps
        })
      });

      if (res.ok) {
        if (onUpdate) onUpdate();
        onClose();
      } else {
        alert('Error al actualizar la tarea');
      }
    } catch (err) {
      console.error(err);
      alert('Error al actualizar la tarea');
    }
  };

  const toggleDependency = (depId) => {
    if (selectedDeps.includes(depId)) {
      setSelectedDeps(selectedDeps.filter(id => id !== depId));
    } else {
      setSelectedDeps([...selectedDeps, depId]);
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 2000
      }}>
        <div style={{ background: '#fff', padding: '30px', borderRadius: '8px' }}>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 2000
    }}>
      <div style={{
        background: '#fff', padding: '30px', borderRadius: '8px',
        width: '500px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto'
      }}>
        <h2>Detalles de Tarea</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>Título:</strong> {task.title}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Descripción:</strong> {task.description}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Prioridad:</strong> {task.priority} | <strong>Tipo:</strong> {task.type}
        </div>
        {task.assignedEmail && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Asignado a:</strong> {task.assignedEmail}
          </div>
        )}

        {isOwner && (
          <>
            <hr style={{ margin: '20px 0' }} />
            <h3>Dependencias</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
              Selecciona las tareas de las que depende esta tarea:
            </p>
            
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
              {allTasks.length === 0 ? (
                <p style={{ color: '#666' }}>No hay otras tareas disponibles</p>
              ) : (
                allTasks.map(t => (
                  <label key={t.id} style={{
                    display: 'block', padding: '8px', cursor: 'pointer',
                    borderBottom: '1px solid #eee'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedDeps.includes(t.id)}
                      onChange={() => toggleDependency(t.id)}
                      style={{ marginRight: '10px' }}
                    />
                    {t.title} ({t.priority})
                  </label>
                ))
              )}
            </div>
          </>
        )}

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          {isOwner && (
            <button onClick={handleSave} style={{
              flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: '#fff',
              border: 'none', borderRadius: '4px', cursor: 'pointer'
            }}>
              Guardar
            </button>
          )}
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: '#fff',
            border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}