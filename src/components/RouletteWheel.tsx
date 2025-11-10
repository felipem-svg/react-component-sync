import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlipText } from "@/components/ui/flip-text";

interface RouletteItem {
  id: number;
  label: string;
  color: string;
  weight?: number;
}

interface RouletteWheelProps {
  items?: RouletteItem[];
  onSpinComplete?: (winner: RouletteItem) => void;
  className?: string;
}

const getColorLight = (color: string) => {
  const colors: { [key: string]: string } = {
    "bg-red-500": "#ef4444",
    "bg-blue-500": "#3b82f6",
    "bg-green-500": "#22c55e",
    "bg-yellow-500": "#eab308",
    "bg-purple-500": "#a855f7",
    "bg-pink-500": "#ec4899",
    "bg-orange-500": "#f97316",
    "bg-teal-500": "#14b8a6",
  };
  return colors[color] || "#ef4444";
};

const getColorDark = (color: string) => {
  const colors: { [key: string]: string } = {
    "bg-red-500": "#b91c1c",
    "bg-blue-500": "#1e40af",
    "bg-green-500": "#15803d",
    "bg-yellow-500": "#a16207",
    "bg-purple-500": "#7e22ce",
    "bg-pink-500": "#be185d",
    "bg-orange-500": "#c2410c",
    "bg-teal-500": "#0f766e",
  };
  return colors[color] || "#b91c1c";
};

