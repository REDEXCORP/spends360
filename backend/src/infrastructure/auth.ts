import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { INVITE_TOKEN_EXPIRES_IN, REGISTRATION_TOKEN_EXPIRES_IN } from '../config/auth';
import { InviteTokenPayload, RegistrationTokenPayload } from '../utils/interfaces';

export class AuthService {
    private static readonly SALT_ROUNDS = 10;

    static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    static generateAccessToken(userId: number, role: string, workspaceId: number): string {
        return jwt.sign({ sub: userId.toString(), role, workspaceId }, process.env.JWT_SECRET!, { expiresIn: '24h' });
    }

    static validateAndExtractClaims(token: string, secret: string): any {
        return jwt.verify(token, secret);
    }

    static generateRegistrationToken(payload: RegistrationTokenPayload): string {
        return jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: REGISTRATION_TOKEN_EXPIRES_IN,
        });
    }

    static verifyRegistrationToken(token: string): RegistrationTokenPayload {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as RegistrationTokenPayload;
        if (!decoded.email) {
            throw new Error('Invalid registration token');
        }
        return decoded;
    }

    static generateInviteToken(payload: InviteTokenPayload): string {
        return jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: INVITE_TOKEN_EXPIRES_IN,
        });
    }

    static verifyInviteToken(token: string): InviteTokenPayload {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as InviteTokenPayload;
        if (!decoded.email || !decoded.workspaceId || !decoded.role) {
            throw new Error('Invalid invite token');
        }
        return decoded;
    }
}
