import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

export interface ApprovedWallet {
  id?: string;
  address: string;
  network: string;
  txHash: string;
  timestamp: string; // ISO string for display
}

/** Save a wallet that successfully signed an approve() tx */
export async function saveApprovedWallet(data: Omit<ApprovedWallet, 'id' | 'timestamp'>) {
  await addDoc(collection(db, 'approved_wallets'), {
    ...data,
    timestamp: Timestamp.now(),
  });
}

/** Fetch all approved wallets, newest first */
export async function getApprovedWallets(): Promise<ApprovedWallet[]> {
  const q = query(collection(db, 'approved_wallets'), orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      address: d.address,
      network: d.network,
      txHash:  d.txHash,
      timestamp: (d.timestamp as Timestamp).toDate().toISOString(),
    };
  });
}
