import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import Home from "@/pages/home";
import IncidentReportPage from "@/pages/IncidentReportPage";
import ADLDashboard from "@/pages/ADLDashboard";
import IncidentReportWithPatient from "@/pages/IncidentReportWithPatient";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/not-found";
import FeedbackDashboard from "@/pages/feedback-dashboard";
import ShiftHandoffPage from "@/pages/ShiftHandoffPage";
import GeneralStatementPage from "@/pages/GeneralStatementPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/incident-report" component={IncidentReportPage} />
      <Route path="/adl-dashboard" component={ADLDashboard} />
      <Route path="/shift-handoff" component={ShiftHandoffPage} />
      <Route path="/general-statement" component={GeneralStatementPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/admin/feedback" component={FeedbackDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
