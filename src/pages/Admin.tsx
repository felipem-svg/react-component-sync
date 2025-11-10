import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { PrizeCustomizer } from "@/components/PrizeCustomizer";
import { RouletteWheel } from "@/components/RouletteWheel";
import { AdminStats } from "@/components/admin/AdminStats";
import { PrizesFilters } from "@/components/admin/PrizesFilters";
import { PrizesTable } from "@/components/admin/PrizesTable";
import { PrizesChart } from "@/components/admin/PrizesChart";
import { SpinLimitSettings } from "@/components/admin/SpinLimitSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BarChart3, Settings, History, Shield } from "lucide-react";

interface Prize {
  id: number;
  label: string;
  color: string;
  weight: number;
}

interface UserPrize {
  id: string;
  prize_label: string;
  prize_color: string;
  won_at: string;
  user_email: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPrizes, setUserPrizes] = useState<UserPrize[]>([]);
  const [loadingPrizes, setLoadingPrizes] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedPrize, setSelectedPrize] = useState("all");

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchPrizes();
      fetchUserPrizes();
    }
  }, [isAdmin]);

  const fetchPrizes = async () => {
    try {
      const { data, error } = await supabase
        .from("roulette_prizes")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;

      const formattedPrizes = data.map((prize) => ({
        id: prize.id,
        label: prize.label,
        color: prize.color,
        weight: prize.weight || 10,
      }));

      setPrizes(formattedPrizes);
    } catch (error) {
      console.error("Error fetching prizes:", error);
      toast({
        title: "Erro ao carregar prêmios",
        description: "Não foi possível carregar os prêmios do banco de dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrizesChange = async (newPrizes: Prize[]) => {
    try {
      // Delete all existing prizes
      const { error: deleteError } = await supabase
        .from("roulette_prizes")
        .delete()
        .neq("id", 0);

      if (deleteError) throw deleteError;

      // Insert new prizes
      const prizesToInsert = newPrizes.map((prize, index) => ({
        label: prize.label,
        color: prize.color,
        position: index + 1,
        weight: prize.weight || 10,
      }));

      const { error: insertError } = await supabase
        .from("roulette_prizes")
        .insert(prizesToInsert);

      if (insertError) throw insertError;

      toast({
        title: "Prêmios salvos!",
        description: "As alterações foram salvas com sucesso.",
      });

      await fetchPrizes();
    } catch (error) {
      console.error("Error saving prizes:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  const fetchUserPrizes = async () => {
    try {
      setLoadingPrizes(true);
      const { data, error } = await supabase
        .from("user_prizes")
        .select("id, prize_label, prize_color, won_at, user_email")
        .order("won_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      const formattedPrizes: UserPrize[] = data.map((prize) => ({
        id: prize.id,
        prize_label: prize.prize_label,
        prize_color: prize.prize_color,
        won_at: prize.won_at,
        user_email: prize.user_email || "Usuário desconhecido",
      }));

      setUserPrizes(formattedPrizes);
    } catch (error) {
      console.error("Error fetching user prizes:", error);
      toast({
        title: "Erro ao carregar prêmios",
        description: "Não foi possível carregar o histórico de prêmios.",
        variant: "destructive",
      });
    } finally {
      setLoadingPrizes(false);
    }
  };

  // Filter prizes based on search and filters
  const filteredPrizes = useMemo(() => {
    return userPrizes.filter((prize) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        prize.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prize.prize_label.toLowerCase().includes(searchTerm.toLowerCase());

      // Date filter
      let matchesDate = true;
      if (dateFilter !== "all") {
        const prizeDate = new Date(prize.won_at);
        const today = new Date();
        
        if (dateFilter === "today") {
          matchesDate = prizeDate.toDateString() === today.toDateString();
        } else if (dateFilter === "week") {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = prizeDate >= weekAgo;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(today);
          monthAgo.setDate(monthAgo.getDate() - 30);
          matchesDate = prizeDate >= monthAgo;
        }
      }

      // Prize filter
      const matchesPrize =
        selectedPrize === "all" || prize.prize_label === selectedPrize;

      return matchesSearch && matchesDate && matchesPrize;
    });
  }, [userPrizes, searchTerm, dateFilter, selectedPrize]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateFilter("all");
    setSelectedPrize("all");
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Painel Administrativo
        </h1>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="prizes" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Gerenciar Prêmios
            </TabsTrigger>
            <TabsTrigger value="spin-limits" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Limites de Giro
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {loadingPrizes ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <AdminStats userPrizes={userPrizes} />
                <PrizesChart userPrizes={userPrizes} />
              </>
            )}
          </TabsContent>

          <TabsContent value="prizes">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Personalizar Prêmios
                </h2>
                <PrizeCustomizer prizes={prizes} onPrizesChange={handlePrizesChange} />
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Preview da Roleta</h2>
                <RouletteWheel items={prizes} onSpinComplete={() => {}} />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="spin-limits">
            <SpinLimitSettings />
          </TabsContent>

          <TabsContent value="history">
            {loadingPrizes ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <PrizesFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  dateFilter={dateFilter}
                  setDateFilter={setDateFilter}
                  selectedPrize={selectedPrize}
                  setSelectedPrize={setSelectedPrize}
                  prizes={prizes}
                  onClearFilters={handleClearFilters}
                />
                
                {filteredPrizes.length === 0 ? (
                  <Card className="p-12 text-center">
                    <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">
                      Nenhum prêmio encontrado
                    </h3>
                    <p className="text-muted-foreground">
                      Ajuste os filtros ou aguarde novos prêmios serem ganhos.
                    </p>
                  </Card>
                ) : (
                  <PrizesTable prizes={filteredPrizes} />
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
