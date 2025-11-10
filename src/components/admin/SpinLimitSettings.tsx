import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, RotateCcw, Clock, Users, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type SpinLimitType = 'unlimited' | 'once_per_day' | 'once_per_week' | 'once_lifetime';

interface RouletteSettings {
  id: string;
  spin_limit_type: SpinLimitType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const spinLimitOptions = [
  { value: 'unlimited', label: 'Sem Limites', description: 'Usuários podem girar quantas vezes quiserem', icon: '∞', color: 'bg-green-500' },
  { value: 'once_per_day', label: '1 Giro por Dia', description: 'Cada usuário pode girar uma vez por dia', icon: '📅', color: 'bg-yellow-500' },
  { value: 'once_per_week', label: '1 Giro por Semana', description: 'Cada usuário pode girar uma vez por semana', icon: '📆', color: 'bg-orange-500' },
  { value: 'once_lifetime', label: '1 Giro Único', description: 'Cada usuário pode girar apenas uma vez na vida', icon: '🔒', color: 'bg-red-500' },
];

export function SpinLimitSettings() {
  const [settings, setSettings] = useState<RouletteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [spinLimitType, setSpinLimitType] = useState<SpinLimitType>('unlimited');
  const [isActive, setIsActive] = useState(true);
  const [totalSpins, setTotalSpins] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('roulette_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const typedData: RouletteSettings = {
          id: data.id,
          spin_limit_type: data.spin_limit_type as SpinLimitType,
          is_active: data.is_active,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        setSettings(typedData);
        setSpinLimitType(typedData.spin_limit_type);
        setIsActive(typedData.is_active);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Erro ao carregar configurações',
        description: 'Não foi possível carregar as configurações de giros.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { count, error } = await supabase
        .from('user_prizes')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setTotalSpins(count || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('roulette_settings')
          .update({
            spin_limit_type: spinLimitType,
            is_active: isActive,
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('roulette_settings')
          .insert({
            spin_limit_type: spinLimitType,
            is_active: isActive,
          });

        if (error) throw error;
      }

      toast({
        title: 'Configurações salvas!',
        description: 'As configurações de giros foram atualizadas com sucesso.',
      });

      await fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetting(true);

      const { error } = await supabase
        .from('user_prizes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      toast({
        title: 'Histórico resetado!',
        description: 'Todos os giros foram apagados. Usuários podem girar novamente.',
      });

      await fetchStats();
    } catch (error) {
      console.error('Error resetting spins:', error);
      toast({
        title: 'Erro ao resetar',
        description: 'Não foi possível resetar o histórico de giros.',
        variant: 'destructive',
      });
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentOption = spinLimitOptions.find(opt => opt.value === spinLimitType);

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Status Atual</h2>
            <p className="text-muted-foreground">
              Regra ativa de controle de giros
            </p>
          </div>
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={`text-lg px-4 py-2 ${currentOption?.color || 'bg-primary'} text-white`}
          >
            {isActive ? '✓ Ativo' : '✗ Inativo'}
          </Badge>
        </div>

        {currentOption && (
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
            <div className="text-5xl">{currentOption.icon}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">{currentOption.label}</h3>
              <p className="text-muted-foreground">{currentOption.description}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Configuration Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Configurar Limites</h2>
        </div>

        <div className="space-y-6">
          {/* Spin Limit Type Selection */}
          <div className="space-y-3">
            <Label htmlFor="spin-limit" className="text-base font-medium">
              Tipo de Limite de Giros
            </Label>
            <Select value={spinLimitType} onValueChange={(value) => setSpinLimitType(value as SpinLimitType)}>
              <SelectTrigger id="spin-limit" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {spinLimitOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentOption && (
              <p className="text-sm text-muted-foreground mt-2">
                {currentOption.description}
              </p>
            )}
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="space-y-0.5">
              <Label htmlFor="active-switch" className="text-base font-medium cursor-pointer">
                Ativar Restrições
              </Label>
              <p className="text-sm text-muted-foreground">
                Quando ativo, as regras de limite serão aplicadas
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
            size="lg"
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Statistics Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Estatísticas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Total de Giros</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalSpins}</p>
          </div>

          <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-secondary" />
              <p className="text-sm font-medium text-muted-foreground">Regra Atual</p>
            </div>
            <p className="text-lg font-bold text-foreground">{currentOption?.label}</p>
          </div>

          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-accent-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Status</p>
            </div>
            <p className="text-lg font-bold text-foreground">
              {isActive ? 'Restrito' : 'Liberado'}
            </p>
          </div>
        </div>
      </Card>

      {/* Danger Zone Card */}
      <Card className="p-6 border-destructive/50">
        <div className="flex items-center gap-2 mb-4">
          <RotateCcw className="h-6 w-6 text-destructive" />
          <h2 className="text-2xl font-semibold text-destructive">Zona de Perigo</h2>
        </div>

        <p className="text-muted-foreground mb-4">
          Resetar o histórico de giros apagará todos os registros e permitirá que todos os usuários girem novamente, independentemente da regra configurada.
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={resetting || totalSpins === 0}
              className="w-full"
            >
              {resetting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Resetando...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Resetar Todos os Giros
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso irá apagar permanentemente todos os {totalSpins} registros de giros do banco de dados.
                Todos os usuários poderão girar novamente, independentemente das restrições.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Sim, Resetar Tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
}