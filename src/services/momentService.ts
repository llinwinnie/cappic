import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Moment } from '../types';

// Add a new moment to Firestore
export const addMoment = async (moment: Omit<Moment, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'moments'), {
      ...moment,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding moment:', error);
    throw error;
  }
};

// Get all moments for a user
export const getMoments = async (userId: string = 'local-user'): Promise<Moment[]> => {
  try {
    const q = query(
      collection(db, 'moments'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toMillis() || doc.data().timestamp,
      createdAt: doc.data().createdAt?.toMillis() || doc.data().createdAt
    })) as Moment[];
  } catch (error) {
    console.error('Error getting moments:', error);
    return [];
  }
};

// Delete a moment
export const deleteMoment = async (momentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'moments', momentId));
  } catch (error) {
    console.error('Error deleting moment:', error);
    throw error;
  }
};

// Update a moment
export const updateMoment = async (momentId: string, updates: Partial<Moment>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'moments', momentId), {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating moment:', error);
    throw error;
  }
};

// Upload image to Firebase Storage
export const uploadImage = async (file: File, userId: string): Promise<string> => {
  try {
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Delete image from Firebase Storage
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Search moments by text
export const searchMoments = async (
  searchTerm: string, 
  filter?: string, 
  userId: string = 'local-user'
): Promise<Moment[]> => {
  try {
    const moments = await getMoments(userId);
    
    return moments.filter(moment => {
      // Apply search filter
      const matchesSearch = !searchTerm ||
        moment.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        moment.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Apply mood/tag filter
      const matchesFilter = !filter ||
        moment.mood === filter ||
        moment.tags?.includes(filter);

      return matchesSearch && matchesFilter;
    });
  } catch (error) {
    console.error('Error searching moments:', error);
    return [];
  }
}; 