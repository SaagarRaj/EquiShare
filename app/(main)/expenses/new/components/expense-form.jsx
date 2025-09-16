"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import {
  useConvexMutation,
  useConvexQueries,
} from "@/hooks/use-convex-queries";
import { getAllCategories } from "@/lib/expense-categories";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import CategorySelector from "./category-selector";
import GroupSelector from "./group-selector";
import ParticipantSelector from "./participant-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SplitSelector from "./split-selector";

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) =>
        !isNaN(parseFloat(val) && parseFloat(val) > 0, {
          message: "Amount must be positive number",
        })
    ),
  category: z.string().optional(),
  date: z.date(),
  paidByUserId: z.string().min(1, "Payer is required"),
  splitType: z.enum(["equal", "percentage", "exact"]),
  groupId: z.string().optional(),
});

const ExpenseForm = ({ type, onSuccess }) => {
  const [participants, setParticipants] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [splits, setSplits] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { data: currentUser, isLoading } = useConvexQueries(
    api.users.getCurrentUser
  );
  const createExpense = useConvexMutation(api.expenses.createExpense);
  const categories = getAllCategories();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      date: new Date(),
      paidByUserId: currentUser?._id || "",
      splitType: "equal",
      groupId: undefined,
    },
  });

  const amountValue = watch("amount");
  const paidByUserId = watch("paidByUserId");
  //when user is added or removed, update the participants list
  useEffect(() => {
    if (participants.length === 0 && currentUser) {
      //Always add the current user as a participant
      setParticipants([
        {
          id: currentUser._id,
          name: currentUser.name,
          email: currentUser.email,
          imageUrl: currentUser.imageUrl,
        },
      ]);
    }
  }, [currentUser, participants]);

  if (!currentUser) return null;

  const onSubmit = async (data) => {};

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        {/* Description + Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Lunch, movie tickets, etc."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0.01"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <CategorySelector
              categories={categories || []}
              onChange={(categoryId) => {
                if (categoryId) {
                  setValue("category", categoryId);
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className={"w-auto p-0"}>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setValue("date", date);
                  }}
                  className="rounded-ms border"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {type === "group" && (
          <div className="space-y-2">
            <Label>Group</Label>
            <GroupSelector
              onChange={(group) => {
                //only update if group has changed to prevent loop
                if (!selectedGroup || selectedGroup.id !== group.id) {
                  setSelectedGroup(group);
                  setValue("groupId", group);
                  // update participants with the group members
                  if (group.members && Array.isArray(group.members)) {
                    setParticipants(group.members);
                  }
                }
              }}
            />
            {!selectedGroup && (
              <p className="text-xs text-amber-600">
                Please select a group to continue
              </p>
            )}
          </div>
        )}

        {type === "individual" && (
          <div className="space-y-2">
            <Label>Participants</Label>
            <ParticipantSelector
              participants={participants}
              onParticipantsChange={setParticipants}
            />
            {participants.length <= 1 && (
              <p className="text-xs text-amber-600">
                Please add atleast one other participant
              </p>
            )}
          </div>
        )}

        {/* Paid by participant selector  */}
        <div className="space-y-4">
          <Label>Paid By:</Label>
          <select
            {...register("paidByUserId")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select who paid</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id === currentUser._id ? "You" : p.name}
              </option>
            ))}
          </select>
          {errors.paidByUserId && (
            <p className="text-sm text-red-500">
              {errors.paidByUserId.message}{" "}
            </p>
          )}
        </div>

        {/* Split Type */}
        <div className="space-y-4">
          <Label>Split Type</Label>

          <Tabs
            defaultValues="equal"
            className=""
            onValueChange={(value) => setValue("splitType", value)}
          >
            <TabsList className={"grid w-full grid-cols-3"}>
              <TabsTrigger value="equal">Equal</TabsTrigger>
              <TabsTrigger value="percentage">Percentage</TabsTrigger>
              <TabsTrigger value="exact">Exact</TabsTrigger>
            </TabsList>
            <TabsContent value="equal" className={"pt-4"}>
              <p className="text-sm text-muted-foreground">
                Split equally among all participants
              </p>
              <SplitSelector />
            </TabsContent>
            <TabsContent value="percentage" className={"pt-4"}>
              <p className="text-sm text-muted-foreground">
                Split by percentage
              </p>
              <SplitSelector />
            </TabsContent>
            <TabsContent value="exact" className={"pt-4"}>
              <p className="text-sm text-muted-foreground">
                Enter exact amounts
              </p>
              <SplitSelector />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || participants.length <= 1}
        >
          {isSubmitting ? "Creating..." : "Create Expense"}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
