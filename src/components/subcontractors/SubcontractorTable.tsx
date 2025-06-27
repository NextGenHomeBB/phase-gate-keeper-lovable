
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Phone, Mail } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Subcontractor } from "@/services/subcontractorService";

interface SubcontractorTableProps {
  subcontractors: Subcontractor[];
  loading: boolean;
  onEdit: (subcontractor: Subcontractor) => void;
  onDelete: (id: string) => void;
}

export function SubcontractorTable({ subcontractors, loading, onEdit, onDelete }: SubcontractorTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
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
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Trade Specialty</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subcontractors.map((subcontractor) => (
            <TableRow key={subcontractor.id}>
              <TableCell className="font-medium">{subcontractor.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">{subcontractor.trade_specialty}</Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {subcontractor.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-3 w-3 mr-1" />
                      {subcontractor.phone}
                    </div>
                  )}
                  {subcontractor.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-3 w-3 mr-1" />
                      {subcontractor.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-xs truncate text-sm text-gray-600">
                  {subcontractor.notes || "-"}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(subcontractor)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Sub-contractor</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {subcontractor.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(subcontractor.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
