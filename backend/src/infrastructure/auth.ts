import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
    private static readonly SALT_ROUNDS = 10;

    static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    static generateAccessToken(userId: number, role: string | null, workspaceId: number | null): string {
        return jwt.sign({ sub: userId.toString(), role, workspaceId }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    }

    static generateRefreshToken(userId: number): string {
        return jwt.sign({ sub: userId.toString() }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
    }

    static validateAndExtractClaims(token: string, secret: string = process.env.JWT_REFRESH_SECRET!): any {
        return jwt.verify(token, secret);
    }
}
