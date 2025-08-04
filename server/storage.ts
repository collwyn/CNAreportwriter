import { users, reports, feedback, feedbackAnalytics, suggestions, type User, type InsertUser, type Report, type InsertReport, type Feedback, type InsertFeedback, type FeedbackAnalytics, type InsertFeedbackAnalytics, type Suggestion, type InsertSuggestion } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User authentication methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByProvider(provider: string, providerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  linkProvider(userId: number, provider: string, providerId: string): Promise<void>;
  
  // Reports
  createReport(report: InsertReport & { generatedReport: string }): Promise<Report>;
  
  // Feedback
  createFeedback(feedback: InsertFeedback, ipAddress: string): Promise<Feedback>;
  getAllFeedback(): Promise<Feedback[]>;
  getFeedbackStats(): Promise<any>;
  trackFeedbackAnalytics(analytics: InsertFeedbackAnalytics): Promise<FeedbackAnalytics>;
  getFeedbackAnalytics(): Promise<any>;
  
  // Suggestions
  createSuggestion(suggestion: InsertSuggestion, ipAddress: string, userAgent: string): Promise<Suggestion>;
  getAllSuggestions(): Promise<Suggestion[]>;
  getSuggestionsByStatus(status: string): Promise<Suggestion[]>;
  updateSuggestionStatus(id: number, status: string, adminResponse?: string): Promise<void>;
  voteSuggestion(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByProvider(provider: string, providerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(eq(users.authProvider, provider), eq(users.providerId, providerId))
    );
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        updatedAt: new Date()
      })
      .returning();
    return user;
  }

  async linkProvider(userId: number, provider: string, providerId: string): Promise<void> {
    await db
      .update(users)
      .set({
        authProvider: provider,
        providerId: providerId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async createReport(reportData: InsertReport & { generatedReport: string }): Promise<Report> {
    // Handle optional patientStatement field properly
    const patientStatement = reportData.patientStatement === undefined
      ? null
      : reportData.patientStatement;
    
    const [report] = await db
      .insert(reports)
      .values({
        ...reportData,
        patientStatement
      })
      .returning();
    
    return report;
  }

  async createFeedback(feedbackData: InsertFeedback, ipAddress: string): Promise<Feedback> {
    const [feedbackRecord] = await db
      .insert(feedback)
      .values({
        ...feedbackData,
        ipAddress
      })
      .returning();
    
    return feedbackRecord;
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return await db.select().from(feedback).orderBy(feedback.submittedAt);
  }

  async getFeedbackStats(): Promise<any> {
    const allFeedback = await this.getAllFeedback();
    
    if (allFeedback.length === 0) {
      return {
        totalResponses: 0,
        averageUsefulness: 0,
        averageEaseOfUse: 0,
        averageSatisfaction: 0,
        ratingDistribution: [],
        topFeatures: [],
        commonSuggestions: []
      };
    }

    const totalResponses = allFeedback.length;
    const averageUsefulness = allFeedback.reduce((sum, f) => sum + f.usefulness, 0) / totalResponses;
    const averageEaseOfUse = allFeedback.reduce((sum, f) => sum + f.easeOfUse, 0) / totalResponses;
    const averageSatisfaction = allFeedback.reduce((sum, f) => sum + f.overallSatisfaction, 0) / totalResponses;

    // Rating distribution based on overall satisfaction
    const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: allFeedback.filter(f => f.overallSatisfaction === rating).length
    }));

    // Simple text analysis for top features and suggestions
    const featureWords = allFeedback.flatMap(f => 
      f.mostHelpfulFeature.toLowerCase().split(/\s+/).filter(word => word.length > 3)
    );
    const suggestionWords = allFeedback.flatMap(f => 
      f.suggestedImprovements.toLowerCase().split(/\s+/).filter(word => word.length > 3)
    );

    const getTopTerms = (words: string[], limit = 5) => {
      const counts = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(counts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([feature, count]) => ({ feature, count }));
    };

    return {
      totalResponses,
      averageUsefulness: Math.round(averageUsefulness * 10) / 10,
      averageEaseOfUse: Math.round(averageEaseOfUse * 10) / 10,
      averageSatisfaction: Math.round(averageSatisfaction * 10) / 10,
      ratingDistribution: ratingCounts,
      topFeatures: getTopTerms(featureWords),
      commonSuggestions: getTopTerms(suggestionWords)
    };
  }

  async trackFeedbackAnalytics(analyticsData: InsertFeedbackAnalytics): Promise<FeedbackAnalytics> {
    const [analytics] = await db
      .insert(feedbackAnalytics)
      .values(analyticsData)
      .returning();
    
    return analytics;
  }

  async getFeedbackAnalytics(): Promise<any> {
    const analytics = await db.select().from(feedbackAnalytics).orderBy(feedbackAnalytics.timestamp);
    
    const totalViews = analytics.filter(a => a.eventType === 'view').length;
    const totalSubmissions = analytics.filter(a => a.eventType === 'submit').length;
    const conversionRate = totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0;
    
    // Recent analytics (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAnalytics = analytics.filter(a => a.timestamp >= sevenDaysAgo);
    const recentViews = recentAnalytics.filter(a => a.eventType === 'view').length;
    const recentSubmissions = recentAnalytics.filter(a => a.eventType === 'submit').length;
    const recentConversionRate = recentViews > 0 ? (recentSubmissions / recentViews) * 100 : 0;

    return {
      totalViews,
      totalSubmissions,
      conversionRate: Math.round(conversionRate * 10) / 10,
      recentViews,
      recentSubmissions,
      recentConversionRate: Math.round(recentConversionRate * 10) / 10
    };
  }

  // Suggestions methods
  async createSuggestion(suggestionData: InsertSuggestion, ipAddress: string, userAgent: string): Promise<Suggestion> {
    const [suggestion] = await db
      .insert(suggestions)
      .values({
        ...suggestionData,
        ipAddress,
        userAgent,
      })
      .returning();
    
    return suggestion;
  }

  async getAllSuggestions(): Promise<Suggestion[]> {
    return await db.select().from(suggestions).orderBy(suggestions.createdAt);
  }

  async getSuggestionsByStatus(status: string): Promise<Suggestion[]> {
    return await db.select().from(suggestions).where(eq(suggestions.status, status)).orderBy(suggestions.createdAt);
  }

  async updateSuggestionStatus(id: number, status: string, adminResponse?: string): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    
    if (adminResponse) {
      updateData.adminResponse = adminResponse;
      updateData.respondedAt = new Date();
    }
    
    await db
      .update(suggestions)
      .set(updateData)
      .where(eq(suggestions.id, id));
  }

  async voteSuggestion(id: number): Promise<void> {
    const [suggestion] = await db.select().from(suggestions).where(eq(suggestions.id, id));
    if (suggestion) {
      await db
        .update(suggestions)
        .set({
          userVotes: suggestion.userVotes + 1,
          updatedAt: new Date(),
        })
        .where(eq(suggestions.id, id));
    }
  }
}

