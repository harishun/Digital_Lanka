import { useState } from 'react';
import './NicCard.css';

/** 
 * PDF417 2D Barcode generator — renders a realistic dense rectangular barcode grid
 * matching the bottom of the card back in the reference image.
 */
const Pdf417Barcode = ({ value }) => {
  const rows = 12;
  const cols = 95; // realistic dense grid matching back.png aspect ratio
  const seed = value || '000000000000';
  
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c < 4) {
        // Start pattern: alternating solid lines
        cells.push(c % 2 === 0);
      } else if (c > cols - 5) {
        // Stop pattern
        cells.push((cols - 1 - c) % 2 === 0);
      } else {
        // Data cells: deterministic based on char codes of seed + indices
        const charCode = seed.charCodeAt((r + c) % seed.length) || 48;
        const val = (charCode * (r + 3) + c * 17) % 11;
        cells.push(val > 4);
      }
    }
  }

  return (
    <div className="nic-pdf417-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {cells.map((filled, i) => (
        <div 
          key={i} 
          className={`nic-pdf417-cell ${filled ? 'filled' : ''}`} 
        />
      ))}
    </div>
  );
};

/**
 * NicCard — Sri Lanka National Identity Card (High Fidelity Template-Based Component)
 */
export default function NicCard({
  nic = '000000000000',
  fullName = 'JOHN CITIZEN WILLIAMS',
  gender = 'Male',
  dateOfBirth = '0000/00/00',
  address = 'Address, City, Sri Lanka',
  dateOfIssue = '0000/00/00',
  placeOfBirth = 'Colombo',
  photoUrl = null,
  signatureUrl = null,
  commissionerSignUrl = null,
  serialOld = null,
  serialAlt = '00Y00000 - O',
  serialVertical = '00A0A-000',
}) {
  const [flipped, setFlipped] = useState(false);

  const formattedDob = dateOfBirth
    ? new Date(dateOfBirth).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      }).replace(/\//g, '/')
    : '00/00/0000';

  const formattedIssue = dateOfIssue
    ? new Date(dateOfIssue).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      }).replace(/\//g, '/')
    : '00/00/0000';

  // Format old serial if not provided
  const oldSerialValue = serialOld || (
    nic.length === 12 
      ? nic.substring(2, 7) + nic.substring(8, 12) + 'V'
      : nic
  );

  return (
    <div
      className="nic-card-scene"
      onClick={() => setFlipped(f => !f)}
      title="Click to flip"
      role="button"
      tabIndex={0}
      aria-label="National Identity Card — click to flip"
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setFlipped(f => !f)}
    >
      <div className={`nic-card ${flipped ? 'is-flipped' : ''}`}>

        {/* ── FRONT ──────────────────────────────────────────────────── */}
        <div className="nic-face nic-front">
          
          {/* NIC Number row */}
          <div className="nic-no-line">
            <span className="nic-lbl font-serif">No.:</span>
            <span className="nic-no-val">{nic}</span>
          </div>

          {/* Photo */}
          <div className="nic-photo">
            {photoUrl ? (
              <img src={photoUrl} alt="Holder photo" className="nic-photo-img" />
            ) : (
              <div className="nic-photo-placeholder">
              </div>
            )}
          </div>

          {/* Details Fields */}
          <div className="nic-nm">
            <span className="nic-nm-lbl font-serif">Name:</span>
            <span className="nic-nm-val nic-en">{fullName}</span>
          </div>

          <div className="nic-row-sex">
            <span className="nic-row-lbl font-serif">Sex :</span>
            <span className="nic-row-val">{gender}</span>
          </div>

          <div className="nic-row-dob">
            <span className="nic-row-lbl font-serif">Date of Birth :</span>
            <span className="nic-row-val">{formattedDob}</span>
          </div>

          {/* Footer Signature strip */}
          <div className="nic-fr-foot">
            <span className="nic-foot-lbl font-serif">Holder&apos;s Signature :</span>
            <div className="nic-foot-sign">
              {signatureUrl ? (
                <img src={signatureUrl} alt="Signature" className="nic-sig-img" />
              ) : (
                <span className="nic-sig-cursive">J. Citizen</span>
              )}
            </div>
          </div>
        </div>

        {/* ── BACK ───────────────────────────────────────────────────── */}
        <div className="nic-face nic-back">
          {/* Address block */}
          <div className="nic-addr">
            <span className="nic-en">{address.toUpperCase()}</span>
          </div>

          {/* Place of Birth */}
          <div className="nic-place">
            <span className="nic-row2-lbl font-serif">Place of Birth :</span>
            <span className="nic-row2-val">{placeOfBirth.toUpperCase()}</span>
          </div>

          {/* Date of Issue */}
          <div className="nic-issue">
            <span className="nic-row2-lbl font-serif">Date of Issue :</span>
            <span className="nic-row2-val">{formattedIssue}</span>
          </div>

          {/* Commissioner General Signature */}
          <div className="nic-commissioner">
            <div className="nic-cg-sign">
              {commissionerSignUrl ? (
                <img src={commissionerSignUrl} alt="Commissioner Signature" className="nic-cg-sign-img" />
              ) : (
                <span className="nic-commissioner-cursive">Commissioner General</span>
              )}
            </div>
            <span className="nic-cg-lbl font-serif">Commissioner General</span>
          </div>

          {/* Barcode section: Spans across the bottom layout */}
          <div className="nic-barcode">
            <Pdf417Barcode value={nic} />
          </div>
        </div>

      </div>

      {/* Flip hint */}
      <p className="nic-flip-hint">{flipped ? '↩ Click to see front' : '↪ Click to flip'}</p>
    </div>
  );
}
export { Pdf417Barcode };
