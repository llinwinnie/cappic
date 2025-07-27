import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Moment } from '../types';

// Collection name
const MOMENTS_COLLECTION = 'moments';

// Add a new moment
export const addMoment = async (moment: Omit<Moment, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, MOMENTS_COLLECTION), {
      ...moment,
      timestamp: Timestamp.fromDate(new Date(moment.timestamp)),
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding moment:', error);
    throw error;
  }
};

// Get all moments for a user
export const getMoments = async (userId: string): Promise<Moment[]> => {
  try {
    const q = query(
      collection(db, MOMENTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const moments: Moment[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      moments.push({
        id: doc.id,
        timestamp: data.timestamp.toDate().getTime(),
        imageUrl: data.imageUrl,
        note: data.note,
        tags: data.tags,
        mood: data.mood,
        userId: data.userId
      });
    });
    
    return moments;
  } catch (error) {
    console.error('Error getting moments:', error);
    throw error;
  }
};

// Delete a moment
export const deleteMoment = async (momentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, MOMENTS_COLLECTION, momentId));
  } catch (error) {
    console.error('Error deleting moment:', error);
    throw error;
  }
};

// Update a moment
export const updateMoment = async (momentId: string, updates: Partial<Moment>): Promise<void> => {
  try {
    const docRef = doc(db, MOMENTS_COLLECTION, momentId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating moment:', error);
    throw error;
  }
};

// Upload image to Firebase Storage
export const uploadImage = async (file: File, userId: string): Promise<string> => {
  try {
    const fileName = `${userId}/${Date.now()}_${file.name}`;
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

// Search moments
export const searchMoments = async (
  userId: string, 
  searchTerm: string, 
  filter?: string
): Promise<Moment[]> => {
  try {
    let q = query(
      collection(db, MOMENTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const moments: Moment[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const moment = {
        id: doc.id,
        timestamp: data.timestamp.toDate().getTime(),
        imageUrl: data.imageUrl,
        note: data.note,
        tags: data.tags,
        mood: data.mood,
        userId: data.userId
      };
      
      // Apply search filter
      const matchesSearch = !searchTerm || 
        moment.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        moment.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Apply mood/tag filter
      const matchesFilter = !filter || 
        moment.mood === filter || 
        moment.tags?.includes(filter);
      
      if (matchesSearch && matchesFilter) {
        moments.push(moment);
      }
    });
    
    return moments;
  } catch (error) {
    console.error('Error searching moments:', error);
    throw error;
  }
}; 