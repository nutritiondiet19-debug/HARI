import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// ─── User Profiles ───────────────────────────────────────────────
export const saveUserProfile = async (uid, profileData) => {
  await setDoc(doc(db, 'user_profiles', uid), {
    ...profileData,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'user_profiles', uid));
  return snap.exists() ? snap.data() : null;
};

// ─── Diet Logs ───────────────────────────────────────────────────
export const addDietLog = async (uid, logData) => {
  await addDoc(collection(db, 'diet_logs'), {
    userId: uid,
    ...logData,
    date: logData.date || getTodayDateStr(),
    timestamp: serverTimestamp(),
  });
};

export const getDietLogsByDate = async (uid, dateStr) => {
  const q = query(
    collection(db, 'diet_logs'),
    where('userId', '==', uid),
    where('date', '==', dateStr),
    orderBy('timestamp', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── Water Logs ──────────────────────────────────────────────────
export const addWaterLog = async (uid, amount) => {
  await addDoc(collection(db, 'water_logs'), {
    userId: uid,
    amount,
    date: getTodayDateStr(),
    timestamp: serverTimestamp(),
  });
};

export const getWaterLogByDate = async (uid, dateStr) => {
  const q = query(
    collection(db, 'water_logs'),
    where('userId', '==', uid),
    where('date', '==', dateStr)
  );
  const snap = await getDocs(q);
  let total = 0;
  snap.docs.forEach(d => { total += d.data().amount || 0; });
  return total;
};

// ─── Workout Logs ────────────────────────────────────────────────
export const addWorkoutLog = async (uid, workoutData) => {
  await addDoc(collection(db, 'workout_logs'), {
    userId: uid,
    ...workoutData,
    date: getTodayDateStr(),
    timestamp: serverTimestamp(),
  });
};

export const getWorkoutLogsByDate = async (uid, dateStr) => {
  const q = query(
    collection(db, 'workout_logs'),
    where('userId', '==', uid),
    where('date', '==', dateStr)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── Weekly Stats ──────────────────────────────────────────────
export const getWeeklyCalories = async (uid) => {
  const dates = getLast7Days();
  const promises = dates.map(d => getDietLogsByDate(uid, d));
  const results = await Promise.all(promises);
  return dates.map((date, i) => ({
    date,
    calories: results[i].reduce((sum, log) => sum + (log.calories || 0), 0),
  }));
};

// ─── Helpers ─────────────────────────────────────────────────────
export const getTodayDateStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return days;
};
