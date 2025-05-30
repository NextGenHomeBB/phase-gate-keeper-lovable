
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, Edit, X, Plus, Download, FileText } from "lucide-react";
import { Checklist } from "@/pages/ChecklistCreator";
import { ChecklistItemEditor } from "./ChecklistItemEditor";
import { ChecklistMetadataEditor } from "./ChecklistMetadataEditor";
import { ChecklistExport } from "./ChecklistExport";

interface ChecklistEditorProps {
  checklist: Checklist;
  isEditing: boolean;
  onSave: (checklist: Checklist) => void;
  onEdit: () => void;
  onCancel: () => void;
}

export function ChecklistEditor({
  checklist,
  isEditing,
  onSave,
  onEdit,
  onCancel
}: ChecklistEditorProps) {
  const [editedChecklist, setEditedChecklist] = useState<Checklist>(checklist);
  const [showExport, setShowExport] = useState(false);

  const handleSave = () => {
    onSave(editedChecklist);
  };

  const handleAddItem = () => {
    const newItem = {
      id: `${Date.now()}-${Math.random()}`,
      text: "New checklist item",
      completed: false,
    };
    setEditedChecklist(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const completedCount = editedChecklist.items.filter(item => item.completed).length;
  const completionPercentage = editedChecklist.items.length > 0 
    ? Math.round((completedCount / editedChecklist.items.length) * 100) 
    : 0;

  if (showExport) {
    return (
      <ChecklistExport
        checklist={editedChecklist}
        onClose={() => setShowExport(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editedChecklist.title}
                  onChange={(e) => setEditedChecklist(prev => ({ ...prev, title: e.target.value }))}
                  className="text-lg font-semibold"
                  placeholder="Checklist title"
                />
                <Textarea
                  value={editedChecklist.description}
                  onChange={(e) => setEditedChecklist(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Checklist description"
                  rows={2}
                />
              </div>
            ) : (
              <div>
                <CardTitle className="text-xl">{editedChecklist.title}</CardTitle>
                <CardDescription className="mt-2">{editedChecklist.description}</CardDescription>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {!isEditing && (
              <>
                <Button size="sm" variant="outline" onClick={() => setShowExport(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </>
            )}
            {isEditing && (
              <>
                <Button size="sm" variant="outline" onClick={onCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Metadata */}
        {isEditing ? (
          <ChecklistMetadataEditor
            checklist={editedChecklist}
            onChange={setEditedChecklist}
          />
        ) : (
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary">{editedChecklist.category}</Badge>
            <Badge variant="outline">{editedChecklist.trade}</Badge>
            <Badge variant="outline">{editedChecklist.projectPhase}</Badge>
            {editedChecklist.isTemplate && (
              <Badge variant="secondary">Template</Badge>
            )}
            {editedChecklist.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Progress */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-gray-600">
              {completedCount} of {editedChecklist.items.length} completed ({completionPercentage}%)
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Add Item Button */}
        {isEditing && (
          <div className="mb-4">
            <Button variant="outline" onClick={handleAddItem} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
          </div>
        )}

        {/* Checklist Items */}
        <div className="space-y-2">
          {editedChecklist.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No items in this checklist yet.</p>
              {isEditing && (
                <Button variant="outline" onClick={handleAddItem} className="mt-3">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              )}
            </div>
          ) : (
            editedChecklist.items.map((item, index) => (
              <ChecklistItemEditor
                key={item.id}
                item={item}
                index={index}
                isEditing={isEditing}
                onUpdate={(updatedItem) => {
                  setEditedChecklist(prev => ({
                    ...prev,
                    items: prev.items.map(i => i.id === updatedItem.id ? updatedItem : i)
                  }));
                }}
                onDelete={(itemId) => {
                  setEditedChecklist(prev => ({
                    ...prev,
                    items: prev.items.filter(i => i.id !== itemId)
                  }));
                }}
                onMove={(fromIndex, toIndex) => {
                  setEditedChecklist(prev => {
                    const newItems = [...prev.items];
                    const [removed] = newItems.splice(fromIndex, 1);
                    newItems.splice(toIndex, 0, removed);
                    return { ...prev, items: newItems };
                  });
                }}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
