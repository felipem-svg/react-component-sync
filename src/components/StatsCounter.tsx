import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

interface StatsCounterProps {
  value: string;
  label: string;
  delay?: number;
}

export const StatsCounter = ({ value, label, delay = 0 }: StatsCounterProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
        {value}
      </div>
      <div className="text-muted-foreground text-sm md:text-base">{label}</div>
    </motion.div>
  );
};
