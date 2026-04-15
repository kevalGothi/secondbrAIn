import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Group from "@/lib/models/Group";
import GroupExpense from "@/lib/models/GroupExpense";

export async function PUT(req: Request, { params }: { params: { shareToken: string; expenseId: string } }) {
  await dbConnect();
  const { shareToken, expenseId } = params;

  const group = await Group.findOne({ shareToken });
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  const body = await req.json();
  const { description, amount, paidBy, splitAmong } = body;

  if (!description || !amount || !paidBy || !splitAmong || splitAmong.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const updatedExpense = await GroupExpense.findOneAndUpdate(
    { _id: expenseId, groupId: group._id },
    { description, amount: Number(amount), paidBy, splitAmong },
    { new: true }
  );

  if (!updatedExpense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

  return NextResponse.json(updatedExpense);
}

export async function DELETE(req: Request, { params }: { params: { shareToken: string; expenseId: string } }) {
  await dbConnect();
  const { shareToken, expenseId } = params;

  const group = await Group.findOne({ shareToken });
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  const deletedExpense = await GroupExpense.findOneAndDelete({ _id: expenseId, groupId: group._id });
  
  if (!deletedExpense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

  return NextResponse.json({ message: "Expense deleted" });
}
