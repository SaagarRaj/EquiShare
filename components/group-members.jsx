import { api } from "@/convex/_generated/api";
import { useConvexQueries } from "@/hooks/use-convex-queries";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Badge } from "lucide-react";
import React from "react";

const GroupMembers = ({ members }) => {
  const { data: currentUser } = useConvexQueries(api.users.getCurrentUser);
  console.log("Members", members);

  if (!members || !members.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No members in this group
      </div>
    );
  }
  return (
    <>
      <div className="space-y-3">
        {members.map((member) => {
          const isCurrentUser = member.id === currentUser?._id;
          const isAdmin = member.role === "admin";
          return (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.imageUrl} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {isCurrentUser ? "You" : member.name}
                    </span>
                    {isCurrentUser && (
                      <Badge variant="outline" className="text-xs py-0 h-5">
                        You
                      </Badge>
                    )}
                  </div>

                  {isAdmin && (
                    <span className="text-xs text-muted-foreground">Admin</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default GroupMembers;
