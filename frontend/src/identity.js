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

/**
 * Mirrors the users seeded in backend DataSeeder.java.
 *
 * Every NIC is the Sri Lankan 12-digit format (YYYY + day-of-year + serial) and
 * every licence is DL-#######-X, so nothing in the demo data looks hand-made.
 *
 * The bracketed text in each label is the persona's POSITION in the workflow —
 * it tells a tester who to select for which step, e.g. only the Police Officer
 * can issue a citation and only the Admin can clear one.
 */
export const PERSONAS = [
  { nic: '197828430012', name: '👮 Inspector Bandara (Police Officer — issues citations)',      role: ROLE_OFFICER, dl: 'DL-1978284-B' },
  { nic: '198000190001', name: '🛡️ Super Admin (Administrator — verifies & clears payments)',  role: ROLE_ADMIN,   dl: null },
  { nic: '197204509123', name: '👤 W.M. Sugathadasa (Citizen — owns 3 vehicles, 1 stolen)',     role: ROLE_CITIZEN, dl: 'DL-1972045-Y' },
  { nic: '198503402948', name: '👤 Arjun Ranaweera (Citizen — motorcycle owner)',               role: ROLE_CITIZEN, dl: 'DL-9044231-X' },
  { nic: '199003402948', name: '👤 K.A. Don Perera (Citizen — main offender for citations)',    role: ROLE_CITIZEN, dl: 'DL-8822119-P' },
  { nic: '198012304958', name: '🚛 Mahinda Rathnayake (Citizen — heavy lorry, expired classes)', role: ROLE_CITIZEN, dl: 'DL-7733441-H' },
  { nic: '199556708123', name: '🚌 Tharindu Jayasuriya (Citizen — bus & public transport)',     role: ROLE_CITIZEN, dl: 'DL-6655443-B' },
  { nic: '200508901234', name: '⚡ Shenali Perera (Citizen — EV owner, clean record)',          role: ROLE_CITIZEN, dl: 'DL-5544332-E' },
  { nic: '198515030045', name: '👮 John Officer (Police Officer — spare test account)',         role: ROLE_OFFICER, dl: null },
  { nic: '199012345678', name: '👤 John Doe (Citizen — vehicle with expired revenue licence)',  role: ROLE_CITIZEN, dl: 'DL-1990123-D' },
];

export const DEFAULT_NIC = '197828430012'; // Inspector Bandara

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
