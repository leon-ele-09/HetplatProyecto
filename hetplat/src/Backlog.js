import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TaskDetailModal } from './TaskDetailModal';

export function TaskList({ refreshTrigger, onTaskUpdate }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const { projectId } = useParams();
  const navigate = useNavigate();

  const loadTasks = () => {
    const token = localStorage.getItem('token');
    fetch(`https://localhost:7286/api/tasks?projectId=${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (res.status === 403) { alert('No tienes acceso'); navigate('/home'); return; }
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then((data) => { if (data) setTasks(data); })
      .catch((err) => console.error(err));
  };

  useEffect(() => { loadTasks(); }, [projectId, refreshTrigger]);

  const toggleComplete = async (taskId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://localhost:7286/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok && onTaskUpdate) onTaskUpdate();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      {tasks.length === 0 ? (
        <p style={{ color: "#666", textAlign: "center" }}>No tasks found.</p>
      ) : (
        <div style={{
          height: "300px", overflowY: "auto", padding: "10px",
          backgroundColor: "#f5f5f5", borderRadius: "10px",
          boxShadow: "inset 0 0 5px rgba(0,0,0,0.1)"
        }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              style={{
                background: task.completed ? '#d4edda' : '#fff',
                border: "1px solid #ddd", borderRadius: "8px",
                padding: "12px", marginBottom: "10px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                cursor: 'pointer'
              }}
            >
              <h3 style={{ margin: "0 0 5px", fontSize: "16px", textDecoration: task.completed ? 'line-through' : 'none' }}>
                {task.title}
              </h3>
              <p style={{ margin: "0 0 8px", color: "#555", fontSize: "14px" }}>
                {task.description}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#666" }}>
                <span>Priority: {task.priority}</span>
                <span>Type: {task.type}</span>
              </div>
              {task.assignedEmail && (
                <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0" }}>
                  Asignado: {task.assignedEmail}
                </p>
              )}
              <button onClick={(e) => toggleComplete(task.id, e)} style={{
                marginTop: '8px', padding: '5px 10px',
                backgroundColor: task.completed ? '#ffc107' : '#28a745',
                color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'
              }}>
                {task.completed ? 'Marcar Incompleto' : 'Completar'}
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          projectId={projectId}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={() => {
            setSelectedTaskId(null);
            if (onTaskUpdate) onTaskUpdate();
          }}
        />
      )}
    </div>
  );
}


export function ActiveTaskList({ refreshTrigger }) {
  const [tasks, setTasks] = useState([]);
  const { projectId } = useParams();
  const navigate = useNavigate();

  const loadTasks = () => {
    const token = localStorage.getItem('token');
    fetch(`https://localhost:7286/api/tasks?projectId=${projectId}`, {  // <-- Faltaba paréntesis
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (res.status === 403) { alert('No tienes acceso'); navigate('/home'); return; }
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then((data) => {
        if (data) {
          const now = new Date();
          const activeTasks = data.filter(task => 
            task.status === "active" && 
            (!task.finishDate || new Date(task.finishDate) > now)
          );
          setTasks(activeTasks);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => { loadTasks(); }, [projectId, refreshTrigger]); 

  const toggleComplete = async (taskId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://localhost:7286/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) loadTasks();
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{
      height: "300px", overflowY: "auto", padding: "10px",
      backgroundColor: "#f5f5f5", borderRadius: "10px",
      boxShadow: "inset 0 0 5px rgba(0,0,0,0.1)"
    }}>
      {tasks.length === 0 ? (
        <p style={{ color: "#666", textAlign: "center" }}>No active tasks found.</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} style={{
            background: '#fff',
            border: "1px solid #ddd", borderRadius: "8px",
            padding: "12px", marginBottom: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ margin: "0 0 5px", fontSize: "16px" }}>
              {task.title}
            </h3>
            <p style={{ margin: "0 0 8px", color: "#555", fontSize: "14px" }}>
              {task.description}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#666" }}>
              <span>Priority: {task.priority}</span>
              <span>Type: {task.type}</span>
            </div>
            {task.assignedEmail && (
              <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0" }}>
                Asignado: {task.assignedEmail}
              </p>
            )}
            
            
          </div>
        ))
      )}
    </div>
  );
}