import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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
