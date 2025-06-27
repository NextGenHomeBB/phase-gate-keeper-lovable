
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Subcontractor } from "@/services/subcontractorService";
import { useIsMobile } from "@/hooks/use-mobile";

interface SubcontractorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Subcontractor, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: Subcontractor | null;
  title: string;
}

export function SubcontractorForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  title 
}: SubcontractorFormProps) {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    name: '',
    trade_specialty: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        trade_specialty: initialData.trade_specialty,
        phone: initialData.phone || '',
        email: initialData.email || '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        name: '',
        trade_specialty: '',
        phone: '',
        email: '',
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.trade_specialty.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        ...formData,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'sm:max-w-[95vw] mx-4' : 'sm:max-w-md'} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className={isMobile ? "text-lg" : undefined}>{title}</DialogTitle>
          <DialogDescription className={isMobile ? "text-sm" : undefined}>
            {initialData ? 'Update' : 'Add'} sub-contractor information and contact details.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter sub-contractor name"
              required
              className={isMobile ? "text-base" : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trade_specialty">Trade Specialty *</Label>
            <Input
              id="trade_specialty"
              value={formData.trade_specialty}
              onChange={(e) => setFormData({ ...formData, trade_specialty: e.target.value })}
              placeholder="e.g., Electrician, Plumber, Carpenter"
              required
              className={isMobile ? "text-base" : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone number"
              className={isMobile ? "text-base" : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email address"
              className={isMobile ? "text-base" : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or comments"
              rows={3}
              className={isMobile ? "text-base" : undefined}
            />
          </div>

          <DialogFooter className={isMobile ? "flex-col space-y-2" : undefined}>
            <Button type="button" variant="outline" onClick={onClose} className={isMobile ? "w-full" : undefined}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.name.trim() || !formData.trade_specialty.trim() || submitting}
              className={isMobile ? "w-full" : undefined}
            >
              {submitting ? 'Saving...' : (initialData ? 'Update' : 'Add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
