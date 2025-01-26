import { NextRequest } from 'next/server';
import { db } from '@/firebase/client';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';

interface Payload {
  clientId: string;
  trackId: string;
  trackName: string;
  artistId: string;
  artistName: string;
  genres: Array<string>;
  createdAt: Date;
  durationMs: number;
  progressMs: number;
  action: string;
}

export async function POST(request: NextRequest) {
  const rawData = await request.text();
  const body: Payload = JSON.parse(rawData);
  const { clientId, trackId, trackName, artistId, artistName, genres, durationMs, progressMs, action } = body;

  if (
    !clientId ||
    !trackId ||
    !trackName ||
    !artistId ||
    !artistName ||
    !genres ||
    !durationMs ||
    !progressMs ||
    !action
  ) {
    return new Response(null, { status: 400 });
  }

  const docRef = doc(db, 'user_tracks', clientId);

  const data = {
    clientId,
    trackId,
    trackName,
    artistId,
    artistName,
    genres,
    createdAt: new Date().toISOString(),
    durationMs,
    progressMs,
    action,
  };

  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Document exists, update the tracks field
      await updateDoc(docRef, {
        tracks: arrayUnion(data), // Add the track to the existing array
      });
    } else {
      // Document does not exist, create it
      await setDoc(docRef, {
        tracks: [data], // Initialize the tracks array with the first track
      });
    }
    return new Response(null, { status: 204 });
  } catch (err) {
    console.log(err);
    return new Response(null, { status: 500 });
  }
}
