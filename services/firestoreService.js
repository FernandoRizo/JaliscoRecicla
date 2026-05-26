// ============================================================
//  firestoreService.js
//  JaliscoRecicla – Firestore collection helpers
//  All 6 collections: users, recyclingCenters, reports,
//  wasteTypes, centerWasteTypes, notifications
// ============================================================

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  GeoPoint,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

// ─────────────────────────────────────────────────────────────
// COLLECTION REFERENCES
// ─────────────────────────────────────────────────────────────
export const COLLECTIONS = {
  USERS:               "users",
  RECYCLING_CENTERS:   "recyclingCenters",
  REPORTS:             "reports",
  WASTE_TYPES:         "wasteTypes",
  CENTER_WASTE_TYPES:  "centerWasteTypes",
  NOTIFICATIONS:       "notifications",
};

// ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
//  1. USERS
// ══════════════════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────

/**
 * Create or update a user document.
 * The document ID = Firebase Auth UID.
 *
 * @param {string} uid   - Firebase Auth UID
 * @param {object} data  - user fields
 */
export const createUser = async (uid, data) => {
  const ref = doc(db, COLLECTIONS.USERS, uid);
  await setDoc(ref, {
    userID:    uid,
    email:     data.email,
    fullName:  data.fullName,
    phone:     data.phone     ?? null,
    photoURL:  data.photoURL  ?? null,
    role:      data.role      ?? "citizen",   // "citizen" | "administrator"
    fcmToken:  data.fcmToken  ?? null,        // for push notifications
    createdAt: serverTimestamp(),
  });
};

/**
 * Get a user document by UID.
 * @returns {object|null}
 */
export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return snap.exists() ? snap.data() : null;
};

/**
 * Update specific user fields.
 */
export const updateUser = async (uid, fields) => {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), fields);
};

/**
 * Save FCM push token for a user.
 */
export const saveFcmToken = async (uid, token) => {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), { fcmToken: token });
};

// ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
//  2. RECYCLING CENTERS
// ══════════════════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────

/**
 * Add a new recycling center (admin only).
 * @returns {string} centerID
 */
export const addRecyclingCenter = async (data) => {
  const ref = await addDoc(collection(db, COLLECTIONS.RECYCLING_CENTERS), {
    name:        data.name,
    address:     data.address,
    location:    new GeoPoint(data.latitude, data.longitude),   // GeoPoint for geo queries
    latitude:    data.latitude,
    longitude:   data.longitude,
    geohash:     data.geohash,     // compute with 'geofire-common' npm package
    status:      data.status     ?? "pending_review",  // "active"|"inactive"|"pending_review"
    schedule:    data.schedule   ?? null,
    phone:       data.phone      ?? null,
    photoURL:    data.photoURL   ?? null,
    rating:      0,
    ratingCount: 0,
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
  });
  return ref.id;
};

/**
 * Get all active recycling centers.
 * @returns {Array}
 */
