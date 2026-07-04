export interface PhoneNumberRecord {
    country: string;
    code: string;
    number: string;
}

const REGION_CODES: Record<string, string> = {
    us: '+1',
    ca: '+1',
    gb: '+44',
    au: '+61',
    in: '+91',
};

export function getCodeForCountry(country: string): string {
    return REGION_CODES[country] ?? '+1';
}

export function asPhoneRecords(raw: PhoneNumberRecord[] | null | undefined): PhoneNumberRecord[] {
    if (!Array.isArray(raw)) return [];
    return raw.filter((record) => record.number?.trim());
}

export function phoneArrayToMap(records: PhoneNumberRecord[]): Record<string, string[]> {
    const map: Record<string, string[]> = {};

    for (const record of records) {
        if (!record.number?.trim()) continue;

        const digits = record.number.replace(/\D/g, '');
        const codeDigits = record.code.replace(/\D/g, '');
        const e164 = digits.startsWith(codeDigits) ? `+${digits}` : `${record.code}${digits}`;

        if (!map[record.country]) map[record.country] = [];
        if (!map[record.country].includes(e164)) {
            map[record.country].push(e164);
        }
    }

    return map;
}

export function hasPhoneRecords(records?: PhoneNumberRecord[]) {
    return Boolean(records?.some((record) => record.number?.trim()));
}
