import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './AppleCatcher.css';
import goodAppleImg from './img/good-apple.png';
import rottenAppleImg from './img/rotten-apple.png';
import catcherImg from './img/catcher.png';

const AppleCatcher = ({ onGameOver }) => {
    const [gameState, setGameState] = useState({
        score: 0,
        time: 60,
        apples: [],
        playerPosition: 50,
        gameStarted: false,
        showResult: false
    });

    const [scoreAnimations, setScoreAnimations] = useState([]);

    const gameLoopRef = useRef(null);
    const lastUpdateTimeRef = useRef(0);

    const checkCollisions = useCallback(() => {
        setGameState(prevState => {
            let newScore = prevState.score;
            const newApples = prevState.apples.filter(apple => {
                const catcherWidth = 25;
                const catcherLeft = prevState.playerPosition - catcherWidth / 2;
                const catcherRight = prevState.playerPosition + catcherWidth / 2;
                const catcherTop = 75;
                const appleBottom = apple.y + 5;

                if (
                    appleBottom >= catcherTop &&
                    appleBottom <= catcherTop + 10 &&
                    apple.x >= catcherLeft &&
                    apple.x <= catcherRight
                ) {
                    const scoreChange = apple.type === 'good' ? 10 : -20;
                    newScore += scoreChange;

                    // Создание уникального ID для анимации
                    const animationId = `${apple.id}-${Date.now()}`;
                    setScoreAnimations(prev => [...prev, {
                        id: animationId,
                        x: apple.x,
                        y: catcherTop - 15,
                        score: scoreChange
                    }]);
                    
                    setTimeout(() => {
                        setScoreAnimations(prev => prev.filter(anim => anim.id !== animationId));
                    }, 1000);

                    return false;
                }
                return apple.y < 100;
            });

            return {
                ...prevState,
                apples: newApples,
                score: newScore
            };
        });
    }, []);

    const gameLoop = useCallback((timestamp) => {
        if (timestamp - lastUpdateTimeRef.current > 50) { // Увеличен интервал обновления
            lastUpdateTimeRef.current = timestamp;
            setGameState(prevState => {
                if (!prevState.gameStarted) return prevState;

                let newApples = prevState.apples.map(apple => ({
                    ...apple,
                    y: apple.y + 0.5,
                }));

                if (Math.random() < 0.01 && newApples.length < 5) { // Уменьшена частота появления яблок
                    newApples.push({
                        id: Date.now(),
                        x: Math.random() * 100,
                        y: 0,
                        type: Math.random() > 0.2 ? 'good' : 'rotten',
                    });
                }

                newApples = newApples.filter(apple => apple.y < 100);

                return {
                    ...prevState,
                    apples: newApples,
                };
            });

            checkCollisions();
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [checkCollisions]);

    useEffect(() => {
        if (gameState.gameStarted && gameState.time > 0) {
            const timer = setInterval(() => {
                setGameState(prev => ({ ...prev, time: prev.time - 1 }));
            }, 1000);

            return () => clearInterval(timer);
        } else if (gameState.time === 0) {
            endGame();
        }
    }, [gameState.gameStarted, gameState.time]);

    useEffect(() => {
        if (gameState.gameStarted) {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        } else {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        }

        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameState.gameStarted, gameLoop]);

    const startGame = () => {
        setGameState({
            ...gameState,
            gameStarted: true,
            score: 0,
            time: 60,
            apples: [],
            showResult: false
        });
    };

    const endGame = () => {
        setGameState(prev => ({
            ...prev,
            gameStarted: false,
            showResult: true
        }));
    };

    const movePlayer = useCallback((e) => {
        if (gameState.gameStarted) {
            const touch = e.touches[0];
            const newPosition = (touch.clientX / window.innerWidth) * 100;
            setGameState(prev => ({ ...prev, playerPosition: newPosition }));
        }
    }, [gameState.gameStarted]);

    const handleResultClose = () => {
        setGameState(prev => ({ ...prev, showResult: false }));
        onGameOver(gameState.score);
    };

    const renderApples = useMemo(() => {
        return gameState.apples.map((apple) => (
            <img
                key={apple.id}
                src={apple.type === 'good' ? goodAppleImg : rottenAppleImg}
                alt={apple.type === 'good' ? 'Good Apple' : 'Rotten Apple'}
                className="apple"
                style={{ 
                    left: `${apple.x}%`, 
                    top: `${apple.y}%`,
                    width: '30px',
                    height: 'auto'
                }}
            />
        ));
    }, [gameState.apples]);

    return (
        <div className="apple-catcher" onTouchMove={movePlayer}>
            <div className="game-info">
                <span>Score: {gameState.score}</span>
                <span>Time: {gameState.time}</span>
            </div>
            {!gameState.gameStarted && !gameState.showResult && (
                <button className="start-button" onClick={startGame}>Start Game</button>
            )}
            <div className="game-area">
                {renderApples}
                {scoreAnimations.map((anim) => (
                    <div
                        key={anim.id}
                        className={`score-animation ${anim.score > 0 ? 'positive' : 'negative'}`}
                        style={{ 
                            left: `${anim.x}%`, 
                            top: `${anim.y}%`,
                            opacity: 1,
                            transform: 'translateY(-20px)',
                            transition: 'opacity 1s, transform 1s'
                        }}
                    >
                        {anim.score > 0 ? `+${anim.score}` : anim.score}
                    </div>
                ))}
                <img
                    src={catcherImg}
                    alt="Catcher"
                    className="player"
                    style={{ 
                        left: `${gameState.playerPosition}%`,
                        width: '90px',
                        height: '90px',
                        bottom: '20%'
                    }}
                />
            </div>
            {gameState.showResult && (
                <div className="result-modal">
                    <div className="result-content">
                        <h2>Game Over!</h2>
                        <p>Your score: {gameState.score}</p>
                        <button onClick={handleResultClose}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppleCatcher;
