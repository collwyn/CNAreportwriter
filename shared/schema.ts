import { pgTable, text, serial, integer, boolean, timestamp, date, time, json, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  username: text("username").unique(),
  password: text("password"), // nullable for OAuth users
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  authProvider: text("auth_provider").notNull().default("local"), // local, google, facebook
  providerId: text("provider_id"), // ID from OAuth provider
  isEmailVerified: boolean("is_email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User registration schemas
export const localSignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const localLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  authProvider: true,
  providerId: true,
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  cnaName: text("cna_name").notNull(),
  shiftTime: text("shift_time").notNull(),
  floor: text("floor").notNull(),
  supervisorOnDuty: text("supervisor_on_duty").notNull(),
  patientId: integer("patient_id").references(() => patients.id),
  patientName: text("patient_name").notNull(),
  patientRoom: text("patient_room").notNull(),
  incidentTime: text("incident_time").notNull(),
  incidentNature: text("incident_nature").notNull(),
  incidentDescription: text("incident_description").notNull(),
  patientAbleToState: text("patient_able_to_state").notNull(),
  patientStatement: text("patient_statement"),
  cnaActions: text("cna_actions").notNull(),
  supervisorNotified: text("supervisor_notified").notNull(),
  generatedReport: text("generated_report").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  generatedReport: true,
  createdAt: true
});

// Patient selection/creation schema for reports
export const reportPatientSchema = z.object({
  useExistingPatient: z.boolean(),
  patientId: z.number().optional(),
  patientName: z.string(),
  patientRoom: z.string(),
  // New patient fields
  admissionDate: z.string().optional(),
  careLevel: z.enum(['skilled', 'assisted', 'independent']).optional(),
  dietaryRestrictions: z.string().optional(),
  mobilityAids: z.string().optional(),
  cognitiveStatus: z.enum(['alert', 'confused', 'dementia']).optional(),
});

export const translateReportSchema = z.object({
  reportText: z.string(),
  targetLanguage: z.string()
});

// Feedback table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  usefulness: integer("usefulness").notNull(),
  easeOfUse: integer("ease_of_use").notNull(),
  overallSatisfaction: integer("overall_satisfaction").notNull(),
  mostHelpfulFeature: text("most_helpful_feature").notNull(),
  suggestedImprovements: text("suggested_improvements").notNull(),
  additionalComments: text("additional_comments"),
  ipAddress: text("ip_address").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  ipAddress: true,
  submittedAt: true,
});

