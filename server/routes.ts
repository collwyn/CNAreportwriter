import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateReport, translateReport } from "./openai";
import { insertReportSchema, translateReportSchema, insertFeedbackSchema, insertFeedbackAnalyticsSchema, localSignupSchema, localLoginSchema } from "@shared/schema";
import { reportRateLimit } from "./rateLimit";
import { db } from "./db";
import passport from "./auth";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session store
  const PgSession = connectPgSimple(session);
  app.use(session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Debug route to check server routing
  app.get("/api/debug/routes", (req, res) => {
    const customDomain = 'www.cnagenius.com';
    const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
    
    const googleCallbacks = [
      `https://${customDomain}/api/auth/google/callback`,
      `https://${replitDomain}/api/auth/google/callback`
    ];
    const facebookCallbacks = [
      `https://${customDomain}/api/auth/facebook/callback`,
      `https://${replitDomain}/api/auth/facebook/callback`
    ];
    
    res.json({ 
      message: "Server routes working", 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      current_host: req.get('host'),
      oauth_callbacks: {
        google: googleCallbacks,
        facebook: facebookCallbacks
      },
      instructions: "Add ALL callback URLs listed above to your OAuth provider settings",
      credentials_status: {
        google_client_id: !!process.env.GOOGLE_CLIENT_ID,
        google_client_secret: !!process.env.GOOGLE_CLIENT_SECRET,
        facebook_app_id: !!process.env.FACEBOOK_APP_ID,
        facebook_app_secret: !!process.env.FACEBOOK_APP_SECRET
      }
    });
  });

  // Auth middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };

  // Authentication routes
  app.post('/api/auth/signup', (req, res, next) => {
    const validation = localSignupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: validation.error.format() 
      });
    }
    
    passport.authenticate('local-signup', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (!user) {
        return res.status(400).json({ message: info?.message || 'Registration failed' });
      }
      
      req.logIn(user, (err: any) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed after registration' });
        }
        return res.status(201).json({ message: 'Registration successful', user: { id: user.id, email: user.email } });
      });
    })(req, res, next);
  });

  app.post('/api/auth/login', (req, res, next) => {
    const validation = localLoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: validation.error.format() 
      });
    }
    
    passport.authenticate('local-login', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      
      req.logIn(user, (err: any) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed' });
        }
        return res.json({ message: 'Login successful', user: { id: user.id, email: user.email } });
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err: any) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  // Google OAuth routes
  app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth?error=google' }),
    (req, res) => {
      res.redirect('/');
    }
  );

  // Facebook OAuth routes
  app.get('/api/auth/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
  );

  app.get('/api/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/auth?error=facebook' }),
    (req, res) => {
      res.redirect('/');
    }
  );

  // Get current user
  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        authProvider: user.authProvider
      });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
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

  // ADL System Routes
  
  // Get all patients
  app.get("/api/patients", async (req, res) => {
    try {
      const { patients } = await import("@shared/schema");
      const allPatients = await db.select().from(patients);
      res.json(allPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Error fetching patients" });
    }
  });

  // Create new patient
  app.post("/api/patients", async (req, res) => {
    try {
      const { insertPatientSchema, patients } = await import("@shared/schema");
      const validationResult = insertPatientSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid patient data", 
          errors: validationResult.error.format() 
        });
      }
      
      const patientData = validationResult.data;
      const [newPatient] = await db.insert(patients).values(patientData).returning();
      
      res.status(201).json(newPatient);
    } catch (error) {
      console.error("Error creating patient:", error);
      res.status(500).json({ message: "Error creating patient" });
    }
  });

  // Get ADL categories
  app.get("/api/adl-categories", async (req, res) => {
    try {
      const { adlCategories } = await import("@shared/schema");
      const categories = await db.select().from(adlCategories);
      
      // Initialize default categories if none exist
      if (categories.length === 0) {
        const defaultCategories = [
          { name: "Bathing", description: "Personal hygiene, showering, grooming" },
          { name: "Dressing", description: "Getting dressed, assistance level needed" },
          { name: "Eating", description: "Meal consumption, nutrition assistance" },
          { name: "Mobility", description: "Walking, transferring, wheelchair use" },
          { name: "Toileting", description: "Bathroom assistance, continence status" },
          { name: "Communication", description: "Patient interactions, cognitive status" }
        ];
        
        await db.insert(adlCategories).values(defaultCategories);
        const newCategories = await db.select().from(adlCategories);
        return res.json(newCategories);
      }
      
      res.json(categories);
    } catch (error) {
      console.error("Error fetching ADL categories:", error);
      res.status(500).json({ message: "Error fetching ADL categories" });
    }
  });

  // Create ADL entry
  app.post("/api/adl-entries", async (req, res) => {
    try {
      const { insertAdlEntrySchema, adlEntries } = await import("@shared/schema");
      const validationResult = insertAdlEntrySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid ADL entry data", 
          errors: validationResult.error.format() 
        });
      }
      
      const [newEntry] = await db.insert(adlEntries).values(validationResult.data).returning();
      res.status(201).json(newEntry);
    } catch (error) {
      console.error("Error creating ADL entry:", error);
      res.status(500).json({ message: "Error creating ADL entry" });
    }
  });

  // Get ADL entries for specific patient and date
  app.get("/api/adl-entries/patient/:patientId/date/:date", async (req, res) => {
    try {
      const { eq, and } = await import("drizzle-orm");
      const { adlEntries } = await import("@shared/schema");
      const { patientId, date } = req.params;
      const entries = await db
        .select()
        .from(adlEntries)
        .where(and(
          eq(adlEntries.patientId, parseInt(patientId)),
          eq(adlEntries.entryDate, date)
        ));
      
      res.json(entries);
    } catch (error) {
      console.error("Error fetching ADL entries:", error);
      res.status(500).json({ message: "Error fetching ADL entries" });
    }
  });

  // Import and use shift handoff route modules
  const shiftsRoutes = await import("./routes/shifts");
  const handoffRoutes = await import("./routes/handoff");

  app.use("/api/shifts", shiftsRoutes.default);
  app.use("/api/handoff", handoffRoutes.default);
  
  // General statement routes
  const generalStatementRoutes = await import("./routes/general-statement");
  app.use("/api/general-statement", generalStatementRoutes.default);

  // Suggestions API routes
  app.post("/api/suggestions", async (req, res) => {
    try {
      const { insertSuggestionSchema } = await import("@shared/schema");
      const validationResult = insertSuggestionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid suggestion data", 
          errors: validationResult.error.format() 
        });
      }
      
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      const suggestion = await storage.createSuggestion(validationResult.data, ipAddress, userAgent);
      res.status(201).json(suggestion);
    } catch (error) {
      console.error("Error creating suggestion:", error);
      res.status(500).json({ message: "Error creating suggestion" });
    }
  });

  app.get("/api/suggestions", async (req, res) => {
    try {
      const { status } = req.query;
      let suggestions;
      
      if (status && typeof status === 'string') {
        suggestions = await storage.getSuggestionsByStatus(status);
      } else {
        suggestions = await storage.getAllSuggestions();
      }
      
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      res.status(500).json({ message: "Error fetching suggestions" });
    }
  });

  app.post("/api/suggestions/:id/vote", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.voteSuggestion(parseInt(id));
      res.json({ message: "Vote recorded successfully" });
    } catch (error) {
      console.error("Error voting on suggestion:", error);
      res.status(500).json({ message: "Error voting on suggestion" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
