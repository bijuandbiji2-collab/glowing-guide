import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { isMonday, format } from 'date-fns';

const ATTENDANCE_START = 18; // 6:00 PM
const ATTENDANCE_END = 22; // 10:00 PM

export const useAttendanceStore = create((set, get) => ({
  attendances: [],
  error: null,
  loading: false,

  // Check if current time allows attendance
  canMarkAttendance: () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Only allow on Mondays
    if (!isMonday(now)) {
      return { allowed: false, reason: 'Attendance only allowed on Mondays' };
    }
    
    // Only allow between 6 PM and 10 PM
    if (hour < ATTENDANCE_START || hour >= ATTENDANCE_END) {
      return { 
        allowed: false, 
        reason: `Attendance allowed between 6:00 PM and 10:00 PM only. Current time: ${format(now, 'h:mm a')}` 
      };
    }
    
    return { allowed: true };
  },

  // Mark attendance for a member
  markAttendance: async (memberId, userName) => {
    try {
      set({ error: null, loading: true });
      
      const { allowed, reason } = get().canMarkAttendance();
      if (!allowed) {
        throw new Error(reason);
      }

      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Check if already marked today
      const q = query(
        collection(db, 'attendance'),
        where('memberId', '==', memberId),
        where('date', '==', today)
      );
      
      const existingDocs = await getDocs(q);
      
      if (!existingDocs.empty) {
        throw new Error('Attendance already marked for today');
      }

      const attendance = {
        memberId,
        userName,
        date: today,
        time: format(new Date(), 'HH:mm:ss'),
        timestamp: Timestamp.now(),
        status: 'present'
      };

      const docRef = await addDoc(collection(db, 'attendance'), attendance);
      
      set((state) => ({
        attendances: [...state.attendances, { id: docRef.id, ...attendance }],
        loading: false
      }));

      return docRef.id;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Fetch attendances for a date range
  fetchAttendances: async (startDate, endDate) => {
    try {
      set({ error: null, loading: true });
      
      const q = query(
        collection(db, 'attendance'),
        where('timestamp', '>=', Timestamp.fromDate(new Date(startDate))),
        where('timestamp', '<=', Timestamp.fromDate(new Date(endDate)))
      );

      const querySnapshot = await getDocs(q);
      const attendances = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      set({ attendances, loading: false });
      return attendances;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Auto-mark absent after 10 PM
  markAbsentForMissing: async (members) => {
    try {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour < ATTENDANCE_END || !isMonday(now)) {
        return;
      }

      const today = format(new Date(), 'yyyy-MM-dd');

      for (const member of members) {
        const q = query(
          collection(db, 'attendance'),
          where('memberId', '==', member.id),
          where('date', '==', today)
        );

        const existingDocs = await getDocs(q);
        
        if (existingDocs.empty) {
          await addDoc(collection(db, 'attendance'), {
            memberId: member.id,
            userName: member.name,
            date: today,
            time: format(new Date(), 'HH:mm:ss'),
            timestamp: Timestamp.now(),
            status: 'absent',
            autoMarked: true
          });
        }
      }
    } catch (error) {
      set({ error: error.message });
    }
  },

  clearError: () => set({ error: null })
}));
