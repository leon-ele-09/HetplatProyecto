import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AllComponent from './AllComponent';
import ListsComponents from './ListsComponents';
import IndividualComponent from './IndividualComponent';
// import ClickItemRedirect from './ClickItemRedirect';
import './App.css';

const App = () => {
  const [jsonData, setJsonData] = useState([]);

  useEffect(() => {
    fetch('/data.json')
      .then((response) => response.json())
      .then((data) => setJsonData(data))
      .catch((error) => console.error('Error fetching data: ', error));
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/allcomponents" element={<AllComponent />} />
          
          <Route path="/" element={<ListsComponents />} />
          
          {/* <Route path="/item/:id" element={<ClickItemRedirect />} /> */}
          
          <Route path="/individual" element={<IndividualComponent data={{title: "Test", description: "Test desc"}} />} />
          
          <Route path="*" element={<div><h1>404 - Página no encontrada</h1></div>} />
        </Routes>
      </div>
    </BrowserRouter>
    
    
  );
};

export default App;

