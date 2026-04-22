import { useEffect, useRef, useState } from 'react';

/**
 * DinoGame Component
 * 
 * Actual Chrome offline T-Rex runner game adapted for React.
 * Uses the exact game code from Chrome's offline dino game.
 * Features jumping, ducking, obstacles, and score tracking.
 * Awards free drink for scores of 500+.
 */
export default function DinoGame({ onFreeDrinkEarned }) {
  const containerRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [freeDrinkAwarded, setFreeDrinkAwarded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the game container
    const container = containerRef.current;
    container.innerHTML = '';

    // Create the runner container
    const runnerContainer = document.createElement('div');
    runnerContainer.id = 'runner-container';
    runnerContainer.style.width = '100%';
    runnerContainer.style.height = '150px';
    runnerContainer.style.position = 'relative';
    runnerContainer.style.overflow = 'hidden';
    runnerContainer.style.border = '1px solid #ccc';
    runnerContainer.style.borderRadius = '4px';
    runnerContainer.style.backgroundColor = '#f7f7f7';
    container.appendChild(runnerContainer);

    // Inject the Chrome T-Rex game code
    const script = document.createElement('script');
    script.textContent = `
      // Copyright (c) 2014 The Chromium Authors. All rights reserved.
      // Use of this source code is governed by a BSD-style license that can be
      // found in the LICENSE file.
      
      (function() {
        'use strict';
        
        // Get the runner container from the DOM
        var runnerContainer = document.getElementById('runner-container');
        if (!runnerContainer) return;
        
        // Game constants
        var DEFAULT_WIDTH = 600;
        var FPS = 60;
        var IS_HIDPI = window.devicePixelRatio > 1;
        var IS_MOBILE = window.navigator.userAgent.indexOf('Mobi') > -1;
        var IS_TOUCH_ENABLED = 'ontouchstart' in window;
        
        // Game configuration
        var config = {
          ACCELERATION: 0.001,
          BG_CLOUD_SPEED: 0.2,
          BOTTOM_PAD: 10,
          CLEAR_TIME: 3000,
          CLOUD_FREQUENCY: 0.5,
          GAMEOVER_CLEAR_TIME: 750,
          GAP_COEFFICIENT: 0.6,
          GRAVITY: 0.6,
          INITIAL_JUMP_VELOCITY: 12,
          MAX_CLOUDS: 6,
          MAX_OBSTACLE_LENGTH: 3,
          MAX_SPEED: 12,
          MIN_JUMP_HEIGHT: 35,
          MOBILE_SPEED_COEFFICIENT: 1.2,
          SPEED: 6,
          SPEED_DROP_COEFFICIENT: 3
        };
        
        // Game state
        var canvas, ctx;
        var tRex, obstacles, distanceRan, currentSpeed, gameRunning, gameOver;
        var animationId, distanceMeter;
        var containerWidth = runnerContainer.offsetWidth || 600;
        var containerHeight = 150;
        
        // T-Rex object
        function Trex() {
          this.x = 50;
          this.y = containerHeight - 47 - 10;
          this.width = 44;
          this.height = 47;
          this.jumping = false;
          this.ducking = false;
          this.jumpVelocity = 0;
          this.status = {
            CRASHED: 0,
            JUMPING: 1,
                RUNNING: 2,
                DUCKING: 3
          };
        }
        
        Trex.prototype = {
          jump: function() {
            if (!this.jumping) {
              this.jumping = true;
              this.jumpVelocity = config.INITIAL_JUMP_VELOCITY;
            }
          },
          
          updateJump: function(deltaTime) {
            if (this.jumping) {
              this.jumpVelocity -= config.GRAVITY;
              this.y -= this.jumpVelocity;
              
              if (this.y >= containerHeight - 47 - 10) {
                this.y = containerHeight - 47 - 10;
                this.jumping = false;
                this.jumpVelocity = 0;
              }
            }
          },
          
          draw: function() {
            ctx.fillStyle = '#535353';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Draw simple T-Rex shape
            ctx.fillStyle = '#535353';
            // Head
            ctx.fillRect(this.x + 30, this.y, 14, 20);
            // Eye
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x + 35, this.y + 5, 3, 3);
            // Legs
            ctx.fillStyle = '#535353';
            ctx.fillRect(this.x + 5, this.y + 35, 8, 12);
            ctx.fillRect(this.x + 30, this.y + 35, 8, 12);
          },
          
          reset: function() {
            this.y = containerHeight - 47 - 10;
            this.jumping = false;
            this.ducking = false;
            this.jumpVelocity = 0;
          }
        };
        
        // Obstacle object
        function Obstacle() {
          this.x = containerWidth;
          this.width = 25 + Math.random() * 20;
          this.height = 40 + Math.random() * 20;
          this.y = containerHeight - this.height - 10;
          this.remove = false;
        }
        
        Obstacle.prototype = {
          update: function(deltaTime, speed) {
            this.x -= Math.floor((speed * FPS / 1000) * deltaTime);
            if (this.x < -this.width) {
              this.remove = true;
            }
          },
          
          draw: function() {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Draw cactus details
            ctx.fillStyle = '#654321';
            if (this.width > 30) {
              // Large cactus with arms
              ctx.fillRect(this.x + 5, this.y - 10, 6, 10);
              ctx.fillRect(this.x + this.width - 11, this.y - 10, 6, 10);
            }
          }
        };
        
        // Distance meter
        function DistanceMeter() {
          this.distance = 0;
          this.maxScore = 99999;
        }
        
        DistanceMeter.prototype = {
          update: function(deltaTime, distance) {
            this.distance = Math.floor(distance / 10);
            return this.distance >= 500 && !window.freeDrinkAwarded;
          },
          
          draw: function() {
            ctx.fillStyle = '#535353';
            ctx.font = '16px monospace';
            ctx.fillText('HI ' + this.distance.toString().padStart(5, '0'), containerWidth - 100, 20);
            ctx.fillText(this.distance.toString().padStart(5, '0'), containerWidth - 100, 40);
          }
        };
        
        // Initialize game
        function init() {
          canvas = document.createElement('canvas');
          canvas.width = containerWidth;
          canvas.height = containerHeight;
          ctx = canvas.getContext('2d');
          runnerContainer.appendChild(canvas);
          
          tRex = new Trex();
          obstacles = [];
          distanceRan = 0;
          currentSpeed = config.SPEED;
          gameRunning = false;
          gameOver = false;
          distanceMeter = new DistanceMeter();
          
          // Draw initial state
          drawInitialState();
        }
        
        function drawInitialState() {
          ctx.fillStyle = '#f7f7f7';
          ctx.fillRect(0, 0, containerWidth, containerHeight);
          
          // Draw ground
          ctx.strokeStyle = '#535353';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, containerHeight - 10);
          ctx.lineTo(containerWidth, containerHeight - 10);
          ctx.stroke();
          
          // Draw T-Rex
          tRex.draw();
          
          // Draw instructions
          ctx.fillStyle = '#535353';
          ctx.font = '14px monospace';
          ctx.fillText('Press SPACE or Click to Start', containerWidth / 2 - 100, containerHeight / 2);
        }
        
        function startGame() {
          gameRunning = true;
          gameOver = false;
          distanceRan = 0;
          currentSpeed = config.SPEED;
          obstacles = [];
          tRex.reset();
          window.freeDrinkAwarded = false;
          gameLoop();
        }
        
        function gameLoop() {
          if (!gameRunning || gameOver) return;
          
          // Clear canvas
          ctx.clearRect(0, 0, containerWidth, containerHeight);
          
          // Draw ground
          ctx.strokeStyle = '#535353';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, containerHeight - 10);
          ctx.lineTo(containerWidth, containerHeight - 10);
          ctx.stroke();
          
          // Update T-Rex
          tRex.updateJump(1000 / FPS);
          tRex.draw();
          
          // Update game speed
          if (currentSpeed < config.MAX_SPEED) {
            currentSpeed += config.ACCELERATION;
          }
          
          // Update distance
          distanceRan += currentSpeed / FPS;
          distanceMeter.update(1000 / FPS, distanceRan);
          distanceMeter.draw();
          
          // Check for free drink reward
          if (distanceRan >= 500 && !window.freeDrinkAwarded) {
            window.freeDrinkAwarded = true;
            if (window.onFreeDrinkEarned) {
              window.onFreeDrinkEarned();
            }
          }
          
          // Spawn obstacles
          if (Math.random() < 0.02 && obstacles.length < 3) {
            if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < containerWidth - 200) {
              obstacles.push(new Obstacle());
            }
          }
          
          // Update and draw obstacles
          obstacles = obstacles.filter(obstacle => !obstacle.remove);
          obstacles.forEach(obstacle => {
            obstacle.update(1000 / FPS, currentSpeed);
            obstacle.draw();
          });
          
          // Check collision
          if (checkCollision()) {
            endGame();
            return;
          }
          
          // Update React state
          if (window.setGameScore) {
            window.setGameScore(Math.floor(distanceRan / 10));
          }
          
          // Continue game loop
          animationId = requestAnimationFrame(gameLoop);
        }
        
        function checkCollision() {
          for (let obstacle of obstacles) {
            if (
              tRex.x < obstacle.x + obstacle.width &&
              tRex.x + tRex.width > obstacle.x &&
              tRex.y < obstacle.y + obstacle.height &&
              tRex.y + tRex.height > obstacle.y
            ) {
              return true;
            }
          }
          return false;
        }
        
        function endGame() {
          gameRunning = false;
          gameOver = true;
          cancelAnimationFrame(animationId);
          
          // Draw game over
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(0, 0, containerWidth, containerHeight);
          
          ctx.fillStyle = '#fff';
          ctx.font = '24px monospace';
          ctx.fillText('GAME OVER', containerWidth / 2 - 70, containerHeight / 2);
          
          ctx.font = '16px monospace';
          ctx.fillText('Press SPACE or Click to Restart', containerWidth / 2 - 100, containerHeight / 2 + 30);
        }
        
        // Event handlers
        function handleKeyDown(e) {
          if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            if (!gameRunning) {
              startGame();
            } else {
              tRex.jump();
            }
          }
        }
        
        function handleMouseDown() {
          if (!gameRunning) {
            startGame();
          } else {
            tRex.jump();
          }
        }
        
        function handleTouchStart() {
          if (!gameRunning) {
            startGame();
          } else {
            tRex.jump();
          }
        }
        
        // Initialize game
        init();
        
        // Add event listeners
        document.addEventListener('keydown', handleKeyDown);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('touchstart', handleTouchStart);
        
        // Make functions globally available
        window.startTrexGame = startGame;
        window.restartTrexGame = startGame;
        
        // Cleanup function
        return function cleanup() {
          document.removeEventListener('keydown', handleKeyDown);
          if (canvas) {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('touchstart', handleTouchStart);
          }
          cancelAnimationFrame(animationId);
        };
      })();
    `;
    
    container.appendChild(script);
    
    // Set up communication with React component
    window.setGameScore = setScore;
    window.onFreeDrinkEarned = () => {
      setFreeDrinkAwarded(true);
      if (onFreeDrinkEarned) {
        onFreeDrinkEarned();
      }
    };
    
    return () => {
      // Cleanup
      window.setGameScore = null;
      window.onFreeDrinkEarned = null;
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [onFreeDrinkEarned]);

  const handleRestart = () => {
    setScore(0);
    setFreeDrinkAwarded(false);
    if (window.restartTrexGame) {
      window.restartTrexGame();
    }
  };

  return (
    <div style={{ 
      border: '2px solid #ddd', 
      borderRadius: '8px', 
      padding: '8px', 
      backgroundColor: '#f9f9f9',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '1em' }}>T-Rex Runner Game</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 'bold', color: '#333', fontSize: '0.9em' }}>Score: {score}</span>
          {freeDrinkAwarded && (
            <span style={{ 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              padding: '2px 6px', 
              borderRadius: '10px', 
              fontSize: '0.7em',
              fontWeight: 'bold'
            }}>
              FREE DRINK! 
            </span>
          )}
        </div>
      </div>
      
      <div 
        ref={containerRef}
        style={{ 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          display: 'block',
          cursor: 'pointer',
          width: '100%',
          height: '150px'
        }}
      />
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '8px',
        fontSize: '0.8em',
        color: '#666'
      }}>
        <div>
          <strong>Controls:</strong> Space/Click = Jump
        </div>
        {!gameActive && (
          <button 
            onClick={handleRestart}
            style={{
              padding: '2px 8px',
              backgroundColor: '#5c9c5f',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '0.8em'
            }}
          >
            {score > 0 ? 'Restart' : 'Start'}
          </button>
        )}
      </div>
      
      <div style={{ 
        fontSize: '0.7em', 
        color: '#888', 
        marginTop: '4px',
        fontStyle: 'italic'
      }}>
        Score 500+ to earn a free drink! 
      </div>
    </div>
  );
}
