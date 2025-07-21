import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { Clock, Activity, FileText, Users, TrendingUp } from "lucide-react";
import type { ShiftSession } from "@shared/schema";

interface ShiftTrackerProps {
  shiftSession: ShiftSession;
}

export default function ShiftTracker({ shiftSession }: ShiftTrackerProps) {
  const { t } = useLanguage();

  // Get shift notes for current shift
  const { data: shiftNotes = [] } = useQuery({
    queryKey: ['/api/shifts', shiftSession.id, 'notes'],
    retry: false,
  });

  const getShiftProgress = () => {
    const start = new Date(shiftSession.shiftStart);
    const now = new Date();
    const totalShiftHours = 8; // Assume 8-hour shifts
    const elapsedHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
    const progress = Math.min((elapsedHours / totalShiftHours) * 100, 100);
    return Math.round(progress);
  };

  const getShiftStatus = () => {
    const progress = getShiftProgress();
    if (progress < 25) return { text: "Early Shift", color: "bg-blue-500" };
    if (progress < 75) return { text: "Mid Shift", color: "bg-yellow-500" };
    return { text: "End of Shift", color: "bg-green-500" };
  };

  const getPriorityNotesCount = () => {
    return shiftNotes.filter((note: any) => 
      note.priorityLevel === 'urgent' || note.priorityLevel === 'high'
    ).length;
  };

  const formatStartTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const status = getShiftStatus();
  const progress = getShiftProgress();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>{t('shiftProgress')}</span>
          </div>
          <Badge className={`${status.color} text-white`}>
            {status.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shift Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Started: {formatStartTime(shiftSession.shiftStart)}</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Shift Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Incidents</p>
                <p className="text-2xl font-bold text-blue-700">
                  {shiftSession.totalIncidents || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">ADL Tasks</p>
                <p className="text-2xl font-bold text-green-700">
                  {shiftSession.totalAdlEntries || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">Quick Notes</p>
                <p className="text-2xl font-bold text-orange-700">
                  {shiftNotes.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900">Priority Items</p>
                <p className="text-2xl font-bold text-red-700">
                  {getPriorityNotesCount()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notes Preview */}
        {shiftNotes.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Recent Notes</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {shiftNotes.slice(-3).map((note: any) => (
                <div key={note.id} className="flex items-start space-x-2 text-sm">
                  <Badge 
                    variant={note.priorityLevel === 'urgent' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {note.priorityLevel}
                  </Badge>
                  <p className="text-gray-600 truncate flex-1">
                    {note.patientName && `${note.patientName}: `}
                    {note.noteText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}