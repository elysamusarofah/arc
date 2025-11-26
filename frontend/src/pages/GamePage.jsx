import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import "../styles/GamePage.css";

const GamePage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("ready"); // ready, aiming, flying
  const [umbrellaCount, setUmbrellaCount] = useState(5);
  
  const gameRef = useRef({
    umbrella: { x: 150, y: 400, vx: 0, vy: 0, radius: 20, isDragging: false, isFired: false },
    slingshot: { x: 150, y: 400, dragX: 150, dragY: 400 },
    boxes: [],
    gravity: 0.5,
    friction: 0.99,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 600;

    // Initialize boxes (targets)
    initBoxes();

    // Game loop
    const gameLoop = setInterval(() => {
      update();
      draw(ctx);
    }, 1000 / 60);

    // Mouse events
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      clearInterval(gameLoop);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [gameState, umbrellaCount]);

  const initBoxes = () => {
    gameRef.current.boxes = [
      { x: 550, y: 480, width: 60, height: 60, color: "#8a2be2", destroyed: false },
      { x: 610, y: 480, width: 60, height: 60, color: "#9370db", destroyed: false },
      { x: 550, y: 420, width: 60, height: 60, color: "#ba55d3", destroyed: false },
      { x: 610, y: 420, width: 60, height: 60, color: "#da70d6", destroyed: false },
      { x: 580, y: 360, width: 60, height: 60, color: "#ff00ff", destroyed: false },
    ];
  };

  const handleMouseDown = (e) => {
    if (gameState !== "ready" || umbrellaCount <= 0) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const { umbrella } = gameRef.current;
    const distance = Math.sqrt((mouseX - umbrella.x) ** 2 + (mouseY - umbrella.y) ** 2);
    
    if (distance < umbrella.radius * 2) {
      umbrella.isDragging = true;
      setGameState("aiming");
    }
  };

  const handleMouseMove = (e) => {
    if (!gameRef.current.umbrella.isDragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const { slingshot } = gameRef.current;
    
    // Limit drag distance
    const dx = mouseX - slingshot.x;
    const dy = mouseY - slingshot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 100;
    
    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      slingshot.dragX = slingshot.x + Math.cos(angle) * maxDistance;
      slingshot.dragY = slingshot.y + Math.sin(angle) * maxDistance;
    } else {
      slingshot.dragX = mouseX;
      slingshot.dragY = mouseY;
    }
    
    gameRef.current.umbrella.x = slingshot.dragX;
    gameRef.current.umbrella.y = slingshot.dragY;
  };

  const handleMouseUp = () => {
    const { umbrella, slingshot } = gameRef.current;
    
    if (!umbrella.isDragging) return;
    
    umbrella.isDragging = false;
    
    // Calculate launch velocity
    const dx = slingshot.x - slingshot.dragX;
    const dy = slingshot.y - slingshot.dragY;
    
    umbrella.vx = dx * 0.2;
    umbrella.vy = dy * 0.2;
    umbrella.isFired = true;
    
    setGameState("flying");
    setUmbrellaCount(prev => prev - 1);
  };

  const update = () => {
    const { umbrella, boxes, gravity, friction } = gameRef.current;
    
    if (gameState === "flying") {
      // Apply physics
      umbrella.vy += gravity;
      umbrella.x += umbrella.vx;
      umbrella.y += umbrella.vy;
      umbrella.vx *= friction;
      
      // Check collision with boxes
      boxes.forEach((box) => {
        if (box.destroyed) return;
        
        if (
          umbrella.x > box.x &&
          umbrella.x < box.x + box.width &&
          umbrella.y > box.y &&
          umbrella.y < box.y + box.height
        ) {
          box.destroyed = true;
          setScore(prev => prev + 100);
          umbrella.vx *= 0.5;
          umbrella.vy *= 0.5;
        }
      });
      
      // Check if umbrella is out of bounds or stopped
      if (umbrella.y > 600 || (umbrella.y > 500 && Math.abs(umbrella.vx) < 0.1 && Math.abs(umbrella.vy) < 0.1)) {
        resetUmbrella();
      }
    }
  };

  const resetUmbrella = () => {
    const { umbrella, slingshot } = gameRef.current;
    umbrella.x = slingshot.x;
    umbrella.y = slingshot.y;
    umbrella.vx = 0;
    umbrella.vy = 0;
    umbrella.isFired = false;
    slingshot.dragX = slingshot.x;
    slingshot.dragY = slingshot.y;
    setGameState("ready");
  };

  const draw = (ctx) => {
    // Clear canvas
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, 800, 600);
    
    // Draw ground
    ctx.fillStyle = "#2a2a3f";
    ctx.fillRect(0, 540, 800, 60);
    
    // Draw slingshot
    const { slingshot, umbrella } = gameRef.current;
    ctx.strokeStyle = "#8a2be2";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(slingshot.x - 20, slingshot.y);
    ctx.lineTo(slingshot.x - 20, slingshot.y - 60);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(slingshot.x + 20, slingshot.y);
    ctx.lineTo(slingshot.x + 20, slingshot.y - 60);
    ctx.stroke();
    
    // Draw elastic band
    if (gameState === "aiming") {
      ctx.strokeStyle = "#ff00ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(slingshot.x - 20, slingshot.y - 60);
      ctx.lineTo(umbrella.x, umbrella.y);
      ctx.lineTo(slingshot.x + 20, slingshot.y - 60);
      ctx.stroke();
    }
    
    // Draw boxes
    gameRef.current.boxes.forEach((box) => {
      if (!box.destroyed) {
        ctx.fillStyle = box.color;
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
      }
    });
    
    // Draw umbrella (purple umbrella emoji)
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("☂️", umbrella.x, umbrella.y);
    
    // Add shadow/glow to umbrella
    ctx.shadowColor = "#8a2be2";
    ctx.shadowBlur = 15;
    ctx.fillText("☂️", umbrella.x, umbrella.y);
    ctx.shadowBlur = 0;
  };

  const handleReset = () => {
    setScore(0);
    setUmbrellaCount(5);
    setGameState("ready");
    initBoxes();
    resetUmbrella();
  };

  const allBoxesDestroyed = gameRef.current.boxes.every(box => box.destroyed);

  return (
    <div className="game-page">
      <div className="game-header">
        <Button
          onClick={() => navigate("/")}
          className="bg-transparent border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        
        <div className="game-title">
          <h1 className="text-3xl font-bold" style={{ 
            background: 'linear-gradient(90deg, #ff00ff, #ff1493)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            🎮 GAMEPC - Purple Umbrella Launcher
          </h1>
        </div>
        
        <Button
          onClick={handleReset}
          className="cyber-button"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Umbrellas:</span>
          <span className="stat-value">{umbrellaCount}</span>
        </div>
      </div>

      <div className="game-canvas-container">
        <canvas ref={canvasRef} className="game-canvas" />
        <div className="game-instructions">
          {gameState === "ready" && umbrellaCount > 0 && !allBoxesDestroyed && (
            <p>🎯 Drag the umbrella ☂️ to aim and release to launch!</p>
          )}
          {umbrellaCount === 0 && !allBoxesDestroyed && (
            <p>🔄 No umbrellas left! Click Reset to play again.</p>
          )}
          {allBoxesDestroyed && (
            <p>🎉 You WIN! All boxes destroyed! Click Reset to play again.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePage;
