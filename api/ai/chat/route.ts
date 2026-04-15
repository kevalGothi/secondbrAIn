import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Chat from "@/lib/models/Chat";
import Note from "@/lib/models/Note";
import Movie from "@/lib/models/Movie";
import Restaurant from "@/lib/models/Restaurant";
import Recipe from "@/lib/models/Recipe";
import Finance from "@/lib/models/Finance";
import Reminder from "@/lib/models/Reminder";
import LinkModel from "@/lib/models/Link";
import { chatWithAI } from "@/lib/gemini";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { message, chatId } = await req.json();
  const userId = (session.user as any).id;
  await dbConnect();

  // Gather ALL user context for the AI
  const [notes, movies, restaurants, recipes, finances, reminders, links] = await Promise.all([
    Note.find({ userId }).sort({ createdAt: -1 }).limit(15).lean(),
    Movie.find({ userId }).sort({ createdAt: -1 }).limit(15).lean(),
    Restaurant.find({ userId }).sort({ createdAt: -1 }).limit(15).lean(),
    Recipe.find({ userId }).sort({ createdAt: -1 }).limit(15).lean(),
    Finance.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    Reminder.find({ userId, isCompleted: false }).sort({ dueDate: 1 }).limit(10).lean(),
    LinkModel.find({ userId }).sort({ createdAt: -1 }).limit(15).lean(),
  ]);

  // Build pending debts
  const pendingLent = (finances as any[]).filter((f: any) => f.type === "lent" && !f.isSettled);
  const pendingBorrowed = (finances as any[]).filter((f: any) => f.type === "borrowed" && !f.isSettled);
  const totalSpent = (finances as any[]).filter((f: any) => f.type === "sent" || f.type === "expense").reduce((s: number, f: any) => s + f.amount, 0);
  const totalReceived = (finances as any[]).filter((f: any) => f.type === "received" || f.type === "income").reduce((s: number, f: any) => s + f.amount, 0);

  const context = `You are "Second Brain AI" — the user's personal AI assistant that knows EVERYTHING about them. You are helpful, witty, and super personalized. Today's date: ${new Date().toLocaleDateString('en-IN')}.

=== USER'S DATA ===

📝 NOTES: ${(notes as any[]).map((n: any) => n.title || n.text?.substring(0, 50)).join(", ") || "None yet"}

🎬 MOVIES: ${(movies as any[]).map((m: any) => `${m.title} (${m.liked ? "❤️ liked" : m.disliked ? "👎 disliked" : m.status})`).join(", ") || "None yet"}

🍽️ RESTAURANTS: ${(restaurants as any[]).map((r: any) => `${r.name} (${r.liked ? "❤️ liked" : "saved"}) [${r.cuisine?.join(",")}]`).join(", ") || "None yet"}

🧑‍🍳 RECIPES: ${(recipes as any[]).map((r: any) => r.title).join(", ") || "None yet"}

💰 FINANCES:
- Total Spent: ₹${totalSpent}
- Total Received: ₹${totalReceived}
- People who OWE the user: ${pendingLent.map((f: any) => `${f.person} owes ₹${f.amount}${f.dueDate ? ` (due ${new Date(f.dueDate).toLocaleDateString('en-IN')})` : ""}`).join(", ") || "None"}
- User OWES: ${pendingBorrowed.map((f: any) => `Owes ₹${f.amount} to ${f.person}${f.dueDate ? ` (due ${new Date(f.dueDate).toLocaleDateString('en-IN')})` : ""}`).join(", ") || "None"}
- Recent transactions: ${(finances as any[]).slice(0, 10).map((f: any) => `${f.type} ₹${f.amount} ${f.person ? `(${f.person})` : ""} - ${f.description}`).join("; ")}

🔔 ACTIVE REMINDERS:
${(reminders as any[]).map((r: any) => `- ${r.title} (${r.type}) due ${r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-IN') : "??"}`).join("\n") || "None"}

🔗 SAVED LINKS:
${(links as any[]).map((l: any) => `- ${l.title} [${l.platform}] (${l.category})${l.jobInfo?.role ? ` — JOB: ${l.jobInfo.role}${l.jobInfo.company ? ` at ${l.jobInfo.company}` : ""}` : ""}`).join("\n") || "None"}
Job links: ${(links as any[]).filter((l: any) => l.jobInfo?.role).map((l: any) => `${l.jobInfo.role}${l.jobInfo.skills?.length ? ` [${l.jobInfo.skills.join(", ")}]` : ""}`).join(", ") || "None"}

=== CAPABILITIES ===
You can help with:
1. 💬 CRAFT MESSAGES — When asked to craft/write a message to someone, write a natural, polite message. If it's about money, include exact amounts from the finance data.
2. 💰 FINANCE ADVICE — Track spending, remind about debts, suggest budgets
3. 🎬 RECOMMENDATIONS — Movies, restaurants, recipes based on likes/dislikes
4. 📝 SUMMARIES — Summarize notes, recall info from any category
5. 🔔 REMINDERS — Help track what's due, what's overdue
6. 🔗 LINKS — Recall saved links, job searches, bookmarks
7. 🧠 ANYTHING — You're the second brain. Help with literally anything.

Be concise but helpful. Use Hindi words casually if context feels Indian (like "bhai", "yaar"). Format money as ₹.`;

  const aiResponse = await chatWithAI(message, context);

  // Save chat history
  let chat;
  if (chatId) {
    chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { $push: { messages: [
        { role: "user", content: message },
        { role: "ai", content: aiResponse },
      ] } },
      { new: true }
    );
  } else {
    chat = await Chat.create({
      userId, contextType: "general",
      messages: [
        { role: "user", content: message },
        { role: "ai", content: aiResponse },
      ],
    });
  }

  return NextResponse.json({ response: aiResponse, chatId: chat._id });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const chats = await Chat.find({ userId: (session.user as any).id }).sort({ createdAt: -1 }).limit(20);
  return NextResponse.json(chats);
}
