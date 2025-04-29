import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    id: 1,
    user: "John Doe",
    action: "Created new project",
    time: "2 hours ago",
    avatar: "/avatars/01.png"
  },
  {
    id: 2,
    user: "Jane Smith",
    action: "Updated inventory",
    time: "5 hours ago",
    avatar: "/avatars/02.png"
  },
  {
    id: 3,
    user: "Robert Johnson",
    action: "Approved design",
    time: "1 day ago",
    avatar: "/avatars/03.png"
  },
  {
    id: 4,
    user: "Emily Davis",
    action: "Completed order",
    time: "2 days ago",
    avatar: "/avatars/04.png"
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={activity.avatar} />
              <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.user}</p>
              <p className="text-sm text-muted-foreground">{activity.action}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {activity.time}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}