import * as jobsRepository from '../repositories/jobsRepository';

export const createJobService = async (workspaceId: number, userId: number, data: any) => {
    const jobData = {
        ...data,
        workspaceId,
        createdBy: userId,
        updatedBy: userId,
    };
    return await jobsRepository.createJob(jobData);
};

export const getJobsService = async (workspaceId: number) => {
    return await jobsRepository.getJobsByWorkspaceId(workspaceId);
};

export const getJobByIdService = async (jobId: number, workspaceId: number) => {
    const job = await jobsRepository.getJobById(jobId, workspaceId);
    if (!job) {
        throw new Error('Job not found');
    }
    return job;
};

export const updateJobService = async (jobId: number, workspaceId: number, userId: number, data: any) => {
    const job = await jobsRepository.getJobById(jobId, workspaceId);
    if (!job) {
        throw new Error('Job not found');
    }

    const jobData = {
        ...data,
        updatedBy: userId,
    };
    return await jobsRepository.updateJob(jobId, workspaceId, jobData);
};
