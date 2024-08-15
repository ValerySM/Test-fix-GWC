const UniverseData = {
  totalClicks: 0,
  gameScores: {
    appleCatcher: 0,
    purblePairs: 0
  },

  getTotalClicks() {
    return this.totalClicks;
  },

  setTotalClicks(newTotal) {
    this.totalClicks = newTotal;
    this.saveToLocalStorage();
  },

  addGameScore(gameType, score) {
    if (gameType in this.gameScores) {
      // Обновляем счёт игры, добавляя новые очки
      this.gameScores[gameType] = score;
      // Добавляем или вычитаем из общего счёта в зависимости от набранных очков
      this.totalClicks += score;
      this.saveToLocalStorage();
      console.log(`Updated ${gameType} score:`, this.gameScores[gameType]);
      console.log('New total clicks:', this.totalClicks);
    } else {
      console.error('Неизвестный тип игры:', gameType);
    }
  },

  saveToLocalStorage() {
    localStorage.setItem('universeData', JSON.stringify({
      totalClicks: this.totalClicks,
      gameScores: this.gameScores
    }));
  },

  loadFromLocalStorage() {
    const savedData = localStorage.getItem('universeData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.totalClicks = parsedData.totalClicks || 0;
      this.gameScores = parsedData.gameScores || {
        appleCatcher: 0,
        purblePairs: 0
      };
    }
  },

  init() {
    this.loadFromLocalStorage();
  }
};

UniverseData.init();

export default UniverseData;