const createSegmentPath = (index: number, total: number, radius: number = 200) => {
  const angle = (360 / total) * (Math.PI / 180);
  const startAngle = index * angle - Math.PI / 2;
  const endAngle = (index + 1) * angle - Math.PI / 2;
  
  const x1 = radius + radius * Math.cos(startAngle);
  const y1 = radius + radius * Math.sin(startAngle);
  const x2 = radius + radius * Math.cos(endAngle);
  const y2 = radius + radius * Math.sin(endAngle);
  
  const largeArcFlag = angle > Math.PI ? 1 : 0;
  
  return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

const getGiftPosition = (index: number, total: number, radius: number = 200) => {
  const angle = (360 / total) * (Math.PI / 180);
  const middleAngle = (index + 0.5) * angle - Math.PI / 2;
  const distance = radius * 0.65;
  
  return {
    x: radius + distance * Math.cos(middleAngle) - 40,
    y: radius + distance * Math.sin(middleAngle) - 40
  };
};

export function RouletteWheel({
  items = [
    { id: 1, label: "Prize 1", color: "bg-red-500" },
    { id: 2, label: "Prize 2", color: "bg-blue-500" },
    { id: 3, label: "Prize 3", color: "bg-green-500" },
    { id: 4, label: "Prize 4", color: "bg-yellow-500" },
    { id: 5, label: "Prize 5", color: "bg-purple-500" },
    { id: 6, label: "Prize 6", color: "bg-pink-500" },
    { id: 7, label: "Prize 7", color: "bg-orange-500" },
    { id: 8, label: "Prize 8", color: "bg-teal-500" },
  ],
  onSpinComplete,
  className,
}: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<RouletteItem | null>(null);
  const [showWinner, setShowWinner] = useState(false);

  const segmentAngle = 360 / items.length;

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowWinner(false);
    setWinner(null);

    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 10), 0);
    const randomValue = Math.random() * totalWeight;
    
    let cumulativeWeight = 0;
    let selectedIndex = 0;
    
    for (let i = 0; i < items.length; i++) {
      cumulativeWeight += items[i].weight || 10;
      if (randomValue <= cumulativeWeight) {
        selectedIndex = i;
        break;
      }
    }

    const segmentCenterAngle = selectedIndex * segmentAngle + (segmentAngle / 2);
    const spins = 5 + Math.random() * 3;
    const currentSegmentAbsolutePosition = (rotation + segmentCenterAngle) % 360;
    const rotationNeeded = (360 - currentSegmentAbsolutePosition) % 360;
    const totalRotation = rotation + (spins * 360) + rotationNeeded;

    setRotation(totalRotation);

    setTimeout(() => {
      const winningItem = items[selectedIndex];
      setWinner(winningItem);
      setShowWinner(true);
      setIsSpinning(false);
      if (onSpinComplete) onSpinComplete(winningItem);
    }, 4000);
  };

  const reset = () => {
    setRotation(0);
    setWinner(null);
    setShowWinner(false);
    setIsSpinning(false);
  };

  return (
    <div className={cn("flex flex-col items-center gap-8 p-8", className)}>
      <motion.div 
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
      >
        {/* Premium Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-20">
          <div className="relative">
            <div className="w-0 h-0 border-l-[26px] border-l-transparent border-r-[26px] border-r-transparent border-t-[52px] border-t-amber-400 drop-shadow-2xl" 
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(251, 191, 36, 0.6))'
              }}
            />
            <div className="absolute inset-0 w-0 h-0 border-l-[26px] border-l-transparent border-r-[26px] border-r-transparent border-t-[52px] border-t-yellow-300 opacity-40 blur-sm" />
          </div>
        </div>

        {/* Decorative Outer Ring */}
        <div className="absolute inset-0 rounded-full border-[10px] border-double border-amber-400/60 -m-2 shadow-2xl" />

        {/* Wheel Container */}
        <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] lg:w-[500px] lg:h-[500px]">
          <motion.svg
            viewBox="0 0 400 400"
            className="w-full h-full rounded-full shadow-2xl border-8 border-amber-500"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(251, 191, 36, 0.2)'
            }}
            animate={{ 
              rotate: rotation
            }}
            transition={{
              duration: 4,
              ease: [0.17, 0.67, 0.12, 0.99],
            }}
          >
            {/* Background circle */}
            <circle cx="200" cy="200" r="200" fill="#ffffff" />
            
            {/* Gradients definitions */}
            <defs>
              {items.map((item, i) => (
                <radialGradient key={`grad-${i}`} id={`gradient-${i}`} cx="35%" cy="35%">
                  <stop offset="0%" stopColor={getColorLight(item.color)} />
                  <stop offset="100%" stopColor={getColorDark(item.color)} />
                </radialGradient>
              ))}
              <radialGradient id="center-gradient" cx="40%" cy="40%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f3f4f6" />
              </radialGradient>
            </defs>
            
            {/* Segments */}
            {items.map((item, index) => {
              const giftPos = getGiftPosition(index, items.length, 200);
              return (
                <g key={item.id}>
                  {/* Colored segment */}
                  <path
                    d={createSegmentPath(index, items.length, 200)}
                    fill={`url(#gradient-${index})`}
                    stroke="white"
                    strokeWidth="3"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
                    }}
                  />
                  
                  {/* Gift icon in foreignObject */}
                  <foreignObject
                    x={giftPos.x}
                    y={giftPos.y}
                    width="80"
                    height="80"
                  >
                    <div 
                      className="w-full h-full rounded-full bg-white/95 flex items-center justify-center shadow-lg border-2 border-white/40"
                      style={{
                        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))'
                      }}
                    >
                      <span className="text-5xl">🎁</span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
            
            {/* Center circle - must be last for proper z-index */}
            <circle 
              cx="200" 
              cy="200" 
              r="50" 
              fill="url(#center-gradient)" 
              stroke="#fbbf24" 
              strokeWidth="6"
              style={{
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))'
              }}
            />
            
            {/* Star icon in center */}
            <text 
              x="200" 
              y="220" 
              fontSize="36" 
              textAnchor="middle"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }}
            >
              ⭐
            </text>
          </motion.svg>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
        <Button
          onClick={spinWheel}
          disabled={isSpinning}
          size="default"
          className="gap-2 sm:text-base lg:text-lg sm:px-6 sm:py-6"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5" />
          {isSpinning ? "Girando..." : "Girar"}
        </Button>
        <Button
          onClick={reset}
          disabled={isSpinning}
          variant="outline"
          size="default"
          className="gap-2 sm:text-base lg:text-lg sm:px-6 sm:py-6"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          Reset
        </Button>
      </div>

      {/* Winner Display */}
      <AnimatePresence>
        {showWinner && winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <span className="text-2xl sm:text-3xl lg:text-4xl">🎉</span>
              <FlipText 
                word="Parabéns" 
                duration={0.3}
                delayMultiple={0.1}
                className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground"
                spacing="space-x-1 sm:space-x-2"
              />
              <span className="text-2xl sm:text-3xl lg:text-4xl">🎉</span>
            </div>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className={cn(
                "text-base sm:text-lg md:text-xl lg:text-2xl font-bold px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 rounded-xl text-white shadow-2xl border-2 border-white/20 max-w-[90vw] break-words text-center",
                winner.color
              )}
            >
              {winner.label}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
