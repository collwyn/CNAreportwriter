import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import TopNavigation from "@/components/TopNavigation";
import ShiftTracker from "@/components/handoff/ShiftTracker";
import QuickNoteEntry from "@/components/handoff/QuickNoteEntry";
import HandoffGenerator from "@/components/handoff/HandoffGenerator";
import { Clock, ClipboardCheck, Users, AlertCircle, Play, Square } from "lucide-react";
import type { ShiftSession, InsertShiftSession } from "@shared/schema";

export default function ShiftHandoffPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNoteEntry, setShowNoteEntry] = useState(false);
  const [showHandoffGenerator, setShowHandoffGenerator] = useState(false);

  // Get current active shift
  const { data: currentShift, isLoading: shiftLoading } = useQuery({
    queryKey: ['/api/shifts/current'],
    retry: false,
  });

  // Start shift mutation
  const startShiftMutation = useMutation({
    mutationFn: async (shiftData: InsertShiftSession) => {
      return await apiRequest('/api/shifts/start', {
        method: 'POST',
        body: JSON.stringify(shiftData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shifts/current'] });
      toast({
        title: t('shiftStarted'),
        description: "Your shift has been started successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error starting shift",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // End shift mutation
  const endShiftMutation = useMutation({
    mutationFn: async (shiftId: number) => {
      return await apiRequest(`/api/shifts/${shiftId}/end`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shifts/current'] });
      setShowHandoffGenerator(true);
      toast({
        title: t('shiftEnded'),
        description: "Your shift has been ended. Generate your handoff report.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error ending shift",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartShift = () => {
    const now = new Date();
    const currentHour = now.getHours();
    let shiftType = 'day';
    
    if (currentHour >= 6 && currentHour < 14) {
      shiftType = 'morning';
    } else if (currentHour >= 14 && currentHour < 22) {
      shiftType = 'evening';
    } else {
      shiftType = 'night';
    }

    startShiftMutation.mutate({
      cnaName: "Current User", // This would come from auth context
      shiftType,
      shiftStart: now,
      facilityFloor: "General", // This could be user preference
    });
  };

  const handleEndShift = () => {
    if (currentShift) {
      endShiftMutation.mutate(currentShift.id);
    }
  };

  const formatShiftDuration = (start: string) => {
    const startTime = new Date(start);
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <ClipboardCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('shiftHandoff')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('shiftHandoffDescription')}
          </p>
        </div>

        {shiftLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading shift information...</p>
          </div>
        ) : currentShift ? (
          <>
            {/* Current Shift Status */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span>{t('currentShift')}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <Button 
                    onClick={handleEndShift}
                    disabled={endShiftMutation.isPending}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Square className="w-4 h-4" />
                    <span>{endShiftMutation.isPending ? 'Ending...' : t('endShift')}</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('shiftType')}</p>
                    <p className="text-lg font-semibold capitalize">{currentShift.shiftType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('shiftDuration')}</p>
                    <p className="text-lg font-semibold">{formatShiftDuration(currentShift.shiftStart)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('totalIncidents')}</p>
                    <p className="text-lg font-semibold">{currentShift.totalIncidents || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('totalAdlEntries')}</p>
                    <p className="text-lg font-semibold">{currentShift.totalAdlEntries || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shift Components */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Shift Tracker */}
              <ShiftTracker shiftSession={currentShift} />
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => setShowNoteEntry(true)}
                    className="w-full flex items-center space-x-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{t('addQuickNote')}</span>
                  </Button>
                  
                  <Button 
                    onClick={() => setShowHandoffGenerator(true)}
                    variant="outline"
                    className="w-full flex items-center space-x-2"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>{t('generateHandoff')}</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          /* No Active Shift - Start Shift */
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Users className="w-6 h-6" />
                <span>No Active Shift</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-gray-600">
                Start your shift to begin tracking activities and preparing handoff reports.
              </p>
              
              <Button 
                onClick={handleStartShift}
                disabled={startShiftMutation.isPending}
                size="lg"
                className="flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>{startShiftMutation.isPending ? 'Starting...' : t('startShift')}</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        {showNoteEntry && currentShift && (
          <QuickNoteEntry
            shiftSessionId={currentShift.id}
            onClose={() => setShowNoteEntry(false)}
          />
        )}

        {showHandoffGenerator && currentShift && (
          <HandoffGenerator
            shiftSession={currentShift}
            onClose={() => setShowHandoffGenerator(false)}
          />
        )}
      </main>
    </div>
  );
}