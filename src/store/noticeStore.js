import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useNoticeStore = create((set, get) => ({
  notices: [],
  error: null,
  loading: false,

  // Create notice
  createNotice: async (noticeData, userId) => {
    try {
      set({ error: null, loading: true });

      const newNotice = {
        ...noticeData,
        createdBy: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'notices'), newNotice);
      
      set((state) => ({
        notices: [{ id: docRef.id, ...newNotice }, ...state.notices],
        loading: false
      }));

      return docRef.id;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update notice
  updateNotice: async (noticeId, updates) => {
    try {
      set({ error: null, loading: true });
      
      const noticeRef = doc(db, 'notices', noticeId);
      await updateDoc(noticeRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      set((state) => ({
        notices: state.notices.map(n => 
          n.id === noticeId ? { ...n, ...updates } : n
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete notice
  deleteNotice: async (noticeId) => {
    try {
      set({ error: null, loading: true });
      
      await deleteDoc(doc(db, 'notices', noticeId));

      set((state) => ({
        notices: state.notices.filter(n => n.id !== noticeId),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Fetch all notices
  fetchNotices: async () => {
    try {
      set({ error: null, loading: true });
      
      const q = query(
        collection(db, 'notices'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const notices = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      set({ notices, loading: false });
      return notices;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));
