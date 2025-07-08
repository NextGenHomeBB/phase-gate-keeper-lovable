
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Phone, Mail, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { SendWhatsAppButton } from "@/components/SendWhatsAppButton";
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
import { Subcontractor } from "@/services/subcontractorService";

interface SubcontractorCardProps {
  subcontractor: Subcontractor;
  onEdit: (subcontractor: Subcontractor) => void;
  onDelete: (id: string) => void;
}

export function SubcontractorCard({ subcontractor, onEdit, onDelete }: SubcontractorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {subcontractor.name}
            </h3>
            <Badge variant="secondary" className="mb-2">
              {subcontractor.trade_specialty}
            </Badge>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(subcontractor)}
              className="h-9 w-9"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9">
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
        </div>

        {/* Contact buttons - always visible on mobile */}
        <div className="flex gap-2 mb-3">
          {subcontractor.phone && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCall(subcontractor.phone!)}
              className="flex items-center gap-2 flex-1"
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
          )}
          {subcontractor.phone && (
            <SendWhatsAppButton to={subcontractor.phone} className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </SendWhatsAppButton>
          )}
          {subcontractor.email && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEmail(subcontractor.email!)}
              className="flex items-center gap-2 flex-1"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
          )}
        </div>

        {/* Contact details */}
        {(subcontractor.phone || subcontractor.email) && (
          <div className="space-y-1 mb-3 text-sm text-gray-600">
            {subcontractor.phone && (
              <div className="flex items-center">
                <Phone className="h-3 w-3 mr-2" />
                {subcontractor.phone}
              </div>
            )}
            {subcontractor.email && (
              <div className="flex items-center">
                <Mail className="h-3 w-3 mr-2" />
                {subcontractor.email}
              </div>
            )}
          </div>
        )}

        {/* Expandable notes section */}
        {subcontractor.notes && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0 h-auto text-sm text-gray-600 hover:text-gray-900"
            >
              <span className="mr-1">Notes</span>
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
            {isExpanded && (
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {subcontractor.notes}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
