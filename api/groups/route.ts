import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Group from "@/lib/models/Group";

// Helper function to generate a random share token
function generateShareToken(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  
  const groups = await Group.find({ ownerId: (session.user as any).id }).sort({ createdAt: -1 });
  return NextResponse.json(groups);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  
  await dbConnect();
  
  const userName = session.user.name || "Owner";
  let initialMembers = body.members || [];
  if (!initialMembers.includes(userName)) {
      initialMembers.push(userName);
  }
  
  const newGroup = await Group.create({
    name: body.name,
    members: initialMembers,
    ownerId: (session.user as any).id,
    shareToken: generateShareToken(),
  });
  
  return NextResponse.json(newGroup, { status: 201 });
}
