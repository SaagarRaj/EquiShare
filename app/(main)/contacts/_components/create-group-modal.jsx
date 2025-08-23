"use client";
import { useForm } from "react-hook-form";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useConvexMutation,
  useConvexQueries,
} from "@/hooks/use-convex-queries";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
} from "@/components/ui/command";
import { toast } from "sonner";

const CreateGroupModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);
  const createGroup = useConvexMutation(api.contacts.createGroup);

  const addMember = (user) => {
    if (!selectedMembers.some((m) => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setCommandOpen(false);
  };
  const removeMember = (userId) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== userId));
  };

  const { data: currentUser } = useConvexQueries(api.users.getCurrentUser);
  const { data: searchResults, isLoading: isSearching } = useConvexQueries(
    api.users.searchUsers,
    { query: searchQuery }
  );
  const handleClose = () => {
    reset();
    setSelectedMembers([]);
    onClose();
  };

  const groupSchema = z.object({
    name: z.string().min(1, "Group name is required"),
    description: z.string().optional(),
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data) => {
    //console.log(data);
    try {
      const memberIds = selectedMembers?.map((member) => member.id);
      const groupId = await createGroup.mutate({
        name: data.name,
        description: data.description,
        members: memberIds,
      });
      toast.success("Group Created Successfully!!");
      if (onSuccess) onSuccess(groupId);
      handleClose();
    } catch (error) {
      toast.error("Failed to create group: " + err.message);
    }
  };
  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new group</DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                placeholder="Enter Group Name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-800"> {errors.name.message}</p>
              )}
            </div>
            {/* Group Description  */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter group description"
                {...register("description")}
              />
            </div>
            {/* Group Members */}
            <div className="space-y-2">
              <Label>Members</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentUser && (
                  <>
                    <Badge variant="secondary" className="px-3 py-1">
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarImage src={currentUser.imageUrl} />
                        <AvatarFallback>
                          {currentUser.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {currentUser.name}{" "}
                        <span className="font-thin text-gray-800">(You)</span>
                      </span>
                    </Badge>
                  </>
                )}
                {/* Selected members */}
                {selectedMembers.map((member) => (
                  <Badge
                    key={member.id}
                    variant="secondary"
                    className="px-3 py-1"
                  >
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarImage src={member.imageUrl} />
                      <AvatarFallback>
                        {member.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {/* Popover Add user to selected members */}
                <Popover open={commandOpen} onOpenChange={setCommandOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Add member
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start" side="bottom">
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
                              Type at least 2 characters to search
                            </p>
                          ) : isSearching ? (
                            <p className="py-3 px-4 text-sm text-center text-muted-foreground ">
                              {" "}
                              Searching...
                            </p>
                          ) : (
                            <p className="py-3 px-4 text-sm text-center text-muted-foreground ">
                              No users found{" "}
                            </p>
                          )}
                        </CommandEmpty>
                        <CommandGroup heading="Users">
                          {searchResults?.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.name + user.email}
                              onSelect={() => addMember(user)}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className={"h-6 w-6"}>
                                  <AvatarImage src={user.imageUrl} />
                                  <AvatarFallback>
                                    {user.name?.charAt(0) || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col ">
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

                {selectedMembers.length === 0 && (
                  <p className="text-sm text-amber-600">
                    Add at least one member to the group
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || selectedMembers.length === 0}
              >
                {isSubmitting ? "Creating..." : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateGroupModal;
