import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building, MapPin, Calendar, Users, Settings, Info, Edit } from "lucide-react";
import { Project } from "@/pages/Index";
import { ProjectInfoEditor } from "./ProjectInfoEditor";

interface ProjectInfoOverviewProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
}

export const ProjectInfoOverview = ({ project, onUpdateProject }: ProjectInfoOverviewProps) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ProjectInfoEditor
        project={project}
        onSave={(updatedProject) => {
          onUpdateProject(updatedProject);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{project.name}</h2>
          <p className="text-muted-foreground">Projectinformatie overzicht</p>
        </div>
        <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Bewerken
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basisinformatie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Basisinformatie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Projectnaam</label>
              <p className="text-foreground">{project.name}</p>
            </div>
            
            {(project.address || project.postal_code || project.city) && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Projectadres</label>
                <p className="text-foreground">
                  {project.address && <span>{project.address}<br /></span>}
                  {project.postal_code && project.city && <span>{project.postal_code} {project.city}</span>}
                </p>
              </div>
            )}

            {project.building_year && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bouwjaar bestaand pand</label>
                <p className="text-foreground">{project.building_year}</p>
              </div>
            )}

            {project.existing_building_type && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type bestaande bouw</label>
                <p className="text-foreground">{project.existing_building_type}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transformatie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Transformatie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.transformation_description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Omschrijving transformatie</label>
                <p className="text-foreground">{project.transformation_description}</p>
              </div>
            )}

            {project.number_of_units_after_split && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Aantal woningen na splitsing</label>
                <p className="text-foreground">{project.number_of_units_after_split}</p>
              </div>
            )}

            {project.unit_access_type && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Woningontsluiting</label>
                <Badge variant="secondary">
                  {project.unit_access_type === 'gemeenschappelijke_entree' ? 'Gemeenschappelijke entree' : 'Eigen opgang'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Woninginformatie */}
        {(project.unit_areas?.length || project.unit_purposes?.length || project.energy_labels?.length) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Woninginformatie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {project.unit_areas?.length && (
                  <div>
                    <h4 className="font-medium mb-3">Oppervlaktes</h4>
                    <div className="space-y-2">
                      {project.unit_areas.map((area, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{area.unit}:</span>
                          <div className="text-muted-foreground">
                            GO: {area.go_area} m²
                            {area.bvo_area && <span>, BVO: {area.bvo_area} m²</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {project.unit_purposes?.length && (
                  <div>
                    <h4 className="font-medium mb-3">Bestemming</h4>
                    <div className="space-y-2">
                      {project.unit_purposes.map((purpose, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{purpose.unit}:</span>
                          <Badge variant="outline" className="ml-2">
                            {purpose.purpose === 'verhuur' ? 'Verhuur' : 'Verkoop'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {project.energy_labels?.length && (
                  <div>
                    <h4 className="font-medium mb-3">Energielabels</h4>
                    <div className="space-y-2">
                      {project.energy_labels.map((label, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{label.unit}:</span>
                          <div className="text-muted-foreground">
                            {label.current && <span>Huidig: {label.current}</span>}
                            {label.current && label.planned && <span>, </span>}
                            {label.planned && <span>Gepland: {label.planned}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Installatieconcept */}
        {project.installation_concept && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Installatieconcept
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.installation_concept.heating && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Verwarming</label>
                  <p className="text-foreground">{project.installation_concept.heating}</p>
                </div>
              )}
              {project.installation_concept.ventilation && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ventilatie</label>
                  <p className="text-foreground">{project.installation_concept.ventilation}</p>
                </div>
              )}
              {project.installation_concept.electrical && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Elektra</label>
                  <p className="text-foreground">{project.installation_concept.electrical}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Projectmanagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Projectmanagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.project_manager && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Projectmanager</label>
                <p className="text-foreground">{project.project_manager}</p>
              </div>
            )}
            {project.executor && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Uitvoerder</label>
                <p className="text-foreground">{project.executor}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Startdatum</label>
              <p className="text-foreground">{new Date(project.startDate).toLocaleDateString('nl-NL')}</p>
            </div>
            {project.planned_delivery_date && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Verwachte opleverdatum</label>
                <p className="text-foreground">{new Date(project.planned_delivery_date).toLocaleDateString('nl-NL')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bijzonderheden */}
        {project.special_considerations && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Bijzonderheden en Aandachtspunten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">{project.special_considerations}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};