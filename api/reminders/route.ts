import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Reminder from "@/lib/models/Reminder";
import { getRecommendations } from "@/lib/gemini";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const reminders = await Reminder.find({ userId: (session.user as any).id }).sort({ dueDate: 1 });
  return NextResponse.json(reminders);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await dbConnect();
  let recommendations: string[] = [];
  if (body.type && body.title) {
    try { recommendations = await getRecommendations(body.type, [body.title], []); } catch (e) {}
  }
  const reminder = await Reminder.create({
    ...body, userId: (session.user as any).id, recommendations,
    dueDate: body.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return NextResponse.json(reminder, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...updates } = await req.json();
  await dbConnect();
  const reminder = await Reminder.findOneAndUpdate(
    { _id: id, userId: (session.user as any).id }, updates, { new: true }
  );
  return NextResponse.json(reminder);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await dbConnect();
  await Reminder.findOneAndDelete({ _id: id, userId: (session.user as any).id });
  return NextResponse.json({ message: "Deleted" });
}
