
import { MaterialsList } from "@/components/MaterialsList";

interface ProjectDetailMaterialsProps {
  projectId: string;
  phaseId: number;
  readOnly?: boolean;
}

export function ProjectDetailMaterials({ projectId, phaseId, readOnly = false }: ProjectDetailMaterialsProps) {
  return (
    <MaterialsList 
      projectId={projectId} 
      phaseId={phaseId} 
      readOnly={readOnly} 
    />
  );
}
