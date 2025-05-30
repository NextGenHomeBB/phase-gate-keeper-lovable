
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ChecklistTemplates } from "@/components/checklist/ChecklistTemplates";
import { ChecklistEditor } from "@/components/checklist/ChecklistEditor";
import { ChecklistFilters } from "@/components/checklist/ChecklistFilters";
import { toast } from "@/hooks/use-toast";

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  assignedTo?: string;
  notes?: string;
}

export interface Checklist {
  id: string;
  title: string;
  description: string;
  category: 'safety' | 'inspection' | 'material' | 'equipment' | 'quality' | 'environmental';
  trade: 'general' | 'plumbing' | 'electrical' | 'hvac' | 'concrete' | 'roofing' | 'framing';
  projectPhase: 'planning' | 'foundation' | 'framing' | 'mechanical' | 'finishing' | 'closeout';
  items: ChecklistItem[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isTemplate: boolean;
}

const ChecklistCreator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTrade, setSelectedTrade] = useState<string>("all");
  const [selectedPhase, setSelectedPhase] = useState<string>("all");

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Load sample checklists on mount
  useEffect(() => {
    const sampleChecklists: Checklist[] = [
      {
        id: "1",
        title: "Daily Safety Inspection",
        description: "Comprehensive daily safety checklist for construction sites",
        category: "safety",
        trade: "general",
        projectPhase: "framing",
        items: [
          { id: "1-1", text: "Check hard hat availability and condition", completed: false },
          { id: "1-2", text: "Verify safety harness inspection", completed: false },
          { id: "1-3", text: "Inspect scaffolding stability", completed: false },
          { id: "1-4", text: "Check emergency exit accessibility", completed: false },
          { id: "1-5", text: "Verify first aid kit supplies", completed: false },
        ],
        tags: ["daily", "mandatory", "safety"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.id || "",
        isTemplate: true,
      },
      {
        id: "2",
        title: "Material Delivery Checklist",
        description: "Verification checklist for incoming materials",
        category: "material",
        trade: "general",
        projectPhase: "planning",
        items: [
          { id: "2-1", text: "Verify delivery matches purchase order", completed: false },
          { id: "2-2", text: "Check material condition and quality", completed: false },
          { id: "2-3", text: "Confirm quantity received", completed: false },
          { id: "2-4", text: "Document any damages or discrepancies", completed: false },
          { id: "2-5", text: "Update inventory records", completed: false },
        ],
        tags: ["delivery", "materials", "inventory"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.id || "",
        isTemplate: true,
      },
    ];
    setChecklists(sampleChecklists);
  }, [user]);

  const filteredChecklists = checklists.filter(checklist => {
    const matchesSearch = checklist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checklist.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checklist.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || checklist.category === selectedCategory;
    const matchesTrade = selectedTrade === "all" || checklist.trade === selectedTrade;
    const matchesPhase = selectedPhase === "all" || checklist.projectPhase === selectedPhase;

    return matchesSearch && matchesCategory && matchesTrade && matchesPhase;
  });

  const handleCreateNew = () => {
    const newChecklist: Checklist = {
      id: Date.now().toString(),
      title: "New Checklist",
      description: "Description of the new checklist",
      category: "general" as any,
      trade: "general",
      projectPhase: "planning",
      items: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user?.id || "",
      isTemplate: false,
    };
    setSelectedChecklist(newChecklist);
    setIsEditing(true);
  };

  const handleEditChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setIsEditing(true);
  };

  const handleSaveChecklist = (checklist: Checklist) => {
    const updatedChecklist = {
      ...checklist,
      updatedAt: new Date().toISOString(),
    };

    setChecklists(prev => {
      const existing = prev.find(c => c.id === checklist.id);
      if (existing) {
        return prev.map(c => c.id === checklist.id ? updatedChecklist : c);
      } else {
        return [...prev, updatedChecklist];
      }
    });

    setSelectedChecklist(updatedChecklist);
    setIsEditing(false);
    toast({
      title: "Checklist Saved",
      description: "Your checklist has been successfully saved.",
    });
  };

  const handleDeleteChecklist = (checklistId: string) => {
    setChecklists(prev => prev.filter(c => c.id !== checklistId));
    if (selectedChecklist?.id === checklistId) {
      setSelectedChecklist(null);
      setIsEditing(false);
    }
    toast({
      title: "Checklist Deleted",
      description: "The checklist has been successfully deleted.",
    });
  };

  const handleCopyChecklist = (checklist: Checklist) => {
    const copiedChecklist: Checklist = {
      ...checklist,
      id: Date.now().toString(),
      title: `${checklist.title} (Copy)`,
      items: checklist.items.map(item => ({
        ...item,
        id: `${Date.now()}-${Math.random()}`,
        completed: false,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isTemplate: false,
    };
    setChecklists(prev => [...prev, copiedChecklist]);
    toast({
      title: "Checklist Copied",
      description: "A copy of the checklist has been created.",
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checklist Creator</h1>
            <p className="text-gray-600 mt-1">
              Create and manage construction checklists for your projects
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Checklist
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Checklist Library */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search and Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Checklist Library</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search checklists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <ChecklistFilters
                  selectedCategory={selectedCategory}
                  selectedTrade={selectedTrade}
                  selectedPhase={selectedPhase}
                  onCategoryChange={setSelectedCategory}
                  onTradeChange={setSelectedTrade}
                  onPhaseChange={setSelectedPhase}
                />
              </CardContent>
            </Card>

            {/* Checklist Templates */}
            <ChecklistTemplates
              checklists={filteredChecklists}
              selectedChecklist={selectedChecklist}
              onSelectChecklist={setSelectedChecklist}
              onEditChecklist={handleEditChecklist}
              onDeleteChecklist={handleDeleteChecklist}
              onCopyChecklist={handleCopyChecklist}
            />
          </div>

          {/* Right Panel - Checklist Editor */}
          <div className="lg:col-span-2">
            {selectedChecklist ? (
              <ChecklistEditor
                checklist={selectedChecklist}
                isEditing={isEditing}
                onSave={handleSaveChecklist}
                onEdit={() => setIsEditing(true)}
                onCancel={() => {
                  setIsEditing(false);
                  if (!checklists.find(c => c.id === selectedChecklist.id)) {
                    setSelectedChecklist(null);
                  }
                }}
              />
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <div className="text-gray-400 mb-4">
                    <Filter className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Select a Checklist
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Choose a checklist from the library to view or edit, or create a new one.
                  </p>
                  <Button onClick={handleCreateNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Checklist
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChecklistCreator;
