import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Group from "@/lib/models/Group";
import GroupExpense from "@/lib/models/GroupExpense";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { id } = params;
  const updates = await req.json();
  
  await dbConnect();
  
  const updatedGroup = await Group.findOneAndUpdate(
    { _id: id, ownerId: (session.user as any).id },
    updates,
    { new: true }
  );
  
  if (!updatedGroup) return NextResponse.json({ error: "Group not found or unauthorized" }, { status: 404 });
  
  return NextResponse.json(updatedGroup);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { id } = params;
  await dbConnect();
  
  const deletedGroup = await Group.findOneAndDelete({ _id: id, ownerId: (session.user as any).id });
  
  if (deletedGroup) {
      // Also delete all expenses for this group
      await GroupExpense.deleteMany({ groupId: id });
  }
  
  return NextResponse.json({ message: "Group and its expenses deleted" });
}
