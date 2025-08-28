import { internal } from "./_generated/api";
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getGroupExpenses = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);
    const group = await ctx.db.get(groupId);
    if (!group) throw new Error("Group not found");

    if (!group.members.some((m) => m.userId === currentUser._id)) {
      throw new Error("You are not a member of this group");
    }

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();

    const settlements = await ctx.db
      .query("settlements")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();

    /* Member Detail */

    const memberDetail = await Promise.all(
      group.members.map(async (m) => {
        const u = await ctx.db.get(m.userId);
        return {
          id: u._id,
          name: u.name,
          imageUrl: u.imageUrl,
          role: m.role,
        };
      })
    );
    const ids = memberDetail.map((m) => m.id);
    /*
   Balance Calculation 
   Initialize total object to tract overall balance for each user
   Format: {userId1: balance1, userId2: balance2, .......}
   */

    const totals = Object.fromEntries(ids.map((id) => [id, 0]));

    /*
    Create 2-D ledger to track who owes whom 
    ledger[A][B] = how much A owes B
    ledger = {
    "user1": {"user2" : 0, "user3": 0},
    "user2": {"user1" : 0, "user3": 0},
    "user3": {"user1" : 0, "user2": 0},
    }
    */

    const ledger = {};

    ids.forEach((a) => {
      ledger[a] = {};
      ids.forEach((b) => {
        if (a != b) ledger[a][b] = 0;
      });
    });

    /* 
    Apply Expenses to Balances

    Example: 
    Exp1 -> user1 paid $60, split equally among all 3 users ( $20 each )
    After applying this expense:
    totals : {"user1" : +40 , "user2" : -20 , "user3" : -20}
    ledger: {
        "user1": {"user2": 0 , "user3" : 0} ,
        "user2": {"user1": 20 , "user3" : 0} ,
        "user3": {"user1": 20 , "user2" : 0} ,
    }
    Above means user2 owes $20 to user1 and user3 owes $20 to user1
    */

    for (const exp of exp.splits) {
      // Skip if this is payers own split or is already paid
      if (split.userId === payer || split.paid) continue;

      const debtor = split.userId;
      const amt = split.amount;

      // Update totals
      totals[payer] += amt;
      totals[debtor] -= amt;

      ledger[debtor][payer] += amt;
    }

    /* 
    Apply Settlement to Balances

    Example: 
    User2 paid $10 to user1

    After applying this settlement:
    totals : {"user1" : +30 , "user2" : -10 , "user3" : -20}
    ledger: {
        "user1": {"user2": 0 , "user3" : 0} ,
        "user2": {"user1": 10 , "user3" : 0} ,
        "user3": {"user1": 20 , "user2" : 0} ,
    }
    Above means user2 owes only $10 to user1 and user3 owes $20 to user1.
    */

    for (const s of settlements) {
      // Update totals: increase payers balance, decrease receivers balance
      totals[s.paidByUserId] += s.amount;
      totals[s.receivedByUserId] -= s.amount;

      //Update Ledger: reduce what the payer owes to the receiver;
      ledger[s.paidByUserId][s.receivedByUserId] -= s.amount;
    }

    /*

     Format Response Data 
     Create a comprehensive balance object for each member
     
     */

    const balances = memberDetail.map((m) => ({
      ...m,
      totalBalance: totals[m.id],
      owes: Object.entries(ledger[m.id])
        .filter(([, v]) => v > 0)
        .map(([to, amount]) => {
          to, amount;
        }),
      owedBy: ids
        .filter((other) => ledger[other][m.id] > 0)
        .map((other) => ({ from: other, amount: ledger[other][m.id] })),
    }));

    const userLookUp = {};
    memberDetail.forEach((member) => {
      userLookUp[member.id] = member;
    });

    return {
      // Group Information
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
      },
      members: memberDetail, // All group member detail
      expenses, //All Expenses in this group
      settlements, // All settlements in this group
      balances, // calculated balance info for each member
      userLookUp, // Quick lookup for user detail
    };
  },
});
