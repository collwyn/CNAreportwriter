import { useLanguage } from "@/context/LanguageContext";
import { Link } from "wouter";

export function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-500">
          <div className="mb-2">
            <Link href="/terms-and-conditions">
              <span className="text-blue-600 hover:text-blue-800 underline cursor-pointer">
                Terms and Conditions
              </span>
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} CNA Genius. {t("footerText")}</p>
        </div>
      </div>
    </footer>
  );
}
