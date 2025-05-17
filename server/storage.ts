import { users, type User, type InsertUser, type Report, type InsertReport } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createReport(report: InsertReport & { generatedReport: string }): Promise<Report>;
}

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

export const storage = new MemStorage();
