import { useLanguage } from "@/context/LanguageContext";
import TopNavigation from "@/components/TopNavigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsAndConditions() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <TopNavigation />
      
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex-grow">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Terms and Conditions
            </CardTitle>
            <p className="text-gray-600">Effective Date: August 1, 2025</p>
          </CardHeader>
          
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                Welcome to <strong>CNA Genius</strong> (the "Platform", "we", "us", or "our"). 
                By accessing or using <a href="https://cnagenius.com" className="text-blue-600 hover:text-blue-800 underline">cnagenius.com</a>, 
                you agree to comply with and be bound by these Terms and Conditions ("Terms"). 
                Please read them carefully before using the site or services.
              </p>

              <section>
                <h2 className="text-xl font-semibold text-blue-800 mb-3">1. Use of the Platform</h2>
                <p>
                  CNA Genius provides a freemium software-as-a-service (SaaS) platform for users to upload content and create accounts. 
                  By using our services, you agree to provide accurate account information and keep it up to date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-blue-800 mb-3">2. User Content</h2>
                <p>
                  You retain ownership of any content you upload or submit to CNA Genius. However, by uploading content, 
                  you grant CNA Genius a non-exclusive, royalty-free license to store, display, and use your content solely 
                  for the purposes of operating and improving the platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-blue-800 mb-3">3. Intellectual Property</h2>
                <p>
                  All trademarks, branding, logos, and proprietary content provided by CNA Genius are the exclusive property 
                  of CNA Genius and may not be used without our written permission.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-blue-800 mb-3">4. Account Termination</h2>
                <p>
                  We reserve the right to suspend or terminate user accounts at our sole discretion, without prior notice, 
                  if we believe a user has violated these Terms or is misusing the platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-blue-800 mb-3">5. Payments and Subscriptions</h2>
                <p>
                  CNA Genius offers both free and paid features. Subscriptions to premium features may be billed on a recurring basis. 
                  All payments are final and non-refundable unless otherwise stated.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-blue-800 mb-3">6. Prohibited Uses</h2>
                <p>
                  You agree not to use the platform to post or distribute any unlawful, harmful, abusive, or inappropriate content. 
                  You also agree not to interfere with or disrupt the functionality or security of the platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-blue-800 mb-3">7. Disclaimer of Warranties</h2>
                <p>
                  The platform is provided "as is" without warranties of any kind. CNA Genius does not guarantee the platform 
                  will be error-free, secure, or continuously available.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-blue-800 mb-3">8. Limitation of Liability</h2>
                <p>
                  In no event shall CNA Genius or its affiliates be liable for any indirect, incidental, special, or consequential 
                  damages arising out of or related to your use of the platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-blue-800 mb-3">9. Governing Law</h2>
                <p>
                  These Terms are governed by the laws of the State of South Carolina, USA. Any legal action or proceeding 
                  shall be brought exclusively in the state or federal courts located in South Carolina.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-blue-800 mb-3">10. Changes to These Terms</h2>
                <p>
                  We may update these Terms from time to time. Continued use of the platform after any changes constitutes 
                  your acceptance of the revised Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-blue-800 mb-3">11. Contact Us</h2>
                <p>
                  If you have any questions about these Terms, you can contact us at: <a href="mailto:collwync@gmail.com" className="text-blue-600 hover:text-blue-800 underline">collwync@gmail.com</a>
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}