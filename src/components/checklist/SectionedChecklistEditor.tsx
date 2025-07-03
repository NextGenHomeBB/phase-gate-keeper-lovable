import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Save, Edit, X, Download, Plus } from "lucide-react";
import { SectionedChecklist, ChecklistSection } from "@/data/constructionChecklists";
import { ChecklistExport } from "./ChecklistExport";
import { AddToProjectDialog } from "./AddToProjectDialog";

interface SectionedChecklistEditorProps {
  checklist: SectionedChecklist;
  isEditing: boolean;
  onSave: (checklist: SectionedChecklist) => void;
  onEdit: () => void;
  onCancel: () => void;
  onAddToProject?: (checklist: SectionedChecklist) => void;
}

interface ChecklistItemWithProgress {
  text: string;
  completed: boolean;
}

export function SectionedChecklistEditor({
  checklist,
  isEditing,
  onSave,
  onEdit,
  onCancel,
  onAddToProject
}: SectionedChecklistEditorProps) {
  const [editedChecklist, setEditedChecklist] = useState<SectionedChecklist>(checklist);
  const [sectionStates, setSectionStates] = useState<Record<string, boolean>>({});
  const [itemProgress, setItemProgress] = useState<Record<string, ChecklistItemWithProgress[]>>(() => {
    const initial: Record<string, ChecklistItemWithProgress[]> = {};
    checklist.sections.forEach(section => {
      initial[section.title] = section.items.map(item => ({
        text: item,
        completed: false
      }));
    });
    return initial;
  });
  const [showExport, setShowExport] = useState(false);
  const [showAddToProject, setShowAddToProject] = useState(false);

  const handleSave = () => {
    onSave(editedChecklist);
  };

  const toggleSection = (sectionTitle: string) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const toggleItemCompletion = (sectionTitle: string, itemIndex: number) => {
    setItemProgress(prev => ({
      ...prev,
      [sectionTitle]: prev[sectionTitle].map((item, index) => 
        index === itemIndex ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  const getTotalProgress = () => {
    const allItems = Object.values(itemProgress).flat();
    const completed = allItems.filter(item => item.completed).length;
    return allItems.length > 0 ? Math.round((completed / allItems.length) * 100) : 0;
  };

  const getSectionProgress = (sectionTitle: string) => {
    const sectionItems = itemProgress[sectionTitle] || [];
    const completed = sectionItems.filter(item => item.completed).length;
    return sectionItems.length > 0 ? Math.round((completed / sectionItems.length) * 100) : 0;
  };

  if (showExport) {
    // Convert sectioned checklist to flat format for export
    const flatChecklist = {
      id: checklist.id,
      title: checklist.title,
      description: `Construction checklist with ${checklist.sections.length} sections`,
      category: 'inspection' as const,
      trade: 'general' as const,
      projectPhase: 'planning' as const,
      items: Object.entries(itemProgress).flatMap(([sectionTitle, items]) =>
        items.map((item, index) => ({
          id: `${checklist.id}-${sectionTitle}-${index}`,
          text: item.text,
          completed: item.completed,
          notes: `Section: ${sectionTitle}`
        }))
      ),
      tags: ['construction'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '',
      isTemplate: true
    };

    return (
      <ChecklistExport
        checklist={flatChecklist}
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
              </div>
            ) : (
              <div>
                <CardTitle className="text-xl">{editedChecklist.title}</CardTitle>
                <CardDescription className="mt-2">
                  {editedChecklist.sections.length} sections • Construction checklist
                </CardDescription>
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
                {onAddToProject && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowAddToProject(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Project
                  </Button>
                )}
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

        {/* Progress */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">
              {getTotalProgress()}% complete
            </span>
          </div>
          <div className="mt-2 w-full bg-muted-foreground/20 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${getTotalProgress()}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {editedChecklist.sections.map((section, sectionIndex) => {
            const isOpen = sectionStates[section.title] ?? true;
            const sectionProgress = getSectionProgress(section.title);
            
            return (
              <Collapsible
                key={section.title}
                open={isOpen}
                onOpenChange={() => toggleSection(section.title)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <CardTitle className="text-base">{section.title}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {sectionProgress}%
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {itemProgress[section.title]?.filter(item => item.completed).length || 0} / {section.items.length}
                        </div>
                      </div>
                      <div className="w-full bg-muted-foreground/20 rounded-full h-1">
                        <div
                          className="bg-primary h-1 rounded-full transition-all duration-300"
                          style={{ width: `${sectionProgress}%` }}
                        />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                         {section.items.map((item, itemIndex) => {
                           const itemState = itemProgress[section.title]?.[itemIndex];
                           const itemText = typeof item === 'string' ? item : (item as any)?.description || item;
                           
                           return (
                             <div
                               key={itemIndex}
                               className="flex items-start space-x-3 p-2 rounded border hover:bg-muted/30 transition-colors"
                             >
                               <Checkbox
                                 checked={itemState?.completed || false}
                                 onCheckedChange={() => toggleItemCompletion(section.title, itemIndex)}
                                 disabled={isEditing}
                                 className="mt-1"
                               />
                               <span className={`text-sm flex-1 ${itemState?.completed ? 'line-through text-muted-foreground' : ''}`}>
                                 {itemText}
                               </span>
                             </div>
                           );
                         })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      </CardContent>

      {/* Add to Project Dialog */}
      <AddToProjectDialog
        checklist={checklist}
        isOpen={showAddToProject}
        onClose={() => setShowAddToProject(false)}
      />
    </Card>
  );
}