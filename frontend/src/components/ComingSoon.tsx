import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ComingSoonProps {
    title: string;
    description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
    return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
            <Card className="w-full max-w-lg border-dashed shadow-none">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">This module will be available in a future release.</p>
                </CardContent>
            </Card>
        </div>
    );
}
