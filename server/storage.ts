import { users, reports, type User, type InsertUser, type Report, type InsertReport } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createReport(report: InsertReport & { generatedReport: string }): Promise<Report>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
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
}

// For backward compatibility, we'll temporarily keep MemStorage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reports: Map<number, Report>;
  private userCurrentId: number;
  private reportCurrentId: number;

  constructor() {
    this.users = new Map();
    this.reports = new Map();
    this.userCurrentId = 1;
    this.reportCurrentId = 1;
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
}

// Switch to database storage
export const storage = new DatabaseStorage();
