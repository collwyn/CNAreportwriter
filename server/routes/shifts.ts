import { Router } from "express";
import { db } from "../db";
import { shiftSessions, shiftNotes, handoffReports, adlEntries, reports } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Start new shift session
router.post("/start", async (req, res) => {
  try {
    const { cnaName, shiftType, facilityFloor } = req.body;
    
    // Check if there's already an active shift for this CNA
    const [existingShift] = await db
      .select()
      .from(shiftSessions)
      .where(and(
        eq(shiftSessions.cnaName, cnaName),
        eq(shiftSessions.status, "active")
      ));

    if (existingShift) {
      return res.status(400).json({ 
        message: "You already have an active shift. Please end your current shift before starting a new one." 
      });
    }

    const [newShift] = await db
      .insert(shiftSessions)
      .values({
        cnaName,
        shiftType,
        facilityFloor,
        shiftStart: new Date(),
        status: "active",
      })
      .returning();

    res.json(newShift);
  } catch (error) {
    console.error("Error starting shift:", error);
    res.status(500).json({ message: "Failed to start shift" });
  }
});

// End current shift session
router.put("/:id/end", async (req, res) => {
  try {
    const shiftId = parseInt(req.params.id);
    const now = new Date();

    // Get current shift data for metrics calculation
    const [shift] = await db
      .select()
      .from(shiftSessions)
      .where(eq(shiftSessions.id, shiftId));

    if (!shift) {
      return res.status(404).json({ message: "Shift session not found" });
    }

    // Count incidents and ADL entries during this shift
    const shiftStart = new Date(shift.shiftStart);
    
    const [incidentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(sql`created_at >= ${shiftStart} AND created_at <= ${now}`);
      
    const [adlCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(adlEntries)
      .where(sql`created_at >= ${shiftStart} AND created_at <= ${now}`);

    // Update shift session
    const [updatedShift] = await db
      .update(shiftSessions)
      .set({
        shiftEnd: now,
        status: "completed",
        totalIncidents: incidentCount.count,
        totalAdlEntries: adlCount.count,
        updatedAt: now,
      })
      .where(eq(shiftSessions.id, shiftId))
      .returning();

    res.json(updatedShift);
  } catch (error) {
    console.error("Error ending shift:", error);
    res.status(500).json({ message: "Failed to end shift" });
  }
});

// Get current active shift for CNA
router.get("/current", async (req, res) => {
  try {
    // In a real app, this would use authenticated user info
    // For now, we'll get the most recent active shift
    const [currentShift] = await db
      .select()
      .from(shiftSessions)
      .where(eq(shiftSessions.status, "active"))
      .orderBy(desc(shiftSessions.createdAt))
      .limit(1);

    if (!currentShift) {
      return res.status(404).json({ message: "No active shift found" });
    }

    res.json(currentShift);
  } catch (error) {
    console.error("Error getting current shift:", error);
    res.status(500).json({ message: "Failed to get current shift" });
  }
});

// Get shift history
router.get("/history", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const shifts = await db
      .select()
      .from(shiftSessions)
      .orderBy(desc(shiftSessions.createdAt))
      .limit(limit)
      .offset(offset);

    res.json(shifts);
  } catch (error) {
    console.error("Error getting shift history:", error);
    res.status(500).json({ message: "Failed to get shift history" });
  }
});

// Add note to shift
router.post("/:shiftId/notes", async (req, res) => {
  try {
    const shiftSessionId = parseInt(req.params.shiftId);
    const { patientName, patientRoom, noteType, noteText, priorityLevel } = req.body;

    const [newNote] = await db
      .insert(shiftNotes)
      .values({
        shiftSessionId,
        patientName,
        patientRoom,
        noteType,
        noteText,
        priorityLevel,
      })
      .returning();

    res.json(newNote);
  } catch (error) {
    console.error("Error adding shift note:", error);
    res.status(500).json({ message: "Failed to add shift note" });
  }
});

// Get notes for shift
router.get("/:shiftId/notes", async (req, res) => {
  try {
    const shiftSessionId = parseInt(req.params.shiftId);

    const notes = await db
      .select()
      .from(shiftNotes)
      .where(eq(shiftNotes.shiftSessionId, shiftSessionId))
      .orderBy(desc(shiftNotes.createdAt));

    res.json(notes);
  } catch (error) {
    console.error("Error getting shift notes:", error);
    res.status(500).json({ message: "Failed to get shift notes" });
  }
});

// Update shift note
router.put("/notes/:noteId", async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const { noteText, priorityLevel, noteType } = req.body;

    const [updatedNote] = await db
      .update(shiftNotes)
      .set({ noteText, priorityLevel, noteType })
      .where(eq(shiftNotes.id, noteId))
      .returning();

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(updatedNote);
  } catch (error) {
    console.error("Error updating shift note:", error);
    res.status(500).json({ message: "Failed to update shift note" });
  }
});

// Delete shift note
router.delete("/notes/:noteId", async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);

    const [deletedNote] = await db
      .delete(shiftNotes)
      .where(eq(shiftNotes.id, noteId))
      .returning();

    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting shift note:", error);
    res.status(500).json({ message: "Failed to delete shift note" });
  }
});

export default router;