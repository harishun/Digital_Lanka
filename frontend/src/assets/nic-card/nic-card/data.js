/* ============================================================
   SRI LANKA e-NIC DATA  —  your "database" layer
   ------------------------------------------------------------
   Replace this object with data from your server / DB:

     const res  = await fetch('/api/nic/' + id);
     const data = await res.json();
     renderCard(data);

   Keep the same keys and the whole card populates automatically.
   The card is trilingual, so name / sex / place / address each
   have Sinhala (Si), Tamil (Ta) and English (En) versions.
   ============================================================ */

window.NIC_DATA = {
  /* ---------------- FRONT ---------------- */
  nicNo:    "000000000000",          // 12-digit new NIC number

  photo:    "photo.jpg",             // holder photo (color)

  nameSi:   "ජෝන් සිටිසන් විලියම්ස්",
  nameTa:   "ஜான் சிட்டிசன் வில்லியம்ஸ்",
  nameEn:   "JOHN CITIZEN WILLIAMS",

  sexSi:    "පිරිමි",
  sexTa:    "ஆண்",
  sexEn:    "Male",

  dob:      "0000/00/00",            // Date of Birth  YYYY/MM/DD

  signature:"signature.png",         // holder's signature image

  /* ---------------- BACK ----------------- */
  addressSi:"00/0, ශ්‍රී සාරාලංකාර මාවත, වැල්මිල්ල",
  addressTa:"00/0, ஸ்ரீ சாராலங்கார மாவத்த, வலேமில்ல",
  addressEn:"00/0, SRI SARALANKARA MAWATHA, WELMILLA",

  dateOfIssue:"0000/00/00",

  placeSi:  "අනුරාධපුර",
  placeTa:  "அனுராதபுரம்",
  placeEn:  "ANURADHAPURA",

  serialOld:      "000000000V",       // old-format number (top right)
  serialAlt:      "00Y00000 - O",     // secondary serial
  serialVertical: "00A0A-000",        // vertical serial

  commissionerSign:"commissioner.png",// Commissioner General signature
  barcode:  "barcode.png"             // barcode image (optional)
};
