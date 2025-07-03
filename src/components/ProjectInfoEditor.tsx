import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, X } from "lucide-react";
import { Project, UnitArea, UnitPurpose, EnergyLabel } from "@/pages/Index";

const projectInfoSchema = z.object({
  name: z.string().min(1, "Projectnaam is verplicht"),
  description: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  building_year: z.number().min(1800).max(new Date().getFullYear()).optional(),
  existing_building_type: z.string().optional(),
  transformation_description: z.string().optional(),
  number_of_units_after_split: z.number().min(1).optional(),
  unit_access_type: z.enum(['gemeenschappelijke_entree', 'eigen_opgang']).optional(),
  project_manager: z.string().optional(),
  executor: z.string().optional(),
  startDate: z.string(),
  planned_delivery_date: z.string().optional(),
  special_considerations: z.string().optional(),
  installation_concept: z.object({
    heating: z.string().optional(),
    ventilation: z.string().optional(),
    electrical: z.string().optional(),
  }).optional(),
});

interface ProjectInfoEditorProps {
  project: Project;
  onSave: (project: Project) => void;
  onCancel: () => void;
}

export const ProjectInfoEditor = ({ project, onSave, onCancel }: ProjectInfoEditorProps) => {
  const [unitAreas, setUnitAreas] = useState<UnitArea[]>(project.unit_areas || []);
  const [unitPurposes, setUnitPurposes] = useState<UnitPurpose[]>(project.unit_purposes || []);
  const [energyLabels, setEnergyLabels] = useState<EnergyLabel[]>(project.energy_labels || []);

  const form = useForm<z.infer<typeof projectInfoSchema>>({
    resolver: zodResolver(projectInfoSchema),
    defaultValues: {
      name: project.name,
      description: project.description,
      address: project.address || '',
      postal_code: project.postal_code || '',
      city: project.city || '',
      building_year: project.building_year,
      existing_building_type: project.existing_building_type || '',
      transformation_description: project.transformation_description || '',
      number_of_units_after_split: project.number_of_units_after_split,
      unit_access_type: project.unit_access_type,
      project_manager: project.project_manager || '',
      executor: project.executor || '',
      startDate: project.startDate,
      planned_delivery_date: project.planned_delivery_date || '',
      special_considerations: project.special_considerations || '',
      installation_concept: {
        heating: project.installation_concept?.heating || '',
        ventilation: project.installation_concept?.ventilation || '',
        electrical: project.installation_concept?.electrical || '',
      },
    },
  });

  const addUnitArea = () => {
    setUnitAreas([...unitAreas, { unit: '', go_area: 0 }]);
  };

  const removeUnitArea = (index: number) => {
    setUnitAreas(unitAreas.filter((_, i) => i !== index));
  };

  const updateUnitArea = (index: number, field: keyof UnitArea, value: string | number) => {
    const updated = [...unitAreas];
    updated[index] = { ...updated[index], [field]: value };
    setUnitAreas(updated);
  };

  const addUnitPurpose = () => {
    setUnitPurposes([...unitPurposes, { unit: '', purpose: 'verhuur' }]);
  };

  const removeUnitPurpose = (index: number) => {
    setUnitPurposes(unitPurposes.filter((_, i) => i !== index));
  };

  const updateUnitPurpose = (index: number, field: keyof UnitPurpose, value: string) => {
    const updated = [...unitPurposes];
    updated[index] = { ...updated[index], [field]: value };
    setUnitPurposes(updated);
  };

  const addEnergyLabel = () => {
    setEnergyLabels([...energyLabels, { unit: '' }]);
  };

  const removeEnergyLabel = (index: number) => {
    setEnergyLabels(energyLabels.filter((_, i) => i !== index));
  };

  const updateEnergyLabel = (index: number, field: keyof EnergyLabel, value: string) => {
    const updated = [...energyLabels];
    updated[index] = { ...updated[index], [field]: value };
    setEnergyLabels(updated);
  };

  const onSubmit = (values: z.infer<typeof projectInfoSchema>) => {
    const updatedProject: Project = {
      ...project,
      ...values,
      building_year: values.building_year || undefined,
      number_of_units_after_split: values.number_of_units_after_split || undefined,
      unit_areas: unitAreas.filter(area => area.unit && area.go_area > 0),
      unit_purposes: unitPurposes.filter(purpose => purpose.unit),
      energy_labels: energyLabels.filter(label => label.unit),
      installation_concept: values.installation_concept?.heating || values.installation_concept?.ventilation || values.installation_concept?.electrical 
        ? values.installation_concept 
        : undefined,
    };
    
    onSave(updatedProject);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Projectinformatie Bewerken</h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Annuleren
          </Button>
          <Button type="submit" form="project-info-form">
            <Save className="h-4 w-4 mr-2" />
            Opslaan
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form id="project-info-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Basisinformatie */}
          <Card>
            <CardHeader>
              <CardTitle>Basisinformatie</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projectnaam *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adres</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stad</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="building_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bouwjaar bestaand pand</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="existing_building_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type bestaande bouw</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="bijv. traditioneel metselwerk, betonskelet, jaren 30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Transformatie */}
          <Card>
            <CardHeader>
              <CardTitle>Transformatie</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="transformation_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Omschrijving transformatie</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="bijv. splitsing van 1 woning naar 3 appartementen" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="number_of_units_after_split"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aantal woningen na splitsing</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_access_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Woningontsluiting</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer ontsluiting" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gemeenschappelijke_entree">Gemeenschappelijke entree</SelectItem>
                        <SelectItem value="eigen_opgang">Eigen opgang</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Unit Areas */}
          <Card>
            <CardHeader>
              <CardTitle>Oppervlaktes per Woning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {unitAreas.map((area, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 items-center">
                  <div className="col-span-1">
                    <FormLabel htmlFor={`unit-area-${index}`}>Woning {index + 1}</FormLabel>
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="text"
                      id={`unit-area-${index}`}
                      value={area.unit}
                      onChange={(e) => updateUnitArea(index, 'unit', e.target.value)}
                      placeholder="Woning ID"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      placeholder="GO m²"
                      value={area.go_area}
                      onChange={(e) => updateUnitArea(index, 'go_area', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeUnitArea(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addUnitArea}>
                <Plus className="h-4 w-4 mr-2" />
                Woning toevoegen
              </Button>
            </CardContent>
          </Card>

          {/* Unit Purposes */}
          <Card>
            <CardHeader>
              <CardTitle>Bestemming per Woning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {unitPurposes.map((purpose, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 items-center">
                  <div className="col-span-1">
                    <FormLabel htmlFor={`unit-purpose-${index}`}>Woning {index + 1}</FormLabel>
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="text"
                      id={`unit-purpose-${index}`}
                      value={purpose.unit}
                      onChange={(e) => updateUnitPurpose(index, 'unit', e.target.value)}
                      placeholder="Woning ID"
                    />
                  </div>
                  <div className="col-span-1">
                    <Select onValueChange={(value) => updateUnitPurpose(index, 'purpose', value)} defaultValue={purpose.purpose}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer bestemming" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verhuur">Verhuur</SelectItem>
                        <SelectItem value="verkoop">Verkoop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeUnitPurpose(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addUnitPurpose}>
                <Plus className="h-4 w-4 mr-2" />
                Woning toevoegen
              </Button>
            </CardContent>
          </Card>

          {/* Energy Labels */}
          <Card>
            <CardHeader>
              <CardTitle>Energielabels per Woning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {energyLabels.map((label, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-center">
                  <div className="col-span-1">
                    <FormLabel htmlFor={`energy-label-${index}`}>Woning {index + 1}</FormLabel>
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="text"
                      id={`energy-label-${index}`}
                      value={label.unit}
                      onChange={(e) => updateEnergyLabel(index, 'unit', e.target.value)}
                      placeholder="Woning ID"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeEnergyLabel(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addEnergyLabel}>
                <Plus className="h-4 w-4 mr-2" />
                Woning toevoegen
              </Button>
            </CardContent>
          </Card>
          
          {/* Installatieconcept */}
          <Card>
            <CardHeader>
              <CardTitle>Installatieconcept</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="installation_concept.heating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verwarming</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="bijv. individuele CV, warmtepomp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installation_concept.ventilation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ventilatie</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="bijv. natuurlijk, mechanisch" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installation_concept.electrical"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Elektra</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="bijv. nieuwe meterkast, groepenverdeling" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Projectmanagement */}
          <Card>
            <CardHeader>
              <CardTitle>Projectmanagement & Planning</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="project_manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projectmanager</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="executor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uitvoerder</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startdatum *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="planned_delivery_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verwachte opleverdatum</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Bijzonderheden */}
          <Card>
            <CardHeader>
              <CardTitle>Bijzonderheden en Aandachtspunten</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="special_considerations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bijzonderheden</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="bijv. monumentstatus, funderingsherstel, vergunningsaanvragen"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};