export const getActiveCenters = async () => {
  const q = query(
    collection(db, COLLECTIONS.RECYCLING_CENTERS),
    where("status", "==", "active"),
    orderBy("name")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Get a single recycling center by ID.
 */
export const getCenter = async (centerID) => {
  const snap = await getDoc(doc(db, COLLECTIONS.RECYCLING_CENTERS, centerID));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/**
 * Update center status (admin only).
 * status: "active" | "inactive" | "pending_review"
 */
export const updateCenterStatus = async (centerID, status) => {
  await updateDoc(doc(db, COLLECTIONS.RECYCLING_CENTERS, centerID), {
    status,
    updatedAt: serverTimestamp(),
  });
};

// ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
//  3. REPORTS
// ══════════════════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────

/**
 * Create a new citizen report.
 * @returns {string} reportID
 */
export const createReport = async (data) => {
  const ref = await addDoc(collection(db, COLLECTIONS.REPORTS), {
    userID:      data.userID,
    centerID:    data.centerID  ?? null,   // null if suggesting a brand-new center
    name:        data.name,
    address:     data.address,
    description: data.description ?? null,
    wasteTypes:  data.wasteTypes  ?? [],   // array of wasteTypeIDs
    photoURLs:   data.photoURLs   ?? [],   // Firebase Storage download URLs
    status:      "submitted",              // initial status
    // status values: "submitted" | "pending_review" | "approved" | "rejected" | "archived"
    reviewerID:  null,
    reviewNote:  null,
    createdAt:   serverTimestamp(),
    reviewedAt:  null,
  });
  return ref.id;
};

/**
 * Get all reports by a specific user.
 */
export const getUserReports = async (userID) => {
  const q = query(
    collection(db, COLLECTIONS.REPORTS),
    where("userID", "==", userID),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Get all pending reports (admin only).
 */
export const getPendingReports = async () => {
  const q = query(
    collection(db, COLLECTIONS.REPORTS),
    where("status", "==", "submitted"),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Approve or reject a report (admin only).
 * @param {string} reportID
 * @param {"approved"|"rejected"} decision
 * @param {string} reviewerID  - admin UID
 * @param {string} [note]      - optional review note
 */
export const reviewReport = async (reportID, decision, reviewerID, note = null) => {
  await updateDoc(doc(db, COLLECTIONS.REPORTS, reportID), {
    status:     decision,
    reviewerID,
    reviewNote: note,
    reviewedAt: serverTimestamp(),
  });
};

/**
 * Add photo URLs to an existing report.
 */
export const addReportPhotos = async (reportID, photoURLs) => {
  await updateDoc(doc(db, COLLECTIONS.REPORTS, reportID), {
    photoURLs: arrayUnion(...photoURLs),
  });
};

// ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
//  4. WASTE TYPES
// ══════════════════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────

/**
 * Get all waste types.
 * @returns {Array}
 */
export const getWasteTypes = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.WASTE_TYPES));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Search waste types by name (client-side filter).
 */
export const searchWasteTypes = async (query_str) => {
  const all = await getWasteTypes();
  const q = query_str.toLowerCase();
  return all.filter(
    (w) =>
      w.name.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q)
  );
};

// ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
//  5. CENTER – WASTE TYPE (N:M)
// ══════════════════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────

/**
 * Link a waste type to a recycling center.
 */
export const linkWasteToCenter = async (centerID, wasteTypeID, acceptedQty = null) => {
  const id = `${centerID}_${wasteTypeID}`;
  await setDoc(doc(db, COLLECTIONS.CENTER_WASTE_TYPES, id), {
    centerID,
    wasteTypeID,
    acceptedQty,
    createdAt: serverTimestamp(),
  });
};

/**
 * Get all waste types accepted by a center.
 */
export const getCenterWasteTypes = async (centerID) => {
  const q = query(
    collection(db, COLLECTIONS.CENTER_WASTE_TYPES),
    where("centerID", "==", centerID)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
};

/**
 * Get all centers that accept a given waste type.
 */
export const getCentersByWasteType = async (wasteTypeID) => {
  const q = query(
    collection(db, COLLECTIONS.CENTER_WASTE_TYPES),
    where("wasteTypeID", "==", wasteTypeID)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
};

// ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
//  6. NOTIFICATIONS
// ══════════════════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────

/**
 * Create a notification for a user.
 * type: "report_update" | "schedule_alert" | "broadcast" | "system"
 */
export const createNotification = async (data) => {
  await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    userID:   data.userID,
    title:    data.title,
    message:  data.message,
    type:     data.type,
    reportID: data.reportID ?? null,
    readAt:   null,
    createdAt: serverTimestamp(),
  });
};

/**
 * Get all notifications for a user (newest first).
 */
export const getUserNotifications = async (userID, maxResults = 20) => {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("userID", "==", userID),
    orderBy("createdAt", "desc"),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Mark a notification as read.
 */
export const markNotificationRead = async (notificationID) => {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationID), {
    readAt: serverTimestamp(),
  });
};

/**
 * Get unread notification count for a user.
 */
export const getUnreadCount = async (userID) => {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("userID",  "==", userID),
    where("readAt",  "==", null)
  );
  const snap = await getDocs(q);
  return snap.size;
};
