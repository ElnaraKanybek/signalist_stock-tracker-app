'use server';

import { connectToDatabase } from "@/database/mongoose";
import {Watchlist} from "@/database/models/watchlist.model";

export async function  getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Mongoose connection not connected");

    // Find user by email in the 'users' collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string}>(
        { email: email}
    );

    if (!user) return [];

    // Get user ID. Better Auth usually puts it in 'id'.
    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1}).lean();
    return items.map((i : { symbol: string }) => String(i.symbol));

  } catch (e) {
    console.error('Error fetching watchlist for email:', email, e);
    return [];
  }
};
