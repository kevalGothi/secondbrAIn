import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Link from "@/lib/models/Link";
import { generateEmbedding, analyzeLinkWithAI } from "@/lib/gemini";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const links = await Link.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });
  return NextResponse.json(links);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await dbConnect();

  let linkData = { ...body };

  // AI analysis
  if (body.url) {
    try {
      const analysis = await analyzeLinkWithAI(body.url, body.userNote || body.context);
      linkData = {
        ...linkData,
        title: body.title || analysis.title,
        description: analysis.description,
        platform: analysis.platform,
        category: body.category || analysis.category,
        tags: analysis.tags || [],
        aiSummary: analysis.aiSummary,
        jobInfo: analysis.isJobRelated ? analysis.jobInfo : undefined,
      };
    } catch (e) {
      // If AI fails, detect platform from URL at minimum
      linkData.platform = detectPlatform(body.url);
    }
  }

  // Generate embedding for vector search
  let embedding: number[] = [];
  try {
    const embeddingText = `${linkData.title || ""} ${linkData.description || ""} ${linkData.aiSummary || ""} ${linkData.userNote || ""} ${linkData.tags?.join(" ") || ""}`;
    embedding = await generateEmbedding(embeddingText);
  } catch (e) {}

  const link = await Link.create({
    ...linkData,
    userId: (session.user as any).id,
    embedding,
  });

  return NextResponse.json(link, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...updates } = await req.json();
  await dbConnect();
  const link = await Link.findOneAndUpdate(
    { _id: id, userId: (session.user as any).id }, updates, { new: true }
  );
  return NextResponse.json(link);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await dbConnect();
  await Link.findOneAndDelete({ _id: id, userId: (session.user as any).id });
  return NextResponse.json({ message: "Deleted" });
}

function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("github.com")) return "github";
  if (u.includes("reddit.com")) return "reddit";
  if (u.includes("medium.com")) return "medium";
  return "website";
}
