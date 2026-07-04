import * as pilotRepository from '../repositories/pilotRepository';
import { AppError } from '../utils/AppError';
import { CreatePilotPayload, PilotView } from '../utils/pilotTypes';
import { withWorkspaceAudit } from '../utils/workspaceEntity';
import { pilots } from '../db/schema/pilots';

type PilotRow = typeof pilots.$inferSelect;

function toPilotView(row: PilotRow): PilotView {
    return {
        id: row.id,
        workspaceId: row.workspaceId,
        name: row.name,
        email: row.email,
        description: row.description,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

export const listPilots = async (workspaceId: number | null): Promise<PilotView[]> => {
    if (!workspaceId) return [];

    const rows = await pilotRepository.listByWorkspaceId(workspaceId);
    return rows.map(toPilotView);
};

export const createPilot = async (
    workspaceId: number | null,
    userId: number,
    payload: CreatePilotPayload
): Promise<PilotView> => {
    if (!workspaceId) {
        throw new AppError('Workspace is required', 400);
    }

    const name = payload.name?.trim();
    if (!name) {
        throw new AppError('Pilot name is required', 400);
    }

    const email = payload.email?.trim() || null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new AppError('Invalid email address', 400);
    }

    const row = await pilotRepository.create(
        withWorkspaceAudit(
            {
                name,
                email,
                description: payload.description?.trim() || null,
            },
            workspaceId,
            userId
        )
    );

    return toPilotView(row);
};
