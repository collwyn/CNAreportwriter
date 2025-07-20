import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import Home from "@/pages/home";
import ADLDashboard from "@/pages/ADLDashboard";
import IncidentReportWithPatient from "@/pages/IncidentReportWithPatient";
import NotFound from "@/pages/not-found";
import FeedbackDashboard from "@/pages/feedback-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/incident-report" component={IncidentReportWithPatient} />
      <Route path="/adl-dashboard" component={ADLDashboard} />
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
