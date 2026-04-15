import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Note from "@/lib/models/Note";
import DocumentModel from "@/lib/models/Document";
import Movie from "@/lib/models/Movie";
import Restaurant from "@/lib/models/Restaurant";
import Recipe from "@/lib/models/Recipe";
import { generateEmbedding } from "@/lib/gemini";

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { query, type } = await req.json();
  const userId = (session.user as any).id;
  await dbConnect();

  const results: any[] = [];

  // Full-text search
  const textSearchFilter = { userId, $text: { $search: query } };
  
  if (!type || type === "all" || type === "notes") {
    try {
      const notes = await Note.find({ userId, $text: { $search: query } }).limit(10);
      notes.forEach((n: any) => results.push({ type: "note", item: n, score: 0.5 }));
    } catch { 
      const notes = await Note.find({ userId, title: { $regex: query, $options: "i" } }).limit(10);
      notes.forEach((n: any) => results.push({ type: "note", item: n, score: 0.3 }));
    }
  }
  if (!type || type === "all" || type === "documents") {
    try {
      const docs = await DocumentModel.find({ userId, $text: { $search: query } }).limit(10);
      docs.forEach((d: any) => results.push({ type: "document", item: d, score: 0.5 }));
    } catch {
      const docs = await DocumentModel.find({ userId, title: { $regex: query, $options: "i" } }).limit(10);
      docs.forEach((d: any) => results.push({ type: "document", item: d, score: 0.3 }));
    }
  }
  if (!type || type === "all" || type === "movies") {
    try {
      const movies = await Movie.find({ userId, $text: { $search: query } }).limit(10);
      movies.forEach((m: any) => results.push({ type: "movie", item: m, score: 0.5 }));
    } catch {
      const movies = await Movie.find({ userId, title: { $regex: query, $options: "i" } }).limit(10);
      movies.forEach((m: any) => results.push({ type: "movie", item: m, score: 0.3 }));
    }
  }
  if (!type || type === "all" || type === "restaurants") {
    try {
      const rests = await Restaurant.find({ userId, $text: { $search: query } }).limit(10);
      rests.forEach((r: any) => results.push({ type: "restaurant", item: r, score: 0.5 }));
    } catch {
      const rests = await Restaurant.find({ userId, name: { $regex: query, $options: "i" } }).limit(10);
      rests.forEach((r: any) => results.push({ type: "restaurant", item: r, score: 0.3 }));
    }
  }
  if (!type || type === "all" || type === "recipes") {
    try {
      const recipes = await Recipe.find({ userId, $text: { $search: query } }).limit(10);
      recipes.forEach((r: any) => results.push({ type: "recipe", item: r, score: 0.5 }));
    } catch {
      const recipes = await Recipe.find({ userId, title: { $regex: query, $options: "i" } }).limit(10);
      recipes.forEach((r: any) => results.push({ type: "recipe", item: r, score: 0.3 }));
    }
  }

  // Vector search - boost scores for semantically similar items
  try {
    const queryEmbedding = await generateEmbedding(query);
    results.forEach((r) => {
      if (r.item.embedding && r.item.embedding.length > 0) {
        const sim = cosineSimilarity(queryEmbedding, r.item.embedding);
        r.score = Math.max(r.score, sim);
      }
    });
  } catch (e) {}

  results.sort((a, b) => b.score - a.score);
  return NextResponse.json(results.slice(0, 20));
}
