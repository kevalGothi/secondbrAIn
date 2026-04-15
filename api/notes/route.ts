import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Note from "@/lib/models/Note";
import { generateEmbedding } from "@/lib/gemini";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const notes = await Note.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });
  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, text, tags, category } = await req.json();
  await dbConnect();
  let embedding: number[] = [];
  try { embedding = await generateEmbedding(`${title || ""} ${text}`); } catch (e) {}
  const note = await Note.create({
    title: title || text.substring(0, 50),
    text, tags: tags || [], category: category || "general",
    userId: (session.user as any).id, embedding,
  });
  return NextResponse.json(note, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await dbConnect();
  await Note.findOneAndDelete({ _id: id, userId: (session.user as any).id });
  return NextResponse.json({ message: "Deleted" });
}
