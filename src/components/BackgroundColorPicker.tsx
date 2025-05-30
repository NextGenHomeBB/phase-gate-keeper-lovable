
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette } from "lucide-react";

interface BackgroundColorPickerProps {
  onColorChange: (color: string) => void;
  currentColor: string;
}

export function BackgroundColorPicker({ onColorChange, currentColor }: BackgroundColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presetColors = [
    { name: "Default Gray", value: "bg-gray-50" },
    { name: "White", value: "bg-white" },
    { name: "Light Blue", value: "bg-blue-50" },
    { name: "Light Green", value: "bg-green-50" },
    { name: "Light Purple", value: "bg-purple-50" },
    { name: "Light Yellow", value: "bg-yellow-50" },
    { name: "Light Pink", value: "bg-pink-50" },
    { name: "Light Indigo", value: "bg-indigo-50" },
  ];

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="w-4 h-4" />
          Achtergrond
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-white border border-gray-200 shadow-lg z-50">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Kies achtergrondkleur</h4>
          <div className="grid grid-cols-2 gap-2">
            {presetColors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color.value)}
                className={`p-3 rounded-md border text-left text-xs hover:shadow-md transition-shadow ${color.value} ${
                  currentColor === color.value ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {color.name}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