// For backward compatibility, we'll temporarily keep MemStorage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reports: Map<number, Report>;
  private feedbacks: Map<number, Feedback>;
  private analytics: Map<number, FeedbackAnalytics>;
  private userCurrentId: number;
  private reportCurrentId: number;
  private feedbackCurrentId: number;
  private analyticsCurrentId: number;

  constructor() {
    this.users = new Map();
    this.reports = new Map();
    this.feedbacks = new Map();
    this.analytics = new Map();
    this.userCurrentId = 1;
    this.reportCurrentId = 1;
    this.feedbackCurrentId = 1;
    this.analyticsCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createReport(reportData: InsertReport & { generatedReport: string }): Promise<Report> {
    const id = this.reportCurrentId++;
    const now = new Date();
    
    // Handle optional patientStatement field properly
    const patientStatement = reportData.patientStatement === undefined 
      ? null 
      : reportData.patientStatement;
    
    const report: Report = {
      ...reportData,
      patientStatement,
      id,
      createdAt: now
    };
    this.reports.set(id, report);
    return report;
  }

  async createFeedback(feedbackData: InsertFeedback, ipAddress: string): Promise<Feedback> {
    const id = this.feedbackCurrentId++;
    const now = new Date();
    
    const feedbackRecord: Feedback = {
      ...feedbackData,
      id,
      ipAddress,
      submittedAt: now
    };
    this.feedbacks.set(id, feedbackRecord);
    return feedbackRecord;
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values()).sort((a, b) => 
      a.submittedAt.getTime() - b.submittedAt.getTime()
    );
  }

  async getFeedbackStats(): Promise<any> {
    const allFeedback = await this.getAllFeedback();
    
    if (allFeedback.length === 0) {
      return {
        totalResponses: 0,
        averageUsefulness: 0,
        averageEaseOfUse: 0,
        averageSatisfaction: 0,
        ratingDistribution: [],
        topFeatures: [],
        commonSuggestions: []
      };
    }

    const totalResponses = allFeedback.length;
    const averageUsefulness = allFeedback.reduce((sum, f) => sum + f.usefulness, 0) / totalResponses;
    const averageEaseOfUse = allFeedback.reduce((sum, f) => sum + f.easeOfUse, 0) / totalResponses;
    const averageSatisfaction = allFeedback.reduce((sum, f) => sum + f.overallSatisfaction, 0) / totalResponses;

    // Rating distribution based on overall satisfaction
    const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: allFeedback.filter(f => f.overallSatisfaction === rating).length
    }));

    return {
      totalResponses,
      averageUsefulness: Math.round(averageUsefulness * 10) / 10,
      averageEaseOfUse: Math.round(averageEaseOfUse * 10) / 10,
      averageSatisfaction: Math.round(averageSatisfaction * 10) / 10,
      ratingDistribution: ratingCounts,
      topFeatures: [],
      commonSuggestions: []
    };
  }

  async trackFeedbackAnalytics(analyticsData: InsertFeedbackAnalytics): Promise<FeedbackAnalytics> {
    const id = this.analyticsCurrentId++;
    const now = new Date();
    
    const analytics: FeedbackAnalytics = {
      ...analyticsData,
      id,
      timestamp: now
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async getFeedbackAnalytics(): Promise<any> {
    const analytics = Array.from(this.analytics.values());
    
    const totalViews = analytics.filter(a => a.eventType === 'view').length;
    const totalSubmissions = analytics.filter(a => a.eventType === 'submit').length;
    const conversionRate = totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0;

    return {
      totalViews,
      totalSubmissions,
      conversionRate: Math.round(conversionRate * 10) / 10,
      recentViews: totalViews,
      recentSubmissions: totalSubmissions,
      recentConversionRate: Math.round(conversionRate * 10) / 10
    };
  }
}

// Switch to database storage
export const storage = new DatabaseStorage();
