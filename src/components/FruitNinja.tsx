import React, { useState, useEffect, useRef } from 'react';

// Type definitions
interface Fruit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  emoji: string;
  color: string;
  sliced: boolean;
}

interface SlicedFruit extends Fruit {
  timeAlive: number;
}

interface Point {
  x: number;
  y: number;
  time: number;
}

interface Explosion {
  x: number;
  y: number;
  timeAlive: number;
  triggerGameOver: boolean;
}

// Bombhit state tracking - separate from game over
interface GameState {
  active: boolean;
  fadeStartTime: number;
  fadeProgress: number; // 0 to 1
  bombHit: boolean; // Flag to track if a bomb was hit
  score: number; // Track high score for this session
}

interface FruitType {
  emoji: string;
  color: string;
}

const FruitNinja: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  
  // Game state references (to avoid closures in event handlers)
  const fruitsRef = useRef<Fruit[]>([]);
  const slashPointsRef = useRef<Point[]>([]);
  const slicedsRef = useRef<SlicedFruit[]>([]);
  const bombsRef = useRef<Fruit[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const lastTimeRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const gameOverRef = useRef<GameState>({
    active: false,
    fadeStartTime: 0,
    fadeProgress: 0,
    bombHit: false,
    score: 0,
  });
  const gameStartedRef = useRef<boolean>(false);
  const gameOverTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update refs when state changes
  useEffect(() => {
    scoreRef.current = score;
    gameOverRef.current.active = gameOver;
    gameStartedRef.current = gameStarted;
  }, [score, gameOver, gameStarted]);
  
  const fruits: FruitType[] = [
    { emoji: '🍎', color: '#ff0000' },
    { emoji: '🍊', color: '#ffa500' },
    { emoji: '🍋', color: '#ffff00' },
    { emoji: '🍉', color: '#ff6347' },
    { emoji: '🍇', color: '#9370db' },
    { emoji: '🍓', color: '#dc143c' },
    { emoji: '🍑', color: '#ffdab9' },
    { emoji: '🍍', color: '#ffd700' },
  ];
  
  const bomb: FruitType = { emoji: '💣', color: '#000000' };
  
  const initGame = (): void => {
    // Clear any existing game over timer
    if (gameOverTimerRef.current) {
      clearTimeout(gameOverTimerRef.current);
      gameOverTimerRef.current = null;
    }
    
    // Save the current score as high score if it's higher
    if (score > gameOverRef.current.score) {
      gameOverRef.current.score = score;
    }
    
    fruitsRef.current = [];
    slashPointsRef.current = [];
    slicedsRef.current = [];
    bombsRef.current = [];
    explosionsRef.current = [];
    setScore(0);
    setGameOver(false);
    gameOverRef.current = {
      ...gameOverRef.current,
      active: false,
      fadeStartTime: 0,
      fadeProgress: 0,
      bombHit: false
    };
    setGameStarted(true);
    lastTimeRef.current = 0;
    requestAnimationFrame(gameLoop);
  };
  
  // Create a new fruit
  const createFruit = (): Fruit => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Canvas is not available");
    
    const fruit = fruits[Math.floor(Math.random() * fruits.length)];
    const x = Math.random() * (canvas.width - 50) + 25;
    const vx = (Math.random() - 0.5) * 4;
    const vy = -15 - Math.random() * 5; // Upward velocity
    
    return {
      x,
      y: canvas.height + 30,
      vx,
      vy,
      radius: 45, // Increased from 30 to 45
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      emoji: fruit.emoji,
      color: fruit.color,
      sliced: false
    };
  };
  
  // Create a bomb
  const createBomb = (): Fruit => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Canvas is not available");
    
    const x = Math.random() * (canvas.width - 50) + 25;
    const vx = (Math.random() - 0.5) * 4;
    const vy = -15 - Math.random() * 5; // Upward velocity
    
    return {
      x,
      y: canvas.height + 30,
      vx,
      vy,
      radius: 45, // Increased from 30 to 45
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      emoji: bomb.emoji,
      color: bomb.color,
      sliced: false
    };
  };
  
  // Game loop
  const gameLoop = (timestamp: number): void => {
    if (!gameStartedRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const gravity = 0.5;
    const dt = Math.min(1, (timestamp - lastTimeRef.current) / 16);
    lastTimeRef.current = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Randomly spawn new fruits if game is not over
    if (!gameOverRef.current.active && Math.random() < 0.02 * dt) {
      fruitsRef.current.push(createFruit());
    }
    
    // Randomly spawn bombs if game is not over
    if (!gameOverRef.current.active && Math.random() < 0.005 * dt) {
      bombsRef.current.push(createBomb());
    }
    
    // Draw background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw slash trail with blade-like effect
    if (slashPointsRef.current.length > 1) {
      // Draw glow effect behind the main blade line
      ctx.beginPath();
      ctx.moveTo(slashPointsRef.current[0].x, slashPointsRef.current[0].y);
      
      for (let i = 1; i < slashPointsRef.current.length; i++) {
        ctx.lineTo(slashPointsRef.current[i].x, slashPointsRef.current[i].y);
      }
      
      // Outer glow (blue/white)
      ctx.strokeStyle = 'rgba(120, 190, 255, 0.4)';
      ctx.lineWidth = 8; // Reduced from 12 to 8
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      
      // Draw main blade line with varying opacity
      ctx.beginPath();
      ctx.moveTo(slashPointsRef.current[0].x, slashPointsRef.current[0].y);
      
      // Draw line segments with varying opacity
      for (let i = 1; i < slashPointsRef.current.length; i++) {
        ctx.lineTo(slashPointsRef.current[i].x, slashPointsRef.current[i].y);
      }
      
      // Main slice line (bright white)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 3; // Reduced from 6 to 3
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      
      // Add sparkle effects at the newest point (tip of the blade)
      if (slashPointsRef.current.length > 0) {
        const newestPoint = slashPointsRef.current[slashPointsRef.current.length - 1];
        
        // Draw small sparkles
        for (let i = 0; i < 3; i++) {
          const sparkOffset = Math.random() * 10 - 5;
          const sparkSize = Math.random() * 5 + 2;
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(
            newestPoint.x + sparkOffset, 
            newestPoint.y + sparkOffset, 
            sparkSize, 
            0, 
            Math.PI * 2
          );
          ctx.fill();
        }
      }
      
      // Fade out slash points
      slashPointsRef.current = slashPointsRef.current.filter(
        (point) => timestamp - point.time < 200
      );
    }
    
    // Update and draw fruits
    fruitsRef.current = fruitsRef.current.filter((fruit) => {
      // Apply physics
      fruit.vy += gravity * dt;
      fruit.x += fruit.vx * dt;
      fruit.y += fruit.vy * dt;
      fruit.rotation += fruit.rotationSpeed * dt;
      
      // Check if the fruit is out of bounds
      if (fruit.y > canvas.height + 100) {
        return false;
      } else {
        // Draw fruit
        ctx.save();
        ctx.translate(fruit.x, fruit.y);
        ctx.rotate(fruit.rotation);
        ctx.font = '60px Arial'; // Increased from 40px to 60px
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fruit.emoji, 0, 0);
        ctx.restore();
        return true;
      }
    });
    
    // Update and draw bombs
    bombsRef.current = bombsRef.current.filter((bomb) => {
      // Apply physics
      bomb.vy += gravity * dt;
      bomb.x += bomb.vx * dt;
      bomb.y += bomb.vy * dt;
      bomb.rotation += bomb.rotationSpeed * dt;
      
      // Check if the bomb is out of bounds
      if (bomb.y > canvas.height + 100) {
        return false;
      } else {
        // Draw bomb
        ctx.save();
        ctx.translate(bomb.x, bomb.y);
        ctx.rotate(bomb.rotation);
        ctx.font = '60px Arial'; // Increased from 40px to 60px
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bomb.emoji, 0, 0);
        ctx.restore();
        return true;
      }
    });
    
    // Update and draw sliced fruits
    slicedsRef.current = slicedsRef.current.filter((sliced) => {
      // Apply physics
      sliced.vy += gravity * dt;
      sliced.x += sliced.vx * dt;
      sliced.y += sliced.vy * dt;
      sliced.rotation += sliced.rotationSpeed * dt;
      sliced.timeAlive += dt;
      
      // Remove if too old or out of bounds
      if (sliced.timeAlive > 100 || sliced.y > canvas.height + 100) {
        return false;
      } else {
        // Calculate opacity based on timeAlive (faster fade - completes in half the time)
        const opacity = Math.max(0, 1 - sliced.timeAlive / 50);
        
        // Draw sliced piece (smaller) with fading effect
        ctx.save();
        ctx.translate(sliced.x, sliced.y);
        ctx.rotate(sliced.rotation);
        ctx.globalAlpha = opacity;
        ctx.font = '45px Arial'; // Increased from 30px to 45px, maintaining proportionally smaller than whole fruit
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sliced.emoji, 0, 0);
        ctx.restore();
        return true;
      }
    });
    
    // Update and draw explosions
    explosionsRef.current = explosionsRef.current.filter((explosion) => {
      // Update explosion
      explosion.timeAlive += dt;
      
      // Check if this explosion should trigger game over
      if (explosion.triggerGameOver && explosion.timeAlive > 30) {
        explosion.triggerGameOver = false; // Prevent multiple triggers
        
        // Schedule game over after a delay if not already done
        if (!gameOverRef.current.active && !gameOverTimerRef.current) {
          gameOverTimerRef.current = setTimeout(() => {
            console.log("SETTING GAME OVER TO TRUE");
            setGameOver(true);
            gameOverRef.current.active = true;
            gameOverRef.current.fadeStartTime = performance.now();
            gameOverRef.current.fadeProgress = 0;
          }, 1000); // 1-second delay
        }
      }
      
      // Remove if too old
      if (explosion.timeAlive > 50) {
        return false;
      } else {
        // Draw explosion with fade out
        const opacity = 1 - explosion.timeAlive / 50;
        const scale = 1 + explosion.timeAlive / 15;
        
        ctx.save();
        ctx.translate(explosion.x, explosion.y);
        ctx.scale(scale, scale);
        ctx.globalAlpha = opacity;
        ctx.font = '80px Arial'; // Increased from 60px to 80px
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💥', 0, 0);
        ctx.restore();
        return true;
      }
    });
    
    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${scoreRef.current}`, 20, 40);
    
    // Game over screen with fade-in animation
    if (gameOverRef.current.active) {
      // Update fade progress
      if (gameOverRef.current.fadeProgress < 1) {
        const fadeElapsed = timestamp - gameOverRef.current.fadeStartTime;
        const fadeDuration = 1000; // 1 second fade-in
        gameOverRef.current.fadeProgress = Math.min(1, fadeElapsed / fadeDuration);
      }
      
      // Apply fade effect to all elements
      const fadeOpacity = gameOverRef.current.fadeProgress;
      
      // Dark overlay with fade-in
      ctx.fillStyle = `rgba(0, 0, 0, ${1 * fadeOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Only render if we've started fading in
      if (fadeOpacity > 0) {
        // Game Over text (red at top) with fade-in
        ctx.fillStyle = `rgba(255, 51, 51, ${fadeOpacity})`;
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height * 0.3);
        
        // Final score with fade-in
        ctx.fillStyle = `rgba(255, 255, 255, ${fadeOpacity})`;
        ctx.font = '32px Arial';
        ctx.fillText(`Final Score: ${scoreRef.current}`, canvas.width / 2, canvas.height * 0.45);
        
        // Only show buttons when fade is complete
        if (fadeOpacity > 0.7) {
          const buttonWidth = 220;
          const buttonHeight = 60;
          const buttonX = canvas.width / 2 - buttonWidth / 2;
          
          // Button opacity based on fade progress, but accelerated to appear later
          const buttonOpacity = Math.max(0, (fadeOpacity - 0.7) / 0.3);
          
          // SHARE BUTTON - First button
          const shareButtonY = canvas.height * 0.6;
          
          // Share button background with fade-in
          ctx.fillStyle = `#7c65c1`; // warpcast purple color
          ctx.fillRect(buttonX, shareButtonY, buttonWidth, buttonHeight);
          
          // Share button border with fade-in
          ctx.strokeStyle = `rgba(255, 255, 255, ${buttonOpacity})`;
          ctx.lineWidth = 3;
          ctx.strokeRect(buttonX, shareButtonY, buttonWidth, buttonHeight);
          
          // Share button text with fade-in
          ctx.fillStyle = `rgba(255, 255, 255, ${buttonOpacity})`;
          ctx.font = 'bold 28px Arial';
          ctx.textBaseline = 'middle';
          ctx.fillText('CAST SCORE', canvas.width / 2, shareButtonY + buttonHeight / 2);
          
          // PLAY AGAIN BUTTON - Second button (20px below first button)
          const playAgainY = shareButtonY + buttonHeight + 20;
          
          // Play Again button background with fade-in
          ctx.fillStyle = `rgba(76, 175, 80, ${buttonOpacity})`; // Green color
          ctx.fillRect(buttonX, playAgainY, buttonWidth, buttonHeight);
          
          // Play Again button border with fade-in
          ctx.strokeStyle = `rgba(255, 255, 255, ${buttonOpacity})`;
          ctx.lineWidth = 3;
          ctx.strokeRect(buttonX, playAgainY, buttonWidth, buttonHeight);
          
          // Play Again button text with fade-in
          ctx.fillStyle = `rgba(255, 255, 255, ${buttonOpacity})`;
          ctx.font = 'bold 28px Arial';
          ctx.textBaseline = 'middle';
          ctx.fillText('PLAY AGAIN', canvas.width / 2, playAgainY + buttonHeight / 2);
        }
      }
    }
    
    // Start screen
    if (!gameStartedRef.current) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'white';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Fruit Ninja', canvas.width / 2, canvas.height / 2 - 50);
      
      ctx.font = '24px Arial';
      ctx.fillText('Slash fruits! Avoid bombs!', canvas.width / 2, canvas.height / 2);
      
      ctx.font = '18px Arial';
      ctx.fillText('Tap to start', canvas.width / 2, canvas.height / 2 + 50);
    }
    
    requestAnimationFrame(gameLoop);
  };
  
  // Check for collisions between slash and objects
  const checkSlashCollisions = (): void => {
    if (slashPointsRef.current.length < 2) return;
    
    // Don't check collisions if a bomb has been hit or game over is active
    if (gameOverRef.current.bombHit || gameOverRef.current.active) {
      return;
    }
    
    // Check collisions with fruits
    fruitsRef.current = fruitsRef.current.filter((fruit) => {
      // Check if this fruit is hit by the slash
      for (let i = 1; i < slashPointsRef.current.length; i++) {
        const p1 = slashPointsRef.current[i - 1];
        const p2 = slashPointsRef.current[i];
        
        // Simple line-circle collision detection
        if (lineCircleCollision(p1.x, p1.y, p2.x, p2.y, fruit.x, fruit.y, fruit.radius)) {
          // Create two sliced pieces
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          
          // Left half with velocity going left
          slicedsRef.current.push({
            x: fruit.x - Math.cos(angle) * 5,
            y: fruit.y - Math.sin(angle) * 5,
            vx: fruit.vx - Math.cos(angle + Math.PI / 2) * 3,
            vy: fruit.vy - Math.sin(angle + Math.PI / 2) * 3,
            emoji: fruit.emoji,
            color: fruit.color,
            rotation: fruit.rotation,
            rotationSpeed: fruit.rotationSpeed - 0.1,
            radius: fruit.radius,
            sliced: true,
            timeAlive: 0
          });
          
          // Right half with velocity going right
          slicedsRef.current.push({
            x: fruit.x + Math.cos(angle) * 5,
            y: fruit.y + Math.sin(angle) * 5,
            vx: fruit.vx + Math.cos(angle + Math.PI / 2) * 3,
            vy: fruit.vy + Math.sin(angle + Math.PI / 2) * 3,
            emoji: fruit.emoji,
            color: fruit.color,
            rotation: fruit.rotation,
            rotationSpeed: fruit.rotationSpeed + 0.1,
            radius: fruit.radius,
            sliced: true,
            timeAlive: 0
          });
          
          // Increase score
          setScore(prevScore => prevScore + 1);
          
          // Remove the original fruit
          return false;
        }
      }
      
      // Keep the fruit if not sliced
      return true;
    });
    
    // Check collisions with bombs
    bombsRef.current = bombsRef.current.filter((bomb) => {
      // Check if this bomb is hit by the slash
      for (let i = 1; i < slashPointsRef.current.length; i++) {
        const p1 = slashPointsRef.current[i - 1];
        const p2 = slashPointsRef.current[i];
        
        // Simple line-circle collision detection
        if (lineCircleCollision(p1.x, p1.y, p2.x, p2.y, bomb.x, bomb.y, bomb.radius)) {
          // Mark bomb as hit immediately to prevent further scoring
          gameOverRef.current.bombHit = true;
          
          // Create explosion effect
          explosionsRef.current.push({
            x: bomb.x,
            y: bomb.y,
            timeAlive: 0,
            triggerGameOver: true
          });
          
          // Remove the bomb
          return false;
        }
      }
      
      // Keep the bomb if not hit
      return true;
    });
  };
  
  // Line-circle collision detection
  const lineCircleCollision = (
    x1: number, 
    y1: number, 
    x2: number, 
    y2: number, 
    cx: number, 
    cy: number, 
    r: number
  ): boolean => {
    // Vector from line start to circle center
    const dx = cx - x1;
    const dy = cy - y1;
    
    // Vector along line
    const ex = x2 - x1;
    const ey = y2 - y1;
    
    // Normalize line vector
    const len = Math.sqrt(ex * ex + ey * ey);
    const nx = ex / len;
    const ny = ey / len;
    
    // Project circle center onto line
    const projection = dx * nx + dy * ny;
    
    // Closest point on line to circle
    let closestX: number, closestY: number;
    
    // Clamp projection to line segment
    if (projection < 0) {
      closestX = x1;
      closestY = y1;
    } else if (projection > len) {
      closestX = x2;
      closestY = y2;
    } else {
      closestX = x1 + nx * projection;
      closestY = y1 + ny * projection;
    }
    
    // Distance from closest point to circle center
    const distance = Math.sqrt(
      (cx - closestX) * (cx - closestX) + (cy - closestY) * (cy - closestY)
    );
    
    // Check if distance is less than circle radius
    return distance <= r;
  };
  
  // Event handlers for touch/mouse
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    let isSlashing = false;
    
    const handleStart = (e: MouseEvent | TouchEvent): void => {
      e.preventDefault();
      
      // Get position
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e 
        ? e.touches[0]?.clientX 
        : (e as MouseEvent).clientX;
      const clientY = 'touches' in e 
        ? e.touches[0]?.clientY 
        : (e as MouseEvent).clientY;
      
      if (clientX === undefined || clientY === undefined) return;
      
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      console.log("Canvas click at:", x, y);
      
      // Check if click/touch is on the buttons when game is over
      if (gameOverRef.current.active && gameOverRef.current.fadeProgress > 0.9) {
        const buttonWidth = 220;
        const buttonHeight = 60;
        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const shareButtonY = canvas.height * 0.6;
        const playAgainY = shareButtonY + buttonHeight + 20;
        
        console.log("Button check - Share:", {
          buttonX, y: shareButtonY, buttonWidth, buttonHeight, 
          clicked: (x >= buttonX && x <= buttonX + buttonWidth && y >= shareButtonY && y <= shareButtonY + buttonHeight)
        });
        
        console.log("Button check - Play Again:", {
          buttonX, y: playAgainY, buttonWidth, buttonHeight, 
          clicked: (x >= buttonX && x <= buttonX + buttonWidth && y >= playAgainY && y <= playAgainY + buttonHeight)
        });
        
        // Check if Share button was clicked
        if (
          x >= buttonX && 
          x <= buttonX + buttonWidth && 
          y >= shareButtonY && 
          y <= shareButtonY + buttonHeight
        ) {
          console.log("Share button clicked!");
          // Open a share prompt or use the browser's share API if available
          const link = encodeURIComponent('TODO');
          const text = `🍎🍊🍋🍉🍇🍓🍑🍍%0A%0AMy%20score%20on%20Fruit%20Ninja%20is%20${scoreRef.current}%0A%0ATry%20to%20beat%20my%20score%20here%3A%20${link}%20%0A%0A🍎🍊🍋🍉🍇🍓🍑🍍`
          const shareLink = `https://warpcast.com/~/compose?text=${text}`;

          // NOTE: opening a deeplink cast is weird in the warpcast webview since it leads to a deadend.
          // Not sure of a good workaround at the moment.
          window.location.href = shareLink;

          return;
        }
        
        // Check if Play Again button was clicked
        if (
          x >= buttonX && 
          x <= buttonX + buttonWidth && 
          y >= playAgainY && 
          y <= playAgainY + buttonHeight
        ) {
          console.log("Play Again button clicked!");
          initGame();
          return;
        }
        
        return; // If game is over but button not clicked, do nothing
      }
      
      // Start a new game if not started yet
      if (!gameStartedRef.current) {
        initGame();
        return;
      }
      
      isSlashing = true;
      slashPointsRef.current = [];
      
      // Add first slash point
      slashPointsRef.current.push({ x, y, time: performance.now() });
    };
    
    const handleMove = (e: MouseEvent | TouchEvent): void => {
      if (!isSlashing) return;
      e.preventDefault();
      
      // Don't process slashing if a bomb has been hit
      if (gameOverRef.current.bombHit || gameOverRef.current.active) {
        return;
      }
      
      // Get position
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e 
        ? e.touches[0]?.clientX 
        : (e as MouseEvent).clientX;
      const clientY = 'touches' in e 
        ? e.touches[0]?.clientY 
        : (e as MouseEvent).clientY;
      
      if (clientX === undefined || clientY === undefined) return;
      
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      // Add new slash point
      slashPointsRef.current.push({ x, y, time: performance.now() });
      
      // Check for collisions
      checkSlashCollisions();
    };
    
    const handleEnd = (): void => {
      isSlashing = false;
    };
    
    // Add event listeners
    canvas.addEventListener('mousedown', handleStart as EventListener);
    canvas.addEventListener('mousemove', handleMove as EventListener);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);
    
    canvas.addEventListener('touchstart', handleStart as EventListener);
    canvas.addEventListener('touchmove', handleMove as EventListener);
    canvas.addEventListener('touchend', handleEnd);
    canvas.addEventListener('touchcancel', handleEnd);
    
    // Resize handler
    const handleResize = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Start game loop
    requestAnimationFrame(gameLoop);
    
    // Clean up
    return () => {
      if (gameOverTimerRef.current) {
        clearTimeout(gameOverTimerRef.current);
      }
      
      canvas.removeEventListener('mousedown', handleStart as EventListener);
      canvas.removeEventListener('mousemove', handleMove as EventListener);
      canvas.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('mouseleave', handleEnd);
      
      canvas.removeEventListener('touchstart', handleStart as EventListener);
      canvas.removeEventListener('touchmove', handleMove as EventListener);
      canvas.removeEventListener('touchend', handleEnd);
      canvas.removeEventListener('touchcancel', handleEnd);
      
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="w-full h-full bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

export default FruitNinja;