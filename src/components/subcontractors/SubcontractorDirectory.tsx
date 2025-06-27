
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SubcontractorTable } from "./SubcontractorTable";
import { SubcontractorMobileList } from "./SubcontractorMobileList";
import { SubcontractorForm } from "./SubcontractorForm";
import { subcontractorService, Subcontractor } from "@/services/subcontractorService";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export function SubcontractorDirectory() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [filteredSubcontractors, setFilteredSubcontractors] = useState<Subcontractor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubcontractor, setEditingSubcontractor] = useState<Subcontractor | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSubcontractors();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = subcontractors.filter(sub => 
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.trade_specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSubcontractors(filtered);
    } else {
      setFilteredSubcontractors(subcontractors);
    }
  }, [searchQuery, subcontractors]);

  const loadSubcontractors = async () => {
    try {
      setLoading(true);
      const data = await subcontractorService.fetchSubcontractors();
      setSubcontractors(data);
      setFilteredSubcontractors(data);
    } catch (error) {
      console.error('Error loading subcontractors:', error);
      toast({
        title: "Error",
        description: "Failed to load subcontractors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubcontractor = async (data: Omit<Subcontractor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await subcontractorService.addSubcontractor(data);
      await loadSubcontractors();
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Subcontractor added successfully",
      });
    } catch (error) {
      console.error('Error adding subcontractor:', error);
      toast({
        title: "Error",
        description: "Failed to add subcontractor",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubcontractor = async (id: string, data: Partial<Omit<Subcontractor, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      await subcontractorService.updateSubcontractor(id, data);
      await loadSubcontractors();
      setEditingSubcontractor(null);
      toast({
        title: "Success",
        description: "Subcontractor updated successfully",
      });
    } catch (error) {
      console.error('Error updating subcontractor:', error);
      toast({
        title: "Error",
        description: "Failed to update subcontractor",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubcontractor = async (id: string) => {
    try {
      await subcontractorService.deleteSubcontractor(id);
      await loadSubcontractors();
      toast({
        title: "Success",
        description: "Subcontractor deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting subcontractor:', error);
      toast({
        title: "Error",
        description: "Failed to delete subcontractor",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center gap-4 mb-4">
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "sm"}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader className={isMobile ? "p-4" : undefined}>
          <CardTitle className={isMobile ? "text-xl" : undefined}>
            Sub-contractor Directory
          </CardTitle>
          <CardDescription>
            Manage your network of sub-contractors and their specialties
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? "p-4 pt-0" : undefined}>
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 mb-6`}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or trade specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => setIsFormOpen(true)}
              className={isMobile ? "w-full" : undefined}
              size={isMobile ? "lg" : "default"}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Sub-contractor
            </Button>
          </div>

          {isMobile ? (
            <SubcontractorMobileList
              subcontractors={filteredSubcontractors}
              loading={loading}
              onEdit={setEditingSubcontractor}
              onDelete={handleDeleteSubcontractor}
            />
          ) : (
            <SubcontractorTable
              subcontractors={filteredSubcontractors}
              loading={loading}
              onEdit={setEditingSubcontractor}
              onDelete={handleDeleteSubcontractor}
            />
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Button
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <SubcontractorForm
        isOpen={isFormOpen || !!editingSubcontractor}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSubcontractor(null);
        }}
        onSubmit={editingSubcontractor 
          ? (data) => handleUpdateSubcontractor(editingSubcontractor.id, data)
          : handleAddSubcontractor
        }
        initialData={editingSubcontractor}
        title={editingSubcontractor ? "Edit Sub-contractor" : "Add New Sub-contractor"}
      />
    </div>
  );
}
