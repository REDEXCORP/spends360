'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { addDays, addMonths, endOfMonth, format, startOfMonth } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateRange, SelectRangeEventHandler } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const presets = [
    { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
    {
        label: 'Yesterday',
        getValue: () => {
            const yesterday = addDays(new Date(), -1);
            return { from: yesterday, to: yesterday };
        },
    },
    {
        label: 'Last 7 Days',
        getValue: () => ({ from: addDays(new Date(), -6), to: new Date() }),
    },
    {
        label: 'Last 30 Days',
        getValue: () => ({ from: addDays(new Date(), -29), to: new Date() }),
    },
    {
        label: 'This Month',
        getValue: () => ({
            from: startOfMonth(new Date()),
            to: endOfMonth(new Date()),
        }),
    },
    {
        label: 'Last Month',
        getValue: () => {
            const lastMonth = addMonths(new Date(), -1);
            return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
        },
    },
    { label: 'Custom Range', getValue: () => undefined },
];

function DatePicker() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [date, setDate] = React.useState<DateRange | undefined>(() => {
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        if (startDate && endDate) {
            return { from: new Date(startDate), to: new Date(endDate) };
        }
        return { from: addDays(new Date(), -6), to: new Date() };
    });
    const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date);
    const [isOpen, setIsOpen] = React.useState(false);
    const [currentMonth, setCurrentMonth] = React.useState(new Date());
    const getPresetFromDates = React.useCallback((from: Date, to: Date): string => {
        const today = new Date();

        if (format(from, 'yyyy-MM-dd') === format(to, 'yyyy-MM-dd')) {
            if (format(from, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
                return 'Today';
            }
            if (format(from, 'yyyy-MM-dd') === format(addDays(today, -1), 'yyyy-MM-dd')) {
                return 'Yesterday';
            }
        }

        if (
            format(from, 'yyyy-MM-dd') === format(addDays(to, -6), 'yyyy-MM-dd') &&
            format(to, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        ) {
            return 'Last 7 Days';
        }

        if (
            format(from, 'yyyy-MM-dd') === format(addDays(to, -29), 'yyyy-MM-dd') &&
            format(to, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        ) {
            return 'Last 30 Days';
        }

        if (
            format(from, 'yyyy-MM-dd') === format(startOfMonth(to), 'yyyy-MM-dd') &&
            format(to, 'yyyy-MM-dd') === format(endOfMonth(to), 'yyyy-MM-dd')
        ) {
            const lastMonth = addMonths(new Date(), -1);
            if (format(from, 'yyyy-MM') === format(lastMonth, 'yyyy-MM')) {
                return 'Last Month';
            }
            if (format(from, 'yyyy-MM') === format(today, 'yyyy-MM')) {
                return 'This Month';
            }
        }

        return 'Custom Range';
    }, []);

    const [selectedPreset, setSelectedPreset] = React.useState<string>(() => {
        if (date?.from && date?.to) {
            return getPresetFromDates(date.from, date.to);
        }
        return 'Last 7 Days';
    });

    const [tempPreset, setTempPreset] = React.useState<string>('Last 7 Days');
    const [isPresetOpen, setIsPresetOpen] = React.useState(false);

    const handleSelect: SelectRangeEventHandler = range => {
        setTempDate(range);
        setTempPreset('Custom Range');
    };

    const handlePresetClick = (preset: (typeof presets)[number]) => {
        const range = preset.getValue();
        setTempDate(range);
        setTempPreset(preset.label);
        if (range) {
            setCurrentMonth(range.from);
        }
        setIsPresetOpen(false);
    };

    const handleApply = () => {
        setDate(tempDate);
        setSelectedPreset(tempPreset);
        if (tempDate?.from && tempDate?.to) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('startDate', format(tempDate.from, 'yyyy-MM-dd'));
            newSearchParams.set('endDate', format(tempDate.to, 'yyyy-MM-dd'));
            router.push(`?${newSearchParams.toString()}`);
        }
        setIsOpen(false);
    };

    const handleCancel = () => {
        setTempDate(date);
        setTempPreset(selectedPreset);
        setIsOpen(false);
    };
    const handleOpenChange = (open: boolean) => {
        if (open) {
            setTempDate(date);
            setTempPreset(selectedPreset);
        } else {
            handleCancel();
        }
        setIsOpen(open);
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn('w-[280px] justify-start bg-white text-left font-normal', !date && 'text-black')}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                        date.to ? (
                            <>
                                {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                            </>
                        ) : (
                            format(date.from, 'LLL dd, y')
                        )
                    ) : (
                        <span>Pick a date</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0" align="end">
                {/* Desktop Layout */}
                <div className="hidden flex-col md:flex">
                    <div className="flex">
                        <div className="w-[200px] space-y-2 border-r p-4">
                            {presets.map(preset => (
                                <Button
                                    key={preset.label}
                                    onClick={() => handlePresetClick(preset)}
                                    variant="ghost"
                                    className={cn(
                                        'w-full justify-start font-normal',
                                        tempPreset === preset.label &&
                                            'bg-primary text-white hover:bg-primary/90 hover:text-white'
                                    )}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                        <div className="w-fit p-4">
                            <div className="mb-2 flex justify-between">
                                <Button variant="ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</div>
                                <Button variant="ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex space-x-4">
                                <Calendar
                                    mode="range"
                                    selected={tempDate}
                                    onSelect={handleSelect}
                                    month={currentMonth}
                                    disableNavigation
                                    className="rounded-md border"
                                />
                                <Calendar
                                    mode="range"
                                    selected={tempDate}
                                    onSelect={handleSelect}
                                    disableNavigation
                                    month={addMonths(currentMonth, 1)}
                                    className="rounded-md border"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 border-t p-4">
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleApply}>Apply</Button>
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="flex flex-col md:hidden">
                    <div className="p-4">
                        <Popover open={isPresetOpen} onOpenChange={setIsPresetOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {tempPreset || 'Select preset'}
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px]">
                                <MobilePresets tempPreset={tempPreset} handlePresetClick={handlePresetClick} />
                            </PopoverContent>
                        </Popover>

                        <div className="mt-4">
                            <div className="mb-2 flex justify-between">
                                <Button variant="ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</div>
                                <Button variant="ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            <Calendar
                                mode="range"
                                selected={tempDate}
                                onSelect={handleSelect}
                                month={currentMonth}
                                className="rounded-md border"
                                disableNavigation
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 border-t p-4">
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleApply}>Apply</Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

function MobilePresets({
    tempPreset,
    handlePresetClick,
}: {
    tempPreset: string;
    handlePresetClick: (preset: (typeof presets)[number]) => void;
}) {
    return (
        <div className="space-y-2">
            {presets.map(preset => (
                <Button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    variant="ghost"
                    className={cn(
                        'w-full justify-start font-normal',
                        tempPreset === preset.label && 'bg-primary text-w hover:bg-primary/90 hover:text-white'
                    )}
                >
                    {preset.label}
                </Button>
            ))}
        </div>
    );
}

export default DatePicker;
