import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLogs } from "@/context/LogContext";
import { formatDistanceToNow } from "date-fns";
import { FileText, Utensils, BookOpen, Layout } from "lucide-react";

const LogIcon = ({ type }) => {
    const icons = {
        booking: <BookOpen className="h-4 w-4 text-blue-500" />,
        order: <Utensils className="h-4 w-4 text-green-500" />,
        table: <FileText className="h-4 w-4 text-orange-500" />,
        layout: <Layout className="h-4 w-4 text-purple-500" />,
        default: <FileText className="h-4 w-4 text-gray-500" />,
    };
    return icons[type] || icons.default;
};

const ActivityLogs = ({ restaurantId }) => {
    const { logs } = useLogs();

    const restaurantLogs = logs.filter(log => log.restaurantId === restaurantId);

    return (
        <div>
            <h2 className="mb-4 text-xl font-semibold">Activity Logs</h2>
            <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-4 pr-4">
                    {restaurantLogs.length > 0 ? restaurantLogs.map((log) => (
                        <div key={log.id} className="flex items-start space-x-3">
                            <div className="mt-1">
                                <LogIcon type={log.type} />
                            </div>
                            <div>
                                <p className="text-sm text-foreground">{log.message}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-muted-foreground py-8">
                            No recent activity.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default ActivityLogs;