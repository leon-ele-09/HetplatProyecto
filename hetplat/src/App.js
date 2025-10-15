import React, { useState, useEffect } from 'react';
import AllComponent from './AllComponent';

const App = () => {
  const [jsonData, setJsonData] = useState([]);

  useEffect(() => {
    fetch('/data.json')
      .then((response) => response.json())
      .then((data) => setJsonData(data))
      .catch((error) => console.error('Error fetching data: ', error));
  }, []);

  return (
    <div classname="AppMain" style={{ width: '300px', margin: '0 auto', border: '1px solid blue', padding: '20px' }}>
      <h1>Dynamic Component Rendering</h1>
      <div className="App"> 
        <AllComponent jsonData={jsonData} filter={"Description for Card 1"} />
      </div>
      <div className="App">
        <AllComponent jsonData={jsonData} filter={"Description for Card 2"}/>
      </div>
      <div className="App">
        <AllComponent jsonData={jsonData} filter={"Description for Card 3"}/>
      </div>
    </div>
    
    
  );
};

export default App;

