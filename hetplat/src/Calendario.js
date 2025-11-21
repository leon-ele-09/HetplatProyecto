import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendario.css';
import { useParams, useNavigate } from 'react-router-dom';

const Calendario = ({ refreshTrigger }) => {
  const [eventos, setEventos] = useState([]);
  const { projectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!projectId) return;
    const token = localStorage.getItem('token');

    Promise.all([
      fetch(`https://localhost:7286/api/tasks?projectId=${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      fetch(`https://localhost:7286/api/events?projectId=${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json())
    ])
      .then(([tasks, events]) => {
        const taskEvents = tasks
          .filter(t => t.startDate || t.finishDate)
          .map(t => ({
            id: t.id,
            title: t.title,
            start: t.startDate,
            end: t.finishDate,
            backgroundColor: t.completed ? '#28a745' : '#3498db'
          }));

        const eventEvents = events.map(e => ({
          id: e.id,
          title: e.title,
          start: e.startedAt,
          end: e.endedAt,
          backgroundColor: '#e74c3c'
        }));

        setEventos([...taskEvents, ...eventEvents]);
      })
      .catch(err => console.error(err));
  }, [projectId, refreshTrigger]);

  return (
    <div className="calendario-container">
      <div className="calendario-content" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="calendario-header">
          <h1>Calendario</h1>
        </div>
        <div className="calendario-main" style={{ height: '100%' }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
            }}
            events={eventos}
            locale="es"
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default Calendario;