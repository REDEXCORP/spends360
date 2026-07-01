import { Request, Response } from 'express';
import * as jobsService from '../services/jobsService';
import { authenticatedUser } from '../utils';

export const createJob = async (req: Request, res: Response) => {
    const { workspaceId, userId } = authenticatedUser(req);
    const job = await jobsService.createJobService(workspaceId, userId, req.body);
    res.status(201).json(job);
};

export const getJobs = async (req: Request, res: Response) => {
    const { workspaceId } = authenticatedUser(req);
    const jobs = await jobsService.getJobsService(workspaceId);
    res.json(jobs);
};

export const getJob = async (req: Request, res: Response) => {
    const { workspaceId } = authenticatedUser(req);
    const jobId = parseInt(req.params.jobId as string);
    const job = await jobsService.getJobByIdService(jobId, workspaceId);
    res.json(job);
};

export const updateJob = async (req: Request, res: Response) => {
    const { workspaceId, userId } = authenticatedUser(req);
    const jobId = parseInt(req.params.jobId as string);
    const job = await jobsService.updateJobService(jobId, workspaceId, userId, req.body);
    res.json(job);
};
