import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { jobs } from '../db/schema/jobs';

export const createJob = async (jobData: any) => {
    const result = await db.insert(jobs).values(jobData).returning();
    return result[0];
};

export const getJobsByWorkspaceId = async (workspaceId: number) => {
    return await db.select().from(jobs).where(eq(jobs.workspaceId, workspaceId)).orderBy(desc(jobs.createdAt));
};

export const getJobById = async (id: number, workspaceId: number) => {
    const result = await db
        .select()
        .from(jobs)
        .where(and(eq(jobs.id, id), eq(jobs.workspaceId, workspaceId)))
        .limit(1);
    return result[0];
};

export const updateJob = async (id: number, workspaceId: number, jobData: any) => {
    const result = await db
        .update(jobs)
        .set({ ...jobData, updatedAt: new Date() })
        .where(and(eq(jobs.id, id), eq(jobs.workspaceId, workspaceId)))
        .returning();
    return result[0];
};
