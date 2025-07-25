import { Router } from "express";
import { insertGeneralStatementSchema, generalStatements } from "@shared/schema";
import { processGeneralStatement } from "../openai";
import { reportRateLimit } from "../rateLimit";
import { db } from "../db";

const router = Router();

// Process general statement
router.post("/process", async (req, res) => {
  try {
    const validationResult = insertGeneralStatementSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid statement data", 
        errors: validationResult.error.format() 
      });
    }
    
    const { residentName, roomNumber, rawStatement } = validationResult.data;
    
    // Process the statement with AI
    const processedStatement = await processGeneralStatement({
      residentName,
      roomNumber,
      rawStatement,
    });
    
    // Save to database
    const [savedStatement] = await db
      .insert(generalStatements)
      .values({
        residentName,
        roomNumber,
        rawStatement,
        processedStatement,
      })
      .returning();
    
    res.json({
      id: savedStatement.id,
      processedStatement,
      createdAt: savedStatement.createdAt,
    });
  } catch (error) {
    console.error("Error processing general statement:", error);
    res.status(500).json({ message: "Error processing statement" });
  }
});

// Get all general statements (for admin/history purposes)
router.get("/", async (req, res) => {
  try {
    const statements = await db
      .select()
      .from(generalStatements)
      .orderBy(generalStatements.createdAt);
    
    res.json(statements);
  } catch (error) {
    console.error("Error fetching general statements:", error);
    res.status(500).json({ message: "Error fetching statements" });
  }
});

// Get specific general statement by ID
router.get("/:id", async (req, res) => {
  try {
    const { eq } = await import("drizzle-orm");
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid statement ID" });
    }
    
    const [statement] = await db
      .select()
      .from(generalStatements)
      .where(eq(generalStatements.id, id));
    
    if (!statement) {
      return res.status(404).json({ message: "Statement not found" });
    }
    
    res.json(statement);
  } catch (error) {
    console.error("Error fetching general statement:", error);
    res.status(500).json({ message: "Error fetching statement" });
  }
});

export default router;