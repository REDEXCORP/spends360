import { ReactNode } from 'react';

interface SettingsTabPanelProps {
    title?: string;
    description?: string;
    children: ReactNode;
}

export default function SettingsTabPanel({ title, description, children }: SettingsTabPanelProps) {
    const hasHeader = Boolean(title || description);

    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
            {hasHeader && (
                <div className="mb-6 border-b border-neutral-100 pb-4">
                    {title && <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>}
                    {description && (
                        <p className={`text-sm text-neutral-500 ${title ? 'mt-1' : ''}`}>{description}</p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
}
