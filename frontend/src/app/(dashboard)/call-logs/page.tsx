'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import {
    IconLoader2,
    IconPhoneCalling,
    IconPhoneOff,
    IconPhoneX,
} from '@tabler/icons-react';

import { useQuery } from "@tanstack/react-query";
import { calls } from "@/requests";
import { PhoneCall } from "lucide-react";

function getStatusBadge(reason: string | null) {
    switch (reason) {
        case "normal_clearing":
            return (
                <Badge className="bg-green-500 hover:bg-green-500">
                    Answered
                </Badge>
            );

        case "user_busy":
            return (
                <Badge variant="destructive">
                    Busy
                </Badge>
            );

        case "originator_cancel":
            return (
                <Badge className="bg-yellow-500 hover:bg-yellow-500 text-black">
                    Cancelled
                </Badge>
            );

        default:
            return <Badge variant="secondary">Unknown</Badge>;
    }
}

function getCallIcon(reason: string | null) {
    switch (reason) {
        case "normal_clearing":
            return <IconPhoneCalling size={16} stroke={1.75} className="text-green-500" />;

        case "user_busy":
            return <IconPhoneX size={16} stroke={1.75} className="text-red-500" />;

        case "originator_cancel":
            return <IconPhoneOff size={16} stroke={1.75} className="text-yellow-500" />;

        default:
            return null;
    }
}

function formatDuration(
    start: string | null,
    end: string | null,
    reason: string | null
) {
    if (
        reason === "user_busy" ||
        !start ||
        !end
    ) {
        return "-";
    }

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    const diff = Math.floor((endTime - startTime) / 1000);

    const mins = Math.floor(diff / 60);
    const secs = diff % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function CallLogsPage() {
    const { data: callsList = [], isLoading } = useQuery({
        queryKey: ["calls-list"],
        queryFn: () => calls.list(),
        retry: 1,
        refetchOnWindowFocus: false,
    });

    return (
        <div >
            <div className="text-2xl">
                Calls log
            </div>
            <hr className="my-4 border-border" />
            
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12">
                    <IconLoader2 size={32} stroke={1.75} className="animate-spin text-[#492FA6] mb-2" />
                    <p className="text-sm text-muted-foreground">Loading calls log...</p>
                </div>
            ) : callsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card rounded border border-dashed border-border text-center shadow-xs">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                        <PhoneCall className="h-8 w-8 text-[#492FA6]" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No call logs found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        There are currently no calls recorded in your workspace.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Started At</TableHead>
                                <TableHead>Call ID</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {callsList.map((call: any) => (
                                <TableRow key={call.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getCallIcon(
                                                call.statusReason
                                            )}

                                            {getStatusBadge(
                                                call.statusReason
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="font-medium">
                                        {call.fromNumber}
                                    </TableCell>

                                    <TableCell>
                                        {call.toNumber}
                                    </TableCell>

                                    <TableCell>
                                        {formatDuration(
                                            call.startTime,
                                            call.endTime,
                                            call.statusReason
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {new Date(
                                            call.startTime
                                        ).toLocaleString()}
                                    </TableCell>

                                    <TableCell className="max-w-[220px] truncate text-muted-foreground text-sm">
                                        {call.callId}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}