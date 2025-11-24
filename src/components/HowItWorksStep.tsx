import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface HowItWorksStepProps {
  step: number;
  title: string;
  description: string;
  delay?: number;
}

export const HowItWorksStep = ({ step, title, description, delay = 0 }: HowItWorksStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative"
    >
      <Card className="h-full border-primary/30 bg-card/80 backdrop-blur hover:border-secondary/50 transition-colors duration-300">
        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary text-foreground flex items-center justify-center text-2xl font-bold shadow-lg">
            {step}
          </div>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
