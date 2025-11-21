import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import {TaskList, ActiveTaskList} from "./Backlog";
import DependentTaskList from "./WaterfallBacklog";
import Calendario from "./Calendario";
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import { ProjectMembers } from './ProjectMembers';
import { CreateTaskButton } from './CreateTask';
import { ProjectStats, CreateEventButton } from './StatsAndEvents';

export const HStack = ({ children, style, gap = '1rem', justifyContent = 'flex-start', alignItems = 'center' }) => {
  const hStackStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap,
    justifyContent,
    alignItems,
    ...style,
  };
  return <div style={hStackStyle}>{children}</div>;
};

export const VStack = ({ children, style, gap = '0.75rem', justifyContent = 'flex-start', alignItems = 'stretch' }) => {
  const vStackStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap,
    justifyContent,
    alignItems,
    ...style,
  };
  return <div style={vStackStyle}>{children}</div>;
};

const ZStack = ({ children, style }) => {
  return (
    <div style={{ position: 'relative', ...style }}>
      {children}
    </div>
  );
};


function TopBarLayout({ children, gap = "1rem", style }) {
  const barHeight = 60;
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    gap,
    ...style,
  };

  const styles = {
    topbar: {
      width: "100%",
      height: `${barHeight}px`,
      backgroundColor: "#333",
      color: "white",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      boxSizing: "border-box",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 1000,
    },
    content: {
      paddingTop: `${barHeight}px`,
    },
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={containerStyle}>
      <div style={styles.topbar}>
        <HStack gap='5vw' style={{ width: '100%' }}>
          <h1>Menu</h1>
          <h1>Proyecto Ejemplo</h1>
          <h1 style={{ marginLeft: "auto" }}>
            <button onClick={() => navigate(-1)}
              style={{
                all: "unset",
                cursor: "pointer",
                color: "inherit",
                fontSize: "inherit",
                fontFamily: "inherit",
              }}>
              GOJI
            </button>
          </h1>
        </HStack>
      </div>
      <div style={styles.content}>{children}</div>
    </div>
  );
}

const ScrumView = () => {
  const { projectId } = useParams();
  const [isOwner, setIsOwner] = useState(false);
  const [refreshTasks, setRefreshTasks] = useState(0);
  const [showStats, setShowStats]   = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`https://localhost:7286/api/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setIsOwner(data.isOwner))
      .catch(err => console.error(err));
  }, [projectId]);

  return (
    <div className="animated-gradient-bg">

    <ZStack style={{ width: '100%', paddingLeft: '50px'}}>
      <VStack style={{ width: '100%' }}>
        <TopBarLayout />

        <div style={{ padding: '20px', display: 'flex', gap: '10px' }}>
          {isOwner && (
            <>
              <CreateTaskButton projectId={projectId} onTaskCreated={() => setRefreshTasks(prev => prev + 1)} />
              <CreateEventButton projectId={projectId} onEventCreated={() => setRefreshTasks(prev => prev + 1)} />
            </>
          )}
          <button onClick={() => setShowStats(!showStats)} style={{
            padding: '10px 20px', backgroundColor: '#3498db', color: '#fff',
            border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>
            {showStats ? 'Ocultar Stats' : 'Ver Stats'}
          </button>
        </div>

        {showStats && <ProjectStats projectId={projectId} />}

        

        <HStack gap='5vw' style={{ width: '100%' }}>
          <VStack style={{ 
            width: '20%', 
            boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.5)', 
            borderRadius: '10px',
            padding: '5px',
            backgroundColor: '#ede2f3ff'
          }}>
            <h1>PRODUCT BACKLOG</h1>
            <TaskList key={refreshTasks} refreshTrigger={refreshTasks} />
            
            
          </VStack>
          
          <VStack style={{ 
            width: '20%', 
            boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.5)', 
            borderRadius: '10px',
            padding: '5px',
            backgroundColor: '#ede2f3ff'
          }}>
            <h1>SPRINT BACKLOG</h1>
            <ActiveTaskList key={refreshTasks} refreshTrigger={refreshTasks} />
          </VStack>
        </HStack>

        <div style={{ padding: '20px'}}>
          <ProjectMembers projectId={projectId} isOwner={isOwner} />
        </div>
          
          
        <Calendario key={refreshTasks} refreshTrigger={refreshTasks} />
      </VStack>
    </ZStack>
    </div>
  );
};

const WaterfallView = () => {
  const { projectId } = useParams();
  const [isOwner, setIsOwner] = useState(false);
  const [refreshTasks, setRefreshTasks] = useState(0);
  const [showStats, setShowStats]   = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`https://localhost:7286/api/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setIsOwner(data.isOwner))
      .catch(err => console.error(err));
  }, [projectId]);

  return (
    <div className="animated-gradient-bg">

    <ZStack style={{ width: '100%', paddingLeft: '50px' }}>
      <VStack style={{ width: '100%' }}>
        <TopBarLayout />

        
        <div style={{ padding: '20px', display: 'flex', gap: '10px' }}>
          {isOwner && (
            <>
              <CreateTaskButton projectId={projectId} onTaskCreated={() => setRefreshTasks(prev => prev + 1)} />
            </>
          )}
          <button onClick={() => setShowStats(!showStats)} style={{
            padding: '10px 20px', backgroundColor: '#3498db', color: '#fff',
            border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>
            {showStats ? 'Ocultar Stats' : 'Ver Stats'}
          </button>
        </div>

        {showStats && <ProjectStats projectId={projectId} />}


        <HStack gap='5vw' style={{ width: '100%' }}>
          <VStack style={{ 
            width: '20%', 
            boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.5)', 
            borderRadius: '10px',
            padding: '5px',
            backgroundColor: '#ede2f3ff'
          }}>
            <h1>PRODUCT BACKLOG</h1>
            <TaskList key={refreshTasks} refreshTrigger={refreshTasks} />


          </VStack>
          
          <VStack style={{ 
            width: '60%', 
            boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.5)', 
            borderRadius: '10px',
            padding: '5px',
            backgroundColor: '#ede2f3ff'
          }}>
            <h1>Tareas</h1>
            <DependentTaskList key={refreshTasks} refreshTrigger={refreshTasks} />
          </VStack>
        </HStack>

        <div style={{ padding: '20px' }}>
          <ProjectMembers projectId={projectId} isOwner={isOwner} />
          
        </div>

        <Calendario key={refreshTasks} refreshTrigger={refreshTasks} />
      </VStack>
    </ZStack>
    </div>
  );
};

