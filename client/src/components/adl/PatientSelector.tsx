import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";
import type { Patient } from "@shared/schema";

export function PatientSelector({ onPatientSelect }: { onPatientSelect: (patient: Patient) => void }) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: patients, isLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  const filteredPatients = patients?.filter((patient: Patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getCareLevel = (level: string) => {
    const levels = {
      skilled: { text: "Skilled Care", color: "bg-red-100 text-red-800" },
      assisted: { text: "Assisted Living", color: "bg-yellow-100 text-yellow-800" },
      independent: { text: "Independent", color: "bg-green-100 text-green-800" }
    };
    return levels[level as keyof typeof levels] || levels.assisted;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Select Patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading patients...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Select Patient
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or room number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No patients found matching your search." : "No patients found."}
            </div>
          ) : (
            filteredPatients.map((patient: Patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onPatientSelect(patient)}
              >
                <div className="flex items-center space-x-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{patient.name}</h3>
                    <p className="text-sm text-gray-600">Room {patient.roomNumber}</p>
                  </div>
                  <Badge className={getCareLevel(patient.careLevel).color}>
                    {getCareLevel(patient.careLevel).text}
                  </Badge>
                </div>
                <Button size="sm" variant="outline">
                  Select
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}