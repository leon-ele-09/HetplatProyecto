import React from 'react';
import ClickItemRedirect from './ClickItemRedirect';

const IndividualComponent = ({ data }) => {
  return (
    <div className="card" onClick={ClickItemRedirect} style={{ cursor: 'pointer' }}>
      <h2>{data.title}</h2>
      <p>{data.description}</p>
    </div>
  );
};

export default IndividualComponent;