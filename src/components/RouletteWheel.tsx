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

const getColorGradient = (color: string) => {
  const gradients: { [key: string]: string } = {
    "bg-red-500": "radial-gradient(circle at 35% 35%, #ef4444, #b91c1c)",
    "bg-blue-500": "radial-gradient(circle at 35% 35%, #3b82f6, #1e40af)",
    "bg-green-500": "radial-gradient(circle at 35% 35%, #22c55e, #15803d)",
    "bg-yellow-500": "radial-gradient(circle at 35% 35%, #eab308, #a16207)",
    "bg-purple-500": "radial-gradient(circle at 35% 35%, #a855f7, #7e22ce)",
    "bg-pink-500": "radial-gradient(circle at 35% 35%, #ec4899, #be185d)",
    "bg-orange-500": "radial-gradient(circle at 35% 35%, #f97316, #c2410c)",
    "bg-teal-500": "radial-gradient(circle at 35% 35%, #14b8a6, #0f766e)",
  };
  return gradients[color] || gradients["bg-red-500"];
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
        <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] lg:w-[500px] lg:h-[500px] rounded-full shadow-2xl overflow-hidden border-8 border-amber-500"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(251, 191, 36, 0.2), inset 0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          <motion.div
            className="w-full h-full relative"
            animate={{ 
              rotate: rotation,
              filter: isSpinning ? "blur(0.5px)" : "blur(0px)"
            }}
            transition={{
              duration: 4,
              ease: [0.17, 0.67, 0.12, 0.99],
            }}
          >
            {items.map((item, index) => {
              const angle = segmentAngle * index;
              return (
                <React.Fragment key={item.id}>
                  {/* Segment */}
                  <div
                    className="absolute w-full h-full origin-center"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      clipPath: `polygon(50% 50%, 50% 0%, ${
                        50 + 50 * Math.sin((segmentAngle * Math.PI) / 180)
                      }% ${50 - 50 * Math.cos((segmentAngle * Math.PI) / 180)}%)`,
                      background: getColorGradient(item.color),
                      boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    {/* Gift Icon with circular background */}
                    <div
                      className="absolute top-[20%] left-1/2 -translate-x-1/2"
                      style={{
                        transform: `translateX(-50%) rotate(${segmentAngle / 2}deg)`,
                      }}
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-white/95 flex items-center justify-center shadow-lg border-2 border-white/40">
                        <span className="text-3xl sm:text-4xl lg:text-5xl" style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                        }}>🎁</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Segment Separator */}
                  <div 
                    className="absolute w-full h-1/2 top-0 left-1/2 origin-bottom border-r-[3px] border-white/40"
                    style={{ 
                      transform: `rotate(${angle}deg)`,
                      pointerEvents: 'none'
                    }}
                  />
                </React.Fragment>
              );
            })}
          </motion.div>

          {/* Premium Center Circle */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-4 sm:border-5 lg:border-6 border-amber-400 z-10 flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 40% 40%, #ffffff, #f3f4f6)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.8)'
            }}
          >
            <span className="text-2xl sm:text-3xl lg:text-4xl">⭐</span>
          </div>
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
