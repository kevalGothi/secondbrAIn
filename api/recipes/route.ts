import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Recipe from "@/lib/models/Recipe";
import { generateEmbedding, getRecipeInfo } from "@/lib/gemini";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const recipes = await Recipe.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });
  return NextResponse.json(recipes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await dbConnect();
  let data = body;
  if (body.fetchInfo) {
    try {
      const info = await getRecipeInfo(body.title);
      data = { ...body, ...info };
    } catch (e) {}
  }
  let embedding: number[] = [];
  try { embedding = await generateEmbedding(`${data.title} ${data.cuisine || ""} ${data.ingredients?.join(" ") || ""}`); } catch (e) {}
  const recipe = await Recipe.create({
    ...data, userId: (session.user as any).id, embedding,
  });
  return NextResponse.json(recipe, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...updates } = await req.json();
  await dbConnect();
  const recipe = await Recipe.findOneAndUpdate(
    { _id: id, userId: (session.user as any).id }, updates, { new: true }
  );
  return NextResponse.json(recipe);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await dbConnect();
  await Recipe.findOneAndDelete({ _id: id, userId: (session.user as any).id });
  return NextResponse.json({ message: "Deleted" });
}
