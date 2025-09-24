"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useConvexQueries } from "@/hooks/use-convex-queries";
import { ArrowLeft, User, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { BarLoader } from "react-spinners";
import SettlementForm from "./components/settlement-form";

const SettlementPage = () => {
  const params = useParams();
  const router = useRouter();
  const { type, id } = params;

  const { data, isLoading } = useConvexQueries(
    api.settlements.getSettlementData,
    {
      entityType: type,
      entityId: id,
    }
  );

  //console.log("settlements data", data);
  if (isLoading) {
    return (
      <div className="container mx-auto">
        <BarLoader width={"100%"} color="#111" />
      </div>
    );
  }

  const handleSuccess = () => {
    if (type === "user") {
      router.push(`/person/${id}`);
    } else if (type === "group") {
      router.push(`/groups/${id}`);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-lg">
      <Button
        variant="outline"
        size="sm"
        classname="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="mb-6">
        <h1 className="text-5xl gradient-title">Record a settlement</h1>
        <p className="text-muted-foreground mt-1">
          {type === "user"
            ? `Settling up with ${data?.counterpart?.name}`
            : `Settling up in ${data?.group?.name}`}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 ">
            {type === "user" ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={data?.counterpart?.imageUrl} />
                <AvatarFallback>
                  {data?.counterpart?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="bg-primary/10 p-2 rounded-md">
                <Users className="h-6 w-6 text-primary" />
              </div>
            )}
            <CardTitle>
              {type === "user" ? data?.counterpart?.name : data?.group?.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <SettlementForm
            entityType={type}
            entityData={data}
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SettlementPage;
