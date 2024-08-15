import React, { useState, useEffect } from 'react';
import Score from './comp/Score';
import './css/EWE.css'
import FarmButton from './comp/FarmButton';

function Ewe() {
  const [tokens, setTokens] = useState(() => {
    const savedTokens = localStorage.getItem('tokens');
    return savedTokens ? parseFloat(savedTokens) : 0;
  });

  const [farmedTokens, setFarmedTokens] = useState(() => {
    const savedFarmedTokens = localStorage.getItem('farmedTokens');
    return savedFarmedTokens ? parseFloat(savedFarmedTokens) : 0;
  });

  const [isFarming, setIsFarming] = useState(() => {
    const savedIsFarming = localStorage.getItem('isFarming');
    return savedIsFarming === 'true';
  });

  const [startTime, setStartTime] = useState(() => {
    const savedStartTime = localStorage.getItem('startTime');
    return savedStartTime ? new Date(parseInt(savedStartTime, 10)) : null;
  });

  const [elapsedFarmingTime, setElapsedFarmingTime] = useState(() => {
    const savedElapsedFarmingTime = localStorage.getItem('elapsedFarmingTime');
    return savedElapsedFarmingTime ? parseFloat(savedElapsedFarmingTime) : 0;
  });

  useEffect(() => {
    let farmingInterval;
    if (isFarming) {
      const maxTokens = 32;
      const duration = 3 * 60 * 60 * 1000;
      const interval = duration / (maxTokens * 1000);

      farmingInterval = setInterval(() => {
        const now = new Date();
        const elapsed = (now - startTime) / 1000;
        const farmed = Math.min((elapsed + elapsedFarmingTime) * 0.001, maxTokens);
        setFarmedTokens(farmed);

        if (farmed >= maxTokens) {
          clearInterval(farmingInterval);
          setIsFarming(false);
          setElapsedFarmingTime(0);
        }
      }, interval);
    }

    return () => clearInterval(farmingInterval);
  }, [isFarming, startTime, elapsedFarmingTime]);

  useEffect(() => {
    localStorage.setItem('tokens', tokens);
    localStorage.setItem('farmedTokens', farmedTokens);
    localStorage.setItem('isFarming', isFarming);
    localStorage.setItem('startTime', startTime ? startTime.getTime() : null);
    localStorage.setItem('elapsedFarmingTime', elapsedFarmingTime);
  }, [tokens, farmedTokens, isFarming, startTime, elapsedFarmingTime]);

  const handleButtonClick = () => {
    if (isFarming) {
      collectTokens();
    } else {
      startFarming();
    }
  };

  const startFarming = () => {
    if (!isFarming) {
      const now = new Date();
      setStartTime(now);
      setIsFarming(true);
      setElapsedFarmingTime(farmedTokens / 0.001); 
      setFarmedTokens(0);
    }
  };

  const collectTokens = () => {
    if (farmedTokens >= 32) {
      setTokens(prevTokens => Number((prevTokens + farmedTokens).toFixed(3)));
      setFarmedTokens(0);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <Score tokens={tokens} />
      </header>
      <div className="content">
        <FarmButton
          isFarming={isFarming}
          farmedTokens={farmedTokens}
          onClick={handleButtonClick}
        />
      </div>
    </div>
  );
}

export default Ewe;
