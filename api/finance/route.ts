import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Finance from "@/lib/models/Finance";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const records = await Finance.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });
  return NextResponse.json(records);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await dbConnect();
  const record = await Finance.create({
    ...body,
    userId: (session.user as any).id,
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
  });
  return NextResponse.json(record, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...updates } = await req.json();
  await dbConnect();
  const record = await Finance.findOneAndUpdate(
    { _id: id, userId: (session.user as any).id }, updates, { new: true }
  );
  return NextResponse.json(record);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await dbConnect();
  await Finance.findOneAndDelete({ _id: id, userId: (session.user as any).id });
  return NextResponse.json({ message: "Deleted" });
}
