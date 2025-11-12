import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Edit, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const iconMap = {
  booking: <BookOpen className="h-5 w-5 text-blue-500" />,
  "profile-update": <Edit className="h-5 w-5 text-green-500" />,
  "account-creation": <User className="h-5 w-5 text-purple-500" />,
};

const UserActivityLog = ({ logs }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {iconMap[log.action] || <User className="h-5 w-5" />}
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
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default UserActivityLog;