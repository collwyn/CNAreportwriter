import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "wouter";
import PatientSelector from "../components/PatientSelector";
import SimpleForm from "../components/SimpleForm";
import { useLanguage } from "../context/LanguageContext";
import type { Patient } from "@shared/schema";

export default function IncidentReportWithPatient() {
  const { t } = useLanguage();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [step, setStep] = useState<'select-patient' | 'fill-report'>('select-patient');

  const handlePatientSelect = (patient: Patient | null, isNew?: boolean) => {
    setSelectedPatient(patient);
    if (patient) {
      setStep('fill-report');
    }
  };

  const handleBackToPatientSelect = () => {
    setStep('select-patient');
    setSelectedPatient(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToHome')}
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('incidentReportWriter')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('incidentReportDescription')}
          </p>
        </div>

        {step === 'select-patient' ? (
          <PatientSelector
            onPatientSelect={handlePatientSelect}
            selectedPatient={selectedPatient}
            context="incident"
          />
        ) : (
          <div className="space-y-6">
            {/* Selected Patient Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{t('selectedPatient')}: {selectedPatient?.name}</h3>
                    <p className="text-gray-600">{t('room')}: {selectedPatient?.roomNumber}</p>
                  </div>
                  <Button variant="outline" onClick={handleBackToPatientSelect}>
                    {t('changePatient')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Incident Report Form */}
            <SimpleForm 
              preSelectedPatient={selectedPatient}
            />
          </div>
        )}
      </div>
    </div>
  );
}