function ProjectsTable() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  const loadProjects = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://localhost:7286/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Error al cargar proyectos");
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar lista de proyectos");
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleRowClick = (proj) => {
    if (proj.Tipo === "Waterfall") {
      navigate(`/waterfall/${proj.id}`);
    } else if (proj.Tipo === "Scrum") {
      navigate(`/scrum/${proj.id}`);
    } else {
      console.warn("Tipo de proyecto desconocido:", proj.Tipo);
    }
  };

  const handleDelete = async (e, projId) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de borrar este proyecto?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://localhost:7286/api/projects/${projId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        loadProjects(); // Recargar lista
      } else {
        alert('Error al borrar el proyecto');
      }
    } catch (err) {
      console.error(err);
      alert('Error al borrar el proyecto');
    }
  };

  return (
    <VStack style={{ padding: "20px", width: "100%" }} gap="1.5rem">
      <HStack style={{ justifyContent: 'space-between' }}>
        <h1>Proyectos</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2ecc71',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
          Crear Proyecto
        </button>
      </HStack>

      {showCreateForm && (
        <CreateProjectForm 
          onClose={() => setShowCreateForm(false)} 
          onSuccess={loadProjects} 
        />
      )}

      <table style={{ width: "70%", borderCollapse: "collapse", margin : 'auto' }}>
        
        <thead >
          <tr>
            <th><div style={{padding : '30px'}}>ID</div></th>
            <th><div style={{padding : '30px'}}>Tipo</div></th>
            <th><div style={{padding : '30px'}}>Nombre</div></th>
            <th><div style={{padding : '30px'}}>Descripcion</div></th>
            <th><div style={{padding : '30px'}}> </div> </th>
          </tr>
        </thead>
        <tbody>
          {error ? (
            <tr>
              <td colSpan={5}>{error}</td>
            </tr>
          ) : (
            projects.map((proj) => (
              <tr
                key={proj.id}
                onClick={() => handleRowClick(proj)}
                style={{ cursor: "pointer"}}
              >
                <td><div style={{boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)', padding : '30px'}}>{proj.id}</div></td>
                <td><div style={{boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)', padding : '30px'}}>{proj.Tipo}</div></td>
                <td><div style={{boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)', padding : '30px'}}>{proj.Nombre}</div></td>
                <td><div style={{boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)', padding : '30px'}}>{proj.Descripcion}</div></td>
                <td><div style={{boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)', padding : '30px'}}>
                  {proj.isOwner && (
                    <button
                      onClick={(e) => handleDelete(e, proj.id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}>
                      Borrar
                    </button>
                  )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </VStack>
  );
}

function CreateProjectForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    Name: '',
    Description: '',
    Type: 'Scrum'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://localhost:7286/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setError('Error al crear el proyecto');
      }
    } catch (err) {
      console.error(err);
      setError('Error al crear el proyecto');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff',
        padding: '30px',
        borderRadius: '8px',
        width: '400px',
        maxWidth: '90%'
      }}>
        <h2>Crear Nuevo Proyecto</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Nombre</label>
            <input
              type="text"
              value={formData.Name}
              onChange={(e) => setFormData({...formData, Name: e.target.value})}
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
          <div style={{ marginBottom: '15px' }}>
            <label>Descripción</label>
            <textarea
              value={formData.Description}
              onChange={(e) => setFormData({...formData, Description: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                minHeight: '80px'
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label>Tipo</label>
            <select
              value={formData.Type}
              onChange={(e) => setFormData({...formData, Type: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}>
              <option value="Scrum">Scrum</option>
              <option value="Waterfall">Waterfall</option>
            </select>
          </div>
          <HStack gap="10px">
            <button type="submit" style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#2ecc71',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Crear
            </button>
            <button type="button" onClick={onClose} style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#95a5a6',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Cancelar
            </button>
          </HStack>
        </form>
      </div>
    </div>
  );
}

function HomeView() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <VStack>
        <HStack style = {{
      width: "100%",
      
      backgroundColor: "#333",
      color: "white",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      boxSizing: "border-box",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 1000,
      boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)'
      }}>
          <h1>GOJI | Home Page</h1>
          <h3 style={{ marginLeft: "auto" }}>
            <button onClick={handleLogout}
              style={{
                all: "unset",
                cursor: "pointer",
                color: "inherit",
                fontSize: "inherit",
                fontFamily: "inherit",
              }}>
              Log Out
            </button>
          </h3>
        </HStack>
        <ProjectsTable />
      </VStack>
    </div>
  );
}

function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error || 'Email o contraseña incorrectos');
    }
  };

  return (
    <HStack>
    <VStack style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>GOJI</h1>
      <img src="./logo512.png" style={{ width: '200px', margin: 'auto', padding: '30px' }} alt="Logo" />
      </VStack>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        <form onSubmit={handleLogin} style={{
          background: '#fff', padding: '30px', borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '300px'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <div style={{ marginBottom: '15px' }}>
            <label>Email</label>
            <input type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Password</label>
            <input type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <button type="submit" style={{
            width: '100%', padding: '10px', backgroundColor: '#3498db', color: '#fff',
            border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px'
          }}>Login</button>
          <button type="button" onClick={() => navigate('/register')} style={{
            width: '100%', padding: '10px', backgroundColor: '#2ecc71', color: '#fff',
            border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>Register</button>
        </form>
      </div>
      </HStack>
    
  );
}

function RegisterView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const result = await register(email, password);
    
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error || 'Error al registrarse');
    }
  };

  return (
    <HStack>
    <VStack style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>GOJI</h1>
      <img src="./logo512.png" style={{ width: '200px', margin: 'auto', padding: '30px' }} alt="Logo" />
      </VStack>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <form onSubmit={handleRegister} style={{
          background: '#fff', padding: '30px', borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '300px'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <div style={{ marginBottom: '15px' }}>
            <label>Email</label>
            <input type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Password</label>
            <input type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Confirmar Password</label>
            <input type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} required
              style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <button type="submit" style={{
            width: '100%', padding: '10px', backgroundColor: '#2ecc71', color: '#fff',
            border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px'
          }}>Register</button>
          <button type="button" onClick={() => navigate('/')} style={{
            width: '100%', padding: '10px', backgroundColor: '#95a5a6', color: '#fff',
            border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>Back to Login</button>
        </form>
      </div>
      </HStack>
    
  );
}
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <HomeView />
            </ProtectedRoute>
          } />
          <Route path="/waterfall/:projectId" element={
            <ProtectedRoute>
              <WaterfallView />
            </ProtectedRoute>
          } />
          <Route path="/scrum/:projectId" element={
            <ProtectedRoute>
              <ScrumView />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;