import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const useAuthStore = create((set) => ({
  user: null,
  userRole: null,
  loading: true,
  error: null,

  // Login user
  login: async (email, password) => {
    try {
      set({ error: null, loading: true });
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      const userData = userDoc.data();
      
      set({
        user: result.user,
        userRole: userData?.role || 'member',
        loading: false
      });
      
      return result.user;
    } catch (error) {
      set({ 
        error: error.message,
        loading: false 
      });
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, userRole: null });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Initialize auth listener
  initAuthListener: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        set({
          user,
          userRole: userData?.role || 'member',
          loading: false
        });
      } else {
        set({
          user: null,
          userRole: null,
          loading: false
        });
      }
    });
  },

  // Clear error
  clearError: () => set({ error: null })
}));
