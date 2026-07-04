import * as batchRepository from '../repositories/batchRepository';
import { AppError } from '../utils/AppError';
import { BatchView, CreateBatchPayload } from '../utils/batchTypes';
import { withWorkspaceAudit } from '../utils/workspaceEntity';
import { batches } from '../db/schema/batches';

type BatchRow = typeof batches.$inferSelect;

const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;

function normalizeTags(tags: string[] | undefined): string[] {
    if (!tags?.length) return [];

    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const raw of tags) {
        const tag = raw.trim();
        if (!tag) continue;

        if (tag.length > MAX_TAG_LENGTH) {
            throw new AppError(`Each tag must be ${MAX_TAG_LENGTH} characters or less`, 400);
        }

        const key = tag.toLowerCase();
        if (seen.has(key)) continue;

        seen.add(key);
        normalized.push(tag);

        if (normalized.length > MAX_TAGS) {
            throw new AppError(`A batch can have at most ${MAX_TAGS} tags`, 400);
        }
    }

    return normalized;
}

function toBatchView(row: BatchRow): BatchView {
    return {
        id: row.id,
        workspaceId: row.workspaceId,
        name: row.name,
        description: row.description,
        tags: row.tags ?? [],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

export const listBatches = async (workspaceId: number | null): Promise<BatchView[]> => {
    if (!workspaceId) return [];

    const rows = await batchRepository.listByWorkspaceId(workspaceId);
    return rows.map(toBatchView);
};

export const createBatch = async (
    workspaceId: number | null,
    userId: number,
    payload: CreateBatchPayload
): Promise<BatchView> => {
    if (!workspaceId) {
        throw new AppError('Workspace is required', 400);
    }

    const name = payload.name?.trim();
    if (!name) {
        throw new AppError('Batch name is required', 400);
    }

    const row = await batchRepository.create(
        withWorkspaceAudit(
            {
                name,
                description: payload.description?.trim() || null,
                tags: normalizeTags(payload.tags),
            },
            workspaceId,
            userId
        )
    );

    return toBatchView(row);
};
