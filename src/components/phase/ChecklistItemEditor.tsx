
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface ChecklistItemEditorProps {
  isOpen: boolean;
  editingItemText: string;
  editingItemNotes: string;
  onTextChange: (text: string) => void;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ChecklistItemEditor({
  isOpen,
  editingItemText,
  editingItemNotes,
  onTextChange,
  onNotesChange,
  onSave,
  onCancel
}: ChecklistItemEditorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Checklist Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              value={editingItemText}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Enter description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Notes
            </label>
            <Textarea
              value={editingItemNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add notes or additional information"
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
