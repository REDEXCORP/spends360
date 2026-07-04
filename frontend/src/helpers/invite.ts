export type InviteDetails = {
    email: string;
    workspaceId: number;
    workspaceName: string;
    role: string;
    inviteAccepted: boolean;
    isVerified: boolean;
    hasAccount: boolean;
};

export function buildRegisterUrl(email: string) {
    const params = new URLSearchParams({ email });
    return `/register?${params.toString()}`;
}

export function needsAccountSetup(invite: InviteDetails) {
    return !invite.hasAccount || !invite.isVerified;
}
