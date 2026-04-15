import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Group from "@/lib/models/Group";
import GroupExpense from "@/lib/models/GroupExpense";

export async function GET(req: Request, { params }: { params: { shareToken: string } }) {
  await dbConnect();
  const { shareToken } = params;
  
  const group = await Group.findOne({ shareToken });
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  
  const expenses = await GroupExpense.find({ groupId: group._id }).sort({ date: -1 });
  
  return NextResponse.json(expenses);
}

export async function POST(req: Request, { params }: { params: { shareToken: string } }) {
  await dbConnect();
  const { shareToken } = params;
  
  const group = await Group.findOne({ shareToken });
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  const body = await req.json();
  const { description, amount, paidBy, splitAmong } = body;

  if (!description || !amount || !paidBy || !splitAmong || splitAmong.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const newExpense = await GroupExpense.create({
      groupId: group._id,
      description,
      amount: Number(amount),
      paidBy,
      splitAmong,
      date: new Date()
  });

  return NextResponse.json(newExpense, { status: 201 });
}
