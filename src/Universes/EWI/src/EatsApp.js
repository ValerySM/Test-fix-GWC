import React, { useState, useEffect, useRef } from 'react';
import './EatsApp.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import UpgradeTab from './components/UpgradeTab';
import BoostTab from './components/BoostTab';
import TasksTab from './components/TasksTab';
import SettingsButton from './components/SettingsButton';
import clickerImage from '../public/clicker-image.png'
import SoonTab from './components/SoonTab'
import UniverseData from './UniverseData';

import {
  handleClick,
  handleDamageUpgrade,
  handleEnergyUpgrade,
  handleRegenUpgrade,
  handleMouseDown,
  handleMouseUp
} from './scripts/functions';

function EatsApp({ setIsTabOpen }) {
  const currentUniverse = UniverseData.getCurrentUniverse();

  const [totalClicks, setTotalClicks] = useState(UniverseData.getTotalClicks());
  const [count, setCount] = useState(0);
  const [activeTab, setActiveTab] = useState(null);
  const [isImageDistorted, setIsImageDistorted] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTabOpenState, setIsTabOpenState] = useState(false);
  const [showButtons, setShowButtons] = useState(true);

  const [energy, setEnergy] = useState(() => {
    const savedEnergy = UniverseData.getUniverseData(currentUniverse, 'energy', 1000);
    const lastUpdate = UniverseData.getUniverseData(currentUniverse, 'lastUpdate', Date.now());
    const energyMax = UniverseData.getUniverseData(currentUniverse, 'energyMax', 1000);
    const regenRate = UniverseData.getUniverseData(currentUniverse, 'regenRate', 1);

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
    const regenAmount = Math.min(elapsedSeconds * regenRate, energyMax - savedEnergy);
    
    return Math.min(savedEnergy + regenAmount, energyMax);
  });

  const [energyMax, setEnergyMax] = useState(() => 
    UniverseData.getUniverseData(currentUniverse, 'energyMax', 1000)
  );
  const [regenRate, setRegenRate] = useState(() => 
    UniverseData.getUniverseData(currentUniverse, 'regenRate', 1)
  );

  const [damageLevel, setDamageLevel] = useState(() => 
    UniverseData.getUniverseData(currentUniverse, 'damageLevel', 1)
  );
  const [energyLevel, setEnergyLevel] = useState(() => 
    UniverseData.getUniverseData(currentUniverse, 'energyLevel', 1)
  );
  const [regenLevel, setRegenLevel] = useState(() => 
    UniverseData.getUniverseData(currentUniverse, 'regenLevel', 1)
  );

  const damageUpgradeCost = 1000 * Math.pow(2, damageLevel - 1);
  const energyUpgradeCost = 1000 * Math.pow(2, energyLevel - 1);
  const regenUpgradeCost = 50000 * Math.pow(2, regenLevel - 1);

  const activityTimeoutRef = useRef(null);

  useEffect(() => {
    UniverseData.setUniverseData(currentUniverse, 'energy', energy);
  }, [energy, currentUniverse]);

  useEffect(() => {
    UniverseData.setUniverseData(currentUniverse, 'energyMax', energyMax);
  }, [energyMax, currentUniverse]);

  useEffect(() => {
    UniverseData.setUniverseData(currentUniverse, 'regenRate', regenRate);
  }, [regenRate, currentUniverse]);

  useEffect(() => {
    UniverseData.setUniverseData(currentUniverse, 'damageLevel', damageLevel);
  }, [damageLevel, currentUniverse]);

  useEffect(() => {
    UniverseData.setUniverseData(currentUniverse, 'energyLevel', energyLevel);
  }, [energyLevel, currentUniverse]);

  useEffect(() => {
    UniverseData.setUniverseData(currentUniverse, 'regenLevel', regenLevel);
  }, [regenLevel, currentUniverse]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prevEnergy => {
        if (prevEnergy < energyMax) {
          const newEnergy = Math.min(prevEnergy + regenRate, energyMax);
          UniverseData.setUniverseData(currentUniverse, 'energy', newEnergy);
          UniverseData.setUniverseData(currentUniverse, 'lastUpdate', Date.now());
          return newEnergy;
        }
        return prevEnergy;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      UniverseData.setUniverseData(currentUniverse, 'energy', energy);
      UniverseData.setUniverseData(currentUniverse, 'lastUpdate', Date.now());
    };
  }, [currentUniverse, energy, energyMax, regenRate]);

  const handleTabOpen = (tab) => {
    setActiveTab(tab);
    setIsTabOpenState(true);
    setIsTabOpen(true);
    setShowButtons(false);
  };

  const handleBackButtonClick = () => {
    setActiveTab(null);
    setIsTabOpenState(false);
    setIsTabOpen(false);
    setShowButtons(true);
  };

  const updateTotalClicks = (additionalClicks) => {
    setTotalClicks(prevTotal => {
      const newTotal = prevTotal + additionalClicks;
      UniverseData.setTotalClicks(newTotal);
      return newTotal;
    });
  };

  const tabContent = (() => {
    switch (activeTab) {
      case 'UPGRADE':
        return (
          <UpgradeTab
            totalClicks={totalClicks}
            damageUpgradeCost={damageUpgradeCost}
            energyUpgradeCost={energyUpgradeCost}
            regenUpgradeCost={regenUpgradeCost}
            damageLevel={damageLevel}
            energyLevel={energyLevel}
            regenLevel={regenLevel}
            handleDamageUpgrade={() => handleDamageUpgrade(totalClicks, damageUpgradeCost, updateTotalClicks, setDamageLevel, damageLevel)}
            handleEnergyUpgrade={() => handleEnergyUpgrade(totalClicks, energyUpgradeCost, updateTotalClicks, setEnergyMax, setEnergyLevel, energyMax, energyLevel)}
            handleRegenUpgrade={() => handleRegenUpgrade(totalClicks, regenUpgradeCost, updateTotalClicks, setRegenRate, setRegenLevel, regenRate, regenLevel)}
          />
        );
      case 'BOOST':
        return <BoostTab updateTotalClicks={updateTotalClicks} />;
      case 'TASKS':
        return <TasksTab />;
      case 'SOON':
        return <SoonTab />;
      default:
        return null;
    }
  })();

  const remainingEnergyPercentage = ((energyMax - energy) / energyMax) * 100;

  return (
    <div className={`App`} onMouseDown={() => handleMouseDown(setIsClicking)} onMouseUp={() => handleMouseUp(setIsClicking, activityTimeoutRef, setIsImageDistorted, isClicking)}>
      <header className="App-header">
       <div className='bg'>
       <div className="abg-wr-4">
    
    <ul className="abg-4">
        <li></li>
        <li></li>
        <li></li>
    </ul>
</div>
       </div>
        
        <SettingsButton isActive={activeTab !== null} /> 
        <div className="balance-container">
          <img src={clickerImage} alt="Balance Icon" className="balance-icon" />
          <p>{totalClicks}</p>
        </div>
        <div className="energy-container">
          <p>Energy: {Math.floor(energy)}/{energyMax}</p>
        </div>
        <div className="clicker-container" onClick={() => handleClick(energy, damageLevel, count, totalClicks, setCount, updateTotalClicks, setEnergy, setIsImageDistorted, activityTimeoutRef, setRegenRate)}>
            <img src={clickerImage} alt="Clicker" className={`clicker-image ${isImageDistorted ? 'distorted' : ''}`} />
          <div className="progress-circle" style={{ boxShadow: '0px 0px 10px 5px gray' }}>
            <CircularProgressbar
              value={remainingEnergyPercentage}
              maxValue={100}
              styles={buildStyles({
                pathColor: 'rgba(188, 1, 1)',
                textColor: '#fff',
                trailColor: 'greenyellow',
                backgroundColor: '#3e98c7',
              })}
            />
          </div>
        </div>
        {showButtons && (
          <div className="tabs">
            <button className={activeTab === 'UPGRADE' ? 'active' : ''} onClick={() => handleTabOpen('UPGRADE')}>
              UPGRADE
            </button>
            <button className={activeTab === 'BOOST' ? 'active' : ''} onClick={() => handleTabOpen('BOOST')}>
              GAMES
            </button>
            <button className={activeTab === 'TASKS' ? 'active' : ''} onClick={() => handleTabOpen('TASKS')}>
              TASKS
            </button>
            <button className={activeTab === 'SOON' ? 'active' : ''} onClick={() => handleTabOpen('SOON')}>
              REF
            </button>
          </div>
        )}
        {isTabOpenState && (
          <div className={`tab-content ${isTabOpenState ? 'open' : ''}`}>
            <button className="back-button" onClick={handleBackButtonClick}>Back</button>
            {tabContent}
          </div>
        )}
      </header>
    </div>
  );
}

export default EatsApp;