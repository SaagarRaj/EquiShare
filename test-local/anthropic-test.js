import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey:
    "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",
});

const testUser = {
  _id: "test-user-1",
  name: "Saagar",
  email: "saagar@example.com",
};

const testExpenses = [
  { category: "Food", amount: 200 },
  { category: "Transport", amount: 50 },
  { category: "Entertainment", amount: 120 },
  { category: "Bills", amount: 300 },
];

// ----- Build JSON blob for AI prompt -----
const expenseData = JSON.stringify({
  expenses: testExpenses,
  totalSpent: testExpenses.reduce((sum, e) => sum + e.amount, 0),
  categories: testExpenses.reduce((cats, e) => {
    cats[e.category ?? "uncategorised"] = (cats[e.category] ?? 0) + e.amount;
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

async function testClaude() {
  try {
    const aiResponse = await anthropic.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    console.log("Response");
    console.log(aiResponse.content[0].text);
  } catch (error) {
    console.log("Error", error);
  }
}

testClaude();
