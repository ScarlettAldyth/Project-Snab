import React from 'react';
import '../App.css';
import background from '../assets/THERA.jpg';

const LandingPage = ({ onEnter }) => {
  return (
    <div className="landing-page">
      <img src={background} alt="" className="landing-bg" />

      <button className="enter-button" onClick={onEnter}>
        Let the magic begin
      </button>
    </div>
  );
};

export default LandingPage;
