
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Edit, Trash2, Calendar, User } from "lucide-react";
import { Checklist } from "@/pages/ChecklistCreator";

interface ChecklistTemplatesProps {
  checklists: Checklist[];
  selectedChecklist: Checklist | null;
  onSelectChecklist: (checklist: Checklist) => void;
  onEditChecklist: (checklist: Checklist) => void;
  onDeleteChecklist: (checklistId: string) => void;
  onCopyChecklist: (checklist: Checklist) => void;
}

const categoryColors = {
  safety: "bg-red-100 text-red-700",
  inspection: "bg-blue-100 text-blue-700",
  material: "bg-green-100 text-green-700",
  equipment: "bg-yellow-100 text-yellow-700",
  quality: "bg-purple-100 text-purple-700",
  environmental: "bg-teal-100 text-teal-700",
};

export function ChecklistTemplates({
  checklists,
  selectedChecklist,
  onSelectChecklist,
  onEditChecklist,
  onDeleteChecklist,
  onCopyChecklist
}: ChecklistTemplatesProps) {
  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      {checklists.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No checklists found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        checklists.map((checklist) => (
          <Card
            key={checklist.id}
            className={`cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedChecklist?.id === checklist.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
            }`}
            onClick={() => onSelectChecklist(checklist)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium truncate">
                    {checklist.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1 line-clamp-2">
                    {checklist.description}
                  </CardDescription>
                </div>
                {checklist.isTemplate && (
                  <Badge variant="secondary" className="text-xs ml-2">
                    Template
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {/* Category and Trade */}
              <div className="flex flex-wrap gap-1">
                <Badge 
                  className={`text-xs ${categoryColors[checklist.category] || "bg-gray-100 text-gray-700"}`}
                  variant="secondary"
                >
                  {checklist.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {checklist.trade}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {checklist.projectPhase}
                </Badge>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{checklist.items.length} items</span>
                <span>{checklist.items.filter(item => item.completed).length} completed</span>
              </div>

              {/* Tags */}
              {checklist.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {checklist.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {checklist.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{checklist.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-xs text-gray-400">
                  {new Date(checklist.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyChecklist(checklist);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditChecklist(checklist);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChecklist(checklist.id);
                    }}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
