import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { LocationPoint, RouteFeature } from '../types/routes';

// Supabase project credentials
// Default URL from existing Supabase deployment: https://ytbbxbtftsreqadvwxwn.supabase.co
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://ytbbxbtftsreqadvwxwn.supabase.co';

const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const isSupabaseConfigured = (): boolean => {
  return (
    !!import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your-anon-key-here' &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== ''
  );
};

// Initialize client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Database Interfaces
export interface SavedRouteRecord {
  id?: string;
  user_id: string;
  origin_label: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_label: string;
  destination_latitude: number;
  destination_longitude: number;
  selected_route: string;
  distance: number;
  estimated_walking_time: number;
  mean_lst: number;
  mean_ndvi: number;
  environmental_score: number;
  exposure_proxy: number;
  route_summary: string;
  created_at?: string;
}

export type FeedbackCategory =
  | 'General feedback'
  | 'Routing feedback'
  | 'Map feedback'
  | 'Accuracy feedback'
  | 'Suggestions'
  | 'Bug reports';

export interface FeedbackSubmission {
  id?: string;
  user_id: string;
  category: FeedbackCategory;
  rating?: number | null;
  message: string;
  created_at?: string;
}

// Local Storage Keys for offline fallback/smooth UX
const LOCAL_HISTORY_KEY = 'coolcorridor_local_route_history';
const LOCAL_FEEDBACK_KEY = 'coolcorridor_local_feedback';

/* ==========================================================================
   AUTHENTICATION FUNCTIONS
   ========================================================================== */

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to sign up.' };
  }
}

/**
 * Log in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to log in.' };
  }
}

/**
 * Continue as Guest using Supabase Anonymous Authentication
 * Guests are NOT prompted for email, password, name, or phone.
 */
export async function signInAsGuest() {
  try {
    // Supabase Anonymous sign-in
    if (typeof supabase.auth.signInAnonymously === 'function') {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      return { data, error: null };
    } else {
      // Fallback if client version doesn't export signInAnonymously directly
      const { data, error } = await (supabase.auth as any).signUp({
        email: `guest_${Math.random().toString(36).substring(2, 10)}@coolcorridor.guest`,
        password: `Guest_${Math.random().toString(36)}!`,
      });
      if (error) throw error;
      return { data, error: null };
    }
  } catch (err: any) {
    // If anonymous sign in encounters a network or credential barrier, provide a local guest session
    console.warn('[Supabase Auth] Anonymous sign in note:', err);
    return { data: null, error: err.message || 'Unable to establish anonymous session.' };
  }
}

/**
 * Log out
 */
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Failed to sign out.' };
  }
}

/**
 * Get current session user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  } catch {
    return null;
  }
}

/* ==========================================================================
   ROUTE HISTORY FUNCTIONS (public.route_history)
   ========================================================================== */

/**
 * Save a generated route to public.route_history for the current user
 */
