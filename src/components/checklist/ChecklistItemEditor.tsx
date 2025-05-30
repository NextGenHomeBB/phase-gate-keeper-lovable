
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical, Calendar, User, MessageSquare } from "lucide-react";
import { ChecklistItem } from "@/pages/ChecklistCreator";

interface ChecklistItemEditorProps {
  item: ChecklistItem;
  index: number;
  isEditing: boolean;
  onUpdate: (item: ChecklistItem) => void;
  onDelete: (itemId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}

export function ChecklistItemEditor({
  item,
  index,
  isEditing,
  onUpdate,
  onDelete,
  onMove
}: ChecklistItemEditorProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleComplete = (checked: boolean) => {
    onUpdate({ ...item, completed: checked });
  };

  const handleTextChange = (text: string) => {
    onUpdate({ ...item, text });
  };

  const handleDueDateChange = (dueDate: string) => {
    onUpdate({ ...item, dueDate });
  };

  const handleAssignedToChange = (assignedTo: string) => {
    onUpdate({ ...item, assignedTo });
  };

  const handleNotesChange = (notes: string) => {
    onUpdate({ ...item, notes });
  };

  return (
    <div className="group border rounded-lg p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-3">
        {/* Drag Handle */}
        {isEditing && (
          <div className="flex-shrink-0 mt-1 cursor-move">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
        )}

        {/* Checkbox */}
        <div className="flex-shrink-0 mt-1">
          <Checkbox
            checked={item.completed}
            onCheckedChange={handleToggleComplete}
            disabled={isEditing}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={item.text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Checklist item description"
                className={item.completed ? "line-through text-gray-500" : ""}
              />
              
              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={item.dueDate || ""}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    Assigned To
                  </label>
                  <Input
                    value={item.assignedTo || ""}
                    onChange={(e) => handleAssignedToChange(e.target.value)}
                    placeholder="Person responsible"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Notes
                </label>
                <Input
                  value={item.notes || ""}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Additional notes or comments"
                  className="text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className={`text-sm ${item.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                {item.text}
              </p>
              
              {/* Metadata */}
              {(item.dueDate || item.assignedTo || item.notes) && (
                <div className="flex flex-wrap gap-2">
                  {item.dueDate && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(item.dueDate).toLocaleDateString()}
                    </Badge>
                  )}
                  {item.assignedTo && (
                    <Badge variant="outline" className="text-xs">
                      <User className="w-3 h-3 mr-1" />
                      {item.assignedTo}
                    </Badge>
                  )}
                  {item.notes && (
                    <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Notes
                    </Badge>
                  )}
                </div>
              )}

              {/* Notes Details */}
              {showDetails && item.notes && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700">
                  {item.notes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(item.id)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
