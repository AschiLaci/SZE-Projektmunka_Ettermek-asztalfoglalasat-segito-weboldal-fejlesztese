import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Edit, Layout, Utensils, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const iconMap = {
  "layout-update": <Layout className="h-5 w-5 text-purple-500" />,
  "profile-update": <Edit className="h-5 w-5 text-green-500" />,
  "new-booking": <BookOpen className="h-5 w-5 text-blue-500" />,
  "status-change": <Utensils className="h-5 w-5 text-orange-500" />,
  "account-creation": <Edit className="h-5 w-5 text-indigo-500" />,
};

const RestaurantActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/data/restaurant-logs.json');
        const data = await response.json();
        setLogs(data.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch (error) {
        console.error("Failed to fetch restaurant logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[1200px] pr-4">
            {loading ? (
                <p className="text-center text-muted-foreground">Loading logs...</p>
            ) : (
                <div className="space-y-6">
                    {logs.length > 0 ? (
                    logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-4">
                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            {iconMap[log.action] || <AlertCircle className="h-5 w-5" />}
                        </div>
                        <div>
                            <p className="font-medium">{log.details}</p>
                            <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                            </p>
                        </div>
                        </div>
                    ))
                    ) : (
                    <p className="text-center text-muted-foreground">No activity yet.</p>
                    )}
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RestaurantActivityLog;