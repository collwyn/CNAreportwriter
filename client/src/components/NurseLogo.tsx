import nurseLogoImage from "@assets/cnageniuslogo_1753839891568.jpg";

export function NurseLogo() {
  return (
    <div className="mx-auto mb-6 w-50 h-50 flex items-center justify-center">
      <img 
        src={nurseLogoImage} 
        alt="Nurse with clipboard" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}