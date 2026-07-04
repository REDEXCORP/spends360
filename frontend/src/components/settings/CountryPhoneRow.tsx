'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TELNYX_REGIONS } from '@/constants/telnyxRegions';
import { IconTrash } from '@tabler/icons-react';

interface CountryPhoneRowProps {
    country: string;
    number: string;
    onCountryChange: (country: string) => void;
    onNumberChange: (number: string) => void;
    onRemove?: () => void;
    showRemove?: boolean;
    numberPlaceholder?: string;
}

export default function CountryPhoneRow({
    country,
    number,
    onCountryChange,
    onNumberChange,
    onRemove,
    showRemove = false,
    numberPlaceholder = '5551234567',
}: CountryPhoneRowProps) {
    const selected = TELNYX_REGIONS.find(r => r.value === country) ?? TELNYX_REGIONS[0];

    return (
        <div className="flex items-center gap-2">
            <Select value={country} onValueChange={onCountryChange}>
                <SelectTrigger className="w-[88px] shrink-0 px-2">
                    <SelectValue>
                        <span className="flex items-center gap-1.5">
                            <span>{selected.flag}</span>
                            <span>{selected.code}</span>
                        </span>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {TELNYX_REGIONS.map(region => (
                        <SelectItem key={region.value} value={region.value}>
                            <span className="flex items-center gap-1.5">
                                <span>{region.flag}</span>
                                <span>{region.code}</span>
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input
                value={number}
                onChange={e => onNumberChange(e.target.value.replace(/[^\d]/g, ''))}
                placeholder={numberPlaceholder}
                className="min-w-0 flex-1"
            />

            {showRemove && onRemove && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-neutral-400 hover:text-red-600"
                    onClick={onRemove}
                >
                    <IconTrash size={16} stroke={1.75} />
                </Button>
            )}
        </div>
    );
}
