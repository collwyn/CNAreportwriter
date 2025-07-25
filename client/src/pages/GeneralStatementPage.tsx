import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Copy, Download, FileText, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "wouter";

const generalStatementSchema = z.object({
  residentName: z.string().min(1, "Resident name is required"),
  roomNumber: z.string().optional(),
  rawStatement: z.string().min(10, "Statement must be at least 10 characters"),
});

type GeneralStatementForm = z.infer<typeof generalStatementSchema>;

export default function GeneralStatementPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [processedStatement, setProcessedStatement] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const form = useForm<GeneralStatementForm>({
    resolver: zodResolver(generalStatementSchema),
    defaultValues: {
      residentName: "",
      roomNumber: "",
      rawStatement: "",
    },
  });

  const processMutation = useMutation({
    mutationFn: async (data: GeneralStatementForm) => {
      const response = await apiRequest("/api/general-statement/process", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      setProcessedStatement(data.processedStatement);
      setShowResult(true);
      toast({
        title: "Statement Processed",
        description: "Your statement has been improved and is ready for use.",
      });
    },
    onError: (error) => {
      console.error("Error processing statement:", error);
      toast({
        title: "Processing Failed",
        description: "There was an error processing your statement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: GeneralStatementForm) => {
    processMutation.mutate(data);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(processedStatement);
      toast({
        title: "Copied to Clipboard",
        description: "The statement has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please select and copy manually.",
        variant: "destructive",
      });
    }
  };

  const downloadStatement = () => {
    const blob = new Blob([processedStatement], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statement_${form.getValues("residentName").replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Your statement file is being downloaded.",
    });
  };

  const resetForm = () => {
    form.reset();
    setProcessedStatement("");
    setShowResult(false);
  };

  if (showResult && processedStatement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">General Statement Writer</h1>
            <p className="text-gray-600 mt-2">Processed Employee Statement</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Processed Statement
              </CardTitle>
              <CardDescription>
                Your statement has been improved for grammar, spelling, and clarity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {processedStatement}
                </pre>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button onClick={copyToClipboard} className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </Button>
                <Button onClick={downloadStatement} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button onClick={resetForm} variant="outline">
                  Create New Statement
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">General Statement Writer</h1>
          <p className="text-gray-600 mt-2">Create professional employee statements with AI assistance</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee Statement Form</CardTitle>
            <CardDescription>
              Enter the basic information and your statement. AI will improve grammar, spelling, and structure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="residentName">Resident Name *</Label>
                  <Input
                    id="residentName"
                    {...form.register("residentName")}
                    placeholder="Enter resident's name"
                    className={form.formState.errors.residentName ? "border-red-500" : ""}
                  />
                  {form.formState.errors.residentName && (
                    <p className="text-red-500 text-sm">{form.formState.errors.residentName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    {...form.register("roomNumber")}
                    placeholder="Enter room number (optional)"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="rawStatement">Your Statement *</Label>
                <Textarea
                  id="rawStatement"
                  {...form.register("rawStatement")}
                  placeholder="Enter your statement about the incident. Include all relevant details..."
                  rows={8}
                  className={form.formState.errors.rawStatement ? "border-red-500" : ""}
                />
                {form.formState.errors.rawStatement && (
                  <p className="text-red-500 text-sm">{form.formState.errors.rawStatement.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Write your statement in your own words. AI will improve grammar and structure while preserving your meaning.
                </p>
              </div>

              <Button
                type="submit"
                disabled={processMutation.isPending}
                className="w-full"
              >
                {processMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Statement...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Process Statement
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}