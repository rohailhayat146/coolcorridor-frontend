
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { LocationPoint, RouteFeature } from '../types/routes';

// ============================================================================
// SUPABASE CONFIGURATION
// ============================================================================

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://ytbbxbtftsreqadvwxwn.supabase.co';

const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  'missing-supabase-publishable-key';

export const isSupabaseConfigured = (): boolean => {
  const key =
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string);

  return Boolean(
    SUPABASE_URL &&
      key &&
      key !== 'your-anon-key-here' &&
      key !== 'missing-supabase-publishable-key'
  );
};

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// ============================================================================
// DATABASE INTERFACES
// ============================================================================

/**
 * Matches the public.route_history table.
 *
 * origin_label and destination_label are UI compatibility properties.
 * They are stored inside route_summary, not as separate database columns.
 */
export interface SavedRouteRecord {
  id?: string;
  user_id: string;

  origin_latitude: number | null;
  origin_longitude: number | null;
  destination_latitude: number | null;
  destination_longitude: number | null;

  selected_route: string | null;
  distance_km: number | null;
  walking_minutes: number | null;

  mean_lst_c: number | null;
  mean_ndvi: number | null;
  environmental_score: number | null;
  exposure_proxy: number | null;

  route_summary: Record<string, unknown>;
  created_at?: string;

  origin_label?: string;
  destination_label?: string;

  // Compatibility properties for older UI components.
  distance?: number;
  estimated_walking_time?: number;
  mean_lst?: number;
}

export type FeedbackCategory =
  | 'general'
  | 'routing'
  | 'map'
  | 'accuracy'
  | 'suggestion'
  | 'bug_report';

export interface FeedbackSubmission {
  id?: string;
  user_id: string;
  category: FeedbackCategory;
  rating?: number | null;
  message: string;
  created_at?: string;
}

// ============================================================================
// LOCAL STORAGE
// ============================================================================

const LOCAL_HISTORY_KEY = 'coolcorridor_local_route_history';
const LOCAL_FEEDBACK_KEY = 'coolcorridor_local_feedback';

