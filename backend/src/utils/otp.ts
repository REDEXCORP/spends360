import { OTP_LENGTH, OTP_TTL_MS } from "../constants/otp";

export function generateOtp() {
    const min = 10 ** (OTP_LENGTH - 1);
    const max = 10 ** OTP_LENGTH - 1;
    const otp = Math.floor(min + Math.random() * (max - min + 1)).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    return { otp, expiresAt };
}
