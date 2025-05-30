
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ChecklistFiltersProps {
  selectedCategory: string;
  selectedTrade: string;
  selectedPhase: string;
  onCategoryChange: (value: string) => void;
  onTradeChange: (value: string) => void;
  onPhaseChange: (value: string) => void;
}

export function ChecklistFilters({
  selectedCategory,
  selectedTrade,
  selectedPhase,
  onCategoryChange,
  onTradeChange,
  onPhaseChange
}: ChecklistFiltersProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="category" className="text-sm font-medium">Category</Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="inspection">Inspection</SelectItem>
            <SelectItem value="material">Material</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="quality">Quality</SelectItem>
            <SelectItem value="environmental">Environmental</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="trade" className="text-sm font-medium">Trade</Label>
        <Select value={selectedTrade} onValueChange={onTradeChange}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select trade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trades</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="plumbing">Plumbing</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
            <SelectItem value="hvac">HVAC</SelectItem>
            <SelectItem value="concrete">Concrete</SelectItem>
            <SelectItem value="roofing">Roofing</SelectItem>
            <SelectItem value="framing">Framing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="phase" className="text-sm font-medium">Project Phase</Label>
        <Select value={selectedPhase} onValueChange={onPhaseChange}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select phase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="foundation">Foundation</SelectItem>
            <SelectItem value="framing">Framing</SelectItem>
            <SelectItem value="mechanical">Mechanical</SelectItem>
            <SelectItem value="finishing">Finishing</SelectItem>
            <SelectItem value="closeout">Closeout</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
