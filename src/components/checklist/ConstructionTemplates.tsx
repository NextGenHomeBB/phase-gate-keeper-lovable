import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Edit, Eye, Building, CheckSquare } from "lucide-react";
import CHECKLISTS, { PhaseChecklist, constructionChecklists, SectionedChecklist } from "@/data/constructionChecklists";

interface ConstructionTemplatesProps {
  onSelectChecklist: (checklist: SectionedChecklist) => void;
  onImportAsFlat?: (checklist: SectionedChecklist) => void;
}

export function ConstructionTemplates({
  onSelectChecklist,
  onImportAsFlat
}: ConstructionTemplatesProps) {
  const checklists = CHECKLISTS.map(checklist => ({
    id: checklist.code,
    title: checklist.name,
    sections: checklist.sections.map(section => ({
      title: section.name,
      items: section.items.map(item => item.description)
    }))
  }));

  const getTotalItems = (checklist: SectionedChecklist) => {
    return checklist.sections.reduce((total, section) => total + section.items.length, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building className="w-5 h-5" />
          <span>Construction Templates</span>
        </CardTitle>
        <CardDescription>
          Predefined construction checklists for different project phases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checklists.map((checklist) => (
            <Card
              key={checklist.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium truncate">
                      {checklist.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {checklist.sections.length} sections • {getTotalItems(checklist)} items
                    </CardDescription>
                  </div>
                   <Badge 
                     variant={checklist.id === 'voorwerk' ? 'default' : 'secondary'} 
                     className="text-xs ml-2"
                   >
                     {checklist.id === 'voorwerk' ? 'Pre-work' : 'Post-work'}
                   </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {/* Section Preview */}
                <div className="flex flex-wrap gap-1">
                  {checklist.sections.slice(0, 3).map((section, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {section.title}
                    </Badge>
                  ))}
                  {checklist.sections.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{checklist.sections.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Template • Dutch
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectChecklist(checklist);
                      }}
                      className="h-6 w-6 p-0"
                      title="View sections"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    {onImportAsFlat && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onImportAsFlat(checklist);
                        }}
                        className="h-6 w-6 p-0"
                        title="Import as flat list"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}