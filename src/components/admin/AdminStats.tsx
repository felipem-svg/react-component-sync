import { Card } from "@/components/ui/card";
import { Trophy, Users, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface UserPrize {
  id: string;
  prize_label: string;
  prize_color: string;
  won_at: string;
  user_email: string;
}

interface AdminStatsProps {
  userPrizes: UserPrize[];
}

export const AdminStats = ({ userPrizes }: AdminStatsProps) => {
  const totalPrizes = userPrizes.length;
  const uniqueUsers = new Set(userPrizes.map((p) => p.user_email)).size;
  
  // Find most popular prize
  const prizeCounts = userPrizes.reduce((acc, prize) => {
    acc[prize.prize_label] = (acc[prize.prize_label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostPopularPrize = Object.entries(prizeCounts).sort(
    ([, a], [, b]) => b - a
  )[0];

  // Prizes won today
  const today = new Date().toDateString();
  const prizesToday = userPrizes.filter(
    (p) => new Date(p.won_at).toDateString() === today
  ).length;

  const stats = [
    {
      title: "Total de Prêmios",
      value: totalPrizes,
      icon: Trophy,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Usuários Únicos",
      value: uniqueUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Prêmio Mais Popular",
      value: mostPopularPrize?.[0] || "N/A",
      subtitle: mostPopularPrize ? `${mostPopularPrize[1]}x` : "",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Ganhos Hoje",
      value: prizesToday,
      icon: Calendar,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">
                  {typeof stat.value === "number" ? stat.value : stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.subtitle}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
