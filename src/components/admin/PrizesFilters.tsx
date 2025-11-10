import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Prize {
  id: number;
  label: string;
  color: string;
}

interface PrizesFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  selectedPrize: string;
  setSelectedPrize: (value: string) => void;
  prizes: Prize[];
  onClearFilters: () => void;
}

export const PrizesFilters = ({
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  selectedPrize,
  setSelectedPrize,
  prizes,
  onClearFilters,
}: PrizesFiltersProps) => {
  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email ou prêmio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full lg:w-[200px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os períodos</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Últimos 7 dias</SelectItem>
            <SelectItem value="month">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedPrize} onValueChange={setSelectedPrize}>
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue placeholder="Todos os prêmios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os prêmios</SelectItem>
            {prizes.map((prize) => (
              <SelectItem key={prize.id} value={prize.label}>
                {prize.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={onClearFilters}
          className="w-full lg:w-auto"
        >
          <X className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      </div>
    </Card>
  );
};
