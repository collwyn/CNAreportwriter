import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateReport, translateReport } from "./openai";
import { insertReportSchema, translateReportSchema, insertFeedbackSchema, insertFeedbackAnalyticsSchema } from "@shared/schema";
import { reportRateLimit } from "./rateLimit";

export async function registerRoutes(app: Express): Promise<Server> {
  // Debug route to check server routing
  app.get("/api/debug/routes", (req, res) => {
    res.json({ 
      message: "Server routes working", 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  // Rate limit status endpoint
  app.get("/api/rate-limit/status", (req, res) => {
    const status = reportRateLimit.getRemainingRequests(req);
    res.json(status);
  });

  // Generate report endpoint with rate limiting
  app.post("/api/report/generate", reportRateLimit.middleware, async (req, res) => {
    try {
      // Validate request body
      const validationResult = insertReportSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.format() 
        });
      }
      
      const formData = validationResult.data;
      
      // Generate report using OpenAI
      const generatedReport = await generateReport(formData);
      
      // Store report in memory
      const reportWithText = {
        ...formData,
        generatedReport
      };
      
      const report = await storage.createReport(reportWithText);
      
      res.status(201).json({
        report: {
          ...report,
          generatedReport
        }
      });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Error generating report" });
    }
  });

  // Translate report endpoint
  app.post("/api/report/translate", async (req, res) => {
    try {
      // Validate request body
      const validationResult = translateReportSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.format() 
        });
      }
      
      const { reportText, targetLanguage } = validationResult.data;
      
      // Translate report using OpenAI
      const translatedReport = await translateReport(reportText, targetLanguage);
      
      res.status(200).json({ translatedReport });
    } catch (error) {
      console.error("Error translating report:", error);
      res.status(500).json({ message: "Error translating report" });
    }
  });

  // Feedback submission endpoint
  app.post("/api/feedback", async (req, res) => {
    try {
      // Validate request body
      const validationResult = insertFeedbackSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid feedback data", 
          errors: validationResult.error.format() 
        });
      }
      
      const feedbackData = validationResult.data;
      
      // Get client IP address
      const clientIP = req.ip || 
                      req.connection.remoteAddress || 
                      req.headers['x-forwarded-for'] as string || 
                      'unknown';
      
      // Store feedback
      const feedback = await storage.createFeedback(feedbackData, clientIP);
      
      res.status(201).json({
        message: "Feedback submitted successfully",
        feedback: { id: feedback.id }
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Error submitting feedback" });
    }
  });

  // Simple admin authentication middleware
  const adminAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    // Support both Bearer token and simple password formats
    if (authHeader === 'Bearer admin123' || authHeader === 'admin123') {
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };

  // Admin endpoints for feedback access
  app.get("/api/admin/feedback", adminAuth, async (req, res) => {
    try {
      const feedbackData = await storage.getAllFeedback();
      res.json(feedbackData);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Error fetching feedback data" });
    }
  });

  app.get("/api/admin/feedback/stats", adminAuth, async (req, res) => {
    try {
      const stats = await storage.getFeedbackStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
      res.status(500).json({ message: "Error fetching feedback statistics" });
    }
  });

  app.get("/api/admin/feedback/analytics", adminAuth, async (req, res) => {
    try {
      const analytics = await storage.getFeedbackAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching feedback analytics:", error);
      res.status(500).json({ message: "Error fetching feedback analytics" });
    }
  });

  // Track feedback form interactions
  app.post("/api/feedback/track", async (req, res) => {
    try {
      const validationResult = insertFeedbackAnalyticsSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid analytics data", 
          errors: validationResult.error.format() 
        });
      }
      
      const analyticsData = validationResult.data;
      
      // Get client info
      const clientIP = req.ip || 
                      req.connection.remoteAddress || 
                      req.headers['x-forwarded-for'] as string || 
                      'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      // Store analytics
      await storage.trackFeedbackAnalytics({
        ...analyticsData,
        ipAddress: clientIP,
        userAgent
      });
      
      res.status(200).json({ message: "Analytics tracked successfully" });
    } catch (error) {
      console.error("Error tracking analytics:", error);
      res.status(500).json({ message: "Error tracking analytics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
