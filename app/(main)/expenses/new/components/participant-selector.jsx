"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";
import { useConvexQueries } from "@/hooks/use-convex-queries";
import { AvatarImage } from "@radix-ui/react-avatar";
import { UserPlus, X } from "lucide-react";
import { useState } from "react";

const ParticipantSelector = ({ participants, onParticipantsChange }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: currentUser } = useConvexQueries(api.users.getCurrentUser);

  const { data: searchResults, isLoading } = useConvexQueries(
    api.users.searchUsers,
    { query: searchQuery }
  );

  const addParticipant = (user) => {
    if (participants.some((p) => p.id === user.id)) return;

    onParticipantsChange([...participants, user]);
    setOpen(false);
    setSearchQuery("");
  };

  const removeParticipant = (userId) => {
    if (userId === currentUser._id) return;

    onParticipantsChange(participants.filter((p) => p.id !== userId));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {participants.map((p) => (
          <Badge
            key={p.id}
            variant={"secondary"}
            className={"flex items-center gap-2 px-3 py-2"}
          >
            <Avatar className={"h-5 w-5"}>
              <AvatarImage src={p.imageUrl} />
              <AvatarFallback>{p.name?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <span>{p.id === currentUser._id ? "You" : p.name || p.email}</span>
            {p.id !== currentUser?._id && (
              <button
                type="button"
                onClick={() => removeParticipant(p.id)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}

        {participants.length < 2 && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                type="button"
              >
                <UserPlus className="h-3.5 w-3.5" /> Add person
              </Button>
            </PopoverTrigger>
            <PopoverContent className={"p-0"} align="start">
              <Command>
                <CommandInput
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>
                    {searchQuery.length < 2 ? (
                      <p className="py-3 px-4 text-sm text-center text-muted-foreground">
                        Type atleast 2 character to search..
                      </p>
                    ) : isLoading ? (
                      <p className="py-3 px-4 text-sm text-center text-muted-foreground">
                        Searching...
                      </p>
                    ) : (
                      <p className="py-3 px-4 text-sm text-center text-muted-foreground">
                        No user found
                      </p>
                    )}
                  </CommandEmpty>
                  <CommandGroup heading="Users">
                    {searchResults?.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={user.name + user.email}
                        onSelect={() => addParticipant(user)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className={"h-6 w-6"}>
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback>
                              {user.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default ParticipantSelector;
