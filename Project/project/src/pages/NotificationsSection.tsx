import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface Notification {
  id: string;
  action: string;
  date: string;
}

interface NotificationsSectionProps {
  history: Notification[];
}

export default function NotificationsSection({ history }: NotificationsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {history.map((notif) => (
            <li key={notif.id} className="py-2 flex justify-between items-center">
              <span>{notif.action}</span>
              <span className="text-xs text-gray-500">{notif.date}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
