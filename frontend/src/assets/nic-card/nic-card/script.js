/* ============================================================
   Renders NIC_DATA onto the card + handles the flip.
     data-bind="key"      -> text content
     data-bind-src="key"  -> image src (element hidden if no value)
   ============================================================ */

function renderCard(data){
  document.querySelectorAll('[data-bind]').forEach(el => {
    const v = data[el.getAttribute('data-bind')];
    if (v != null) el.textContent = v;
  });

  document.querySelectorAll('[data-bind-src]').forEach(el => {
    const v = data[el.getAttribute('data-bind-src')];
    // if the image is missing or fails to load, drop it cleanly
    el.onerror = () => { el.removeAttribute('src'); el.style.display = 'none'; };
    if (v) { el.src = v; el.style.display = ''; }
    else   { el.removeAttribute('src'); el.style.display = 'none'; }
  });
}

/* ---- flip: click the card OR the button ---- */
function initFlip(){
  const card = document.getElementById('card');
  const btn  = document.getElementById('flipBtn');
  const toggle = () => card.classList.toggle('is-flipped');

  card.addEventListener('click', toggle);
  btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
}

document.addEventListener('DOMContentLoaded', () => {
  renderCard(window.NIC_DATA || {});
  initFlip();
});

/* ------------------------------------------------------------
   Load from a real database instead of data.js:

     async function load(id){
       const res  = await fetch('/api/nic/' + id);   // your endpoint
       const data = await res.json();
       renderCard(data);
     }
     load(123);
   ------------------------------------------------------------ */
