
import { create, callsList } from "../repositories/callsRepository";
import { CallLog } from "../utils/interfaces";

export const createCallLog = async (callLog: CallLog & { workspaceId: number }) => {
    return await create({
        fromNumber: callLog.fromNumber,
        toNumber: callLog.toNumber,
        status: callLog.status,
        statusReason: callLog.statusReason,
        callId: callLog.callId,
        startTime: callLog.startTime,
        endTime: callLog.endTime,
        workspaceId: callLog.workspaceId,
    });
};

export const getCalls = async (workspaceId: number = 1) => {
    return await callsList(workspaceId);
};
