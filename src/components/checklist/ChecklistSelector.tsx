
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Checklist {
  id: string;
  title: string;
  description: string;
  items: Array<{
    id: string;
    text: string;
    completed: boolean;
    notes?: string;
  }>;
}

interface ChecklistSelectorProps {
  checklists: Checklist[];
  selectedChecklist: Checklist | null;
  onSelectChecklist: (checklist: Checklist) => void;
}

export function ChecklistSelector({
  checklists,
  selectedChecklist,
  onSelectChecklist,
}: ChecklistSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedChecklist ? selectedChecklist.title : "Selecteer een checklist..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Zoek checklist..." />
          <CommandList>
            <CommandEmpty>Geen checklist gevonden.</CommandEmpty>
            <CommandGroup>
              {checklists.map((checklist) => (
                <CommandItem
                  key={checklist.id}
                  value={checklist.title}
                  onSelect={() => {
                    onSelectChecklist(checklist);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedChecklist?.id === checklist.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{checklist.title}</span>
                    <span className="text-sm text-gray-500">{checklist.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