// Analytics table for tracking feedback form interactions
export const feedbackAnalytics = pgTable("feedback_analytics", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // 'view' or 'submit'
  formType: text("form_type").notNull(), // 'feedback'
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertFeedbackAnalyticsSchema = createInsertSchema(feedbackAnalytics).omit({
  id: true,
  timestamp: true,
});

// Types for the above tables
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

// ADL System Tables
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  roomNumber: text("room_number").notNull(),
  admissionDate: date("admission_date").notNull(),
  careLevel: text("care_level").notNull(), // skilled, assisted, independent
  dietaryRestrictions: text("dietary_restrictions"),
  mobilityAids: text("mobility_aids"), // wheelchair, walker, etc.
  cognitiveStatus: text("cognitive_status"), // alert, confused, dementia
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adlCategories = pgTable("adl_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // bathing, dressing, eating, etc.
  description: text("description"),
  requiredFields: json("required_fields"), // specific fields for each category
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adlEntries = pgTable("adl_entries", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  cnaName: text("cna_name").notNull(),
  shiftType: text("shift_type").notNull(), // morning, day, evening, night
  entryDate: date("entry_date").notNull(),
  entryTime: time("entry_time").notNull(),
  categoryId: integer("category_id").references(() => adlCategories.id).notNull(),
  assistanceLevel: text("assistance_level").notNull(), // independent, supervision, minimal_assist, moderate_assist, maximum_assist, total_dependence
  completionPercentage: integer("completion_percentage"), // 0-100
  notes: text("notes"),
  patientResponse: text("patient_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dailyAdlSummaries = pgTable("daily_adl_summaries", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  summaryDate: date("summary_date").notNull(),
  cnaName: text("cna_name").notNull(),
  shiftType: text("shift_type").notNull(),
  generatedSummary: text("generated_summary").notNull(),
  totalEntries: integer("total_entries").notNull(),
  flags: json("flags"), // any concerns or alerts
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ADL Schema validations
export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdlCategorySchema = createInsertSchema(adlCategories).omit({
  id: true,
  createdAt: true,
});

export const insertAdlEntrySchema = createInsertSchema(adlEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDailyAdlSummarySchema = createInsertSchema(dailyAdlSummaries).omit({
  id: true,
  createdAt: true,
});

// ADL Types
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type AdlCategory = typeof adlCategories.$inferSelect;
export type InsertAdlCategory = z.infer<typeof insertAdlCategorySchema>;
export type AdlEntry = typeof adlEntries.$inferSelect;
export type InsertAdlEntry = z.infer<typeof insertAdlEntrySchema>;
export type DailyAdlSummary = typeof dailyAdlSummaries.$inferSelect;
export type InsertDailyAdlSummary = z.infer<typeof insertDailyAdlSummarySchema>;

export const insertFeedbackAnalyticsSchema_complete = createInsertSchema(feedbackAnalytics).omit({
  id: true,
  ipAddress: true,
  userAgent: true,
  timestamp: true,
});

// Shift Handoff Schema - NEW FEATURE
export const shiftSessions = pgTable("shift_sessions", {
  id: serial("id").primaryKey(),
  cnaName: varchar("cna_name", { length: 255 }).notNull(),
  facilityFloor: varchar("facility_floor", { length: 100 }),
  shiftType: varchar("shift_type", { length: 50 }).notNull(), // morning, day, evening, night
  shiftStart: timestamp("shift_start").notNull(),
  shiftEnd: timestamp("shift_end"),
  status: varchar("status", { length: 20 }).default("active").notNull(), // active, completed, handed_off
  totalPatients: integer("total_patients").default(0),
  totalIncidents: integer("total_incidents").default(0),
  totalAdlEntries: integer("total_adl_entries").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shiftNotes = pgTable("shift_notes", {
  id: serial("id").primaryKey(),
  shiftSessionId: integer("shift_session_id").references(() => shiftSessions.id).notNull(),
  patientName: varchar("patient_name", { length: 255 }),
  patientRoom: varchar("patient_room", { length: 50 }),
  noteType: varchar("note_type", { length: 50 }).notNull(), // general, priority, family, medical, supply
  noteText: text("note_text").notNull(),
  priorityLevel: varchar("priority_level", { length: 20 }).default("normal").notNull(), // urgent, high, normal, low
  voiceNoteUrl: varchar("voice_note_url", { length: 500 }), // future: audio recordings
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const handoffReports = pgTable("handoff_reports", {
  id: serial("id").primaryKey(),
  shiftSessionId: integer("shift_session_id").references(() => shiftSessions.id).notNull(),
  outgoingCna: varchar("outgoing_cna", { length: 255 }).notNull(),
  incomingCna: varchar("incoming_cna", { length: 255 }),
  generatedSummary: text("generated_summary").notNull(),
  priorityAlerts: json("priority_alerts"), // urgent items requiring immediate attention
  patientSummaries: json("patient_summaries"), // per-patient status updates
  completedActivities: json("completed_activities"), // what was accomplished this shift
  itemsForNextShift: json("items_for_next_shift"), // tasks/follow-ups for incoming staff
  supplyNotes: text("supply_notes"),
  familyCommunications: text("family_communications"),
  handoffConfirmed: boolean("handoff_confirmed").default(false),
  handoffConfirmedAt: timestamp("handoff_confirmed_at"),
  language: varchar("language", { length: 10 }).default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shiftMetrics = pgTable("shift_metrics", {
  id: serial("id").primaryKey(),
  shiftSessionId: integer("shift_session_id").references(() => shiftSessions.id).notNull(),
  totalDocumentationTime: integer("total_documentation_time"), // minutes spent on documentation
  handoffPreparationTime: integer("handoff_preparation_time"), // minutes to prepare handoff
  patientSatisfactionScore: decimal("patient_satisfaction_score", { precision: 3, scale: 2 }), // if collected
  incidentsCount: integer("incidents_count").default(0),
  adlCompletionRate: decimal("adl_completion_rate", { precision: 5, scale: 2 }), // percentage
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shift handoff schemas
export const insertShiftSessionSchema = createInsertSchema(shiftSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShiftNoteSchema = createInsertSchema(shiftNotes).omit({
  id: true,
  createdAt: true,
});

export const insertHandoffReportSchema = createInsertSchema(handoffReports).omit({
  id: true,
  createdAt: true,
});

export const insertShiftMetricsSchema = createInsertSchema(shiftMetrics).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type TranslateRequest = z.infer<typeof translateReportSchema>;

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedbackAnalytics = z.infer<typeof insertFeedbackAnalyticsSchema>;
export type FeedbackAnalytics = typeof feedbackAnalytics.$inferSelect;

// Shift handoff types
export type ShiftSession = typeof shiftSessions.$inferSelect;
export type InsertShiftSession = z.infer<typeof insertShiftSessionSchema>;
export type ShiftNote = typeof shiftNotes.$inferSelect;
export type InsertShiftNote = z.infer<typeof insertShiftNoteSchema>;
export type HandoffReport = typeof handoffReports.$inferSelect;
export type InsertHandoffReport = z.infer<typeof insertHandoffReportSchema>;
export type ShiftMetrics = typeof shiftMetrics.$inferSelect;
export type InsertShiftMetrics = z.infer<typeof insertShiftMetricsSchema>;

// General Statement schema
export const generalStatements = pgTable("general_statements", {
  id: serial("id").primaryKey(),
  residentName: varchar("resident_name", { length: 255 }).notNull(),
  roomNumber: varchar("room_number", { length: 50 }),
  rawStatement: text("raw_statement").notNull(),
  processedStatement: text("processed_statement").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGeneralStatementSchema = createInsertSchema(generalStatements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGeneralStatement = z.infer<typeof insertGeneralStatementSchema>;
export type GeneralStatement = typeof generalStatements.$inferSelect;
