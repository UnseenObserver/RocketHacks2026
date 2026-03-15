import { db } from './firebase-config.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js';

const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomInviteCharacter() {
  const index = Math.floor(Math.random() * INVITE_ALPHABET.length);
  return INVITE_ALPHABET[index];
}

export function generateInviteCode(length = 6) {
  return Array.from({ length }, () => randomInviteCharacter()).join('');
}

export function normalizeInviteCode(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export function buildDisplayName(firstName = '', lastName = '') {
  return `${String(firstName).trim()} ${String(lastName).trim()}`.trim();
}

export function getDefaultMemberPermissions(role = 'child') {
  return {
    canViewTransactions: true,
    canViewGoals: true,
    canViewSplitRatios: true,
    canViewDashboardSummary: true
  };
}

export async function getUserProfile(uid) {
  if (!uid) {
    return null;
  }

  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function getFamilyById(familyId) {
  if (!familyId) {
    return null;
  }

  const snapshot = await getDoc(doc(db, 'users', familyId));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() || {};
  return {
    id: snapshot.id,
    ...data,
    name: data.familyName || buildDisplayName(data.firstName, data.lastName) || 'Parent Account',
    inviteCode: data.inviteCode || ''
  };
}

export async function findFamilyByInviteCode(inviteCode) {
  const normalizedCode = normalizeInviteCode(inviteCode);

  if (!normalizedCode) {
    return null;
  }

  const parentQuery = query(
    collection(db, 'users'),
    where('inviteCode', '==', normalizedCode),
    where('role', '==', 'parent'),
    where('inviteStatus', '==', 'active'),
    limit(1)
  );

  const snapshot = await getDocs(parentQuery);

  if (snapshot.empty) {
    return null;
  }

  const parentDoc = snapshot.docs[0];
  const data = parentDoc.data() || {};

  return {
    id: parentDoc.id,
    ...data,
    ownerUid: parentDoc.id,
    name: data.familyName || buildDisplayName(data.firstName, data.lastName) || 'Parent Account'
  };
}

export async function listFamilyMembers(familyId) {
  if (!familyId) {
    return [];
  }

  const snapshot = await getDocs(collection(db, 'users', familyId, 'familyMembers'));
  return snapshot.docs.map((member) => ({ id: member.id, ...member.data() }));
}

export function getRoleLabel(role) {
  switch (role) {
    case 'parent':
      return 'Parent';
    case 'child':
      return 'Child';
    default:
      return 'Individual';
  }
}
