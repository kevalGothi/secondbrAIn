import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import DocumentModel from "@/lib/models/Document";
import { generateEmbedding } from "@/lib/gemini";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const docs = await DocumentModel.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });
  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, description, content, tags } = await req.json();
  await dbConnect();
  let embedding: number[] = [];
  try { embedding = await generateEmbedding(`${title} ${description || ""} ${content || ""}`); } catch (e) {}
  const doc = await DocumentModel.create({
    title, description: description || "", content: content || "",
    tags: tags || [], userId: (session.user as any).id, embedding,
  });
  return NextResponse.json(doc, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await dbConnect();
  await DocumentModel.findOneAndDelete({ _id: id, userId: (session.user as any).id });
  return NextResponse.json({ message: "Deleted" });
}
