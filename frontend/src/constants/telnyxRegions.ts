export const TELNYX_REGIONS = [
    { value: 'us', flag: '🇺🇸', label: 'United States', code: '+1' },
    { value: 'ca', flag: '🇨🇦', label: 'Canada', code: '+1' },
    { value: 'gb', flag: '🇬🇧', label: 'United Kingdom', code: '+44' },
    { value: 'au', flag: '🇦🇺', label: 'Australia', code: '+61' },
    { value: 'in', flag: '🇮🇳', label: 'India', code: '+91' },
] as const;

export interface PhoneNumberRecord {
    country: string;
    code: string;
    number: string;
}

export function getRegionByValue(value: string) {
    return TELNYX_REGIONS.find(r => r.value === value) ?? TELNYX_REGIONS[0];
}

export function getCodeForCountry(country: string): string {
    return getRegionByValue(country).code;
}

export type PhoneEntry = {
    id: string;
    country: string;
    number: string;
};

function stripCountryCodeDigits(number: string, country: string): string {
    const digits = number.replace(/\D/g, '');
    const codeDigits = getCodeForCountry(country).replace(/\D/g, '');
    if (digits.startsWith(codeDigits)) return digits.slice(codeDigits.length);
    return digits;
}

export function phoneRecordsToEntries(records?: PhoneNumberRecord[]): PhoneEntry[] {
    if (!records?.length) return [];

    return records.map((record, index) => ({
        id: `${record.country}-${index}-${record.number}`,
        country: record.country,
        number: stripCountryCodeDigits(record.number, record.country),
    }));
}

export function entriesToPhoneRecords(entries: { country: string; number: string }[]): PhoneNumberRecord[] {
    return entries
        .filter(entry => entry.number?.trim())
        .map(entry => ({
            country: entry.country,
            code: getCodeForCountry(entry.country),
            number: stripCountryCodeDigits(entry.number, entry.country),
        }));
}
