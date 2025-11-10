import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings2, Save, Clock, Calendar, Infinity, Lock } from "lucide-react";
import { motion } from "framer-motion";

type SpinLimitType = "unlimited" | "once_per_day" | "once_per_week" | "once_lifetime";

interface RouletteSettings {
  id: string;
  spin_limit_type: SpinLimitType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const limitOptions = [
  {
    value: "unlimited" as const,
    label: "Sem Limites",
    description: "Usuários podem girar quantas vezes quiserem",
    icon: Infinity,
    color: "bg-green-500",
  },
  {
    value: "once_per_day" as const,
    label: "1 Giro por Dia",
    description: "Cada usuário pode girar uma vez por dia",
    icon: Calendar,
    color: "bg-yellow-500",
  },
  {
    value: "once_per_week" as const,
    label: "1 Giro por Semana",
    description: "Cada usuário pode girar uma vez por semana",
    icon: Clock,
    color: "bg-orange-500",
  },
  {
    value: "once_lifetime" as const,
    label: "1 Giro Único",
    description: "Cada usuário pode girar apenas uma vez, para sempre",
    icon: Lock,
    color: "bg-red-500",
  },
];

export function SpinLimitSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<RouletteSettings | null>(null);
  const [limitType, setLimitType] = useState<SpinLimitType>("unlimited");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("roulette_settings")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const typedData: RouletteSettings = {
          ...data,
          spin_limit_type: data.spin_limit_type as SpinLimitType
        };
        setSettings(typedData);
        setLimitType(data.spin_limit_type as SpinLimitType);
        setIsActive(data.is_active);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações de giros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Deactivate all existing settings
      await supabase
        .from("roulette_settings")
        .update({ is_active: false })
        .neq("id", "00000000-0000-0000-0000-000000000000");

      // Create new setting
      const { error } = await supabase.from("roulette_settings").insert({
        spin_limit_type: limitType,
        is_active: isActive,
      });

      if (error) throw error;

      toast({
        title: "Configurações salvas!",
        description: "As restrições de giro foram atualizadas com sucesso.",
      });

      await fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentOption = limitOptions.find((opt) => opt.value === settings?.spin_limit_type);
  const CurrentIcon = currentOption?.icon || Settings2;

  return (
    <div className="space-y-6">
      {/* Current Active Setting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Configuração Atual
            </h3>
            <Badge
              variant={settings?.is_active ? "default" : "secondary"}
              className="text-sm"
            >
              {settings?.is_active ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          {settings && currentOption && (
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-lg ${currentOption.color} text-white`}>
                <CurrentIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-semibold">{currentOption.label}</p>
                <p className="text-sm text-muted-foreground">
                  {currentOption.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Atualizado em: {new Date(settings.updated_at).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Edit Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Editar Restrições de Giro</h3>
          
          <div className="space-y-6">
            {/* Limit Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="limit-type">Tipo de Limite</Label>
              <Select
                value={limitType}
                onValueChange={(value) => setLimitType(value as SpinLimitType)}
              >
                <SelectTrigger id="limit-type">
                  <SelectValue placeholder="Selecione o tipo de limite" />
                </SelectTrigger>
                <SelectContent>
                  {limitOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {limitOptions.find((opt) => opt.value === limitType)?.description}
              </p>
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active-switch">Ativar Restrições</Label>
                <p className="text-sm text-muted-foreground">
                  Quando desativado, não haverá restrições de giro
                </p>
              </div>
              <Switch
                id="active-switch"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {limitOptions.map((option) => {
          const Icon = option.icon;
          return (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${option.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{option.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}