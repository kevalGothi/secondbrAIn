import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Movie from "@/lib/models/Movie";
import { generateEmbedding, getMovieInfo } from "@/lib/gemini";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const movies = await Movie.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });
  return NextResponse.json(movies);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await dbConnect();
  let movieData = body;
  if (body.fetchInfo) {
    try {
      const info = await getMovieInfo(body.title);
      movieData = { ...body, ...info, title: info.title || body.title };
    } catch (e) {}
  }
  let embedding: number[] = [];
  try { embedding = await generateEmbedding(`${movieData.title} ${movieData.genre?.join(" ") || ""} ${movieData.overview || ""}`); } catch (e) {}
  const movie = await Movie.create({
    ...movieData, userId: (session.user as any).id, embedding,
    status: movieData.status || "watchlist",
  });
  return NextResponse.json(movie, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...updates } = await req.json();
  await dbConnect();
  const movie = await Movie.findOneAndUpdate(
    { _id: id, userId: (session.user as any).id }, updates, { new: true }
  );
  return NextResponse.json(movie);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await dbConnect();
  await Movie.findOneAndDelete({ _id: id, userId: (session.user as any).id });
  return NextResponse.json({ message: "Deleted" });
}
