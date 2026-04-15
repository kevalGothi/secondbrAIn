import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processVoiceText, getMovieInfo, getRestaurantInfo, getRecipeInfo, generateEmbedding, getRecommendations, craftMessage, analyzeLinkWithAI } from "@/lib/gemini";
import dbConnect from "@/lib/mongodb";
import Movie from "@/lib/models/Movie";
import Restaurant from "@/lib/models/Restaurant";
import Recipe from "@/lib/models/Recipe";
import Note from "@/lib/models/Note";
import Reminder from "@/lib/models/Reminder";
import Finance from "@/lib/models/Finance";
import LinkModel from "@/lib/models/Link";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { text } = await req.json();
  const userId = (session.user as any).id;
  await dbConnect();

  let result: any = {};

  try {
    const parsed = await processVoiceText(text);
    result = { parsed };

    try {
      switch (parsed.intent) {
        case "add_movie": {
          const info = await getMovieInfo(parsed.itemName);
          let embedding: number[] = [];
          try { embedding = await generateEmbedding(`${info.title} ${info.genre?.join(" ")} ${info.overview}`); } catch {}
          const movie = await Movie.create({
            ...info, userId, embedding,
            liked: parsed.sentiment === "positive",
            disliked: parsed.sentiment === "negative",
            status: parsed.sentiment === "positive" ? "watched" : "watchlist",
          });
          result = { ...result, created: movie, type: "movie", message: `Added "${info.title}" to your movies!` };
          break;
        }
        case "add_restaurant": {
          const info = await getRestaurantInfo(parsed.itemName);
          let embedding: number[] = [];
          try { embedding = await generateEmbedding(`${info.name} ${info.cuisine?.join(" ")} ${info.overview}`); } catch {}
          const restaurant = await Restaurant.create({
            ...info, userId, embedding,
            liked: parsed.sentiment === "positive",
            disliked: parsed.sentiment === "negative",
          });
          result = { ...result, created: restaurant, type: "restaurant", message: `Added "${info.name}" to your restaurants!` };
          break;
        }
        case "add_recipe": {
          const info = await getRecipeInfo(parsed.itemName);
          let embedding: number[] = [];
          try { embedding = await generateEmbedding(`${info.title} ${info.cuisine} ${info.ingredients?.join(" ")}`); } catch {}
          const recipe = await Recipe.create({ ...info, userId, embedding });
          result = { ...result, created: recipe, type: "recipe", message: `Added "${info.title}" to your recipes!` };
          break;
        }
        case "add_note": {
          let embedding: number[] = [];
          try { embedding = await generateEmbedding(parsed.itemName + " " + parsed.details); } catch {}
          const note = await Note.create({
            title: parsed.itemName, text: parsed.details || parsed.itemName,
            userId, embedding, category: parsed.category,
          });
          result = { ...result, created: note, type: "note", message: `Note saved!` };
          break;
        }
        case "set_reminder": {
          let recommendations: string[] = [];
          try { recommendations = await getRecommendations(parsed.category, [parsed.itemName], []); } catch {}
          const reminder = await Reminder.create({
            userId, type: parsed.category, title: parsed.itemName,
            description: parsed.details || `Reminder to check out ${parsed.itemName}`,
            recommendations, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
          result = { ...result, created: reminder, type: "reminder", message: `Reminder set for "${parsed.itemName}"!`, recommendations };
          break;
        }
        case "add_finance": {
          const fd = parsed.financeData;
          const dueDate = fd?.daysUntilDue
            ? new Date(Date.now() + fd.daysUntilDue * 24 * 60 * 60 * 1000)
            : undefined;
          const finance = await Finance.create({
            userId,
            type: fd?.type || "sent",
            amount: fd?.amount || 0,
            person: fd?.person || "",
            description: fd?.description || parsed.details || "",
            category: "general",
            dueDate,
          });
          const typeLabels: Record<string, string> = {
            sent: "sent to", received: "received from", lent: "lent to",
            borrowed: "borrowed from", expense: "spent on", income: "earned from",
          };
          result = {
            ...result, created: finance, type: "finance",
            message: `₹${fd?.amount} ${typeLabels[fd?.type] || fd?.type} ${fd?.person || fd?.description || ""}${dueDate ? ` (due ${dueDate.toLocaleDateString('en-IN')})` : ""}`,
          };
          break;
        }
        case "craft_message": {
          const md = parsed.messageData;
          const finances = await Finance.find({ userId, person: { $regex: md?.recipient || "", $options: "i" }, isSettled: false }).lean();
          let financeContext = "";
          if (finances.length > 0) {
            financeContext = finances.map((f: any) => `${f.type} ₹${f.amount} on ${new Date(f.createdAt).toLocaleDateString('en-IN')}`).join(", ");
          }
          const message = await craftMessage(
            md?.recipient || parsed.itemName,
            md?.topic || parsed.details || "general follow-up",
            md?.tone || "polite",
            financeContext ? `Financial history with ${md?.recipient}: ${financeContext}` : undefined
          );
          result = { ...result, type: "message", message: `📝 Crafted message for ${md?.recipient}:`, craftedMessage: message };
          break;
        }
        case "save_link": {
          const ld = parsed.linkData;
          const linkUrl = ld?.url || "";
          if (!linkUrl) {
            result = { ...result, message: "I need a URL to save. Try: 'Save this link https://...'" };
            break;
          }
          const analysis = await analyzeLinkWithAI(linkUrl, ld?.context || parsed.details);
          let embedding: number[] = [];
          try { embedding = await generateEmbedding(`${analysis.title} ${analysis.description} ${analysis.aiSummary}`); } catch {}
          const savedLink = await LinkModel.create({
            userId, url: linkUrl, ...analysis,
            jobInfo: analysis.isJobRelated ? analysis.jobInfo : undefined,
            userNote: ld?.context || parsed.details || "",
            embedding,
          });
          const jobMsg = analysis.isJobRelated && analysis.jobInfo?.role ? ` — Job: ${analysis.jobInfo.role}${analysis.jobInfo.company ? ` at ${analysis.jobInfo.company}` : ""}` : "";
          result = { ...result, created: savedLink, type: "link", message: `🔗 Saved! "${analysis.title}"${jobMsg}` };
          break;
        }
        default:
          result = { ...result, message: `I understood: "${text}". Try: "Save this link https://...", "500 rs sent to Manoj", "I liked YJHD"` };
      }
    } catch (e: any) {
      const isRateLimit = e?.status === 429 || e?.message?.includes("429");
      result = { ...result, message: isRateLimit
        ? "⏳ AI is busy right now (rate limit). Wait a few seconds and try again!"
        : `Processed your input but had an issue: ${e.message}` };
    }
  } catch (e: any) {
    const isRateLimit = e?.status === 429 || e?.message?.includes("429");
    result = {
      message: isRateLimit
        ? "⏳ AI is busy right now (rate limit). Please wait 10-15 seconds and try again!"
        : `Failed to process: ${e.message}. Please try again.`,
    };
  }

  return NextResponse.json(result);
}

