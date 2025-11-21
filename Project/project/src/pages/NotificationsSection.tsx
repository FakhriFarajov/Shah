import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

// interface Notification {
//   id: string;
//   action: string;
//   date: string;
// }

// interface NotificationsSectionProps {
//   history: Notification[];
// }

export default function NotificationsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
        </ul>
      </CardContent>
    </Card>
  );
}
