"use client";
import ExpenseList from "@/components/expense-list";
import { GroupBalances } from "@/components/group-balances";

import GroupMembers from "@/components/group-members";
import SettlementsList from "@/components/settlements-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useConvexQueries } from "@/hooks/use-convex-queries";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { ArrowLeft, ArrowLeftRight, PlusCircle, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BarLoader } from "react-spinners";

const GroupsPage = () => {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("expense");

  const { data, isLoading } = useConvexQueries(api.groups.getGroupExpenses, {
    groupId: params.id,
  });

  //console.log(data);
  const group = data?.group;
  const members = data?.members || [];
  const expenses = data?.expenses || [];
  const settlements = data?.settlements || [];
  const balances = data?.balances || [];
  const userLookupMap = data?.userLookupMap || {};

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <BarLoader width={"100%"} />
      </div>
    );
  }
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Button
          className={"mb-4"}
          variant={"outline"}
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-4 rounded-md">
              <Users className="h-8 w-8 text-primary" />
            </div>

            <div>
              <h1 className="text-4xl gradient-title">{group?.name}</h1>
              <p className="text-muted-foreground">{group?.description}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {members.length} members
              </p>
            </div>
          </div>

          <div className="flex gap-2 ">
            <Button asChild variant={"outline"}>
              <Link href={`/settlements/user/${params.id}`}>
                <ArrowLeftRight className="mr-2 h-4 w-4 " />
                Settle Up
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/expenses/new`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Expenses
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 ">
          <Card>
            <CardHeader className={"pb-2"}>
              <CardTitle className={"text-xl"}>Group Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <GroupBalances balances={balances} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className={"pb-2"}>
              <CardTitle className={"text-xl"}>Group members</CardTitle>
            </CardHeader>
            <CardContent>
              <GroupMembers members={members} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs
        defaultValue="expenses"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">
            Expenses ({expenses.length})
          </TabsTrigger>
          <TabsTrigger value="settlements">
            Settlements ({settlements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <ExpenseList
            expenses={expenses}
            showOtherPerson={true}
            isGroupExpense={true}
            userLookupMap={userLookupMap}
          />
        </TabsContent>

        <TabsContent value="settlements" className="space-y-4">
          <SettlementsList
            settlements={settlements}
            userLookupMap={userLookupMap}
            isGroupSettlement={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupsPage;
