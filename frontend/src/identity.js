/**
 * identity.js — the single source of truth for "who is the current user".
 *
 * There is no login screen right now (it is being built separately), so the
 * persona switcher in the Citizen Portal decides the active user. Everything
 * that used to read the JWT — the Registry tab, the Citations tab, App.jsx's
 * portal routing and the officer/citizen toggle — now reads from here, so the
 * whole app is always looking at the same person.
 *
 * HANDOVER NOTE: when real login lands, keep this module's API and change only
 * the internals: `getCurrentNic()` and `getCurrentPersona()` should read from
 * the authenticated session instead of localStorage, and `PERSONAS` /
 * `setCurrentNic()` can be deleted along with PersonaSwitcherBar.
 */

const STORAGE_KEY = 'current_user_nic';
const CHANGE_EVENT = 'dl-identity-change';

export const ROLE_CITIZEN = 'ROLE_CITIZEN';
export const ROLE_OFFICER = 'ROLE_OFFICER';
export const ROLE_ADMIN = 'ROLE_ADMIN';

/** Mirrors the users seeded in backend DataSeeder.java. */
export const PERSONAS = [
  { nic: 'OFFICER_001',  name: '👮 Inspector Bandara (Police Officer & Vehicle Owner)', role: ROLE_OFFICER },
  { nic: '197204509123', name: '👤 W.M. Sugathadasa (Citizen & Vehicle Owner)',         role: ROLE_CITIZEN },
  { nic: '198503402948', name: '👤 Arjun Ranaweera (Citizen & Motorcycle Owner)',       role: ROLE_CITIZEN },
  { nic: '199003402948', name: '👤 K.A. Don Perera (Citizen Driver)',                   role: ROLE_CITIZEN },
  { nic: '198012304958', name: '🚛 Mahinda Rathnayake (Heavy Lorry Driver)',            role: ROLE_CITIZEN },
  { nic: '199556708123', name: '🚌 Tharindu Jayasuriya (Bus & Public Transport)',       role: ROLE_CITIZEN },
  { nic: '200508901234', name: '⚡ Shenali Perera (EV Owner & New Driver)',             role: ROLE_CITIZEN },
  { nic: 'ADMIN123',     name: '🛡️ Super Admin (Citation Verification)',                role: ROLE_ADMIN },
];

export const DEFAULT_NIC = 'OFFICER_001';

export function getCurrentNic() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_NIC;
}

export function getPersona(nic) {
  return PERSONAS.find((p) => p.nic === nic) || null;
}

export function getCurrentPersona() {
  return getPersona(getCurrentNic());
}

export function getCurrentRole() {
  const persona = getCurrentPersona();
  return persona ? persona.role : ROLE_CITIZEN;
}

export function isOfficer(nic = getCurrentNic()) {
  const persona = getPersona(nic);
  return !!persona && persona.role === ROLE_OFFICER;
}

/** Switch the active persona and notify every subscriber in the app. */
export function setCurrentNic(nic) {
  localStorage.setItem(STORAGE_KEY, nic);
  // Enforcement sessions are scoped to the officer who opened them.
  localStorage.removeItem('sessionToken');
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { nic } }));
}

/** Subscribe to persona changes. Returns an unsubscribe function. */
export function onIdentityChange(handler) {
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}