function getLocalHistory(): SavedRouteRecord[] {
  try {
    const stored = localStorage.getItem(LOCAL_HISTORY_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setLocalHistory(records: SavedRouteRecord[]): void {
  try {
    localStorage.setItem(
      LOCAL_HISTORY_KEY,
      JSON.stringify(records.slice(0, 50))
    );
  } catch (error) {
    console.warn('[LocalStorage] Could not update route history:', error);
  }
}

function getErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const converted = Number(value);

  return Number.isFinite(converted) ? converted : null;
}

// ============================================================================
// ROUTE NORMALIZATION
// ============================================================================

/**
 * Convert the route scenario into one of the values accepted by
 * the route_history selected_route database constraint.
 *
 * Supports:
 * - Lower exposure (lambda=1)
 * - Lower exposure (lambda=2)
 * - Lower exposure (lambda=4)
 * - lambda_1 / lambda_2 / lambda_4
 * - Shortest route
 */
function normalizeRouteType(value: unknown): string | null {
  const scenario = String(value ?? '').trim().toLowerCase();

  if (!scenario) return null;

  if (/lambda[\s_]*=?[\s_]*1\b/.test(scenario)) {
    return 'lambda_1';
  }

  if (/lambda[\s_]*=?[\s_]*2\b/.test(scenario)) {
    return 'lambda_2';
  }

  if (/lambda[\s_]*=?[\s_]*4\b/.test(scenario)) {
    return 'lambda_4';
  }

  if (scenario.includes('shortest')) {
    return 'shortest';
  }

  return null;
}

/**
 * Normalize a Supabase database record for use in the frontend.
 */
function normalizeSavedRoute(record: any): SavedRouteRecord {
  const summary =
    record?.route_summary &&
    typeof record.route_summary === 'object' &&
    !Array.isArray(record.route_summary)
      ? record.route_summary
      : {};

  return {
    ...record,

    route_summary: summary,

    origin_label:
      typeof summary.origin_label === 'string'
        ? summary.origin_label
        : 'Selected Origin',

    destination_label:
      typeof summary.destination_label === 'string'
        ? summary.destination_label
        : 'Selected Destination',

    distance: record.distance_km ?? undefined,
    estimated_walking_time: record.walking_minutes ?? undefined,
    mean_lst: record.mean_lst_c ?? undefined,
  };
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Sign up with email and password.
 */
export async function signUpWithEmail(
  email: string,
  password: string
) {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase is not configured. Check your environment variables.'
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Log in with email and password.
 */
export async function signInWithEmail(
  email: string,
  password: string
) {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase is not configured. Check your environment variables.'
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Continue as Guest using genuine Supabase Anonymous Authentication.
 *
 * A real Supabase UUID is required for route_history and feedback
 * because both tables reference auth.users(id).
 */
export async function signInAsGuest() {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase is not configured. Check your environment variables.'
      );
    }

    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) throw error;

    if (!data.user?.id) {
      throw new Error(
        'Supabase did not return a valid guest user.'
      );
    }

    return { data, error: null };
  } catch (error) {
    console.warn('[Supabase Auth] Anonymous sign-in failed:', error);

    return {
      data: null,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Log out.
 */
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return { error: null };
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
}

/**
 * Get the current authenticated Supabase user.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) return null;

    return data.user ?? null;
  } catch {
    return null;
  }
}

// ============================================================================
// ROUTE HISTORY FUNCTIONS (public.route_history)
// ============================================================================

/**
 * Save a generated route to Supabase.
 *
 * - Uses the exact database column names.
 * - Uses the authenticated Supabase user UUID.
 * - Lets PostgreSQL generate id and created_at.
 * - Stores labels and descriptive information in route_summary.
 * - Returns actual database errors instead of hiding them.
 */
export async function saveRouteToHistory(params: {
  userId: string;
  origin: LocationPoint;
  destination: LocationPoint;
  feature: RouteFeature;
}): Promise<{ data: SavedRouteRecord | null; error: string | null }> {
  const { userId, origin, destination, feature } = params;

  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error:
        'Supabase is not configured. Check your environment variables.',
    };
  }

  try {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError) throw authError;

    const currentUser = authData.user;

    if (!currentUser?.id) {
      return {
        data: null,
        error: 'You must be signed in to save route history.',
      };
    }

    if (currentUser.id !== userId) {
      return {
        data: null,
        error:
          'Your session does not match the account saving this route. Please sign in again.',
      };
    }

    const properties = feature.properties;

    const originLatitude = toNullableNumber(origin.latitude);
    const originLongitude = toNullableNumber(origin.longitude);

    const destinationLatitude = toNullableNumber(
      destination.latitude
    );

    const destinationLongitude = toNullableNumber(
      destination.longitude
    );

    const distanceKm = toNullableNumber(properties.distance_km);

    const walkingMinutes = toNullableNumber(
      properties.walking_time_min
    );

    const meanLst = toNullableNumber(properties.mean_lst_c);
    const meanNdvi = toNullableNumber(properties.mean_ndvi);

    const environmentalScore = toNullableNumber(
      properties.mean_exposure_score
    );

    const exposureProxy = toNullableNumber(
      properties.exposure_proxy
    );

    const selectedRoute = normalizeRouteType(properties.scenario);

    const originLabel = origin.label || 'Selected Origin';
    const destinationLabel =
      destination.label || 'Selected Destination';

    const routeSummary = {
      origin_label: originLabel,
      destination_label: destinationLabel,
      scenario: properties.scenario ?? null,

      description:
        distanceKm !== null && walkingMinutes !== null
          ? `${distanceKm.toFixed(2)} km, approximately ${Math.round(
              walkingMinutes
            )} minutes walking`
          : 'Route details',
    };

    // Only columns defined in public.route_history are inserted.
    const databasePayload = {
      user_id: currentUser.id,

      origin_latitude: originLatitude,
      origin_longitude: originLongitude,

      destination_latitude: destinationLatitude,
      destination_longitude: destinationLongitude,

      selected_route: selectedRoute,

      distance_km: distanceKm,
      walking_minutes: walkingMinutes,

      mean_lst_c: meanLst,
      mean_ndvi: meanNdvi,

      environmental_score: environmentalScore,
      exposure_proxy: exposureProxy,

      route_summary: routeSummary,
    };

    const { data, error } = await supabase
      .from('route_history')
      .insert(databasePayload)
      .select()
      .single();

    if (error) {
      console.error(
        '[Supabase] Route history insert failed:',
        error
      );

      return {
        data: null,
        error:
          error.message ||
          'Could not save route history to Supabase.',
      };
    }

    if (!data) {
      return {
        data: null,
        error:
          'Supabase did not return the saved route record.',
      };
    }

    const savedRecord = normalizeSavedRoute(data);

    // Cache the actual database record using its real Supabase UUID.
    try {
      const existing = getLocalHistory().filter(
        (item) => item.id !== savedRecord.id
      );

      existing.unshift(savedRecord);
      setLocalHistory(existing);
    } catch (error) {
      console.warn(
        '[LocalStorage] Route cache note:',
        error
      );
    }

    return {
      data: savedRecord,
      error: null,
    };
  } catch (error) {
    console.error(
      '[Supabase] Exception saving route history:',
      error
    );

    return {
      data: null,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Fetch route history for the authenticated user.
 */
export async function getRouteHistory(
  userId: string
): Promise<SavedRouteRecord[]> {
  let serverRecords: SavedRouteRecord[] = [];

  try {
    if (!isSupabaseConfigured()) {
      return getLocalHistory().filter(
        (record) => record.user_id === userId
      );
    }

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user?.id) {
      return [];
    }

    if (authData.user.id !== userId) {
      return [];
    }

    const { data, error } = await supabase
      .from('route_history')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(
        '[Supabase] Route history fetch failed:',
        error
      );
    } else if (Array.isArray(data)) {
      serverRecords = data.map(normalizeSavedRoute);
    }
  } catch (error) {
    console.warn(
      '[Supabase] Route history fetch exception:',
      error
    );
  }

  // Merge records from local cache for the same authenticated user.
  try {
    const localRecords = getLocalHistory().filter(
      (record) => record.user_id === userId
    );

    const combined = [...serverRecords];

    for (const localRecord of localRecords) {
      const alreadyExists = combined.some(
        (serverRecord) =>
          serverRecord.id === localRecord.id ||
          (
            serverRecord.created_at === localRecord.created_at &&
            serverRecord.origin_latitude ===
              localRecord.origin_latitude &&
            serverRecord.destination_latitude ===
              localRecord.destination_latitude &&
            serverRecord.origin_longitude ===
              localRecord.origin_longitude &&
            serverRecord.destination_longitude ===
              localRecord.destination_longitude
          )
      );

      if (!alreadyExists) {
        combined.push(localRecord);
      }
    }

    return combined.sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
    );
  } catch (error) {
    console.warn(
      '[LocalStorage] Route history merge failed:',
      error
    );

    return serverRecords;
  }
}

