import * as leadRepository from '../repositories/leadRepository';
import { AppError } from '../utils/AppError';
import { CreateLeadPayload, LeadView } from '../utils/leadTypes';
import { withWorkspaceAudit } from '../utils/workspaceEntity';
import { leads } from '../db/schema/leads';

type LeadRow = typeof leads.$inferSelect;

function toLeadView(row: LeadRow): LeadView {
    return {
        id: row.id,
        workspaceId: row.workspaceId,
        name: row.name,
        phone: row.phone,
        email: row.email,
        source: row.source,
        about: row.about,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

function normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
        throw new AppError('Phone number must have at least 7 digits', 400);
    }
    return digits;
}

export const listLeads = async (workspaceId: number | null): Promise<LeadView[]> => {
    if (!workspaceId) return [];

    const rows = await leadRepository.listByWorkspaceId(workspaceId);
    return rows.map(toLeadView);
};

export const createLead = async (
    workspaceId: number | null,
    userId: number,
    payload: CreateLeadPayload
): Promise<LeadView> => {
    if (!workspaceId) {
        throw new AppError('Workspace is required', 400);
    }

    const name = payload.name?.trim();
    if (!name) {
        throw new AppError('Lead name is required', 400);
    }

    const phoneRaw = payload.phone?.trim();
    if (!phoneRaw) {
        throw new AppError('Phone number is required', 400);
    }

    const phone = normalizePhone(phoneRaw);

    const email = payload.email?.trim() || null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new AppError('Invalid email address', 400);
    }

    const row = await leadRepository.create(
        withWorkspaceAudit(
            {
                name,
                phone,
                email,
                source: payload.source?.trim() || null,
                about: payload.about?.trim() || null,
            },
            workspaceId,
            userId
        )
    );

    return toLeadView(row);
};
