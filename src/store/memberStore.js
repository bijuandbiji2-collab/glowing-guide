import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useMemberStore = create((set, get) => ({
  members: [],
  error: null,
  loading: false,
  totalMembers: 0,
  maxMembers: 500,

  // Add new member
  addMember: async (memberData) => {
    try {
      set({ error: null, loading: true });
      
      const { totalMembers, maxMembers } = get();
      if (totalMembers >= maxMembers) {
        throw new Error(`Maximum members (${maxMembers}) reached`);
      }

      const newMember = {
        ...memberData,
        createdAt: new Date(),
        status: 'active'
      };

      const docRef = await addDoc(collection(db, 'members'), newMember);
      
      set((state) => ({
        members: [...state.members, { id: docRef.id, ...newMember }],
        totalMembers: state.members.length + 1,
        loading: false
      }));

      return docRef.id;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update member
  updateMember: async (memberId, updates) => {
    try {
      set({ error: null, loading: true });
      
      const memberRef = doc(db, 'members', memberId);
      await updateDoc(memberRef, updates);

      set((state) => ({
        members: state.members.map(m => 
          m.id === memberId ? { ...m, ...updates } : m
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete member
  deleteMember: async (memberId) => {
    try {
      set({ error: null, loading: true });
      
      await deleteDoc(doc(db, 'members', memberId));

      set((state) => ({
        members: state.members.filter(m => m.id !== memberId),
        totalMembers: state.members.length - 1,
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Fetch all members
  fetchMembers: async () => {
    try {
      set({ error: null, loading: true });
      
      const querySnapshot = await getDocs(collection(db, 'members'));
      const members = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      set({ 
        members, 
        totalMembers: members.length,
        loading: false 
      });
      
      return members;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Search members
  searchMembers: async (searchTerm) => {
    try {
      set({ error: null, loading: true });
      
      const { members } = get();
      const filtered = members.filter(m =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone?.includes(searchTerm)
      );

      set({ loading: false });
      return filtered;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get member by ID
  getMemberById: (memberId) => {
    const { members } = get();
    return members.find(m => m.id === memberId);
  },

  clearError: () => set({ error: null })
}));
