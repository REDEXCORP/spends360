import { TelnyxClientConfig } from '../utils/interfaces';
import * as telnyxConfigService from '../services/telnyxConfigService';

let cached: TelnyxClientConfig[] | null = null;

export function clearTelnyxConfigCache(): void {
    cached = null;
}

export async function getTelnyxConfigs(): Promise<TelnyxClientConfig[]> {
    if (cached) return cached;

    cached = await telnyxConfigService.getAllConfigs();
    return cached;
}

export async function getTelnyxConfigByWorkspace(
    workspaceId: number
): Promise<TelnyxClientConfig | undefined> {
    const configs = await getTelnyxConfigs();
    return configs.find((config) => config.workspaceId === workspaceId);
}
