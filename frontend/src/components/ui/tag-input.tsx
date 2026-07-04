'use client';

import { useRef, type KeyboardEvent } from 'react';
import { IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

type TagInputProps = {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
};

function addTag(tags: string[], raw: string) {
    const tag = raw.trim();
    if (!tag) return tags;

    const exists = tags.some(existing => existing.toLowerCase() === tag.toLowerCase());
    if (exists) return tags;

    return [...tags, tag];
}

export function TagInput({
    value,
    onChange,
    placeholder = 'Type a tag and press Enter',
    className,
    disabled,
}: TagInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const commitInput = () => {
        const input = inputRef.current;
        if (!input) return;

        const next = addTag(value, input.value);
        if (next.length !== value.length) {
            onChange(next);
        }
        input.value = '';
    };

    const removeTag = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commitInput();
            return;
        }

        if (e.key === 'Backspace' && !e.currentTarget.value && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    return (
        <div
            className={cn(
                'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm transition-colors',
                'focus-within:border-[#492FA6]/40 focus-within:ring-2 focus-within:ring-[#492FA6]/10',
                disabled && 'cursor-not-allowed opacity-60',
                className
            )}
            onClick={() => inputRef.current?.focus()}
        >
            {value.map((tag, index) => (
                <span
                    key={`${tag}-${index}`}
                    className="inline-flex items-center gap-1 rounded-md border border-[#492FA6]/15 bg-[#492FA6]/5 px-2 py-0.5 text-xs font-medium text-[#492FA6]"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={e => {
                            e.stopPropagation();
                            removeTag(index);
                        }}
                        disabled={disabled}
                        className="rounded-sm text-[#492FA6]/70 hover:bg-[#492FA6]/10 hover:text-[#492FA6] disabled:pointer-events-none"
                        aria-label={`Remove ${tag}`}
                    >
                        <IconX size={12} stroke={2} />
                    </button>
                </span>
            ))}

            <input
                ref={inputRef}
                type="text"
                disabled={disabled}
                placeholder={value.length === 0 ? placeholder : 'Add another...'}
                onBlur={commitInput}
                onKeyDown={handleKeyDown}
                className="min-w-[120px] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-neutral-400"
            />
        </div>
    );
}
