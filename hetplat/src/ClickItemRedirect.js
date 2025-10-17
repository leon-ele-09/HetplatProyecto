import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";

const ClickItemRedirect = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/data.json')
      .then((response) => response.json())
      .then((jsonData) => {
        const item = jsonData.find(item => item.id === id);
        setData(item);
      })
      .catch((error) => console.error('Error fetching data: ', error));
  }, [id]);

  if (!data) return <div>Cargando...</div>;

  return (
    <div className="card">
      <h1>{data.title}</h1>
      <h2>{data.description}</h2>
    </div>
  );
};


export default ClickItemRedirect;