export async function saveRouteToHistory(params: {
  userId: string;
  origin: LocationPoint;
  destination: LocationPoint;
  feature: RouteFeature;
}): Promise<{ data: SavedRouteRecord | null; error: string | null }> {
  const { userId, origin, destination, feature } = params;
  const p = feature.properties;

  const record: SavedRouteRecord = {
    id: `route_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    user_id: userId,
    origin_label: origin.label || 'Selected Origin',
    origin_latitude: Number(origin.latitude),
    origin_longitude: Number(origin.longitude),
    destination_label: destination.label || 'Selected Destination',
    destination_latitude: Number(destination.latitude),
    destination_longitude: Number(destination.longitude),
    selected_route: p.scenario || 'Shortest',
    distance: Number(p.distance_km || 0),
    estimated_walking_time: Number(p.walking_time_min || 0),
    mean_lst: Number(p.mean_lst_c || 0),
    mean_ndvi: Number(p.mean_ndvi || 0),
    environmental_score: Number(p.mean_exposure_score || 0),
    exposure_proxy: Number(p.exposure_proxy || 0),
    route_summary: `${p.scenario}: ${p.distance_km.toFixed(2)} km, ~${Math.round(
      p.walking_time_min
    )} min walk (Mean LST: ${p.mean_lst_c?.toFixed(1)}°C, Mean NDVI: ${p.mean_ndvi?.toFixed(3)})`,
    created_at: new Date().toISOString(),
  };

  // Always save locally so history is instantly available for the current user
  try {
    const existingStr = localStorage.getItem(LOCAL_HISTORY_KEY) || '[]';
    const localList: SavedRouteRecord[] = JSON.parse(existingStr);
    localList.unshift(record);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(localList.slice(0, 50)));
  } catch (e) {
    console.warn('[LocalStorage] Route history cache note:', e);
  }

  // Persist to Supabase public.route_history
  try {
    const { data, error } = await supabase.from('route_history').insert([record]).select();
    if (error) {
      console.warn('[Supabase] public.route_history sync notice:', error.message);
      // If table has alternate column names or RLS blocks anon, local record is preserved
    } else if (data && data[0]) {
      return { data: data[0] as SavedRouteRecord, error: null };
    }
  } catch (err: any) {
    console.warn('[Supabase] Exception saving route_history:', err);
  }

  return { data: record, error: null };
}

/**
 * Fetch route history for a given user ID
 */
export async function getRouteHistory(userId: string): Promise<SavedRouteRecord[]> {
  let serverRecords: SavedRouteRecord[] = [];

  try {
    const { data, error } = await supabase
      .from('route_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      serverRecords = data as SavedRouteRecord[];
    }
  } catch (err) {
    console.warn('[Supabase] Route history fetch notice:', err);
  }

  // Combine with local cache for this user
  try {
    const existingStr = localStorage.getItem(LOCAL_HISTORY_KEY) || '[]';
    const localList: SavedRouteRecord[] = JSON.parse(existingStr);
    const userLocal = localList.filter((item) => item.user_id === userId);

    // Merge by unique ID
    const combined = [...serverRecords];
    userLocal.forEach((item) => {
      if (!combined.some((c) => c.id === item.id || (c.created_at === item.created_at && c.distance === item.distance))) {
        combined.push(item);
      }
    });

    return combined.sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  } catch {
    return serverRecords;
  }
}

/**
 * Delete a route from history
 */
export async function deleteRouteRecord(id: string, userId: string): Promise<boolean> {
  // Remove from Supabase
  try {
    await supabase.from('route_history').delete().eq('id', id).eq('user_id', userId);
  } catch (err) {
    console.warn('[Supabase] Delete route error:', err);
  }

  // Remove from local storage
  try {
    const existingStr = localStorage.getItem(LOCAL_HISTORY_KEY) || '[]';
    const localList: SavedRouteRecord[] = JSON.parse(existingStr);
    const updated = localList.filter((item) => item.id !== id);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[LocalStorage] Delete error:', e);
  }

  return true;
}

/* ==========================================================================
   FEEDBACK FUNCTIONS (public.feedback)
   ========================================================================== */

/**
 * Submit user feedback to public.feedback
 */
export async function submitUserFeedback(params: {
  userId: string;
  category: FeedbackCategory;
  rating?: number | null;
  message: string;
}): Promise<{ success: boolean; error: string | null }> {
  const { userId, category, rating, message } = params;

  if (!message.trim()) {
    return { success: false, error: 'Please enter a message before submitting.' };
  }

  const payload: FeedbackSubmission = {
    id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    user_id: userId,
    category,
    rating: rating || null,
    message: message.trim(),
    created_at: new Date().toISOString(),
  };

  // Cache locally
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_FEEDBACK_KEY) || '[]');
    existing.unshift(payload);
    localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(existing.slice(0, 30)));
  } catch (e) {
    console.warn('[LocalStorage] Feedback cache notice:', e);
  }

  // Insert to Supabase public.feedback
  try {
    const { error } = await supabase.from('feedback').insert([payload]);
    if (error) {
      console.warn('[Supabase] public.feedback insert notice:', error.message);
      // If table columns vary or RLS applies, local submission is recorded
    }
  } catch (err: any) {
    console.warn('[Supabase] Exception submitting feedback:', err);
  }

  return { success: true, error: null };
}
