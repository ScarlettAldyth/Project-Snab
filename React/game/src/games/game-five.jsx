import React, { useState, useEffect, useRef } from 'react';

// Configuration
const SCREEN_WIDTH_PX = 256.522;
const SCREEN_HEIGHT_PX = 773.044;
const DRAGON_SIZE = 40;
const EGG_SIZE = 25;
const SPAWN_INTERVAL = 1500; // ms
const EGG_LIFETIME = 5000; // ms, time before egg disappears

const GameFive = () => {
    const [score, setScore] = useState(0);
    const [dragonPos, setDragonPos] = useState({ x: SCREEN_WIDTH_PX / 2, y: SCREEN_HEIGHT_PX / 2 });
    const [eggs, setEggs] = useState([]);
    const containerRef = useRef(null);
    const requestRef = useRef();
    const lastSpawnTime = useRef(0);

    // Mouse Tracking Logic
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                let x = e.clientX - rect.left;
                let y = e.clientY - rect.top;

                // Clamp to bounds (keeping dragon fully inside or center point logic? Let's use center point)
                // Center point tracking feels better for games.
                // Clamp so it doesn't go too far off
                x = Math.max(0, Math.min(x, SCREEN_WIDTH_PX));
                y = Math.max(0, Math.min(y, SCREEN_HEIGHT_PX));

                setDragonPos({ x, y });
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, []);

    // Game Loop (Spawning & Cleaning Eggs)
    useEffect(() => {
        const gameLoop = (time) => {
            // Spawn Eggs
            if (time - lastSpawnTime.current > SPAWN_INTERVAL) {
                const newEgg = {
                    id: Date.now(),
                    x: Math.random() * (SCREEN_WIDTH_PX - EGG_SIZE),
                    y: Math.random() * (SCREEN_HEIGHT_PX - EGG_SIZE), // Keep away from extreme edges?
                    createdAt: time
                };
                setEggs(prev => [...prev, newEgg]);
                lastSpawnTime.current = time;
            }

            // Remove Expired Eggs
            setEggs(prevEggs => prevEggs.filter(egg => time - egg.createdAt < EGG_LIFETIME));

            requestRef.current = requestAnimationFrame(gameLoop);
        };

        requestRef.current = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    // Collision Detection
    useEffect(() => {
        // Find eggs that are colliding with the dragon
        const collectedEggIds = [];

        eggs.forEach(egg => {
            const dx = dragonPos.x - (egg.x + EGG_SIZE / 2);
            const dy = dragonPos.y - (egg.y + EGG_SIZE / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < (DRAGON_SIZE / 2 + EGG_SIZE / 2)) {
                collectedEggIds.push(egg.id);
            }
        });

        if (collectedEggIds.length > 0) {
            // Increment score (1 point per egg)
            setScore(prev => prev + collectedEggIds.length);

            // Remove collected eggs
            setEggs(prev => prev.filter(egg => !collectedEggIds.includes(egg.id)));
        }
    }, [dragonPos, eggs]);

    const resetGame = () => {
        setScore(0);
        setEggs([]);
        // We don't reset dragonPos as it follows mouse anyway
    };

    return (
        <div
            ref={containerRef}
            style={{
                width: `${SCREEN_WIDTH_PX}px`,
                height: `${SCREEN_HEIGHT_PX}px`,
                border: '1px solid black',
                backgroundColor: '#87CEEB', // Sky blue because Dragons fly?
                position: 'relative',
                overflow: 'hidden',
                cursor: 'none' // Hide default cursor for immersion
            }}
        >
            {/* HUD */}
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '0',
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0 20px',
                boxSizing: 'border-box',
                zIndex: 100,
                pointerEvents: 'none' // Let clicks pass through if needed
            }}>
                <div style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '24px',
                    textShadow: '2px 2px 0 #000'
                }}>
                    Score: {score}
                </div>
            </div>

            {/* Reset Button (Needs pointer events) */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                width: '100%',
                textAlign: 'center',
                zIndex: 100
            }}>
                <button
                    onClick={resetGame}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                    }}
                >
                    Reset Game
                </button>
            </div>


            {/* Eggs */}
            {eggs.map(egg => (
                <div key={egg.id} style={{
                    position: 'absolute',
                    left: egg.x,
                    top: egg.y,
                    width: EGG_SIZE,
                    height: EGG_SIZE,
                    fontSize: `${EGG_SIZE}px`,
                    lineHeight: 1,
                    textAlign: 'center',
                    transition: 'transform 0.2s', // slight pop in effect could be added but might be expensive
                }}>
                    🥚
                </div>
            ))}

            {/* Dragon */}
            <div style={{
                position: 'absolute',
                left: dragonPos.x - DRAGON_SIZE / 2, // Center on cursor
                top: dragonPos.y - DRAGON_SIZE / 2,
                width: DRAGON_SIZE,
                height: DRAGON_SIZE,
                fontSize: `${DRAGON_SIZE}px`,
                lineHeight: 1,
                textAlign: 'center',
                pointerEvents: 'none', // Don't block mouse events
                zIndex: 50
            }}>
                🐉
            </div>
        </div>
    );
};

export default GameFive;
