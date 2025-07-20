import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, Plus, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "../context/LanguageContext";
import type { Patient, InsertPatient } from "@shared/schema";

interface PatientSelectorProps {
  onPatientSelect: (patient: Patient | null, isNew?: boolean, newPatientData?: any) => void;
  selectedPatient?: Patient | null;
  showNewPatientForm?: boolean;
  context: 'incident' | 'adl'; // To determine which system is using this component
}

export default function PatientSelector({ 
  onPatientSelect, 
  selectedPatient, 
  showNewPatientForm = false,
  context 
}: PatientSelectorProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectionMode, setSelectionMode] = useState<'existing' | 'new'>('existing');
  const [searchTerm, setSearchTerm] = useState('');
  const [newPatientData, setNewPatientData] = useState<Partial<InsertPatient>>({
    name: '',
    roomNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    careLevel: 'assisted',
    dietaryRestrictions: '',
    mobilityAids: '',
    cognitiveStatus: 'alert'
  });

  // Fetch existing patients
  const { data: patients, isLoading } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: async () => {
      const response = await fetch('/api/patients');
      if (!response.ok) throw new Error('Failed to fetch patients');
      return response.json() as Promise<Patient[]>;
    }
  });

  // Create new patient mutation
  const createPatientMutation = useMutation({
    mutationFn: async (patientData: InsertPatient) => {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });
      if (!response.ok) throw new Error('Failed to create patient');
      return response.json();
    },
    onSuccess: (newPatient: Patient) => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      toast({
        title: t('patientCreated'),
        description: t('patientCreatedSuccessfully'),
      });
      onPatientSelect(newPatient, true, newPatientData);
      // Reset form
      setNewPatientData({
        name: '',
        roomNumber: '',
        admissionDate: new Date().toISOString().split('T')[0],
        careLevel: 'assisted',
        dietaryRestrictions: '',
        mobilityAids: '',
        cognitiveStatus: 'alert'
      });
      setSelectionMode('existing');
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: t('errorCreatingPatient'),
        variant: "destructive",
      });
    }
  });

  const filteredPatients = patients?.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreatePatient = () => {
    if (!newPatientData.name || !newPatientData.roomNumber) {
      toast({
        title: t('error'),
        description: t('pleaseCompleteRequiredFields'),
        variant: "destructive",
      });
      return;
    }
    createPatientMutation.mutate(newPatientData as InsertPatient);
  };

  const updateNewPatientData = (field: keyof InsertPatient, value: any) => {
    setNewPatientData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          {context === 'incident' ? t('selectPatientForReport') : t('selectPatientForADL')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selection Mode */}
        <div>
          <Label className="text-base font-medium">{t('patientSelection')}</Label>
          <RadioGroup
            value={selectionMode}
            onValueChange={(value) => setSelectionMode(value as 'existing' | 'new')}
            className="flex flex-col sm:flex-row gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing" />
              <Label htmlFor="existing">{t('selectExistingPatient')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new">{t('createNewPatient')}</Label>
            </div>
          </RadioGroup>
        </div>

        {selectionMode === 'existing' ? (
          <div className="space-y-4">
            {/* Search existing patients */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('searchPatientsPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Patient list */}
            {isLoading ? (
              <p>{t('loadingPatients')}</p>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                {searchTerm ? t('noMatchingPatients') : t('noPatientsFound')}
                <p className="text-sm mt-2">{t('considerCreatingNewPatient')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onPatientSelect(patient)}
                  >
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-gray-500">
                      {t('room')}: {patient.roomNumber} | {t(patient.careLevel as any)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* New patient form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">{t('patientName')} *</Label>
                <Input
                  id="patientName"
                  value={newPatientData.name || ''}
                  onChange={(e) => updateNewPatientData('name', e.target.value)}
                  placeholder={t('enterPatientName')}
                />
              </div>
              
              <div>
                <Label htmlFor="roomNumber">{t('roomNumber')} *</Label>
                <Input
                  id="roomNumber"
                  value={newPatientData.roomNumber || ''}
                  onChange={(e) => updateNewPatientData('roomNumber', e.target.value)}
                  placeholder={t('enterRoomNumber')}
                />
              </div>

              <div>
                <Label htmlFor="admissionDate">{t('admissionDate')}</Label>
                <Input
                  id="admissionDate"
                  type="date"
                  value={newPatientData.admissionDate || ''}
                  onChange={(e) => updateNewPatientData('admissionDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="careLevel">{t('careLevel')}</Label>
                <Select 
                  value={newPatientData.careLevel} 
                  onValueChange={(value) => updateNewPatientData('careLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skilled">{t('skilledCare')}</SelectItem>
                    <SelectItem value="assisted">{t('assistedLiving')}</SelectItem>
                    <SelectItem value="independent">{t('independent')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cognitiveStatus">{t('cognitiveStatus')}</Label>
                <Select 
                  value={newPatientData.cognitiveStatus} 
                  onValueChange={(value) => updateNewPatientData('cognitiveStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alert">{t('alert')}</SelectItem>
                    <SelectItem value="confused">{t('confused')}</SelectItem>
                    <SelectItem value="dementia">{t('dementia')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mobilityAids">{t('mobilityAids')}</Label>
                <Input
                  id="mobilityAids"
                  value={newPatientData.mobilityAids || ''}
                  onChange={(e) => updateNewPatientData('mobilityAids', e.target.value)}
                  placeholder={t('mobilityAidsPlaceholder')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dietaryRestrictions">{t('dietaryRestrictions')}</Label>
              <Textarea
                id="dietaryRestrictions"
                value={newPatientData.dietaryRestrictions || ''}
                onChange={(e) => updateNewPatientData('dietaryRestrictions', e.target.value)}
                placeholder={t('dietaryRestrictionsPlaceholder')}
                rows={2}
              />
            </div>

            <Button 
              onClick={handleCreatePatient} 
              disabled={createPatientMutation.isPending || !newPatientData.name || !newPatientData.roomNumber}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {createPatientMutation.isPending ? t('creatingPatient') : t('createPatient')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}