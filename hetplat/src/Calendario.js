import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendario.css';

const Calendario = () => {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    fetch('/eventos.json')
      .then(response => response.json())
      .then(data => {
        const eventosFormateados = data.eventos.map(evento => ({
          id: evento.id,
          title: evento.title,
          start: evento['fecha-inicio'],
          end: evento['fecha-final'],
          backgroundColor: getColor(evento.tipo),
        }));
        setEventos(eventosFormateados);
      })
      .catch(error => console.error('Error cargando eventos:', error));
  }, []);

  const getColor = (tipo) => {
    if (tipo === 'deadline') return '#e74c3c';
    if (tipo === 'sprint') return '#3498db';
    if (tipo === 'completado') return '#2ecc71';
    return '#95a5a6';
  };

  return (
    <div className="calendario-container">
      <header className="header">
        <div className="header-left">
          <span className="menu-btn">Menu</span>
          <span className="proyecto-titulo">Proyecto Ejemplo</span>
        </div>
        <div className="header-right">
          <span className="user-name">GOJI</span>
        </div>
      </header>

      <div className="calendario-content">
        <div className="calendario-header">
          <h1>Calendario</h1>
        </div>

        <div className="calendario-main">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView='dayGridMonth'
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
            }}
            events={eventos}
            locale='es'
            height='auto'
          />
        </div>
      </div>
    </div>
  );
};

export default Calendario;