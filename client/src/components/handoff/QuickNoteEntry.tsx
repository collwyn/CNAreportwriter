import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, User, Stethoscope, Users, Package, FileText } from "lucide-react";
import type { InsertShiftNote } from "@shared/schema";

interface QuickNoteEntryProps {
  shiftSessionId: number;
  onClose: () => void;
}

export default function QuickNoteEntry({ shiftSessionId, onClose }: QuickNoteEntryProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    patientName: "",
    patientRoom: "",
    noteType: "general",
    priorityLevel: "normal",
    noteText: "",
  });

  // Get patients for selection
  const { data: patients = [] } = useQuery({
    queryKey: ['/api/patients'],
    retry: false,
  });

  const addNoteMutation = useMutation({
    mutationFn: async (noteData: InsertShiftNote) => {
      return await apiRequest(`/api/shifts/${shiftSessionId}/notes`, {
        method: 'POST',
        body: JSON.stringify(noteData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shifts', shiftSessionId, 'notes'] });
      toast({
        title: t('noteAdded'),
        description: "Your note has been added to the shift record.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error adding note",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.noteText.trim()) {
      toast({
        title: "Note text required",
        description: "Please enter note text before submitting.",
        variant: "destructive",
      });
      return;
    }

    addNoteMutation.mutate({
      shiftSessionId,
      ...formData,
    });
  };

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find((p: any) => p.id.toString() === patientId);
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patientName: patient.name,
        patientRoom: patient.roomNumber,
      }));
    }
  };

  const noteTypeIcons = {
    general: FileText,
    priority: AlertCircle,
    family: Users,
    medical: Stethoscope,
    supply: Package,
  };

  const priorityColors = {
    urgent: "text-red-600 bg-red-100",
    high: "text-orange-600 bg-orange-100",
    normal: "text-blue-600 bg-blue-100",
    low: "text-gray-600 bg-gray-100",
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{t('addQuickNote')}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient (Optional)</Label>
              <Select onValueChange={handlePatientSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient: any) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name} - Room {patient.roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientRoom">Room</Label>
              <Input
                id="patientRoom"
                value={formData.patientRoom}
                onChange={(e) => setFormData(prev => ({ ...prev, patientRoom: e.target.value }))}
                placeholder="Room number"
              />
            </div>
          </div>

          {/* Note Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="noteType">{t('noteType')}</Label>
              <Select 
                value={formData.noteType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, noteType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>{t('generalNote')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="priority">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{t('priorityNote')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="family">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{t('familyNote')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medical">
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4" />
                      <span>{t('medicalNote')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="supply">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4" />
                      <span>{t('supplyNote')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priorityLevel">{t('priorityLevel')}</Label>
              <Select 
                value={formData.priorityLevel} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priorityLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded ${priorityColors.urgent}`}>
                      <span>{t('urgentPriority')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded ${priorityColors.high}`}>
                      <span>{t('highPriority')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="normal">
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded ${priorityColors.normal}`}>
                      <span>{t('normalPriority')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded ${priorityColors.low}`}>
                      <span>{t('lowPriority')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Note Text */}
          <div className="space-y-2">
            <Label htmlFor="noteText">Note</Label>
            <Textarea
              id="noteText"
              value={formData.noteText}
              onChange={(e) => setFormData(prev => ({ ...prev, noteText: e.target.value }))}
              placeholder="Enter your quick note here..."
              rows={4}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addNoteMutation.isPending}
            >
              {addNoteMutation.isPending ? t('addingNote') : 'Add Note'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}