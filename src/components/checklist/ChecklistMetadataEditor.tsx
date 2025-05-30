
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Checklist } from "@/pages/ChecklistCreator";
import { useState, KeyboardEvent } from "react";

interface ChecklistMetadataEditorProps {
  checklist: Checklist;
  onChange: (checklist: Checklist) => void;
}

export function ChecklistMetadataEditor({
  checklist,
  onChange
}: ChecklistMetadataEditorProps) {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() && !checklist.tags.includes(tagInput.trim())) {
      onChange({
        ...checklist,
        tags: [...checklist.tags, tagInput.trim()]
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({
      ...checklist,
      tags: checklist.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-medium">Category</Label>
        <Select
          value={checklist.category}
          onValueChange={(value: any) => onChange({ ...checklist, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="inspection">Inspection</SelectItem>
            <SelectItem value="material">Material</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="quality">Quality</SelectItem>
            <SelectItem value="environmental">Environmental</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trade */}
      <div className="space-y-2">
        <Label htmlFor="trade" className="text-sm font-medium">Trade</Label>
        <Select
          value={checklist.trade}
          onValueChange={(value: any) => onChange({ ...checklist, trade: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select trade" />
          </SelectTrigger>
          <SelectContent>
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

      {/* Project Phase */}
      <div className="space-y-2">
        <Label htmlFor="phase" className="text-sm font-medium">Project Phase</Label>
        <Select
          value={checklist.projectPhase}
          onValueChange={(value: any) => onChange({ ...checklist, projectPhase: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select phase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="foundation">Foundation</SelectItem>
            <SelectItem value="framing">Framing</SelectItem>
            <SelectItem value="mechanical">Mechanical</SelectItem>
            <SelectItem value="finishing">Finishing</SelectItem>
            <SelectItem value="closeout">Closeout</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Template Toggle */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="template"
          checked={checklist.isTemplate}
          onCheckedChange={(checked) => onChange({ ...checklist, isTemplate: checked as boolean })}
        />
        <Label htmlFor="template" className="text-sm font-medium">
          Save as Template
        </Label>
      </div>

      {/* Tags */}
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
        <div className="space-y-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagKeyPress}
            onBlur={handleAddTag}
            placeholder="Add tags (press Enter)"
            className="text-sm"
          />
          {checklist.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {checklist.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
