

export const handleClick = (energy, damageLevel, count, totalClicks, pointsPerClick, setCount, setTotalClicks, setEnergy, setIsImageDistorted, activityTimeoutRef, setRegenRate) => {
    const maxEnergyToUse = Math.min(energy, damageLevel);
    setCount(count + 1);
    setTotalClicks(totalClicks + maxEnergyToUse ?? pointsPerClick);
    setEnergy(energy - maxEnergyToUse);
    setIsImageDistorted(true);
    clearTimeout(activityTimeoutRef.current);
    activityTimeoutRef.current = setTimeout(() => {
      setIsImageDistorted(false);
    }, 200);
    localStorage.setItem('lastUpdate', new Date().toISOString());
    if (energy === 0) {
      setRegenRate(1);
    }
  };
  

  
  export const handleDamageUpgrade = (totalClicks, damageUpgradeCost, setTotalClicks, setPointsPerClick, setDamageLevel, pointsPerClick, damageLevel) => {
    if (totalClicks >= damageUpgradeCost) {
      setTotalClicks(totalClicks - damageUpgradeCost);
      setPointsPerClick(pointsPerClick + 1);
      setDamageLevel(damageLevel + 1);
    }
  };
  
  export const handleEnergyUpgrade = (totalClicks, energyUpgradeCost, setTotalClicks, setEnergyMax, setEnergyLevel, energyMax, energyLevel) => {
    if (totalClicks >= energyUpgradeCost) {
      setTotalClicks(totalClicks - energyUpgradeCost);
      setEnergyMax(energyMax + 500);
      setEnergyLevel(energyLevel + 1);
    }
  };
  
  export const handleRegenUpgrade = (totalClicks, regenUpgradeCost, setTotalClicks, setRegenRate, setRegenLevel, regenRate, regenLevel) => {
    if (totalClicks >= regenUpgradeCost && regenLevel < 5) {
      setTotalClicks(totalClicks - regenUpgradeCost);
      setRegenRate(regenRate + 1);
      setRegenLevel(regenLevel + 1);
    }
  };
  
  export const handleMouseDown = (setIsClicking) => {
    setIsClicking(true);
  };
  
  export const handleMouseUp = (setIsClicking, activityTimeoutRef, setIsImageDistorted, isClicking) => {
    setIsClicking(false);
    clearTimeout(activityTimeoutRef.current);
    activityTimeoutRef.current = setTimeout(() => {
      if (!isClicking) {
        setIsImageDistorted(false);
      }
    }, 2000);
  };
  