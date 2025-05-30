
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText, Table } from "lucide-react";
import { Checklist } from "@/pages/ChecklistCreator";

interface ChecklistExportProps {
  checklist: Checklist;
  onClose: () => void;
}

export function ChecklistExport({ checklist, onClose }: ChecklistExportProps) {
  const handleExportPDF = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${checklist.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .metadata { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .checklist-item { margin: 10px 0; padding: 8px; border: 1px solid #ddd; border-radius: 3px; }
            .checkbox { width: 20px; height: 20px; border: 2px solid #333; display: inline-block; margin-right: 10px; }
            .completed { background: #333; }
            .item-details { margin-left: 30px; font-size: 0.9em; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${checklist.title}</h1>
            <p>${checklist.description}</p>
            <div class="metadata">
              <strong>Category:</strong> ${checklist.category} | 
              <strong>Trade:</strong> ${checklist.trade} | 
              <strong>Phase:</strong> ${checklist.projectPhase}
              ${checklist.tags.length > 0 ? `<br><strong>Tags:</strong> ${checklist.tags.join(', ')}` : ''}
            </div>
          </div>
          
          <h2>Checklist Items (${checklist.items.filter(i => i.completed).length}/${checklist.items.length} completed)</h2>
          
          ${checklist.items.map((item, index) => `
            <div class="checklist-item">
              <span class="checkbox ${item.completed ? 'completed' : ''}"></span>
              <strong>${index + 1}. ${item.text}</strong>
              ${item.dueDate || item.assignedTo || item.notes ? `
                <div class="item-details">
                  ${item.dueDate ? `<div><strong>Due:</strong> ${new Date(item.dueDate).toLocaleDateString()}</div>` : ''}
                  ${item.assignedTo ? `<div><strong>Assigned to:</strong> ${item.assignedTo}</div>` : ''}
                  ${item.notes ? `<div><strong>Notes:</strong> ${item.notes}</div>` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
          
          <div style="margin-top: 30px; font-size: 0.9em; color: #666;">
            Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportExcel = () => {
    // Create CSV content
    const csvContent = [
      ['Item #', 'Description', 'Status', 'Due Date', 'Assigned To', 'Notes'],
      ...checklist.items.map((item, index) => [
        index + 1,
        item.text,
        item.completed ? 'Completed' : 'Pending',
        item.dueDate || '',
        item.assignedTo || '',
        item.notes || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${checklist.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Export Checklist
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">{checklist.title}</h3>
          <p className="text-gray-600 mb-4">{checklist.description}</p>
          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            <span>Category: {checklist.category}</span>
            <span>•</span>
            <span>Trade: {checklist.trade}</span>
            <span>•</span>
            <span>Phase: {checklist.projectPhase}</span>
            <span>•</span>
            <span>{checklist.items.length} items</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={handleExportPDF}>
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-blue-600" />
              <h4 className="font-semibold mb-2">Export as PDF</h4>
              <p className="text-sm text-gray-600">
                Generate a printable PDF version of your checklist
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={handleExportExcel}>
            <CardContent className="p-6 text-center">
              <Table className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <h4 className="font-semibold mb-2">Export as CSV</h4>
              <p className="text-sm text-gray-600">
                Download as CSV file for Excel or Google Sheets
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
