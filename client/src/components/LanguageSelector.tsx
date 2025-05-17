import { LANGUAGES, SupportedLanguage } from "@/utils/i18n";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (value: SupportedLanguage) => {
    setLanguage(value);
  };

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(LANGUAGES).map(([code, { native }]) => (
          <SelectItem key={code} value={code as SupportedLanguage}>
            {native}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
