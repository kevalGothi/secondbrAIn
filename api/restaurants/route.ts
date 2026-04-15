import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Restaurant from "@/lib/models/Restaurant";
import { generateEmbedding, getRestaurantInfo } from "@/lib/gemini";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const restaurants = await Restaurant.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });
  return NextResponse.json(restaurants);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await dbConnect();
  let data = body;
  if (body.fetchInfo) {
    try {
      const info = await getRestaurantInfo(body.name, body.location);
      data = { ...body, ...info };
    } catch (e) {}
  }
  let embedding: number[] = [];
  try { embedding = await generateEmbedding(`${data.name} ${data.cuisine?.join(" ") || ""} ${data.overview || ""}`); } catch (e) {}
  const restaurant = await Restaurant.create({
    ...data, userId: (session.user as any).id, embedding,
  });
  return NextResponse.json(restaurant, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...updates } = await req.json();
  await dbConnect();
  const restaurant = await Restaurant.findOneAndUpdate(
    { _id: id, userId: (session.user as any).id }, updates, { new: true }
  );
  return NextResponse.json(restaurant);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await dbConnect();
  await Restaurant.findOneAndDelete({ _id: id, userId: (session.user as any).id });
  return NextResponse.json({ message: "Deleted" });
}
