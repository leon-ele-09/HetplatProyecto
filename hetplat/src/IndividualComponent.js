import React from 'react';
import { useNavigate } from "react-router-dom";
import ClickItemRedirect from './ClickItemRedirect';


const IndividualComponent = ({ data }) => {

  const navigate = useNavigate();

  return (
    <div className="card" onClick={() => navigate(`/item/${data.id}`)} style={{ cursor: 'pointer' }}>
      <h2>{data.title}</h2>
    </div>
  );
};

export default IndividualComponent;