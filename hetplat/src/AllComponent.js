import React from 'react';
import IndividualComponent from './IndividualComponent';

const AllComponent = ({ jsonData , filter }) => {
  const filteredData = jsonData.filter(item => item.description === filter);
  
  return (
    <div className="main">
      {filteredData.map((item, index) => (
        <IndividualComponent key={index} data={item} />
      ))}
    </div>
  );
};

export default AllComponent;