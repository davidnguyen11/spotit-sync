import { NextRequest } from 'next/server';
import { db } from '@/firebase/client';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';

interface Payload {
  username: string;
  trackId: string;
  trackName: string;
  artistId: string;
  artistName: string;
  genres: Array<string>;
  createdAt: Date;
  durationMs: number;
  progressMs: number;
  action: string;
  email: string;
  userDisplayName: string;
}

export async function POST(request: NextRequest) {
  const rawData = await request.text();
  const body: Payload = JSON.parse(rawData);
  const { username, trackId, trackName, artistId, artistName, genres, durationMs, progressMs, action, email, userDisplayName } = body;

  if (
    !username ||
    !trackId ||
    !trackName ||
    !artistId ||
    !artistName ||
    !genres ||
    !durationMs ||
    !progressMs ||
    !action ||
    !email ||
    !userDisplayName
  ) {
    return new Response(null, { status: 400 });
  }

  const docRef = doc(db, 'user_tracks', username);
  const userRef = doc(db, 'user_info', username);

  const data = {
    username,
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

    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        user: {
          username,
          email,
          displayName: userDisplayName,
        }
      });
    }

    return new Response(null, { status: 204 });
  } catch (err) {
    console.log(err);
    return new Response(null, { status: 500 });
  }
}
