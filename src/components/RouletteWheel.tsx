import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlipText } from "@/components/ui/flip-text";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/useWindowSize";
import { CountdownTimer } from "@/components/CountdownTimer";

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
  disabled?: boolean;
  disabledReason?: string | null;
  nextAvailable?: string | null;
}

const getColorLight = (color: string) => {
  const colors: { [key: string]: string } = {
    "bg-red-500": "#9B4B8A",
    "bg-blue-500": "#722E73",
    "bg-green-500": "#C2A083",
    "bg-yellow-500": "#F6D6C6",
    "bg-purple-500": "#9B4B8A",
    "bg-pink-500": "#E1A8D9",
    "bg-orange-500": "#D4B896",
    "bg-teal-500": "#A85C87",
  };
  return colors[color] || "#9B4B8A";
};

const getColorDark = (color: string) => {
  const colors: { [key: string]: string } = {
    "bg-red-500": "#722E73",
    "bg-blue-500": "#5A2459",
    "bg-green-500": "#A78A70",
    "bg-yellow-500": "#C2A083",
    "bg-purple-500": "#722E73",
    "bg-pink-500": "#9B4B8A",
    "bg-orange-500": "#A08060",
    "bg-teal-500": "#7A3B6A",
  };
  return colors[color] || "#722E73";
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
  disabled = false,
  disabledReason = null,
  nextAvailable = null,
}: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<RouletteItem | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const { width, height } = useWindowSize();

  const segmentAngle = 360 / items.length;

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowWinner(false);
    setWinner(null);

    // Filtrar apenas itens com peso > 0
    const eligibleItems = items.filter(item => (item.weight || 0) > 0);
    
    if (eligibleItems.length === 0) {
      setIsSpinning(false);
      return;
    }

    const totalWeight = eligibleItems.reduce((sum, item) => sum + (item.weight || 0), 0);
    const randomValue = Math.random() * totalWeight;
    
    let cumulativeWeight = 0;
    let selectedIndex = 0;
    
    for (let i = 0; i < eligibleItems.length; i++) {
      cumulativeWeight += eligibleItems[i].weight || 0;
      if (randomValue <= cumulativeWeight) {
        selectedIndex = i;
        break;
      }
    }

    const selectedItem = eligibleItems[selectedIndex];
    const actualIndex = items.indexOf(selectedItem);

    const segmentCenterAngle = actualIndex * segmentAngle + (segmentAngle / 2);
    const spins = 5 + Math.random() * 3;
    const currentSegmentAbsolutePosition = (rotation + segmentCenterAngle) % 360;
    const rotationNeeded = (360 - currentSegmentAbsolutePosition) % 360;
    const totalRotation = rotation + (spins * 360) + rotationNeeded;

    setRotation(totalRotation);

    setTimeout(() => {
      const winningItem = selectedItem;
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
      {/* Confetti Effect */}
      {showWinner && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}
      <motion.div 
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
      >
        {/* Premium Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-20">
          <div className="relative">
            <div className="w-0 h-0 border-l-[26px] border-l-transparent border-r-[26px] border-r-transparent border-t-[52px] border-t-[#C2A083] drop-shadow-2xl" 
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(194, 160, 131, 0.6))'
              }}
            />
            <div className="absolute inset-0 w-0 h-0 border-l-[26px] border-l-transparent border-r-[26px] border-r-transparent border-t-[52px] border-t-[#D4B896] opacity-40 blur-sm" />
          </div>
        </div>

        {/* Decorative Outer Ring */}
        <div className="absolute inset-0 rounded-full border-[10px] border-double border-[#C2A083]/60 -m-2 shadow-2xl" />

        {/* Wheel Container */}
        <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] lg:w-[500px] lg:h-[500px]">
      <motion.svg
        viewBox="0 0 400 400"
        className="w-full h-full rounded-full shadow-2xl border-8 border-[#9B4B8A]"
            style={{
              boxShadow: '0 20px 60px rgba(26, 15, 18, 0.5), 0 0 40px rgba(155, 75, 138, 0.3)'
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
            <circle cx="200" cy="200" r="200" fill="#311035" />
            
            {/* Gradients definitions */}
            <defs>
              {items.map((item, i) => (
                <radialGradient key={`grad-${i}`} id={`gradient-${i}`} cx="35%" cy="35%">
                  <stop offset="0%" stopColor={getColorLight(item.color)} />
                  <stop offset="100%" stopColor={getColorDark(item.color)} />
                </radialGradient>
              ))}
              <radialGradient id="center-gradient" cx="40%" cy="40%">
                <stop offset="0%" stopColor="#F6D6C6" />
                <stop offset="100%" stopColor="#C2A083" />
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
                    stroke="#F6D6C6"
                    strokeWidth="3"
                    opacity={item.weight === 0 ? 0.4 : 1}
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(26,15,18,0.3))'
                    }}
                  />
                  
                  {/* Gift icon in foreignObject */}
                  <foreignObject
                    x={giftPos.x}
                    y={giftPos.y}
                    width="80"
                    height="80"
                  >
                    <motion.div 
                      className="w-full h-full rounded-full bg-[#F6D6C6]/95 flex items-center justify-center shadow-lg border-2 border-[#C2A083]/40 relative"
                      style={{
                        filter: 'drop-shadow(0 2px 6px rgba(26,15,18,0.3))',
                        opacity: item.weight === 0 ? 0.4 : 1
                      }}
                      animate={isSpinning ? {
                        scale: [1, 1.15, 1],
                        rotate: [0, 10, -10, 0],
                      } : {
                        scale: 1,
                        rotate: 0
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: isSpinning ? Infinity : 0,
                        delay: index * 0.1,
                        ease: "easeInOut"
                      }}
                    >
                      {item.weight === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-4xl z-10">
                          🚫
                        </div>
                      )}
                      <motion.span 
                        className="text-5xl"
                        style={{ opacity: item.weight === 0 ? 0.3 : 1 }}
                        animate={isSpinning ? {
                          rotate: [0, -15, 15, 0],
                        } : {
                          rotate: 0
                        }}
                        transition={{
                          duration: 0.4,
                          repeat: isSpinning ? Infinity : 0,
                          delay: index * 0.1 + 0.2,
                          ease: "easeInOut"
                        }}
                      >
                        🎁
                      </motion.span>
                    </motion.div>
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
              stroke="#722E73" 
              strokeWidth="6"
              style={{
                filter: 'drop-shadow(0 8px 16px rgba(26,15,18,0.5))'
              }}
            />
          </motion.svg>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
          <Button
            onClick={spinWheel}
            disabled={isSpinning || disabled}
            size="default"
            className="gap-2 sm:text-base lg:text-lg sm:px-6 sm:py-6"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
            {disabled ? "Giro Bloqueado" : isSpinning ? "Girando..." : "Girar"}
          </Button>
          <Button
            onClick={reset}
            disabled={isSpinning || disabled}
            variant="outline"
            size="default"
            className="gap-2 sm:text-base lg:text-lg sm:px-6 sm:py-6"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            Reset
          </Button>
        </div>
        
        {disabled && disabledReason && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <div className="text-sm bg-destructive/10 text-destructive px-4 py-3 rounded-lg border border-destructive/20 max-w-md">
              {disabledReason}
            </div>
            {nextAvailable && <CountdownTimer targetDate={nextAvailable} />}
          </motion.div>
        )}
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
