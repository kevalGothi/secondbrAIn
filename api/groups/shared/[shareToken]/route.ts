import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Group from "@/lib/models/Group";

export async function GET(req: Request, { params }: { params: { shareToken: string } }) {
  await dbConnect();
  
  const { shareToken } = params;
  
  const group = await Group.findOne({ shareToken }).select("name members createdAt shareToken _id");
  
  if (!group) {
    return NextResponse.json({ error: "Group not found or invalid link" }, { status: 404 });
  }
  
  return NextResponse.json(group);
}
