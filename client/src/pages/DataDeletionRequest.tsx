import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import TopNavigation from "@/components/TopNavigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Trash2, Shield, Clock } from "lucide-react";

export default function DataDeletionRequest() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    accountEmail: "",
    reason: "",
    additionalInfo: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.accountEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Create email body
    const emailBody = `Data Deletion Request

Account Email: ${formData.accountEmail}
Contact Email: ${formData.email}
Reason for Deletion: ${formData.reason}
Additional Information: ${formData.additionalInfo}

Please process this data deletion request according to your Terms and Conditions.`;

    // Create mailto link
    const mailtoLink = `mailto:collwync@gmail.com?subject=Data Deletion Request&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.location.href = mailtoLink;

    toast({
      title: "Email Client Opened",
      description: "Your default email client should open with the deletion request pre-filled.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <TopNavigation />
      
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex-grow">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Data Deletion Request
            </CardTitle>
            <p className="text-gray-600">
              Request deletion of your personal data and account information
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Information Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Your Rights
              </h3>
              <div className="space-y-3 text-sm text-blue-700">
                <p>
                  <strong>Right to Deletion:</strong> You have the right to request deletion of your personal data and account information from our platform.
                </p>
                <p>
                  <strong><Clock className="w-4 h-4 inline mr-1" />Processing Time:</strong> We will process your request within 30 days and confirm completion via email.
                </p>
                <p>
                  <strong>Data Retention:</strong> Some data may be retained for legal compliance or business purposes as permitted by applicable law.
                </p>
              </div>
            </div>

            {/* Request Form */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Submit Your Deletion Request
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Your Contact Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Email address where we should send confirmation
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="accountEmail" className="text-sm font-medium text-gray-700">
                      Account Email to Delete <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="accountEmail"
                        name="accountEmail"
                        type="email"
                        required
                        value={formData.accountEmail}
                        onChange={handleInputChange}
                        placeholder="account.to.delete@example.com"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Email address associated with the account to be deleted
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                    Reason for Deletion (Optional)
                  </Label>
                  <Input
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="e.g., No longer using the service, privacy concerns, etc."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="additionalInfo" className="text-sm font-medium text-gray-700">
                    Additional Information (Optional)
                  </Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Any additional details that might help us locate your data or process your request..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Clicking "Submit Request" will open your default email client with a pre-filled message. 
                    You can review and modify the message before sending.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Submit Deletion Request
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Alternative Contact Method
              </h3>
              <p className="text-sm text-gray-600">
                You can also email us directly at{" "}
                <a href="mailto:collwync@gmail.com?subject=Data Deletion Request" className="text-blue-600 hover:text-blue-800 underline">
                  collwync@gmail.com
                </a>{" "}
                with "Data Deletion Request" in the subject line.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}