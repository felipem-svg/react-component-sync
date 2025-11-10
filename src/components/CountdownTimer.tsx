import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  targetDate: string;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (!newTimeLeft) {
        clearInterval(timer);
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return null;
  }

  const totalSeconds = timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const isUrgent = totalSeconds < 60;

  return (
    <motion.div 
      className="flex items-center justify-center gap-2 text-sm bg-muted/50 px-4 py-2 rounded-lg border border-border"
      animate={isUrgent ? {
        scale: [1, 1.05, 1],
        boxShadow: [
          "0 0 0 0 hsl(var(--primary) / 0)",
          "0 0 0 8px hsl(var(--primary) / 0.2)",
          "0 0 0 0 hsl(var(--primary) / 0)"
        ]
      } : {}}
      transition={{
        duration: 1,
        repeat: isUrgent ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      <motion.div
        animate={isUrgent ? {
          rotate: [0, -10, 10, -10, 10, 0],
        } : {}}
        transition={{
          duration: 0.5,
          repeat: isUrgent ? Infinity : 0,
          repeatDelay: 0.5
        }}
      >
        <Clock className={`w-4 h-4 ${isUrgent ? 'text-primary' : 'text-muted-foreground'}`} />
      </motion.div>
      <span className={`font-medium ${isUrgent ? 'text-primary' : 'text-foreground'}`}>
        Próximo giro em:{" "}
        {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
        {(timeLeft.days > 0 || timeLeft.hours > 0) && <span>{timeLeft.hours}h </span>}
        <motion.span
          animate={isUrgent ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.3, repeat: isUrgent ? Infinity : 0 }}
        >
          {String(timeLeft.minutes).padStart(2, '0')}m{" "}
        </motion.span>
        <motion.span
          animate={isUrgent ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5, repeat: isUrgent ? Infinity : 0 }}
          className="font-bold"
        >
          {String(timeLeft.seconds).padStart(2, '0')}s
        </motion.span>
      </span>
    </motion.div>
  );
}
