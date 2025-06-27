
import { SubcontractorCard } from "./SubcontractorCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Subcontractor } from "@/services/subcontractorService";

interface SubcontractorMobileListProps {
  subcontractors: Subcontractor[];
  loading: boolean;
  onEdit: (subcontractor: Subcontractor) => void;
  onDelete: (id: string) => void;
}

export function SubcontractorMobileList({ 
  subcontractors, 
  loading, 
  onEdit, 
  onDelete 
}: SubcontractorMobileListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (subcontractors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-2">No sub-contractors found</div>
        <div className="text-sm text-gray-400">Add your first sub-contractor to get started</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subcontractors.map((subcontractor) => (
        <SubcontractorCard
          key={subcontractor.id}
          subcontractor={subcontractor}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
