import { Router } from "express";
import { db } from "../db";
import { shiftSessions, shiftNotes, handoffReports, adlEntries, reports } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateShiftHandoff } from "../openai";

const router = Router();

// Generate handoff report
router.post("/generate", async (req, res) => {
  try {
    const { shiftSessionId, additionalNotes } = req.body;

    // Get shift session data
    const [shiftSession] = await db
      .select()
      .from(shiftSessions)
      .where(eq(shiftSessions.id, shiftSessionId));

    if (!shiftSession) {
      return res.status(404).json({ message: "Shift session not found" });
    }

    // Check if handoff already exists
    const [existingHandoff] = await db
      .select()
      .from(handoffReports)
      .where(eq(handoffReports.shiftSessionId, shiftSessionId));

    if (existingHandoff) {
      return res.json(existingHandoff);
    }

    // Gather shift data
    const shiftStart = new Date(shiftSession.shiftStart);
    const shiftEnd = shiftSession.shiftEnd ? new Date(shiftSession.shiftEnd) : new Date();

    // Get incidents during shift
    const incidents = await db
      .select()
      .from(reports)
      .where(sql`created_at >= ${shiftStart} AND created_at <= ${shiftEnd}`)
      .orderBy(desc(reports.createdAt));

    // Get ADL entries during shift
    const adlEntriesData = await db
      .select()
      .from(adlEntries)
      .where(sql`created_at >= ${shiftStart} AND created_at <= ${shiftEnd}`)
      .orderBy(desc(adlEntries.createdAt));

    // Get shift notes
    const shiftNotesData = await db
      .select()
      .from(shiftNotes)
      .where(eq(shiftNotes.shiftSessionId, shiftSessionId))
      .orderBy(desc(shiftNotes.createdAt));

    // Prepare data for AI generation
    const shiftData = {
      cnaName: shiftSession.cnaName,
      shiftType: shiftSession.shiftType,
      shiftStart: shiftSession.shiftStart,
      shiftEnd: shiftSession.shiftEnd || new Date().toISOString(),
      incidents: incidents.map(i => ({
        patientName: i.patientName,
        patientRoom: i.patientRoom,
        incidentNature: i.incidentNature,
        incidentTime: i.incidentTime,
        incidentDescription: i.incidentDescription,
        cnaActions: i.cnaActions,
      })),
      adlEntries: adlEntriesData.map(a => ({
        patientName: a.patientName,
        category: a.category,
        assistanceLevel: a.assistanceLevel,
        notes: a.notes,
      })),
      shiftNotes: shiftNotesData.map(n => ({
        patientName: n.patientName,
        noteType: n.noteType,
        noteText: n.noteText,
        priorityLevel: n.priorityLevel,
      })),
      vitalSigns: [], // Could be added in future
      additionalNotes,
    };

    // Generate handoff report using AI
    const aiResult = await generateShiftHandoff(shiftData);

    // Save handoff report
    const [handoff] = await db
      .insert(handoffReports)
      .values({
        shiftSessionId,
        outgoingCna: shiftSession.cnaName,
        generatedSummary: aiResult.summary,
        priorityAlerts: aiResult.priorityAlerts,
        patientSummaries: aiResult.patientSummaries,
        completedActivities: aiResult.completedActivities,
        itemsForNextShift: aiResult.itemsForNextShift,
        familyCommunications: additionalNotes || null,
      })
      .returning();

    res.json(handoff);
  } catch (error) {
    console.error("Error generating handoff:", error);
    res.status(500).json({ message: "Failed to generate handoff report" });
  }
});

// Get existing handoff report
router.get("/:shiftId", async (req, res) => {
  try {
    const shiftSessionId = parseInt(req.params.shiftId);

    const [handoff] = await db
      .select()
      .from(handoffReports)
      .where(eq(handoffReports.shiftSessionId, shiftSessionId));

    if (!handoff) {
      return res.status(404).json({ message: "Handoff report not found" });
    }

    res.json(handoff);
  } catch (error) {
    console.error("Error getting handoff report:", error);
    res.status(500).json({ message: "Failed to get handoff report" });
  }
});

// Confirm handoff received
router.put("/:id/confirm", async (req, res) => {
  try {
    const handoffId = parseInt(req.params.id);
    const { incomingCna } = req.body;

    const [updatedHandoff] = await db
      .update(handoffReports)
      .set({
        handoffConfirmed: true,
        handoffConfirmedAt: new Date(),
        incomingCna,
      })
      .where(eq(handoffReports.id, handoffId))
      .returning();

    if (!updatedHandoff) {
      return res.status(404).json({ message: "Handoff report not found" });
    }

    res.json(updatedHandoff);
  } catch (error) {
    console.error("Error confirming handoff:", error);
    res.status(500).json({ message: "Failed to confirm handoff" });
  }
});

// Get pending handoffs (for supervisor dashboard)
router.get("/pending", async (req, res) => {
  try {
    const pendingHandoffs = await db
      .select()
      .from(handoffReports)
      .where(eq(handoffReports.handoffConfirmed, false))
      .orderBy(desc(handoffReports.createdAt));

    res.json(pendingHandoffs);
  } catch (error) {
    console.error("Error getting pending handoffs:", error);
    res.status(500).json({ message: "Failed to get pending handoffs" });
  }
});

// Translate handoff to different language
router.post("/:id/translate", async (req, res) => {
  try {
    const handoffId = parseInt(req.params.id);
    const { targetLanguage } = req.body;

    // Get handoff report
    const [handoff] = await db
      .select()
      .from(handoffReports)
      .where(eq(handoffReports.id, handoffId));

    if (!handoff) {
      return res.status(404).json({ message: "Handoff report not found" });
    }

    // TODO: Implement translation using OpenAI
    // For now, return the original content
    res.json({
      translatedSummary: handoff.generatedSummary,
      language: targetLanguage,
    });
  } catch (error) {
    console.error("Error translating handoff:", error);
    res.status(500).json({ message: "Failed to translate handoff" });
  }
});

export default router;