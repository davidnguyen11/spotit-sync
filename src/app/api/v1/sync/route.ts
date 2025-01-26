import { NextRequest } from 'next/server';
import { db } from '@/firebase/client';
import { doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';

interface Payload {
  clientId: string;
  trackId: string;
  trackName: string;
  artistId: string;
  artistName: string;
  genres: Array<string>;
  created_at: Date;
}

export async function POST(request: NextRequest) {
  const rawData = await request.text();
  const body: Payload = JSON.parse(rawData);
  const { clientId, trackId, trackName, artistId, artistName, genres } = body;

  if (!clientId || !trackId || !trackName || !artistId || !artistName || !genres) {
    return new Response(null, { status: 400 });
  }

  const docRef = doc(db, 'user_tracks', 'all_tracks'); // You can name this document "all_tracks"

  const data = {
    clientId,
    trackId,
    trackName,
    artistId,
    artistName,
    genres,
    created_at: new Date().toISOString(),
  };

  try {
    // Try updating the array field with arrayUnion
    await updateDoc(docRef, {
      tracks: arrayUnion(data), // Add the new track to the "tracks" array
    });
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    // @ts-expect-error error is unknown
    if (error.code === 'not-found') {
      // If the document doesn't exist, create it with the initial array
      await setDoc(docRef, {
        tracks: [data], // Initialize the "tracks" array with the first track
      });
      return new Response(null, { status: 204 });
    } else {
      return new Response(null, { status: 500 });
    }
  }
}
