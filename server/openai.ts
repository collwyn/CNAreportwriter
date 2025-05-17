import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

/**
 * Generate a grammatically correct incident report based on form data
 */
export async function generateReport(formData: any): Promise<string> {
  try {
    // Format time for readability
    const incidentTime = formData.incidentTime;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical report assistant that helps CNAs (Certified Nursing Assistants) generate incident reports. Generate a formal, grammatically correct incident report based on the provided information. The report should be professional and suitable for medical documentation.",
        },
        {
          role: "user",
          content: `Please generate a formal incident report with the following information:
          
CNA Name: ${formData.cnaName}
Shift Time: ${formData.shiftTime}
Floor: ${formData.floor}
Supervisor on Duty: ${formData.supervisorOnDuty}
Patient Name: ${formData.patientName}
Patient Room: ${formData.patientRoom}
Time of Incident: ${formData.incidentTime}
Nature of Incident: ${formData.incidentNature}
Description of Incident: ${formData.incidentDescription}
Was patient able to state what happened: ${formData.patientAbleToState}
${formData.patientAbleToState === 'yes' ? `Patient's statement: ${formData.patientStatement}` : ''}
Actions taken by CNA: ${formData.cnaActions}
Actions taken by nurse/supervisor: ${formData.nurseActions}

The report should be structured with sections for introduction (stating name, shift details), incident description, patient's response, actions taken, and conclusion with current date and time. Keep it formal, accurate, and professional.`,
        },
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "Error generating report.";
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to generate report");
  }
}

/**
 * Translate the generated report to another language
 */
export async function translateReport(reportText: string, targetLanguage: string): Promise<string> {
  const languageMap: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    zh: "Chinese",
    ht: "Haitian Kreyol",
    tl: "Tagalog",
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a medical translator that specializes in translating incident reports for healthcare facilities. Translate the provided text into ${languageMap[targetLanguage] || targetLanguage} while maintaining the formal tone, structure, and all medical information. Ensure the translation is grammatically correct and uses appropriate medical terminology in the target language.`,
        },
        {
          role: "user",
          content: reportText,
        },
      ],
      max_tokens: 1500,
    });

    return response.choices[0].message.content || "Error translating report.";
  } catch (error) {
    console.error("Error translating report:", error);
    throw new Error("Failed to translate report");
  }
}
