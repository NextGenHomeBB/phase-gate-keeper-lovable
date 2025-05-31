
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CheckCircle, Edit3, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  notes?: string;
}

interface Checklist {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
}

interface ChecklistItemsListProps {
  selectedChecklist: Checklist | null;
  checklist: ChecklistItem[];
  onUpdateChecklistItem: (itemId: string, completed: boolean) => void;
  onUpdateItemText: (itemId: string, text: string) => void;
}

export function ChecklistItemsList({ 
  selectedChecklist, 
  checklist, 
  onUpdateChecklistItem, 
  onUpdateItemText 
}: ChecklistItemsListProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const startEditingItem = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const saveEditingItem = (itemId: string) => {
    if (editingText.trim()) {
      onUpdateItemText(itemId, editingText.trim());
      
      toast({
        title: "Item bijgewerkt!",
        description: "De checklist item is succesvol bijgewerkt.",
      });
    }
    
    setEditingItemId(null);
    setEditingText("");
  };

  const cancelEditingItem = () => {
    setEditingItemId(null);
    setEditingText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === 'Enter') {
      saveEditingItem(itemId);
    } else if (e.key === 'Escape') {
      cancelEditingItem();
    }
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{selectedChecklist?.title || "Checklist"}</CardTitle>
        <CardDescription>
          {selectedChecklist?.description || "Doorloop deze stappen om je project succesvol op te starten"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checklist.map((item) => (
            <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors group">
              <Checkbox
                checked={item.completed}
                onCheckedChange={(checked) => 
                  onUpdateChecklistItem(item.id, checked as boolean)
                }
              />
              <div className="flex-1">
                {editingItemId === item.id ? (
                  <Input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, item.id)}
                    onBlur={() => saveEditingItem(item.id)}
                    className="text-sm"
                    autoFocus
                  />
                ) : (
                  <span 
                    className={`flex-1 ${
                      item.completed 
                        ? 'line-through text-gray-500' 
                        : 'text-gray-900'
                    }`}
                  >
                    {item.text}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {editingItemId === item.id ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => saveEditingItem(item.id)}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEditingItem}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditingItem(item)}
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )}
                
                {item.completed && editingItemId !== item.id && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        {completedCount === totalCount && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Gefeliciteerd!</h3>
                <p className="text-green-700">
                  Je hebt alle taken voltooid. Je project is klaar om te starten!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
