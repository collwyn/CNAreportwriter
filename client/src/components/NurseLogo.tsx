import nurseLogoImage from "@assets/ChatGPT Image Jul 14, 2025, 04_27_08 PM_1752529567545.png";

export function NurseLogo() {
  return (
    <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center">
      <img 
        src={nurseLogoImage} 
        alt="Nurse with clipboard" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}