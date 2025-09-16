import Anthropic from "@anthropic-ai/sdk";
import { ConvexHttpClient } from "convex/browser";
import { inngest } from "./client";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

const anthropic = new Anthropic(process.env.ANTHROPIC_API_KEY);

export const spendingInsights = inngest.createFunction(
  { name: "Generate Spending Insights", id: "generate-spending-insights" },
  { cron: "0 8 1 * *" }, // 1st of every month at 8:00 am
  async ({ step }) => {
    // Step 1: Pull users with expenses this month
    const users = await step.run("Fetch users with expense", async () => {
      return await convex.query(api.inngest.getUsersWithExpenses);
    });

    //Step 2: Iterate users and send insights email
    const results = [];
    for (const user of users) {
      const expenses = await step.run(`Expenses ${user._id}`, async () => {
        return await convex.query(api.inngest.getUserMonthlyExpenses, {
          userId: user._id,
        });
      });
      if (!expenses.length) continue;

      const expenseData = JSON.stringify({
        expenses,
        totalSpent: expenses.reduce((sum, e) => sum + e.amount, 0),
        categories: expenses.reduce((cats, e) => {
          cats[e.category ?? "uncategorised"] =
            (cats[e.category] ?? 0) + e.amount;
          return cats;
        }, {}),
      });

      const prompt = `
As a financial analyst, review this user's spending data for the past month and provide insightful observations and suggestions.
Focus on spending patterns, category breakdowns, and actionable advice for better financial management.
Use a friendly, encouraging tone. Format your response in HTML for an email.

User spending data:
${expenseData}

Provide your analysis in these sections:
1. Monthly Overview
2. Top Spending Categories
3. Unusual Spending Patterns (if any)
4. Saving Opportunities
5. Recommendations for Next Month
      `.trim();

      try {
        const aiResponse = await step.ai.wrap(
          "anthropic",
          async (p) =>
            anthropic.messages.create({
              model: "claude-opus-4-1-20250805",
              max_tokens: 1500,
              temperature: 0.7,
              messages: [{ role: "user", content: p }],
            }),
          prompt
        );

        const htmlBody =
          aiResponse.content?.[0]?.type === "text"
            ? aiResponse.content[0].text
            : " ";

        await step.run(`Email ${user._id} `, () =>
          convex.action(api.email.sendEmail, {
            to: user.email, // user.email but due to test and unavailability of domain i am using srt93400
            subject: "Your monthly financial insights",
            html: `
              <h1>Your Monthly Financial Insights</h1>
              <p>Hi ${user.name},</p>
              <p>Here's your personalized spending analysis for the past month:</p>
              ${htmlBody}
            `,
            apiKey: process.env.RESEND_API_KEY,
          })
        );
        results.push({ userId: user._id, success: true });
      } catch (error) {
        results.push({
          userId: user._id,
          success: false,
          error: error.message,
        });
      }
    }
    return {
      processed: results.length,
      success: results.filter((f) => f.success).length,
      failed: results.filter((f) => !f.success).length,
    };
  }
);
