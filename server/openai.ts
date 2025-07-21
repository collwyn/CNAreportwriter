import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

/**
 * Generate a grammatically correct incident report based on form data
 */
export async function generateReport(formData: any): Promise<string> {
  try {
    // Get current date and time for the report
    const now = new Date();
    const reportDate = now.toLocaleDateString();
    const reportTime = now.toLocaleTimeString();
    
    // Format time for readability
    const incidentTime = formData.incidentTime;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical report assistant that helps CNAs (Certified Nursing Assistants) generate incident reports. Generate a concise, grammatically correct incident report in a single paragraph. Write in first person from the CNA's perspective. The report should be professional and suitable for medical documentation.",
        },
        {
          role: "user",
          content: `Please generate a concise incident report in first person with the following information:
          
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
${formData.supervisorNotified === 'yes' ? 'Supervisor was notified about the incident.' : 'Supervisor was not notified about the incident.'}

Current Date: ${reportDate}
Current Time: ${reportTime}

Important: Structure the report as a single paragraph. Start with "My name is [CNA Name]" and include all relevant details in a clear, concise narrative. Do not use headers or separate sections. Include the current date and time naturally within the text. The tone should be professional but straightforward.`,
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
    ko: "Korean",
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

// NEW: Shift handoff generation function
export async function generateShiftHandoff(shiftData: {
  cnaName: string;
  shiftType: string;
  shiftStart: string;
  shiftEnd: string;
  incidents: any[];
  adlEntries: any[];
  shiftNotes: any[];
  vitalSigns: any[];
  additionalNotes?: string;
}): Promise<{
  summary: string;
  priorityAlerts: string[];
  patientSummaries: string[];
  completedActivities: string[];
  itemsForNextShift: string[];
}> {
  
  const prompt = `Generate a professional nursing shift handoff report based on this data:

CNA: ${shiftData.cnaName}
Shift: ${shiftData.shiftType} (${shiftData.shiftStart} to ${shiftData.shiftEnd})

SHIFT ACTIVITIES:
- Incidents: ${shiftData.incidents.length} documented
${shiftData.incidents.map(i => `  • ${i.patientName} (${i.patientRoom}): ${i.incidentNature} at ${i.incidentTime}`).join('\n')}

- ADL Activities: ${shiftData.adlEntries.length} documented
${shiftData.adlEntries.map(a => `  • ${a.patientName}: ${a.category} - ${a.assistanceLevel}`).join('\n')}

- Shift Notes:
${shiftData.shiftNotes.map(n => `  • ${n.patientName || 'General'}: ${n.noteText} (${n.priorityLevel})`).join('\n')}

${shiftData.additionalNotes ? `- Additional Notes: ${shiftData.additionalNotes}` : ''}

Create a structured handoff report with these sections:
1. PRIORITY ALERTS (urgent items requiring immediate attention)
2. PATIENT SUMMARIES (per-patient status and needs)
3. COMPLETED ACTIVITIES (what was accomplished this shift)
4. ITEMS FOR NEXT SHIFT (tasks and follow-ups needed)

Use professional healthcare terminology. Prioritize by urgency and patient safety.
Format as JSON with sections: priorityAlerts[], patientSummaries[], completedActivities[], itemsForNextShift[].`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a nursing informatics specialist who creates professional shift handoff reports. Generate comprehensive, well-organized handoffs that ensure patient safety and care continuity. Always prioritize urgent medical information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;
    
    // Parse JSON response and create formatted summary
    try {
      const parsedContent = JSON.parse(content || '{}');
      return {
        summary: generateNarrativeSummary(parsedContent),
        priorityAlerts: parsedContent.priorityAlerts || [],
        patientSummaries: parsedContent.patientSummaries || [],
        completedActivities: parsedContent.completedActivities || [],
        itemsForNextShift: parsedContent.itemsForNextShift || []
      };
    } catch (parseError) {
      // Fallback to plain text if JSON parsing fails
      return {
        summary: content || "Unable to generate handoff report",
        priorityAlerts: [],
        patientSummaries: [],
        completedActivities: [],
        itemsForNextShift: []
      };
    }
  } catch (error) {
    console.error("Error generating shift handoff:", error);
    throw new Error("Failed to generate shift handoff");
  }
}

function generateNarrativeSummary(data: any): string {
  return `SHIFT HANDOFF REPORT

PRIORITY ALERTS:
${data.priorityAlerts?.map((alert: string) => `• ${alert}`).join('\n') || '• No urgent alerts'}

PATIENT UPDATES:
${data.patientSummaries?.map((patient: string) => `• ${patient}`).join('\n') || '• No specific patient updates'}

COMPLETED ACTIVITIES:
${data.completedActivities?.map((activity: string) => `• ${activity}`).join('\n') || '• No activities documented'}

ITEMS FOR NEXT SHIFT:
${data.itemsForNextShift?.map((item: string) => `• ${item}`).join('\n') || '• No pending items'}`;
}
