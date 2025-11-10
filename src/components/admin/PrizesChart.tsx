import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserPrize {
  id: string;
  prize_label: string;
  prize_color: string;
  won_at: string;
  user_email: string;
}

interface PrizesChartProps {
  userPrizes: UserPrize[];
}

export const PrizesChart = ({ userPrizes }: PrizesChartProps) => {
  // Prepare data for line chart (last 7 days)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const dailyData = last7Days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const count = userPrizes.filter(
      (p) => format(new Date(p.won_at), "yyyy-MM-dd") === dayStr
    ).length;

    return {
      date: format(day, "dd/MM", { locale: ptBR }),
      prêmios: count,
    };
  });

  // Prepare data for pie chart (prize distribution)
  const prizeDistribution = userPrizes.reduce((acc, prize) => {
    const existing = acc.find((item) => item.name === prize.prize_label);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({
        name: prize.prize_label,
        value: 1,
        color: prize.prize_color,
      });
    }
    return acc;
  }, [] as { name: string; value: number; color: string }[]);

  // Prepare data for bar chart (top users)
  const userStats = userPrizes.reduce((acc, prize) => {
    acc[prize.user_email] = (acc[prize.user_email] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topUsers = Object.entries(userStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([email, count]) => ({
      email: email.split("@")[0], // Only show username part
      prêmios: count,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Prêmios nos Últimos 7 Dias
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Legend />
            <Line
              type="monotone"
              dataKey="prêmios"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Distribuição de Prêmios
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={prizeDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {prizeDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Top 5 Usuários</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topUsers}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="email" />
            <YAxis />
            <Legend />
            <Bar dataKey="prêmios" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
