import { pgTable, text, serial, integer, boolean, timestamp, date, time, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  cnaName: text("cna_name").notNull(),
  shiftTime: text("shift_time").notNull(),
  floor: text("floor").notNull(),
  supervisorOnDuty: text("supervisor_on_duty").notNull(),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type TranslateRequest = z.infer<typeof translateReportSchema>;

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedbackAnalytics = z.infer<typeof insertFeedbackAnalyticsSchema>;
export type FeedbackAnalytics = typeof feedbackAnalytics.$inferSelect;
