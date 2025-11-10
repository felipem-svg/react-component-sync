import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

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

  return (
    <div className="flex items-center justify-center gap-2 text-sm bg-muted/50 px-4 py-2 rounded-lg border border-border">
      <Clock className="w-4 h-4 text-muted-foreground" />
      <span className="text-foreground font-medium">
        Próximo giro em:{" "}
        {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
        {(timeLeft.days > 0 || timeLeft.hours > 0) && <span>{timeLeft.hours}h </span>}
        <span>{String(timeLeft.minutes).padStart(2, '0')}m </span>
        <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </span>
    </div>
  );
}