/**
 * Delete a route from history.
 *
 * Only updates the local cache after the Supabase request succeeds.
 */
export async function deleteRouteRecord(
  id: string,
  userId: string
): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user?.id) {
      return false;
    }

    if (authData.user.id !== userId) {
      return false;
    }

    const { error } = await supabase
      .from('route_history')
      .delete()
      .eq('id', id)
      .eq('user_id', authData.user.id);

    if (error) {
      console.error(
        '[Supabase] Route deletion failed:',
        error
      );

      return false;
    }

    const updated = getLocalHistory().filter(
      (record) => record.id !== id
    );

    setLocalHistory(updated);

    return true;
  } catch (error) {
    console.error(
      '[Supabase] Route deletion exception:',
      error
    );

    return false;
  }
}

// ============================================================================
// FEEDBACK FUNCTIONS (public.feedback)
// ============================================================================

/**
 * Submit feedback to Supabase.
 *
 * The user ID is obtained from the authenticated session.
 * It is never fabricated or accepted from the frontend.
 */
export async function submitUserFeedback(params: {
  category: FeedbackCategory;
  rating?: number | null;
  message: string;
}): Promise<{ success: boolean; error: string | null }> {
  const { category, rating, message } = params;

  const trimmedMessage = message.trim();

  if (trimmedMessage.length < 3 || trimmedMessage.length > 2000) {
    return {
      success: false,
      error:
        'Your feedback must be between 3 and 2000 characters.',
    };
  }

  const validCategories: FeedbackCategory[] = [
    'general',
    'routing',
    'map',
    'accuracy',
    'suggestion',
    'bug_report',
  ];

  if (!validCategories.includes(category)) {
    return {
      success: false,
      error: 'Please select a valid feedback category.',
    };
  }

  if (
    rating !== undefined &&
    rating !== null &&
    (!Number.isInteger(rating) || rating < 1 || rating > 5)
  ) {
    return {
      success: false,
      error: 'Rating must be between 1 and 5.',
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        'Supabase is not configured. Check your environment variables.',
    };
  }

  try {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError) throw authError;

    const currentUser = authData.user;

    if (!currentUser?.id) {
      return {
        success: false,
        error: 'Please sign in before submitting feedback.',
      };
    }

    // PostgreSQL generates id and created_at.
    const payload = {
      user_id: currentUser.id,
      category,
      rating: rating ?? null,
      message: trimmedMessage,
    };

    const { error } = await supabase
      .from('feedback')
      .insert(payload);

    if (error) {
      console.error(
        '[Supabase] Feedback insert failed:',
        error
      );

      return {
        success: false,
        error: error.message || 'Could not submit feedback.',
      };
    }

    // Cache feedback only after successful database submission.
    try {
      const stored = localStorage.getItem(LOCAL_FEEDBACK_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      const existing = Array.isArray(parsed) ? parsed : [];

      existing.unshift({
        ...payload,
        created_at: new Date().toISOString(),
      });

      localStorage.setItem(
        LOCAL_FEEDBACK_KEY,
        JSON.stringify(existing.slice(0, 30))
      );
    } catch (error) {
      console.warn(
        '[LocalStorage] Feedback cache note:',
        error
      );
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error(
      '[Supabase] Feedback submission exception:',
      error
    );

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
