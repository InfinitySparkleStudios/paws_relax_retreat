/**
 * Booking App – Back Office (Infinity Sparkle Studios · Personalized Apps)
 * ------------------------------------------------------------------------
 * Lives inside the boarder's OWN Google Sheet, in their own free Google account,
 * so their clients' details stay with them.
 *
 *  A booking is a promise  -> Bookings tab
 *  A payment is a claim    -> Payments tab (client taps "I've paid")
 *  A payment is a FACT     -> only when the owner confirms it -> Ledger tab
 *
 * The owner gets a WhatsApp message (CallMeBot) for every new booking,
 * extension request and payment claim. Each payment message has a
 * "check and confirm" link. Prices, hours, rules, capacity and bank details are
 * on the Settings tab (or the Business settings form in the menu).
 */

const TABS = {
  settings: 'Settings',
  bookings: 'Bookings',
  payments: 'Payments',
  ledger:   'Ledger',
  photos:   'Photos',
  longstays: 'Long stays'
};
// Dogs on a monthly long stay: one row per agreement. Each month's invoice is a row on the Bookings tab.
const LONG_COLS = ['Code', 'Client', 'Phone', 'Email', 'Dogs', 'Dog count', 'Monthly (R)', 'Start date', 'End date',
  'Pays by day', 'Active', 'Notes'];
const PHOTO_COLS = ['Added', 'Ref', 'Photo code', 'Day', 'Caption', 'File id'];

const BOOKING_COLS = ['Created', 'Ref', 'Type', 'Status', 'Client', 'Phone', 'Email', 'Address',
  'Emergency contact', 'Dogs', 'Dog details', 'Check-in', 'Check-in time', 'Check-out', 'Check-out time',
  'Nights / months', 'Boarding', 'Family discount', 'Pickup fee', 'Drop-off fee', 'Total',
  'Due now', 'Paid to date', 'Balance', 'Payment schedule', 'Pickup address', 'Drop-off address',
  'Linked booking', 'Notes', 'Dog count', 'Day-care days', 'Paid by', 'Photo code', 'Long stay code', 'Invoice month'];

const PAYMENT_COLS = ['Received', 'Payment ID', 'Ref', 'Client', 'Phone', 'Amount claimed',
  'Date paid (client)', 'Proof of payment', 'Status', 'Amount confirmed', 'Confirmed at', 'Note', 'Method'];

// Same columns as the IBMS ledger used by Infinity Sparkle Studios.
const LEDGER_COLS = ['Date', 'Dashboard Group - Financial Meaning', 'Account -Type Income/Expense/Asset/Liability',
  'Description', 'Transaction Category - Expense Detail', 'Paid By: Director Paid, Company Bank,Cash',
  'Money In Bank Debit', 'Money Out Bank Credit', 'Running Bank Balance', 'Transaction Amount',
  'VAT Applicable Y/N', 'VAT Received/Vat on Sales/ Output', 'VAT Paid VAT on Expenses/ Input',
  'Tax Invoice Yes/No', 'Director Loan Movement', 'VAT Cycle', 'Status', 'Booking Ref', 'App Payment ID'];

const DEFAULT_SETTINGS = [
  ['Setting', 'Value', 'What it does'],
  ['business_name', '', 'Business name – shown at the top of the app, in messages and receipts'],
  ['brand_tagline', '', 'Short line under your logo in the app'],
  ['color_brand', '#5A3216', 'Main colour of your app (#RRGGBB)'],
  ['color_accent', '#C8962E', 'Accent colour – pay buttons and highlights (#RRGGBB)'],
  ['logo_file_id', '', 'Your logo (upload it in the Business settings form)'],
  ['business_email', '', 'Business email (optional)'],
  ['checkin_from', '', 'Earliest check-in time, e.g. 08:00 (blank = any time)'],
  ['checkin_to', '', 'Latest check-in time, e.g. 12:00'],
  ['checkout_from', '', 'Earliest check-out time'],
  ['checkout_to', '', 'Latest check-out time'],
  ['daycare_open', '', 'Day care opens, e.g. 07:00'],
  ['daycare_close', '', 'Day care closes, e.g. 17:00'],
  ['halfday_hours', 5, 'A half day is up to this many hours'],
  ['house_rules', "My dog(s) are up to date on Rabies, DHPP and Bordetella vaccinations.\nI will provide my dog's food, and I have disclosed all behaviour and medical issues above.\nI authorise flea/tick treatment if fleas are found on arrival (Capstar or vet-approved spot-on). Treatment cost is added to my invoice.\nI accept all risks, authorise veterinary care if needed, and understand the boarder takes all reasonable care but is not liable for illness, injury or escape due to unforeseen events.", 'House rules – one per line. Clients tick each one'],
  ['cancellation_policy', '', 'Cancellation policy shown to clients (optional)'],
  ['small_rate', 200, 'Small dog, per night (R)'],
  ['medium_rate', 250, 'Medium dog, per night (R)'],
  ['festive_from', '12-01', 'Festive season starts (MM-DD)'],
  ['festive_to', '01-10', 'Festive season ends (MM-DD)'],
  ['festive_small_rate', 200, 'Small dog, festive night (R)'],
  ['festive_medium_rate', 250, 'Medium dog, festive night (R)'],
  ['daycare_full_small', 150, 'Day care – full day, small dog (R per day)'],
  ['daycare_full_medium', 180, 'Day care – full day, medium dog (R per day)'],
  ['daycare_half_small', 90, 'Day care – half day, small dog (R per day)'],
  ['daycare_half_medium', 110, 'Day care – half day, medium dog (R per day)'],
  ['trip_near_area', '', 'Pickup/drop-off nearby area, e.g. Pretoria & surrounds (blank = fee agreed per client)'],
  ['trip_near_fee', '', 'Pickup/drop-off fee per trip, nearby area (R)'],
  ['trip_far_area', '', 'Pickup/drop-off further area, e.g. Sandton, Midrand & similar distance'],
  ['trip_far_fee', '', 'Pickup/drop-off fee per trip, further area (R)'],
  ['family_discount', 0.10, '2nd and 3rd dog from same home (0.10 = 10%)'],
  ['owner_whatsapp', '', 'Your WhatsApp number in international format, no + or spaces'],
  ['callmebot_apikey', '', 'Your CallMeBot API key (optional). Blank = email alerts only'],
  ['alert_email', '', 'Email for booking and payment alerts (blank = your Google account email)'],
  ['email_alerts', 'yes', 'Email me for every booking and payment notice (yes / no)'],
  ['bank_name', '', 'Shown to clients for EFT'],
  ['account_name', '', 'Shown to clients for EFT'],
  ['account_number', '', 'Shown to clients for EFT'],
  ['branch_code', '', 'Shown to clients for EFT'],
  ['account_type', '', 'Shown to clients for EFT (e.g. Business / Current)'],
  ['max_dogs', '', 'Most dogs at a time (boarding + day care). Blank = no limit. Switches on the availability calendar'],
  ['pay_link', '', 'Online payment link: Yoco Payment Page (https://pay.yoco.com/…), SnapScan (https://pos.snapscan.io/qr/…) or any https link with {amount} {ref}'],
  ['pay_label', '', 'Payment button wording, e.g. by card (blank = automatic)'],
  ['ref_prefix', '', 'Booking reference prefix, letters only (blank = first letters of your business name)'],
  ['ledger_category', 'Boarding', 'Category used in the ledger'],
  ['ledger_group', 'Revenue', 'Dashboard Group used in the ledger'],
  ['admin_key', '', 'Secret for the confirm links. Filled in by Setup – do not share'],
  ['proof_folder_id', '', 'Google Drive folder for proofs of payment. Filled in by Setup'],
  ['photo_folder_id', '', 'Google Drive folder for the daily pet photos. Filled in by Setup'],
  ['app_url', '', 'Address of your booking app – used in the photo links you send clients'],
  ['web_app_url', '', 'Your back office Web app URL (from Deploy) – used in your phone and confirm links']
];

/* =========================== Menu & setup =========================== */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🐾 Bookings')
    .addItem('1. Set up back office', 'setup')
    .addItem('Business settings form (prices, hours, rules)', 'openOwnerForm')
    .addItem('Calendar – who is here each day', 'openCalendar')
    .addItem('📄 Long stays – monthly invoices', 'openLongStays')
    .addItem('Confirm selected payment', 'confirmSelectedPayment')
    .addItem('📱 My back office on my phone', 'showHubLink')
    .addItem('📷 Add photos for selected booking', 'openPhotos')
    .addItem('Cancel selected booking', 'cancelSelectedBooking')
    .addItem('Send me a test alert', 'testWhatsApp')
    .addItem('Show my confirm-link secret', 'showAdminKey')
    .addToUi();
}

function setup() {
  const ss = SpreadsheetApp.getActive();
  const make = (name, header, widths) => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold')
        .setBackground('#5A3216').setFontColor('#FFF8EC').setWrap(true);
      sh.setFrozenRows(1);
      if (widths) widths.forEach((w, i) => w && sh.setColumnWidth(i + 1, w));
    } else {
      // newer versions add columns at the end – add any that are missing
      const have = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
      if (have.length < header.length && header.slice(0, have.length).every((h, i) => h === have[i]))
        sh.getRange(1, have.length + 1, 1, header.length - have.length).setValues([header.slice(have.length)]).setFontWeight('bold');
    }
    return sh;
  };

  // Settings
  let st = ss.getSheetByName(TABS.settings);
  if (!st) {
    st = ss.insertSheet(TABS.settings, 0);
    st.getRange(1, 2, 200, 1).setNumberFormat('@');   // keep 12-01, 08:00 etc. exactly as typed
    st.getRange(1, 1, DEFAULT_SETTINGS.length, 3).setValues(DEFAULT_SETTINGS);
    st.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#5A3216').setFontColor('#FFF8EC');
    st.setColumnWidth(1, 190); st.setColumnWidth(2, 220); st.setColumnWidth(3, 420);
    st.setFrozenRows(1);
  }
  // add any settings introduced in newer versions (e.g. day care prices)
  const have = readSettings_();
  DEFAULT_SETTINGS.slice(1).forEach(r => { if (!(r[0] in have)) st.appendRow(r); });
  make(TABS.bookings, BOOKING_COLS, [140, 150, 90, 160, 160, 120]);
  make(TABS.payments, PAYMENT_COLS, [140, 150, 150, 160, 120, 110, 110, 220, 110]);
  make(TABS.ledger, LEDGER_COLS, [100, 120, 110, 300, 140, 120, 110, 110]);
  make(TABS.photos, PHOTO_COLS, [140, 150, 200, 100, 260, 200]);
  make(TABS.longstays, LONG_COLS, [90, 170, 120, 170, 170, 80, 100, 100, 100, 90, 70, 220]);

  const s = readSettings_();
  if (!s.admin_key) writeSetting_('admin_key', Utilities.getUuid().replace(/-/g, '').slice(0, 20));
  if (!s.proof_folder_id) {
    const folder = DriveApp.createFolder((s.business_name || 'Bookings') + ' – Proofs of Payment');
    writeSetting_('proof_folder_id', folder.getId());
  }
  if (!s.photo_folder_id) writeSetting_('photo_folder_id', DriveApp.createFolder((s.business_name || 'Bookings') + ' – Pet photos').getId());
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);

  ui_('Back office is ready.\n\nNext (step 5 on the setup page): Extensions → Apps Script → Deploy → New deployment → Web app ' +
    '(Execute as: Me, Who has access: Anyone). Then paste the Web app URL on the setup page (step 3) and in Business settings → "Your back office link".');
}

/* ============================ Web entry ============================= */

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'settings') return json_({ ok: true, settings: publicSettings_() });
  if (p.action === 'availability') return json_(availability_(p.from, p.days));
  if (p.action === 'logo') return json_(logo_());
  if (p.action === 'photos') return json_(publicPhotos_(p.token));
  if (p.action === 'calendar') return calendarPage_(p.key, p.month);
  if (p.action === 'confirm') return confirmPage_(p.id, p.key);
  if (p.action === 'owner') return ownerPage_(p.key);
  if (p.action === 'hub') return hubPage_(p.key);
  if (p.action === 'addphotos') return photoPage_(p.key, p.ref);
  if (p.action === 'invoices') return longPage_(p.key);
  return json_({ ok: true, service: (readSettings_().business_name || 'Booking app') + ' back office' });
}

function doPost(e) {
  let data;
  try { data = JSON.parse(e.postData.contents); }
  catch (err) { return json_({ ok: false, error: 'Could not read the request.' }); }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (data.action === 'booking')   return json_(saveBooking_(data));
    if (data.action === 'extension') return json_(saveExtension_(data));
    if (data.action === 'payment')   return json_(savePaymentClaim_(data));
    if (data.action === 'mystays')   return json_(myStays_(data));
    return json_({ ok: false, error: 'Unknown action.' });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Something went wrong on our side. Please send your booking on WhatsApp instead.' });
  } finally {
    lock.releaseLock();
  }
}

/* ============================ Bookings ============================== */

function saveBooking_(d) {
  const s = readSettings_();
  if (!d.name || !d.phone || (!d.checkIn && d.type !== 'daycare') || !Array.isArray(d.dogs) || !d.dogs.length)
    return { ok: false, error: 'Name, phone, dates and at least one dog are required.' };

  const ref = uniqueRef_(pawsRef_(d.ref));
  const dogNames = d.dogs.map(x => clean_(x.name)).filter(String).join(', ');
  const dogDetails = d.dogs.map(x => [clean_(x.name), x.size, clean_(x.breed), clean_(x.age), x.sex,
    'sterilised: ' + x.ster, x.social ? 'with other dogs: ' + clean_(x.social) : '', x.flea ? 'flea & tick: ' + clean_(x.flea) : '',
    x.vacc ? 'last vacc ' + x.vacc : '', x.med ? 'medical: ' + clean_(x.med) : '',
    x.feed ? 'feeding: ' + clean_(x.feed) : '', x.beh ? 'behaviour: ' + clean_(x.beh) : '']
    .filter(String).join(' · ')).join('\n');
  const pick = num_(d.transport && d.transport.pick), drop = num_(d.transport && d.transport.drop);

  let type, period, boarding = 0, discount = 0, total, dueNow, schedule = '', checkOut = d.checkOut;
  if (d.type === 'long') {
    const M = num_(d.long && d.long.monthly), n = Math.max(1, Math.min(12, num_(d.long && d.long.months)));
    const extra = Math.max(0, Math.min(29, num_(d.long && d.long.extra)));
    if (!M) return { ok: false, error: 'Please fill in the agreed monthly price.' };
    boarding = Math.round(M * n + extra * M / 30);
    total = boarding + pick + drop;
    const sched = [];
    for (let i = 0; i < n; i++) sched.push({ label: 'Month ' + (i + 1), due: addMonths_(d.checkIn, i), amt: M });
    if (extra) sched.push({ label: 'Extra ' + extra + ' days', due: addMonths_(d.checkIn, n), amt: Math.round(extra * M / 30) });
    sched[0].amt += pick; sched[sched.length - 1].amt += drop;
    dueNow = sched[0].amt;
    schedule = sched.map(x => x.label + ' – due ' + x.due + ' – R' + x.amt).join('\n');
    checkOut = addMonths_(d.checkIn, n, extra);
    type = 'Long stay'; period = n + ' month(s)' + (extra ? ' + ' + extra + ' days' : '') + ' @ R' + M + '/month';
  } else if (d.type === 'daycare') {
    const kind = d.daycare && d.daycare.kind === 'half' ? 'half' : 'full';
    const days = (d.daycare && Array.isArray(d.daycare.days) ? d.daycare.days : [])
      .map(String).filter(x => parseDate_(x)).filter((x, i, a) => a.indexOf(x) === i).sort().slice(0, 20);
    if (!days.length) return { ok: false, error: 'Please choose at least one day-care day.' };
    const rate = { small: num_(s['daycare_' + kind + '_small']), medium: num_(s['daycare_' + kind + '_medium']) };
    const disc = num_(s.family_discount);
    const order = d.dogs.map(x => x.size).filter(x => x === 'small' || x === 'medium').sort((x, y) => rate[y] - rate[x]);
    order.forEach((sz, i) => { const base = days.length * rate[sz]; boarding += base; if (i > 0) discount += base * disc; });
    boarding = Math.round(boarding); discount = Math.round(discount);
    total = boarding - discount + pick + drop; dueNow = total;
    checkOut = days[days.length - 1]; d.checkIn = days[0];
    schedule = 'Days: ' + days.join(', ');
    type = 'Day care'; period = days.length + ' ' + kind + ' day(s)';
  } else {
    const p = priceNights_(d.checkIn, d.checkOut, d.dogs.map(x => x.size), s);
    if (!p) return { ok: false, error: 'Please choose a check-out date after check-in.' };
    boarding = p.boarding; discount = p.discount;
    total = boarding - discount + pick + drop; dueNow = total;
    type = 'Nightly'; period = p.nights + ' night(s)';
  }

  const dogCount = d.dogs.length;
  const stayDays = type === 'Day care' ? String(schedule).replace('Days: ', '').split(', ') : nightsBetween_(d.checkIn, checkOut);
  const full = fullDay_(stayDays, dogCount, s);
  if (full) return { ok: false, error: 'Sorry, we are fully booked on ' + full + '. Please choose other dates or WhatsApp us.' };

  const photoCode = Utilities.getUuid().replace(/-/g, '').slice(0, 24);   // secret: only this client sees these photos
  const row = {
    'Created': new Date(), 'Ref': ref, 'Type': type, 'Status': 'Booked – awaiting payment',
    'Client': clean_(d.name), 'Phone': clean_(d.phone), 'Email': clean_(d.email), 'Address': clean_(d.address),
    'Emergency contact': [clean_(d.ecname), clean_(d.ecphone)].filter(String).join(' '),
    'Dogs': dogNames, 'Dog details': dogDetails,
    'Check-in': d.checkIn, 'Check-in time': clean_(d.inTime), 'Check-out': checkOut, 'Check-out time': clean_(d.outTime),
    'Nights / months': period, 'Boarding': boarding, 'Family discount': discount ? -discount : '',
    'Pickup fee': pick || '', 'Drop-off fee': drop || '', 'Total': total, 'Due now': dueNow,
    'Paid to date': 0, 'Balance': total, 'Payment schedule': schedule,
    'Pickup address': pick ? clean_(d.transport.pickAddr) : '', 'Drop-off address': drop ? clean_(d.transport.dropAddr) : '',
    'Linked booking': '', 'Notes': 'House rules accepted: ' + (Array.isArray(d.rules) ? d.rules.length : 0),
    'Dog count': dogCount, 'Day-care days': type === 'Day care' ? stayDays.join(', ') : '', 'Photo code': photoCode
  };
  appendRow_(TABS.bookings, BOOKING_COLS, row);

  notify_(['🐾 NEW BOOKING ' + ref,
    clean_(d.name) + ' · ' + clean_(d.phone),
    'Dogs: ' + dogNames,
    type + ': ' + d.checkIn + ' → ' + checkOut + ' (' + period + ')',
    pick ? 'Pickup: R' + pick + ' – ' + clean_(d.transport.pickAddr) : '',
    drop ? 'Drop-off: R' + drop + ' – ' + clean_(d.transport.dropAddr) : '',
    'Total R' + total + ' · due now R' + dueNow,
    'Status: promise (awaiting payment)'].filter(String).join('\n'));

  return { ok: true, ref: ref, total: total, dueNow: dueNow, checkOut: checkOut, photoToken: photoCode };
}

function saveExtension_(d) {
  const s = readSettings_();
  if (!d.name || !d.newOut || !d.curOut) return { ok: false, error: 'Name and both dates are required.' };
  const sizes = [].concat(Array(num_(d.small)).fill('small'), Array(num_(d.medium)).fill('medium'));
  const p = priceNights_(d.curOut, d.newOut, sizes, s);
  if (!p) return { ok: false, error: 'The new check-out must be after the current one.' };
  const base = pawsRef_(d.ref);
  const ref = uniqueRef_(base + '-EXT');
  const total = p.boarding - p.discount;
  const full = fullDay_(nightsBetween_(d.curOut, d.newOut), sizes.length, s);
  appendRow_(TABS.bookings, BOOKING_COLS, {
    'Created': new Date(), 'Ref': ref, 'Type': 'Extension', 'Status': 'Requested – confirm availability',
    'Client': clean_(d.name), 'Phone': clean_(d.phone), 'Dogs': clean_(d.dogs),
    'Check-in': d.curOut, 'Check-out': d.newOut, 'Check-out time': clean_(d.time),
    'Nights / months': p.nights + ' extra night(s)', 'Boarding': p.boarding,
    'Family discount': p.discount ? -p.discount : '', 'Total': total, 'Due now': total,
    'Paid to date': 0, 'Balance': total, 'Linked booking': clean_(d.ref), 'Dog count': sizes.length
  });
  notify_(['🐾 EXTENSION REQUEST ' + ref, clean_(d.name) + ' · ' + clean_(d.phone),
    'Dogs: ' + clean_(d.dogs) + (d.ref ? ' (booking ' + clean_(d.ref) + ')' : ''),
    'Check-out ' + d.curOut + ' → ' + d.newOut + ' (' + p.nights + ' extra nights)',
    'Extra R' + total, full ? '⚠ Over capacity on ' + full : '', 'Please confirm availability with the client.'].filter(String).join('\n'));
  return { ok: true, ref: ref, total: total, dueNow: total };
}

/* ============================ Payments ============================== */

function savePaymentClaim_(d) {
  const s = readSettings_();
  const amount = num_(d.amount);
  if (!d.ref || !amount) return { ok: false, error: 'Booking reference and amount are required.' };
  const booking = findRow_(TABS.bookings, 'Ref', clean_(d.ref));
  const id = 'PAY-' + Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyMMdd-HHmmss');

  let proofUrl = '';
  if (d.proof && d.proof.data) {
    try {
      const bytes = Utilities.base64Decode(String(d.proof.data).split(',').pop());
      if (bytes.length > 6 * 1024 * 1024) throw new Error('too big');
      const type = /^(image\/(png|jpeg|webp|heic)|application\/pdf)$/.test(d.proof.type) ? d.proof.type : 'application/octet-stream';
      const blob = Utilities.newBlob(bytes, type, id + ' ' + clean_(d.ref) + ' ' + clean_(d.proof.name || 'proof'));
      proofUrl = DriveApp.getFolderById(s.proof_folder_id).createFile(blob).getUrl();
    } catch (err) { proofUrl = '(upload failed)'; }
  }

  appendRow_(TABS.payments, PAYMENT_COLS, {
    'Received': new Date(), 'Payment ID': id, 'Ref': clean_(d.ref),
    'Client': clean_(d.name) || (booking ? booking.values['Client'] : ''),
    'Phone': clean_(d.phone) || (booking ? booking.values['Phone'] : ''),
    'Amount claimed': amount, 'Date paid (client)': clean_(d.datePaid), 'Proof of payment': proofUrl,
    'Status': 'Claimed – check bank', 'Note': booking ? '' : 'Reference not found in Bookings',
    'Method': d.method === 'card' ? 'Card / online' : 'EFT'
  });
  if (booking) setCells_(TABS.bookings, booking.row, { 'Status': 'Payment claimed – check bank' });

  const link = baseUrl_() + '?action=confirm&id=' + encodeURIComponent(id) + '&key=' + s.admin_key;
  notify_(['💰 PAYMENT CLAIMED ' + clean_(d.ref) + (d.method === 'card' ? ' (CARD)' : ''),
    (clean_(d.name) || (booking ? booking.values['Client'] : '')) + ' says they paid R' + amount +
      (d.datePaid ? ' on ' + clean_(d.datePaid) : ''),
    proofUrl && proofUrl.indexOf('http') === 0 ? 'Proof: ' + proofUrl : 'No proof attached',
    booking ? '' : '⚠ Reference not found in Bookings',
    (d.method === 'card' ? 'Check your ' + provider_(s.pay_link) + ' app' : 'Check your bank') + ', then confirm: ' + link].filter(String).join('\n'));

  return { ok: true, id: id };
}

/* Called from the confirm page (google.script.run) or the menu. */
function confirmPayment(id, key, amountReceived, decision) {
  const s = readSettings_();
  if (key !== s.admin_key) throw new Error('This link is not valid.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const pay = findRow_(TABS.payments, 'Payment ID', id);
    if (!pay) throw new Error('Payment ' + id + ' not found.');
    const status = String(pay.values['Status']);
    if (status.indexOf('Confirmed') === 0 || status.indexOf('Rejected') === 0)
      return { already: true, status: status };

    if (decision === 'reject') {
      setCells_(TABS.payments, pay.row, { 'Status': 'Rejected – not received', 'Confirmed at': new Date() });
      const b = findRow_(TABS.bookings, 'Ref', pay.values['Ref']);
      if (b) setCells_(TABS.bookings, b.row, { 'Status': 'Payment not received' });
      notify_('❌ Payment ' + id + ' (' + pay.values['Ref'] + ') marked NOT received.');
      return { rejected: true };
    }

    const amount = num_(amountReceived) || num_(pay.values['Amount claimed']);
    const now = new Date();
    setCells_(TABS.payments, pay.row, { 'Status': 'Confirmed', 'Amount confirmed': amount, 'Confirmed at': now });

    const b = findRow_(TABS.bookings, 'Ref', pay.values['Ref']);
    let balance = '', dogs = '', client = pay.values['Client'];
    if (b) {
      const paid = num_(b.values['Paid to date']) + amount;
      balance = num_(b.values['Total']) - paid;
      dogs = b.values['Dogs']; client = b.values['Client'] || client;
      setCells_(TABS.bookings, b.row, {
        'Paid to date': paid, 'Balance': balance,
        'Status': balance <= 0 ? 'Paid in full' : 'Part paid – R' + balance + ' outstanding'
      });
    }

    // The FACT: one ledger row per confirmed payment (IBMS format)
    appendRow_(TABS.ledger, LEDGER_COLS, {
      'Date': pay.values['Date paid (client)'] || now,
      'Dashboard Group - Financial Meaning': s.ledger_group || 'Revenue',
      'Account -Type Income/Expense/Asset/Liability': 'Income',
      'Description': [pawsRef_(pay.values['Ref']), client, dogs].filter(String).join(' – '),
      'Transaction Category - Expense Detail': s.ledger_category || 'Boarding',
      'Paid By: Director Paid, Company Bank,Cash': 'Company Bank',
      'Money In Bank Debit': amount, 'Money Out Bank Credit': '', 'Running Bank Balance': '',
      'Transaction Amount': amount, 'VAT Applicable Y/N': 'No',
      'VAT Received/Vat on Sales/ Output': 0, 'VAT Paid VAT on Expenses/ Input': 0,
      'Tax Invoice Yes/No': 'No', 'Director Loan Movement': 0, 'VAT Cycle': '', 'Status': 'Confirmed',
      'Booking Ref': pay.values['Ref'], 'App Payment ID': id
    });

    notify_('✅ Confirmed R' + amount + ' for ' + pay.values['Ref'] + ' (' + client + '). Ledger updated.' +
      (b ? (balance > 0 ? ' Balance R' + balance + '.' : ' Paid in full.') : ''));

    const phone = waNumber_(pay.values['Phone']);
    const receipt = 'Hi ' + String(client).split(' ')[0] + ', thank you! We received your payment of R' + amount +
      ' for booking ' + pay.values['Ref'] + '.' + (b ? (balance > 0 ? ' Balance outstanding: R' + balance + '.' : ' Your booking is paid in full.') : '') +
      ' 🐾 ' + (s.business_name || '');
    return { confirmed: true, amount: amount, balance: balance, receiptLink: phone ? 'https://wa.me/' + phone + '?text=' + encodeURIComponent(receipt) : '' };
  } finally { lock.releaseLock(); }
}

function confirmSelectedPayment() {
  const sh = SpreadsheetApp.getActiveSheet(), ui = SpreadsheetApp.getUi();
  if (sh.getName() !== TABS.payments) return ui.alert('Select a row on the Payments tab first.');
  const r = sh.getActiveRange().getRow();
  if (r < 2) return ui.alert('Select a payment row.');
  const id = sh.getRange(r, PAYMENT_COLS.indexOf('Payment ID') + 1).getValue();
  const res = confirmPayment(id, readSettings_().admin_key);
  ui.alert(res.already ? 'Already ' + res.status : 'Confirmed R' + res.amount + '. Ledger updated.' +
    (res.receiptLink ? '\n\nReceipt link for the client:\n' + res.receiptLink : ''));
}

/* ========================== Confirm page ============================ */

function confirmPage_(id, key) {
  const s = readSettings_();
  const t = HtmlService.createTemplate(CONFIRM_HTML);
  t.ok = key === s.admin_key; t.id = id || ''; t.key = key || '';
  t.pay = null;
  if (t.ok) {
    const p = findRow_(TABS.payments, 'Payment ID', id);
    if (p) t.pay = {
      ref: p.values['Ref'], client: p.values['Client'], amount: p.values['Amount claimed'],
      date: String(p.values['Date paid (client)'] || ''), proof: p.values['Proof of payment'] || '',
      status: String(p.values['Status'])
    };
  }
  return t.evaluate().setTitle('Confirm payment – ' + (s.business_name || ''))
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

const CONFIRM_HTML = `<!doctype html><html><head><base target="_top"><style>
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#FBF5EA;color:#2B1A0E;margin:0;padding:20px 16px}
.card{max-width:440px;margin:0 auto;background:#fff;border:1px solid #EADBC4;border-radius:16px;overflow:hidden}
.head{background:#5A3216;color:#FFF8EC;padding:16px 18px}.head small{opacity:.8;letter-spacing:.06em;text-transform:uppercase;font-size:.72rem}
.amt{font-size:2rem;font-weight:800}.body{padding:16px 18px;display:flex;flex-direction:column;gap:10px}
label{font-size:.85rem;color:#7A5E46;font-weight:600;display:flex;flex-direction:column;gap:4px}
input{font:inherit;padding:10px;border:1px solid #EADBC4;border-radius:9px}
button,a.btn{font:inherit;font-weight:700;border:0;border-radius:10px;padding:13px;cursor:pointer;text-align:center;text-decoration:none;display:block}
.ok{background:#5A3216;color:#FFF8EC}.no{background:transparent;border:1px solid #EADBC4;color:#2B1A0E}.wa{background:#C8962E;color:#1A1405}
.muted{color:#7A5E46;font-size:.9rem;margin:0}</style></head><body><div class="card">
<? if (!ok || !pay) { ?><div class="body"><p>This confirm link is not valid, or the payment was not found.</p></div>
<? } else { ?>
<div class="head"><small>Payment claimed · <?= pay.ref ?></small><div class="amt">R<?= pay.amount ?></div><div><?= pay.client ?><?= pay.date ? ' · paid ' + pay.date : '' ?></div></div>
<div class="body" id="box">
<? if (pay.status.indexOf('Claimed') !== 0) { ?><p><b>Already handled:</b> <?= pay.status ?></p>
<? } else { ?>
<? if (pay.proof && pay.proof.indexOf('http') === 0) { ?><a class="btn no" href="<?= pay.proof ?>" target="_blank">View proof of payment</a><? } ?>
<p class="muted">Check that the money reflects in your bank account (or card payment app) before you confirm. Confirming writes it to the ledger.</p>
<label>Amount received (R)<input id="amt" type="number" step="0.01" value="<?= pay.amount ?>"></label>
<button class="ok" onclick="go('confirm')">Yes, money received – confirm</button>
<button class="no" onclick="go('reject')">Not received</button>
<? } ?></div><? } ?></div>
<script>function go(d){var b=document.getElementById('box');var a=(document.getElementById('amt')||{}).value;b.innerHTML='<p class="muted">Saving…</p>';
google.script.run.withSuccessHandler(function(r){ if(r.already){b.innerHTML='<p>Already handled: '+r.status+'</p>';return;}
 if(r.rejected){b.innerHTML='<p>Marked as not received. The booking stays a promise.</p>';return;}
 b.innerHTML='<p><b>Confirmed R'+r.amount+'.</b> The ledger is updated'+(r.balance!==''?(r.balance>0?' · balance R'+r.balance:' · paid in full'):'')+'.</p>'+
 (r.receiptLink?'<a class="btn wa" href="'+r.receiptLink+'" target="_blank">Send receipt to client on WhatsApp</a>':'');})
.withFailureHandler(function(e){b.innerHTML='<p>Could not save: '+e.message+'</p>';}).confirmPayment(<?!= JSON.stringify(id) ?>,<?!= JSON.stringify(key) ?>,a,d);}</script>
</body></html>`;

/* ======================= Owner settings form ======================== */
// Each boarding house fills this in once: prices, hours, rules, bank details.
const OWNER_FIELDS = [
  ['Your look – how your app looks to clients', 'business_name', 'Business name', 'text'],
  ['Your look – how your app looks to clients', 'brand_tagline', 'Short line under your logo', 'text'],
  ['Your look – how your app looks to clients', 'color_brand', 'Main colour', 'color'],
  ['Your look – how your app looks to clients', 'color_accent', 'Accent colour (pay buttons)', 'color'],
  ['Your look – how your app looks to clients', 'logo_file_id', 'Your logo', 'logo'],
  ['Business', 'owner_whatsapp', 'WhatsApp number for alerts (e.g. 27821234567)', 'text'],
  ['Business', 'app_url', 'Your app link (from the setup page, e.g. https://…/?b=yourname)', 'text'],
  ['Business', 'web_app_url', 'Your back office link (the Web app URL from Deploy, ends with /exec)', 'text'],
  ['Business', 'business_email', 'Email', 'text'],
  ['Business', 'max_dogs', 'Most dogs at a time (blank = no limit)', 'number'],
  ['Boarding prices (per night)', 'small_rate', 'Small dog', 'money'],
  ['Boarding prices (per night)', 'medium_rate', 'Medium dog', 'money'],
  ['Boarding prices (per night)', 'family_discount', '2nd & 3rd dog discount (%)', 'percent'],
  ['Festive season', 'festive_from', 'Starts (MM-DD, e.g. 12-01)', 'text'],
  ['Festive season', 'festive_to', 'Ends (MM-DD, e.g. 01-10)', 'text'],
  ['Festive season', 'festive_small_rate', 'Small dog per night', 'money'],
  ['Festive season', 'festive_medium_rate', 'Medium dog per night', 'money'],
  ['Day care prices (per dog per day)', 'daycare_full_small', 'Full day – small dog', 'money'],
  ['Day care prices (per dog per day)', 'daycare_full_medium', 'Full day – medium dog', 'money'],
  ['Day care prices (per dog per day)', 'daycare_half_small', 'Half day – small dog', 'money'],
  ['Day care prices (per dog per day)', 'daycare_half_medium', 'Half day – medium dog', 'money'],
  ['Pickup & drop-off (fee per trip – blank = agreed per client)', 'trip_near_area', 'Nearby area, e.g. Pretoria & surrounds', 'text'],
  ['Pickup & drop-off (fee per trip – blank = agreed per client)', 'trip_near_fee', 'Nearby – fee per trip', 'money'],
  ['Pickup & drop-off (fee per trip – blank = agreed per client)', 'trip_far_area', 'Further area, e.g. Sandton & similar distance', 'text'],
  ['Pickup & drop-off (fee per trip – blank = agreed per client)', 'trip_far_fee', 'Further – fee per trip', 'money'],
  ['Hours (leave blank for any time)', 'checkin_from', 'Check-in from', 'time'],
  ['Hours (leave blank for any time)', 'checkin_to', 'Check-in until', 'time'],
  ['Hours (leave blank for any time)', 'checkout_from', 'Check-out from', 'time'],
  ['Hours (leave blank for any time)', 'checkout_to', 'Check-out until', 'time'],
  ['Hours (leave blank for any time)', 'daycare_open', 'Day care opens', 'time'],
  ['Hours (leave blank for any time)', 'daycare_close', 'Day care closes', 'time'],
  ['Hours (leave blank for any time)', 'halfday_hours', 'Half day is up to (hours)', 'number'],
  ['House rules', 'house_rules', 'One rule per line – clients tick each one', 'textarea'],
  ['House rules', 'cancellation_policy', 'Cancellation policy (optional)', 'textarea'],
  ['Bank details for EFT', 'bank_name', 'Bank', 'text'],
  ['Bank details for EFT', 'account_name', 'Account name', 'text'],
  ['Bank details for EFT', 'account_number', 'Account number', 'text'],
  ['Bank details for EFT', 'branch_code', 'Branch code', 'text'],
  ['Bank details for EFT', 'account_type', 'Account type', 'text'],
  ['Online payments (optional)', 'pay_link', 'Your payment link – Yoco Payment Page, SnapScan or any https link', 'text'],
  ['Online payments (optional)', 'pay_label', 'Button wording, e.g. by card (blank = automatic)', 'text'],
  ['Alerts', 'alert_email', 'Email for booking and payment alerts (blank = your Google email)', 'text'],
  ['Alerts', 'callmebot_apikey', 'WhatsApp alerts: CallMeBot API key (optional)', 'text']
];

function openOwnerForm() {
  const html = ownerPage_(readSettings_().admin_key).setWidth(560).setHeight(720);
  SpreadsheetApp.getUi().showModalDialog(html, 'Business settings');
}

function ownerPage_(key) {
  const s = readSettings_();
  const t = HtmlService.createTemplate(OWNER_HTML);
  t.ok = key && key === s.admin_key; t.key = key || '';
  t.logoData = t.ok ? logo_().data : '';
  t.fields = OWNER_FIELDS.map(f => {
    let v = s[f[1]];
    if (f[3] === 'time') v = time_(v);
    else if (f[3] === 'percent') v = Math.round(num_(v) * 100);
    else if (v instanceof Date) v = Utilities.formatDate(v, Session.getScriptTimeZone(), 'MM-dd');
    return { group: f[0], key: f[1], label: f[2], type: f[3], value: v == null ? '' : String(v) };
  });
  return t.evaluate().setTitle('Business settings').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* Called from the form. Only known fields are written. */
function saveOwnerSettings(key, values) {
  const s = readSettings_();
  if (!key || key !== s.admin_key) throw new Error('This link is not valid.');
  const errors = [];
  OWNER_FIELDS.forEach(f => {
    if (!(f[1] in values)) return;
    let v = String(values[f[1]] == null ? '' : values[f[1]]).trim();
    const isNum = x => x !== '' && isFinite(Number(x.replace(',', '.'))) && Number(x.replace(',', '.')) >= 0;
    // anything that doesn't make sense is reported and NOT saved, so a typo never wipes a price
    if (f[3] === 'money' || f[3] === 'number') { if (v !== '' && !isNum(v)) return errors.push(f[2]); v = v === '' ? '' : Number(v.replace(',', '.')); }
    if (f[3] === 'percent') { if (!isNum(v) || Number(v) > 100) return errors.push(f[2]); v = Number(v.replace(',', '.')) / 100; }
    if (f[3] === 'time') { if (v && !time_(v)) return errors.push(f[2]); v = time_(v); }
    if ((f[1] === 'festive_from' || f[1] === 'festive_to') && v && !/^\d{2}-\d{2}$/.test(v)) return errors.push(f[2]);
    if (f[1] === 'pay_link' && v && !/^https:\/\/[^\s"<>`]+$/.test(v)) return errors.push(f[2]);
    if (f[1] === 'pay_label') v = v.replace(/[<>"`]/g, '').slice(0, 40);
    if (f[1] === 'alert_email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return errors.push(f[2]);
    if (f[1] === 'app_url' && v && !/^https:\/\/[^\s"<>`]+$/.test(v)) return errors.push(f[2]);
    if (f[1] === 'web_app_url' && v && !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(v)) return errors.push(f[2]);
    if (f[3] === 'color') { if (!/^#[0-9a-f]{6}$/i.test(v)) return errors.push(f[2]); }
    if (f[3] === 'logo') return;                       // the logo is saved by saveLogo()
    if (f[1] === 'business_name' || f[1] === 'brand_tagline') v = v.replace(/[<>"`\u0000-\u001f]/g, '').slice(0, f[1] === 'business_name' ? 60 : 120);
    writeSetting_(f[1], v);
  });
  return { saved: true, warnings: errors };
}

/* Logo: the form shrinks the picture on the owner's device, then it is saved in their Drive */
function saveLogo(key, dataUrl) {
  const s = readSettings_();
  if (!key || key !== s.admin_key) throw new Error('This link is not valid.');
  const m = /^data:(image\/(png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) throw new Error('Please choose a PNG, JPG or WEBP picture.');
  const bytes = Utilities.base64Decode(m[3]);
  if (bytes.length > 600 * 1024) throw new Error('The picture is too big – please choose a smaller one.');
  const file = DriveApp.getFolderById(s.proof_folder_id).createFile(Utilities.newBlob(bytes, m[1], 'App logo ' + Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyyy-MM-dd HHmm')));
  if (s.logo_file_id) { try { DriveApp.getFileById(String(s.logo_file_id)).setTrashed(true); } catch (e) {} }
  writeSetting_('logo_file_id', file.getId());
  return { saved: true };
}
function logo_() {
  const id = String(readSettings_().logo_file_id || '');
  if (!id) return { ok: true, data: '' };
  try { const b = DriveApp.getFileById(id).getBlob(); return { ok: true, data: 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes()) }; }
  catch (e) { return { ok: true, data: '' }; }
}

const OWNER_HTML = `<!doctype html><html><head><base target="_top"><style>
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#FBF5EA;color:#2B1A0E;margin:0;padding:16px}
form{max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:14px}
fieldset{border:1px solid #EADBC4;background:#fff;border-radius:14px;padding:14px;margin:0;display:flex;flex-direction:column;gap:10px}
legend{font-weight:700;padding:0 6px}label{display:flex;flex-direction:column;gap:4px;font-size:.85rem;font-weight:600;color:#7A5E46}
input,textarea{font:inherit;font-weight:400;color:#2B1A0E;padding:9px;border:1px solid #EADBC4;border-radius:9px;background:#FFFBF4}
textarea{min-height:110px}.row{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
button{font:inherit;font-weight:700;border:0;border-radius:10px;padding:13px;background:#5A3216;color:#FFF8EC;cursor:pointer;position:sticky;bottom:8px}
#msg{font-size:.9rem;min-height:1.2em}</style></head><body>
<? if (!ok) { ?><p>This settings link is not valid.</p><? } else { ?>
<form id="f" onsubmit="return save(event)">
<? var g = null; for (var i = 0; i < fields.length; i++) { var f = fields[i]; if (f.group !== g) { if (g !== null) { ?></div></fieldset><? } g = f.group; ?><fieldset><legend><?= g ?></legend><div class="row"><? } ?>
<? if (f.type === 'logo') { ?><div style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px"><span style="font-size:.85rem;font-weight:600;color:#7A5E46"><?= f.label ?></span>
<img id="lp" alt="" style="max-width:260px;max-height:130px;object-fit:contain<?!= f.value ? '' : ';display:none' ?>" src="<?!= logoData ?>">
<input type="file" id="lf" accept="image/png,image/jpeg,image/webp"><span id="lm" style="font-size:.8rem;color:#7A5E46">A wide picture works best. It is saved as soon as you choose it.</span></div>
<? continue; } ?>
<label><?= f.label ?><? if (f.type === 'color') { ?><input name="<?= f.key ?>" type="color" value="<?= /^#[0-9a-f]{6}$/i.test(f.value) ? f.value : '#5A3216' ?>" style="height:44px;padding:4px"><? } else if (f.type === 'textarea') { ?><textarea name="<?= f.key ?>"><?= f.value ?></textarea><? } else { ?><input name="<?= f.key ?>" value="<?= f.value ?>" <?!= f.type === 'time' ? 'type="time"' : (f.type === 'money' || f.type === 'number' || f.type === 'percent') ? 'type="number" min="0" step="any" inputmode="decimal"' : 'type="text"' ?>><? } ?></label>
<? } ?></div></fieldset>
<p id="msg"></p><button type="submit">Save settings</button></form>
<script>
var lf=document.getElementById('lf'); if(lf) lf.onchange=function(){var f=lf.files[0];if(!f)return;var lm=document.getElementById('lm');lm.textContent='Saving your logo…';
 var img=new Image();img.onload=function(){var w=Math.min(900,img.naturalWidth),h=Math.round(img.naturalHeight*w/img.naturalWidth),c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);
  var d=c.toDataURL('image/png');google.script.run.withSuccessHandler(function(){var p=document.getElementById('lp');p.src=d;p.style.display='';lm.textContent='Logo saved. Your app shows it next time it opens.';})
  .withFailureHandler(function(e){lm.textContent='Could not save the logo: '+e.message;}).saveLogo(<?!= JSON.stringify(key) ?>,d);};
 img.onerror=function(){lm.textContent='That file is not a picture we can use.';};img.src=URL.createObjectURL(f);};
function save(e){e.preventDefault();var v={};new FormData(document.getElementById('f')).forEach(function(x,k){v[k]=x;});
var m=document.getElementById('msg');m.textContent='Saving…';
google.script.run.withSuccessHandler(function(r){m.textContent=r.warnings.length?('Saved, but please check: '+r.warnings.join(', ')):'Saved. The app shows your changes next time it opens.';})
.withFailureHandler(function(err){m.textContent='Could not save: '+err.message;}).saveOwnerSettings(<?!= JSON.stringify(key) ?>,v);return false;}</script>
<? } ?></body></html>`;

/* ========================= Daily pet photos ========================= */

function photoCodeFor_(b) {          // older bookings get a code the first time photos are added
  let code = String(b.values['Photo code'] || '');
  if (!/^[0-9a-f]{24}$/.test(code)) { code = Utilities.getUuid().replace(/-/g, '').slice(0, 24); setCells_(TABS.bookings, b.row, { 'Photo code': code }); }
  return code;
}
function photoRows_(code) {
  const sh = SpreadsheetApp.getActive().getSheetByName(TABS.photos);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, PHOTO_COLS.length).getValues()
    .map((r, i) => ({ row: i + 2, code: String(r[2]), day: iso_(r[3]), caption: String(r[4] || ''), id: String(r[5]) }))
    .filter(r => r.code === code && r.id);
}
/* Public: the photos of ONE booking, for whoever holds its secret photo code */
function publicPhotos_(token) {
  token = String(token || '');
  if (!/^[0-9a-f]{24}$/.test(token)) return { ok: false };
  const b = findRow_(TABS.bookings, 'Photo code', token);
  if (!b) return { ok: false };
  const s = readSettings_();
  return { ok: true, ref: String(b.values['Ref']), dogs: String(b.values['Dogs'] || ''), checkIn: iso_(b.values['Check-in']), checkOut: iso_(b.values['Check-out']),
    business: String(s.business_name || ''),
    photos: photoRows_(token).sort((a, c) => a.day < c.day ? 1 : a.day > c.day ? -1 : c.row - a.row)
      .map(r => ({ url: 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(r.id) + '&sz=w1600', caption: r.caption, day: r.day })) };
}
/* Owner: add photos (from the photo dialog) */
function photoInfo(key, ref) {
  const s = readSettings_();
  if (!key || key !== s.admin_key) throw new Error('This link is not valid.');
  const b = findRow_(TABS.bookings, 'Ref', ref); if (!b) throw new Error('Booking ' + ref + ' not found.');
  const code = photoCodeFor_(b);
  const link = s.app_url ? String(s.app_url).replace(/[?#].*$/, '') + '?photos=' + code : '';
  const first = String(b.values['Client'] || '').split(' ')[0], dogs = String(b.values['Dogs'] || 'your dog');
  const text = 'Hi ' + first + '! Here are daily photos of ' + dogs + ' at ' + (s.business_name || 'us') + ' 🐾 ' + link;
  const phone = waNumber_(b.values['Phone']);
  return { ref: ref, dogs: dogs, client: String(b.values['Client'] || ''), link: link,
    wa: link ? 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text) : '',
    photos: photoRows_(code).map(r => ({ url: 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(r.id) + '&sz=w400', caption: r.caption, day: r.day })) };
}
function savePhoto(key, ref, day, caption, dataUrl) {
  const s = readSettings_();
  if (!key || key !== s.admin_key) throw new Error('This link is not valid.');
  const b = findRow_(TABS.bookings, 'Ref', ref); if (!b) throw new Error('Booking ' + ref + ' not found.');
  const m = /^data:(image\/(jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) throw new Error('Please choose a photo (JPG or PNG).');
  const bytes = Utilities.base64Decode(m[3]);
  if (bytes.length > 3 * 1024 * 1024) throw new Error('That photo is too big.');
  const code = photoCodeFor_(b);
  if (!s.photo_folder_id) writeSetting_('photo_folder_id', DriveApp.createFolder((s.business_name || 'Bookings') + ' – Pet photos').getId());
  const folder = DriveApp.getFolderById(String(readSettings_().photo_folder_id));
  const file = folder.createFile(Utilities.newBlob(bytes, m[1], ref + ' ' + (iso_(day) || '') + ' ' + Utilities.getUuid().slice(0, 6)));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);   // the file id is only ever shared with this client
  appendRow_(TABS.photos, PHOTO_COLS, { 'Added': new Date(), 'Ref': ref, 'Photo code': code,
    'Day': iso_(day) || Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyyy-MM-dd'), 'Caption': clean_(caption).slice(0, 140), 'File id': file.getId() });
  return { saved: true };
}
function openPhotos() {
  const sh = SpreadsheetApp.getActiveSheet(), ui = SpreadsheetApp.getUi();
  if (!sh || sh.getName() !== TABS.bookings) return ui.alert('Select a booking on the Bookings tab first.');
  const r = sh.getActiveRange().getRow(); if (r < 2) return ui.alert('Select a booking row.');
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const ref = String(sh.getRange(r, head.indexOf('Ref') + 1).getValue());
  const t = HtmlService.createTemplate(PHOTO_HTML); t.key = readSettings_().admin_key; t.ref = ref;
  ui.showModalDialog(t.evaluate().setWidth(640).setHeight(640), '📷 Photos – ' + ref);
}
function photoPage_(key, ref) {
  if (!key || key !== readSettings_().admin_key) return HtmlService.createHtmlOutput('<p>This link is not valid.</p>');
  const t = HtmlService.createTemplate(PHOTO_HTML); t.key = key; t.ref = String(ref || '');
  return t.evaluate().setTitle('Photos – ' + t.ref).addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
const PHOTO_HTML = `<!doctype html><html><head><base target="_blank"><style>
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#FBF5EA;color:#2B1A0E;margin:0;padding:14px;display:flex;flex-direction:column;gap:10px}
label{display:flex;flex-direction:column;gap:4px;font-size:.85rem;font-weight:600;color:#7A5E46}input{font:inherit;padding:8px;border:1px solid #EADBC4;border-radius:9px;background:#fff}
button,a.btn{font:inherit;font-weight:700;border:0;border-radius:10px;padding:11px 14px;cursor:pointer;text-align:center;text-decoration:none;display:inline-block}
.p{background:#5A3216;color:#FFF8EC}.w{background:#C8962E;color:#1A1405}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px}
.g figure{margin:0;font-size:.75rem}.g img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:9px}.m{font-size:.85rem;color:#7A5E46}</style></head><body>
<b id="t">Loading…</b><label>Photos<input type="file" id="f" accept="image/*" multiple></label>
<div style="display:flex;gap:8px"><label style="flex:1">Day<input type="date" id="d"></label><label style="flex:2">Caption (optional)<input id="c" maxlength="140" placeholder="e.g. Playing in the garden"></label></div>
<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="p" id="u">Add photos</button><a class="btn w" id="wa">Send photo link on WhatsApp</a></div>
<p class="m" id="m"></p><div class="g" id="g"></div>
<script>var KEY=<?!= JSON.stringify(key) ?>, REF=<?!= JSON.stringify(ref) ?>;
document.getElementById('d').value=new Date().toISOString().slice(0,10);
function e(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function load(){google.script.run.withSuccessHandler(function(i){document.getElementById('t').textContent=i.dogs+' · '+i.client;
 var w=document.getElementById('wa'); if(i.wa){w.href=i.wa;w.style.display='';}else{w.style.display='none';document.getElementById('m').textContent='Ask ISS to fill in app_url on the Settings tab to send photo links.';}
 document.getElementById('g').innerHTML=i.photos.length?i.photos.map(function(p){return '<figure><img src="'+e(p.url)+'"><div>'+e(p.day)+(p.caption?' · '+e(p.caption):'')+'</div></figure>';}).join(''):'<p class="m">No photos yet.</p>';})
 .withFailureHandler(function(x){document.getElementById('t').textContent=x.message;}).photoInfo(KEY,REF);}
function shrink(f){return new Promise(function(ok,no){var i=new Image();i.onload=function(){var k=Math.min(1,1600/Math.max(i.naturalWidth,i.naturalHeight)),c=document.createElement('canvas');c.width=Math.round(i.naturalWidth*k);c.height=Math.round(i.naturalHeight*k);c.getContext('2d').drawImage(i,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',.82));};i.onerror=function(){no(new Error(f.name+' is not a photo'));};i.src=URL.createObjectURL(f);});}
function one(d){return new Promise(function(ok,no){google.script.run.withSuccessHandler(ok).withFailureHandler(no).savePhoto(KEY,REF,document.getElementById('d').value,document.getElementById('c').value,d);});}
document.getElementById('u').onclick=async function(){var fs=[].slice.call(document.getElementById('f').files),m=document.getElementById('m'),n=0;if(!fs.length){m.textContent='Choose one or more photos first.';return;}
 try{for(var j=0;j<fs.length;j++){m.textContent='Uploading '+(j+1)+' of '+fs.length+'…';await one(await shrink(fs[j]));n++;}m.textContent=n+' photo(s) added. The owner sees them in the app under 📷 Photos.';document.getElementById('f').value='';}
 catch(x){m.textContent='Added '+n+'; then: '+x.message;} load();};
load();</script></body></html>`;

/* ===================== Client sign-in (no password) ===================== */
// The pet parent signs in with their WhatsApp number + one of their booking references.
// They get back only THEIR bookings and photo codes.
function lastDigits_(p) { return String(p || '').replace(/\D/g, '').slice(-9); }
function myStays_(d) {
  const phone = lastDigits_(d.phone), ref = clean_(d.ref).toUpperCase();
  if (phone.length < 9 || !ref) return { ok: false, error: 'Please enter your WhatsApp number and a booking reference.' };
  try {   // slow down guessing: 10 tries per number per hour
    const c = CacheService.getScriptCache(), k = 'login-' + phone, n = Number(c.get(k) || 0);
    if (n >= 10) return { ok: false, error: 'Too many tries. Please try again later or WhatsApp us.' };
    c.put(k, String(n + 1), 3600);
  } catch (e) {}
  const sh = SpreadsheetApp.getActive().getSheetByName(TABS.bookings);
  if (!sh || sh.getLastRow() < 2) return { ok: false, error: 'We could not find that booking.' };
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0], col = n => head.indexOf(n);
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, head.length).getValues().map((r, i) => ({ r: r, row: i + 2 }));
  const mine = rows.filter(x => lastDigits_(x.r[col('Phone')]) === phone);
  if (!mine.some(x => String(x.r[col('Ref')]).toUpperCase() === ref)) return { ok: false, error: 'We could not find that booking for this number.' };
  const stays = mine.filter(x => !/cancel|declin/i.test(String(x.r[col('Status')]))).map(x => {
    const b = { row: x.row, values: {} }; head.forEach((h, j) => b.values[h] = x.r[j]);
    return { ref: String(b.values['Ref']), token: photoCodeFor_(b), dogs: String(b.values['Dogs'] || ''), type: String(b.values['Type'] || ''),
      checkIn: iso_(b.values['Check-in']), checkOut: iso_(b.values['Check-out']), status: String(b.values['Status'] || ''),
      total: num_(b.values['Total']), balance: num_(b.values['Balance']) };
  }).reverse();
  return { ok: true, stays: stays };
}

/* ================= The owner's back office on their phone ================= */
/* The web app link the owner deployed and connected. A script can have several deployments and
   ScriptApp.getService().getUrl() may name another one, so the owner's own link wins. */
function baseUrl_() {
  const u = String(readSettings_().web_app_url || '').trim();
  return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(u) ? u : ScriptApp.getService().getUrl();
}
function hubLink_() { return baseUrl_() + '?action=hub&key=' + readSettings_().admin_key; }
function showHubLink() {
  const s = readSettings_(), link = hubLink_();
  const wa = s.owner_whatsapp ? 'https://wa.me/' + waNumber_(s.owner_whatsapp) + '?text=' + encodeURIComponent('My back office: ' + link) : '';
  const html = HtmlService.createHtmlOutput('<div style="font-family:system-ui;padding:8px"><p>Open this link on your phone and add it to your home screen. Keep it private – it opens your back office.</p>' +
    '<p><input style="width:100%;padding:8px" readonly value="' + link + '" onclick="this.select()"></p>' +
    (wa ? '<p><a target="_blank" href="' + wa + '" style="display:inline-block;background:#C8962E;color:#1A1405;padding:10px 14px;border-radius:10px;font-weight:700;text-decoration:none">Send it to my WhatsApp</a></p>' : '') + '</div>').setWidth(520).setHeight(240);
  SpreadsheetApp.getUi().showModalDialog(html, '📱 My back office on my phone');
}
function hubPage_(key) {
  const s = readSettings_();
  if (!key || key !== s.admin_key) return HtmlService.createHtmlOutput('<p>This link is not valid.</p>');
  const today = Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyyy-MM-dd');
  const in14 = addMonths_(today, 0, 14);
  const all = stays_();
  const here = all.filter(b => b.days.indexOf(today) >= 0);
  const soon = all.filter(b => b.checkIn > today && b.checkIn <= in14).sort((a, b) => a.checkIn < b.checkIn ? -1 : 1);
  const psh = SpreadsheetApp.getActive().getSheetByName(TABS.payments);
  let claims = [];
  if (psh && psh.getLastRow() > 1) {
    const ph = psh.getRange(1, 1, 1, psh.getLastColumn()).getValues()[0];
    claims = psh.getRange(2, 1, psh.getLastRow() - 1, ph.length).getValues()
      .filter(r => String(r[ph.indexOf('Status')]).indexOf('Claimed') === 0)
      .map(r => ({ id: String(r[ph.indexOf('Payment ID')]), ref: String(r[ph.indexOf('Ref')]), client: String(r[ph.indexOf('Client')]), amount: num_(r[ph.indexOf('Amount claimed')]) }));
  }
  const t = HtmlService.createTemplate(HUB_HTML);
  t.base = baseUrl_(); t.key = key; t.biz = String(s.business_name || 'My business'); t.today = today;
  t.here = here; t.soon = soon; t.claims = claims; t.max = num_(s.max_dogs) || 0;
  return t.evaluate().setTitle('Back office – ' + t.biz).addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
const HUB_HTML = `<!doctype html><html><head><base target="_top"><style>
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#F6F4EF;color:#222;margin:0;padding:16px}
.w{max-width:620px;margin:0 auto;display:flex;flex-direction:column;gap:14px}h1{margin:0;font-size:1.4rem}h2{margin:0 0 6px;font-size:1.05rem}
.c{background:#fff;border:1px solid #e6e1d6;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:8px}
.r{display:flex;justify-content:space-between;gap:10px;align-items:center;border-top:1px solid #eee;padding-top:8px}.r:first-of-type{border-top:0;padding-top:0}
a.b{display:inline-block;font-weight:700;text-decoration:none;border-radius:10px;padding:9px 12px;background:#5A3216;color:#fff;white-space:nowrap}
a.h{background:#C8962E;color:#1A1405}a.g{background:#fff;color:#222;border:1px solid #ddd}.m{color:#6b6b6b;font-size:.85rem}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.grid a{text-align:center}</style></head><body><div class="w">
<h1><?= biz ?></h1><p class="m">Your back office · <?= today ?></p>
<div class="grid"><a class="b g" href="<?= base ?>?action=calendar&key=<?= key ?>">📅 Calendar</a><a class="b g" href="<?= base ?>?action=owner&key=<?= key ?>">⚙️ Business settings</a><a class="b g" href="<?= base ?>?action=invoices&key=<?= key ?>" style="grid-column:1/-1">📄 Long stays – monthly invoices</a></div>
<div class="c"><h2>💰 Payments to check (<?= claims.length ?>)</h2>
<? if (!claims.length) { ?><p class="m">Nothing to check.</p><? } ?>
<? for (var i = 0; i < claims.length; i++) { var c = claims[i]; ?><div class="r"><div><b>R<?= c.amount ?></b> · <?= c.ref ?><br><span class="m"><?= c.client ?></span></div><a class="b" href="<?= base ?>?action=confirm&id=<?= encodeURIComponent(c.id) ?>&key=<?= key ?>">Check</a></div><? } ?></div>
<div class="c"><h2>🐾 Here today (<?= here.reduce(function(n,b){return n+b.count;},0) ?><?= max ? ' of ' + max : '' ?> dogs)</h2>
<? if (!here.length) { ?><p class="m">No dogs today.</p><? } ?>
<? for (var i = 0; i < here.length; i++) { var b = here[i]; ?><div class="r"><div><b><?= b.dogs ?></b><br><span class="m"><?= b.client ?> · <?= b.ref ?><?= b.checkOut === today ? ' · goes home today' : '' ?></span></div><a class="b h" href="<?= base ?>?action=addphotos&key=<?= key ?>&ref=<?= encodeURIComponent(b.ref) ?>">📷 Photos</a></div><? } ?></div>
<div class="c"><h2>📆 Arriving in the next 2 weeks</h2>
<? if (!soon.length) { ?><p class="m">No arrivals booked.</p><? } ?>
<? for (var i = 0; i < soon.length; i++) { var b = soon[i]; ?><div class="r"><div><b><?= b.dogs ?></b> · <?= b.checkIn ?><br><span class="m"><?= b.client ?> · <?= b.status ?></span></div></div><? } ?></div>
<p class="m">Tip: add this page to your phone's home screen. Keep the link private.</p></div></body></html>`;

/* ===================== Capacity & calendar ========================== */

function iso_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(v || '')); return m ? m[1] : '';
}
function nightsBetween_(a, b) {          // the nights a dog stays: check-in day up to the day before check-out
  const out = [], x = parseDate_(iso_(a)), y = parseDate_(iso_(b));
  if (!x || !y) return out;
  for (const d = new Date(x); d < y; d.setUTCDate(d.getUTCDate() + 1)) out.push(Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd'));
  return out;
}
/* Every booking that is not cancelled/declined, with the days it needs a place */
function stays_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TABS.bookings);
  if (!sh || sh.getLastRow() < 2) return [];
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const col = n => head.indexOf(n);
  return sh.getRange(2, 1, sh.getLastRow() - 1, head.length).getValues()
    .filter(r => !/cancel|declin/i.test(String(r[col('Status')])))
    .map(r => {
      const type = String(r[col('Type')]);
      let days;
      if (type === 'Day care') {
        const list = col('Day-care days') >= 0 && r[col('Day-care days')] ? String(r[col('Day-care days')]) : String(r[col('Payment schedule')]).replace('Days: ', '');
        days = list.split(/,\s*/).map(iso_).filter(String);
      } else days = nightsBetween_(r[col('Check-in')], r[col('Check-out')]);
      const names = String(r[col('Dogs')] || '');
      const count = (col('Dog count') >= 0 && num_(r[col('Dog count')])) || (names ? names.split(',').length : 1);
      return { days: days, count: count, ref: String(r[col('Ref')]), client: String(r[col('Client')]), phone: String(r[col('Phone')]),
               dogs: names, type: type, checkIn: iso_(r[col('Check-in')]), checkOut: iso_(r[col('Check-out')]), status: String(r[col('Status')]) };
    });
}
function occupancy_(fromIso, n) {
  const counts = {}, start = parseDate_(fromIso);
  for (let i = 0; i < n; i++) { const d = new Date(start); d.setUTCDate(d.getUTCDate() + i); counts[Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd')] = 0; }
  stays_().forEach(b => b.days.forEach(d => { if (d in counts) counts[d] += b.count; }));
  return counts;
}
/* First day the new dogs would not fit, as "7 Nov 2026" – or '' */
function fullDay_(days, dogs, s) {
  const max = num_(s.max_dogs); if (!max || !days.length) return '';
  const sorted = days.slice().sort(), n = nightsBetween_(sorted[0], addMonths_(sorted[sorted.length - 1], 0, 1)).length;
  const occ = occupancy_(sorted[0], n);
  const hit = sorted.find(d => (occ[d] || 0) + dogs > max);
  return hit ? Utilities.formatDate(parseDate_(hit), 'UTC', 'd MMM yyyy') : '';
}
/* Public: counts per day only – never names */
function availability_(from, days) {
  const s = readSettings_();
  const today = Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyyy-MM-dd');
  const f = parseDate_(from) && String(from) > today ? String(from) : today;
  const n = Math.max(1, Math.min(120, num_(days) || 62));
  const occ = occupancy_(f, n);
  return { ok: true, capacity: num_(s.max_dogs) || null, from: f, days: Object.keys(occ).sort().map(d => ({ d: d, dogs: occ[d] })) };
}

/* Owner calendar: who is here each day (needs the owner's secret key) */
function calendarData(key, month) {
  const s = readSettings_();
  if (!key || key !== s.admin_key) throw new Error('This link is not valid.');
  return calMonth_(month, stays_(), num_(s.max_dogs) || null);
}
function calMonth_(month, all, cap) {
  month = /^\d{4}-\d{2}$/.test(String(month || '')) ? String(month) : Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyyy-MM');
  const first = month + '-01', n = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 0)).getUTCDate();
  const byDay = {};
  all.forEach(b => b.days.forEach(d => { if (d.slice(0, 7) === month) (byDay[d] = byDay[d] || []).push(
    { ref: b.ref, client: b.client, phone: b.phone, dogs: b.dogs, count: b.count, type: b.type, checkIn: b.checkIn, checkOut: b.checkOut, status: b.status }); }));
  return { month: month, first: first, days: n, capacity: cap, byDay: byDay };
}
function calendarPage_(key, month) {
  const t = HtmlService.createTemplate(CAL_HTML);
  t.key = key || ''; t.month = month || '';
  /* The months are built in here, so the calendar shows straight away – google.script.run can hang
     when the browser is signed in to several Google accounts. Last month up to 12 months ahead. */
  const pre = {};
  const s = readSettings_();
  if (key && key === s.admin_key) {
    const all = stays_(), cap = num_(s.max_dogs) || null;
    const now = Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyyy-MM');
    for (let i = -1; i <= 12; i++) {
      const d = new Date(Date.UTC(+now.slice(0, 4), +now.slice(5, 7) - 1 + i, 1));
      const m = Utilities.formatDate(d, 'UTC', 'yyyy-MM'); pre[m] = calMonth_(m, all, cap);
    }
  }
  t.pre = pre;
  return t.evaluate().setTitle('Calendar').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
function openCalendar() {
  SpreadsheetApp.getUi().showModalDialog(calendarPage_(readSettings_().admin_key).setWidth(900).setHeight(720), 'Calendar – who is here each day');
}
function cancelSelectedBooking() {
  const sh = SpreadsheetApp.getActiveSheet(), ui = SpreadsheetApp.getUi();
  if (!sh || sh.getName() !== TABS.bookings) return ui.alert('Select a booking on the Bookings tab first.');
  const r = sh.getActiveRange().getRow(); if (r < 2) return ui.alert('Select a booking row.');
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const ref = sh.getRange(r, head.indexOf('Ref') + 1).getValue();
  if (ui.alert('Cancel booking ' + ref + '?', 'Its dates become free again on the calendar.', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  sh.getRange(r, head.indexOf('Status') + 1).setValue('Cancelled');
}

const CAL_HTML = `<!doctype html><html><head><base target="_top"><style>
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#FBF5EA;color:#2B1A0E;margin:0;padding:14px}
.head{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px}.head b{font-size:1.15rem;min-width:160px;text-align:center}
button{font:inherit;font-weight:700;border:1px solid #EADBC4;background:#fff;border-radius:9px;padding:6px 12px;cursor:pointer}
.grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}.dow{font-size:.72rem;font-weight:700;color:#7A5E46;text-align:center;text-transform:uppercase}
.day{text-align:left;min-height:56px;display:flex;flex-direction:column;gap:2px;border-radius:8px}.day small{font-size:.72rem;color:#7A5E46}
.some{background:#E2EFE4}.few{background:#F3E2BC}.full{background:#F3D3D0}.blank{visibility:hidden}.on{outline:2px solid #C8962E}
.muted{color:#7A5E46;font-size:.88rem}table{border-collapse:collapse;width:100%;font-size:.88rem;margin-top:8px;background:#fff}
td,th{border-bottom:1px solid #EADBC4;padding:6px 8px;text-align:left;vertical-align:top}th{font-size:.72rem;text-transform:uppercase;color:#7A5E46}</style></head><body>
<div class="head"><button onclick="go(-1)">‹</button><b id="t"></b><button onclick="go(1)">›</button><span class="muted" id="cap"></span></div>
<div class="grid" id="g"></div><div id="list" class="muted" style="margin-top:12px">Tap a day to see which dogs are booked.</div>
<script>var KEY=<?!= JSON.stringify(key) ?>, D=null, SEL=null;
function e(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var PRE=<?!= JSON.stringify(pre) ?>;
function load(m){if(!m){var t=new Date(Date.now()+2*3600e3);m=t.toISOString().slice(0,7);}if(PRE[m]){D=PRE[m];draw();return;}google.script.run.withSuccessHandler(function(d){D=d;draw();}).withFailureHandler(function(x){document.body.innerHTML='<p>'+e(x.message)+'</p>';}).calendarData(KEY,m);}
function cnt(l){return (l||[]).reduce(function(n,b){return n+(b.count||1);},0);}
function draw(){var y=+D.month.slice(0,4),m=+D.month.slice(5,7),f=new Date(Date.UTC(y,m-1,1));
 document.getElementById('t').textContent=f.toLocaleDateString('en-ZA',{month:'long',year:'numeric',timeZone:'UTC'});
 document.getElementById('cap').textContent=D.capacity?'Room for '+D.capacity+' dogs at a time':'Fill in “Most dogs at a time” in Business settings to see when you are full.';
 var h=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(function(x){return '<div class="dow">'+x+'</div>';}).join('');
 for(var i=0;i<(f.getUTCDay()+6)%7;i++)h+='<div class="day blank"></div>';
 for(var n=1;n<=D.days;n++){var d=D.month+'-'+('0'+n).slice(-2),c=cnt(D.byDay[d]),k=D.capacity;
  var cl=!c?'':k&&c>=k?'full':k&&k-c<=Math.max(2,Math.ceil(k*.25))?'few':'some';
  h+='<button class="day '+cl+(d===SEL?' on':'')+'" data-d="'+d+'" onclick="show(this.dataset.d)"><b>'+n+'</b>'+(c?'<small>'+c+(k?' / '+k:'')+' dog'+(c>1?'s':'')+'</small>':'')+'</button>';}
 document.getElementById('g').innerHTML=h;}
function show(d){SEL=d;draw();var l=D.byDay[d]||[];document.getElementById('list').innerHTML='<b>'+e(d)+'</b> · '+cnt(l)+' dog(s)'+(D.capacity?' of '+D.capacity:'')+
 (l.length?'<table><tr><th>Ref</th><th>Dogs</th><th>Client</th><th>Stay</th><th>Status</th></tr>'+l.map(function(b){return '<tr><td><b>'+e(b.ref)+'</b></td><td>'+e(b.dogs)+'</td><td>'+e(b.client)+'<br>'+e(b.phone)+'</td><td>'+e(b.type)+'<br>'+(b.type==='Day care'?'':e(b.checkIn)+' → '+e(b.checkOut)+(b.checkIn===d?' · arrives':''))+'</td><td>'+e(b.status)+'</td></tr>';}).join('')+'</table>':'<p>No dogs booked.</p>');}
function go(k){var y=+D.month.slice(0,4),m=+D.month.slice(5,7)-1+k;var d=new Date(Date.UTC(y,m,1));SEL=null;document.getElementById('list').textContent='Tap a day to see which dogs are booked.';load(d.toISOString().slice(0,7));}
load(<?!= JSON.stringify(month) ?>);</script></body></html>`;


/* ========================= Long stays: monthly invoices ========================= */
// One row per long-stay agreement on the "Long stays" tab. Each month the owner creates that month's invoice
// (a row on Bookings, so calendar, "I've paid", confirm and ledger all work as usual) and sends it on WhatsApp.

function needKey_(key) { if (!key || key !== readSettings_().admin_key) throw new Error('This link is not valid.'); }
function monthIso_(m) { return /^\d{4}-\d{2}$/.test(String(m || '')) ? String(m) : Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyyy-MM'); }
const MONTHS_ = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function monthLabel_(m) { return MONTHS_[Number(String(m).slice(5, 7)) - 1] + ' ' + String(m).slice(0, 4); }
function longDate_(iso) { const d = parseDate_(iso); return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()] + ', ' + d.getUTCDate() + ' ' + MONTHS_[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
function longStays_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TABS.longstays);
  if (!sh || sh.getLastRow() < 2) return [];
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  return sh.getRange(2, 1, sh.getLastRow() - 1, head.length).getValues().map((r, i) => {
    const o = {}; head.forEach((h, j) => o[h] = r[j]);
    return { row: i + 2, code: String(o['Code']), client: String(o['Client']), phone: String(o['Phone'] || ''), email: String(o['Email'] || ''),
      dogs: String(o['Dogs']), count: num_(o['Dog count']) || 1, monthly: num_(o['Monthly (R)']), start: iso_(o['Start date']),
      end: iso_(o['End date']), dueDay: Math.max(1, Math.min(28, num_(o['Pays by day']) || 8)),
      active: !/^(no|false|stopped)$/i.test(String(o['Active']).trim()), notes: String(o['Notes'] || '') };
  }).filter(x => x.code && x.client);
}
function longInvoiceRow_(code, month) {
  const sh = SpreadsheetApp.getActive().getSheetByName(TABS.bookings);
  if (!sh || sh.getLastRow() < 2) return null;
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0], ci = head.indexOf('Long stay code'), mi = head.indexOf('Invoice month');
  if (ci < 0 || mi < 0) return null;
  const data = sh.getRange(2, 1, sh.getLastRow() - 1, head.length).getValues();
  for (let i = data.length - 1; i >= 0; i--) {
    if (String(data[i][ci]) === code && (data[i][mi] instanceof Date ? iso_(data[i][mi]) : String(data[i][mi])).slice(0, 7) === month) {
      const v = {}; head.forEach((h, j) => v[h] = data[i][j]);
      return { row: i + 2, ref: String(v['Ref']), total: num_(v['Total']), paid: num_(v['Paid to date']), status: String(v['Status']) };
    }
  }
  return null;
}
function invoiceText_(s, ls, inv, month) {
  const due = month + '-' + ('0' + ls.dueDay).slice(-2), biz = s.business_name || '';
  const L = ['🐾 INVOICE – ' + biz, '', 'Invoice: ' + inv.ref, 'For: long stay, ' + monthLabel_(month), 'Dogs: ' + ls.dogs, 'Amount: R' + inv.total];
  if (inv.paid > 0) L.push('Already paid: R' + inv.paid + ' · Balance: R' + (inv.total - inv.paid));
  L.push('Please pay by: ' + longDate_(due), '');
  if (s.account_number) L.push('EFT: ' + [s.bank_name, s.account_name].filter(String).join(' · '),
    'Account ' + s.account_number + (s.branch_code ? ' · Branch ' + s.branch_code : ''), 'Reference: ' + inv.ref);
  if (/^https:\/\//.test(String(s.pay_link || ''))) L.push('Or pay by card: ' + s.pay_link);
  if (s.app_url) L.push('', 'After paying, tap "I\'ve paid" in the app: ' + s.app_url);
  L.push('', 'Thank you! ' + biz);
  return L.join('\n');
}
function waLink_(phone, text) { const n = waNumber_(phone); return 'https://wa.me/' + n + '?text=' + encodeURIComponent(text); }

/* Everything the invoices page shows for one month */
function longData(key, month) {
  needKey_(key); month = monthIso_(month);
  const s = readSettings_(), last = month + '-31';
  const stays = longStays_().filter(x => x.start <= last && (x.active || (x.end && x.end >= month + '-01'))).map(x => {
    const inv = longInvoiceRow_(x.code, month);
    return Object.assign({}, x, { inv: inv, due: month + '-' + ('0' + x.dueDay).slice(-2),
      link: inv && waNumber_(x.phone) ? waLink_(x.phone, invoiceText_(s, x, inv, month)) : '', text: inv ? invoiceText_(s, x, inv, month) : '' });
  });
  return { month: month, label: monthLabel_(month), stays: stays, all: longStays_().length };
}
function saveLongStay(key, o) {
  needKey_(key);
  const name = clean_(o.name), dogs = clean_(o.dogs), monthly = num_(o.monthly);
  if (!name || !dogs || !(monthly > 0)) throw new Error('Please fill in the name, the dogs and the monthly amount.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const all = longStays_(), row = {
      'Client': name, 'Phone': clean_(o.phone), 'Email': clean_(o.email), 'Dogs': dogs,
      'Dog count': Math.max(1, Math.min(10, num_(o.count) || dogs.split(/\s*(?:,|&| and )\s*/).filter(String).length)),
      'Monthly (R)': monthly, 'Start date': parseDate_(o.start) ? o.start : Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyyy-MM-dd'),
      'Pays by day': Math.max(1, Math.min(28, num_(o.dueDay) || 8)), 'Notes': clean_(o.notes) };
    const old = o.code ? all.filter(x => x.code === o.code)[0] : null;
    if (old) { setCells_(TABS.longstays, old.row, row); return { code: old.code }; }
    const base = (name.split(/\s+/).pop().toUpperCase().replace(/[^A-Z]/g, '') || 'LS').slice(0, 8);
    let code = base, i = 2; while (all.some(x => x.code === code)) code = base + (i++);
    appendRow_(TABS.longstays, LONG_COLS, Object.assign({ 'Code': code, 'Active': 'Yes', 'End date': '' }, row));
    return { code: code };
  } finally { lock.releaseLock(); }
}
function toggleLongStay(key, code) {
  needKey_(key);
  const x = longStays_().filter(y => y.code === code)[0]; if (!x) throw new Error('Long stay not found.');
  setCells_(TABS.longstays, x.row, x.active ? { 'Active': 'No', 'End date': Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyyy-MM-dd') }
                                            : { 'Active': 'Yes', 'End date': '' });
  return { active: !x.active };
}
function createLongInvoice(key, code, month, amount) {
  needKey_(key); month = monthIso_(month);
  const s = readSettings_(), x = longStays_().filter(y => y.code === code)[0];
  if (!x) throw new Error('Long stay not found.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  let inv;
  try {
    inv = longInvoiceRow_(code, month);
    if (!inv) {
      const total = Math.round((num_(amount) || x.monthly) * 100) / 100;
      const ref = uniqueRef_(prefix_() + '-' + month.slice(2, 4) + month.slice(5, 7) + '-' + code);
      const due = month + '-' + ('0' + x.dueDay).slice(-2);
      const start = x.start > month + '-01' ? x.start : month + '-01';
      appendRow_(TABS.bookings, BOOKING_COLS, {
        'Created': new Date(), 'Ref': ref, 'Type': 'Long stay', 'Status': 'Invoiced – due ' + longDate_(due),
        'Client': x.client, 'Phone': x.phone, 'Email': x.email, 'Dogs': x.dogs,
        'Check-in': start, 'Check-out': addMonths_(month + '-01', 1), 'Nights / months': 'Long stay – ' + monthLabel_(month) + ' @ R' + x.monthly + '/month',
        'Boarding': total, 'Total': total, 'Due now': total, 'Paid to date': 0, 'Balance': total,
        'Payment schedule': monthLabel_(month) + ' – due ' + due + ' – R' + total, 'Notes': 'Monthly long-stay invoice',
        'Dog count': x.count, 'Photo code': Utilities.getUuid().replace(/-/g, '').slice(0, 24),
        'Long stay code': code, 'Invoice month': month });
      inv = { ref: ref, total: total, paid: 0, status: 'Invoiced – due ' + longDate_(due) };
    }
  } finally { lock.releaseLock(); }
  const text = invoiceText_(s, x, inv, month);
  return { ref: inv.ref, total: inv.total, text: text, link: waNumber_(x.phone) ? waLink_(x.phone, text) : '' };
}
/* The owner records money that came in (EFT, card, cash) and confirms it in one step – it goes into the ledger. */
function recordLongPayment(key, ref, amount, datePaid) {
  needKey_(key);
  amount = num_(amount); if (!(amount > 0)) throw new Error('Please fill in the amount received.');
  const b = findRow_(TABS.bookings, 'Ref', ref); if (!b) throw new Error('Invoice ' + ref + ' not found.');
  const id = 'PAY-' + Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyMMdd-HHmmss');
  appendRow_(TABS.payments, PAYMENT_COLS, {
    'Received': new Date(), 'Payment ID': id, 'Ref': ref, 'Client': b.values['Client'], 'Phone': b.values['Phone'],
    'Amount claimed': amount, 'Date paid (client)': parseDate_(datePaid) ? datePaid : Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyyy-MM-dd'),
    'Status': 'Claimed – check bank', 'Note': 'Recorded by the owner', 'Method': 'EFT' });
  return confirmPayment(id, key, amount);
}
function openLongStays() {
  SpreadsheetApp.getUi().showModalDialog(longPage_(readSettings_().admin_key).setWidth(760).setHeight(720), 'Long stays – monthly invoices');
}
function longPage_(key) {
  const t = HtmlService.createTemplate(LONG_HTML); t.key = key || '';
  return t.evaluate().setTitle('Long stays').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
const LONG_HTML = `<!doctype html><html><head><base target="_blank"><style>
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#FBF5EA;color:#2B1A0E;margin:0;padding:14px}
.w{max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:12px}.m{color:#7A5E46;font-size:.88rem;margin:0}
.c{background:#fff;border:1px solid #EADBC4;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:8px}
.top{display:flex;justify-content:space-between;gap:10px}.amt{font-weight:800;font-size:1.3rem}
.head{display:flex;gap:10px;align-items:center}.head b{font-size:1.1rem;min-width:150px;text-align:center}
button,a.b{font:inherit;font-weight:700;border:1px solid #EADBC4;background:#fff;color:#2B1A0E;border-radius:10px;padding:8px 12px;cursor:pointer;text-decoration:none;display:inline-block}
.p,a.b.p{background:#5A3216;color:#fff;border-color:#5A3216}.h{background:#C8962E;color:#1A1405;border-color:#C8962E}
.row{display:flex;flex-wrap:wrap;gap:8px;align-items:end}label{display:flex;flex-direction:column;gap:3px;font-size:.8rem;font-weight:700;color:#7A5E46}
input{font:inherit;padding:7px 9px;border:1px solid #EADBC4;border-radius:8px;background:#FFFBF4;min-width:0}
.pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:.78rem;font-weight:700;background:#F8EBCF}.ok{background:#E2EFE4;color:#2E6B3A}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}.err{color:#A33}</style></head><body><div class="w">
<p class="m">Dogs on a monthly long stay. Create each month's invoice, send it on WhatsApp, and record the payment when it comes in (or the client taps "I've paid"). Paid invoices go into the Ledger.</p>
<div class="head"><button type="button" onclick="go(-1)">‹</button><b id="t">…</b><button type="button" onclick="go(1)">›</button></div>
<div id="list" class="w" style="gap:12px"><p class="m">Loading…</p></div><p id="msg" class="m"></p>
<details class="c" id="addBox"><summary style="font-weight:700;cursor:pointer" id="ft">+ Add a long stay</summary>
<form id="f" onsubmit="save(event)" style="display:flex;flex-direction:column;gap:8px;margin-top:8px"><input type="hidden" name="code">
<div class="grid"><label>Client's name<input name="name" required></label><label>WhatsApp number<input name="phone"></label><label>Email (optional)<input name="email" type="email"></label>
<label>Dogs' names<input name="dogs" required placeholder="e.g. Bella, Max"></label><label>Number of dogs<input name="count" type="number" min="1" max="10" value="1"></label>
<label>Monthly amount (R)<input name="monthly" type="number" min="1" step="any" required></label><label>Long stay started<input name="start" type="date"></label>
<label>Pays by day of the month<input name="dueDay" type="number" min="1" max="28" value="8"></label><label>Notes<input name="notes"></label></div>
<div class="row"><button class="p" type="submit">Save long stay</button><button type="button" onclick="resetF()">Cancel</button></div></form></details>
</div><script>var KEY=<?!= JSON.stringify(key) ?>, D=null, M=null;
(function(){var t=new Date(Date.now()+2*3600e3);if(t.getUTCDate()>=15)t.setUTCMonth(t.getUTCMonth()+1,1);M=t.toISOString().slice(0,7);})();
function e(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function R(n){return 'R'+Number(n||0).toLocaleString('en-ZA',{maximumFractionDigits:2});}
function ord(n){return n+((n%100>=11&&n%100<=13)?'th':({1:'st',2:'nd',3:'rd'}[n%10]||'th'));}
function run(fn,args,ok){var g=google.script.run.withSuccessHandler(ok).withFailureHandler(function(x){document.getElementById('msg').innerHTML='<span class="err">'+e(x.message)+'</span>';});g[fn].apply(g,args);}
function load(){document.getElementById('msg').textContent='';run('longData',[KEY,M],function(d){D=d;draw();});}
function go(k){var y=+M.slice(0,4),m=+M.slice(5,7)-1+k;M=new Date(Date.UTC(y,m,1)).toISOString().slice(0,7);load();}
function draw(){document.getElementById('t').textContent=D.label;var today=new Date(Date.now()+2*3600e3).toISOString().slice(0,10);
 document.getElementById('list').innerHTML=D.stays.length?D.stays.map(function(x,i){var v=x.inv,paid=v&&v.paid>=v.total;
 return '<div class="c"><div class="top"><div><b>'+e(x.client)+'</b>'+(x.active?'':' <span class="pill">stopped</span>')+'<br><span class="m">'+e(x.dogs)+' ('+x.count+' dog'+(x.count>1?'s':'')+') · '+R(x.monthly)+' a month · pays by the '+ord(x.dueDay)+'</span></div><div class="amt">'+R(v?v.total:x.monthly)+'</div></div>'+
 (v?'<p class="m"><b>'+e(v.ref)+'</b> · <span class="pill '+(paid?'ok':'')+'">'+(paid?'Paid':e(v.status))+'</span>'+(!paid&&v.paid>0?' · '+R(v.total-v.paid)+' outstanding':'')+'</p>':'<p class="m">No invoice for '+e(D.label)+' yet · pay by the '+ord(x.dueDay)+'</p>')+
 '<div class="row">'+(v?(x.link?'<a class="b '+(paid?'':'p')+'" href="'+e(x.link)+'">'+(paid?'Send again':'Send invoice on WhatsApp')+'</a>':'<button type="button" onclick="copy('+i+')">Copy invoice text</button>'):
 '<label>Amount (R)<input id="a'+i+'" type="number" step="any" value="'+x.monthly+'" style="width:110px"></label><button class="p" type="button" onclick="make('+i+',this)">Create invoice</button>')+
 (v&&!paid?'<label>Received (R)<input id="r'+i+'" type="number" step="any" value="'+(v.total-v.paid)+'" style="width:110px"></label><label>Date<input id="d'+i+'" type="date" value="'+today+'"></label><button class="h" type="button" onclick="rec('+i+',this)">Payment received</button>':'')+
 '<button type="button" onclick="edit('+i+')">Edit</button><button type="button" onclick="tog('+i+')">'+(x.active?'Stop long stay':'Restart')+'</button></div></div>';}).join(''):'<div class="c"><p class="m">'+(D.all?'No long stays running in '+e(D.label)+'.':'No long stays yet. Add one below.')+'</p></div>';}
function make(i,b){var x=D.stays[i];b.disabled=true;run('createLongInvoice',[KEY,x.code,M,document.getElementById('a'+i).value],function(r){load();
 document.getElementById('msg').innerHTML='Invoice <b>'+e(r.ref)+'</b> created. '+(r.link?'<a class="b p" href="'+e(r.link)+'">Send it on WhatsApp</a>':'No WhatsApp number – use Copy invoice text.');});}
function rec(i,b){var x=D.stays[i],a=document.getElementById('r'+i).value;if(!confirm('Record R'+a+' received for '+x.inv.ref+'? It goes into the Ledger.'))return;b.disabled=true;
 run('recordLongPayment',[KEY,x.inv.ref,a,document.getElementById('d'+i).value],function(r){load();document.getElementById('msg').innerHTML='Recorded R'+e(r.amount)+'. '+(r.receiptLink?'<a class="b" href="'+e(r.receiptLink)+'">Send a thank-you on WhatsApp</a>':'');});}
function copy(i){var t=D.stays[i].text;try{navigator.clipboard.writeText(t);document.getElementById('msg').textContent='Invoice text copied – paste it in WhatsApp.';}catch(x){prompt('Copy the invoice text:',t);}}
function tog(i){var x=D.stays[i];if(!confirm(x.active?'Stop '+x.client+'\\'s long stay? No more invoices. Past invoices stay.':'Restart '+x.client+'\\'s long stay?'))return;run('toggleLongStay',[KEY,x.code],load);}
function edit(i){var x=D.stays[i],f=document.getElementById('f');['code','phone','email','dogs','count','monthly','start','dueDay','notes'].forEach(function(k){f.elements.namedItem(k).value=x[k]==null?'':x[k];});
 f.elements.namedItem('name').value=x.client;document.getElementById('ft').textContent='Edit '+x.client;document.getElementById('addBox').open=true;}
function resetF(){var f=document.getElementById('f');f.reset();f.elements.namedItem('code').value='';document.getElementById('ft').textContent='+ Add a long stay';document.getElementById('addBox').open=false;}
function save(ev){ev.preventDefault();var o={};new FormData(ev.target).forEach(function(v,k){o[k]=v;});run('saveLongStay',[KEY,o],function(){resetF();load();document.getElementById('msg').textContent='Long stay saved.';});}
load();</script></body></html>`;

/* ============================ Helpers =============================== */

function priceNights_(inS, outS, sizes, s) {
  const a = parseDate_(inS), b = parseDate_(outS);
  if (!a || !b || b <= a || !sizes.length) return null;
  const rate = { small: num_(s.small_rate), medium: num_(s.medium_rate) };
  const fRate = { small: num_(s.festive_small_rate) || rate.small, medium: num_(s.festive_medium_rate) || rate.medium };
  let nights = 0, fest = 0;
  for (let d = new Date(a); d < b; d.setUTCDate(d.getUTCDate() + 1)) {
    nights++; if (isFestive_(d, String(s.festive_from), String(s.festive_to))) fest++;
  }
  const norm = nights - fest, disc = num_(s.family_discount);
  const order = sizes.filter(x => x === 'small' || x === 'medium').sort((x, y) => rate[y] - rate[x]);
  let boarding = 0, discount = 0;
  order.forEach((sz, i) => { const base = norm * rate[sz] + fest * fRate[sz]; boarding += base; if (i > 0) discount += base * disc; });
  return { nights: nights, boarding: Math.round(boarding), discount: Math.round(discount) };
}

function isFestive_(d, from, to) {
  const md = Utilities.formatDate(d, 'UTC', 'MM-dd');
  return from <= to ? (md >= from && md <= to) : (md >= from || md <= to);
}
function parseDate_(s) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '')); return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null; }
function addMonths_(s, n, days) {
  const d = parseDate_(s); if (!d) return '';
  const day = d.getUTCDate(); d.setUTCMonth(d.getUTCMonth() + n); if (d.getUTCDate() < day) d.setUTCDate(0);
  d.setUTCDate(d.getUTCDate() + (days || 0)); return Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd');
}
// Every reference starts with the business prefix so bank statement lines are easy to spot.
function prefix_() {
  const s = readSettings_();
  return String(s.ref_prefix || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) ||
         String(s.business_name || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'REF';
}
function pawsRef_(r) {
  const pre = prefix_();
  let x = clean_(r).toUpperCase().replace(/[^A-Z0-9-]/g, '').replace(/^PRR/, 'PAWS');
  if (!x) return pre;
  return (x.indexOf(pre) === 0 ? x : pre + '-' + x).slice(0, 24);
}
function provider_(link) {
  link = String(link || '');
  return /yoco/i.test(link) ? 'Yoco' : /snapscan/i.test(link) ? 'SnapScan' : /payfast/i.test(link) ? 'PayFast' : 'online payment';
}
function time_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'HH:mm');
  const m = /^(\d{1,2})[:h.](\d{2})/.exec(String(v || '').trim());
  return m ? ('0' + m[1]).slice(-2) + ':' + m[2] : '';
}
function num_(v) { const n = parseFloat(v); return isFinite(n) ? n : 0; }
function clean_(v) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').replace(/^[=+\-@]/, "'$&").trim().slice(0, 600); }
function waNumber_(p) { let d = String(p || '').replace(/\D/g, ''); if (d.indexOf('0') === 0) d = '27' + d.slice(1); return d.length >= 10 ? d : ''; }

function uniqueRef_(base) {
  const sh = SpreadsheetApp.getActive().getSheetByName(TABS.bookings);
  const col = BOOKING_COLS.indexOf('Ref') + 1;
  const existing = sh.getLastRow() > 1 ? sh.getRange(2, col, sh.getLastRow() - 1, 1).getValues().map(r => String(r[0])) : [];
  if (existing.indexOf(base) < 0) return base;
  let i = 2; while (existing.indexOf(base + '-' + i) >= 0) i++;
  return base + '-' + i;
}

function readSettings_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TABS.settings);
  const out = {}; if (!sh) return out;
  sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 2).getValues().forEach(r => { if (r[0]) out[String(r[0]).trim()] = r[1]; });
  return out;
}
function writeSetting_(key, value) {
  const sh = SpreadsheetApp.getActive().getSheetByName(TABS.settings);
  const keys = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(r => r[0]);
  const i = keys.indexOf(key);
  if (i >= 0) sh.getRange(i + 1, 2).setNumberFormat('@').setValue(value); else sh.appendRow([key, value]);
}
function publicSettings_() {
  const s = readSettings_();
  return {
    rates: { small: num_(s.small_rate), medium: num_(s.medium_rate) },
    festive: { from: String(s.festive_from || '12-01'), to: String(s.festive_to || '01-10'),
      rates: { small: num_(s.festive_small_rate) || num_(s.small_rate), medium: num_(s.festive_medium_rate) || num_(s.medium_rate) } },
    familyDiscount: num_(s.family_discount),
    businessName: String(s.business_name || ''),
    hours: { checkinFrom: time_(s.checkin_from), checkinTo: time_(s.checkin_to), checkoutFrom: time_(s.checkout_from),
      checkoutTo: time_(s.checkout_to), daycareOpen: time_(s.daycare_open), daycareClose: time_(s.daycare_close),
      halfDayHours: num_(s.halfday_hours) },
    rules: String(s.house_rules || '').split(/\r?\n/).map(x => x.trim()).filter(String),
    cancellation: String(s.cancellation_policy || ''),
    daycare: { full: { small: num_(s.daycare_full_small), medium: num_(s.daycare_full_medium) },
               half: { small: num_(s.daycare_half_small), medium: num_(s.daycare_half_medium) } },
    transport: { near: { area: String(s.trip_near_area || ''), fee: num_(s.trip_near_fee) },
                 far: { area: String(s.trip_far_area || ''), fee: num_(s.trip_far_fee) } },
    payLink: /^https:\/\//.test(String(s.pay_link || '')) ? String(s.pay_link) : '',
    payLabel: String(s.pay_label || ''),
    tagline: String(s.brand_tagline || ''),
    colors: { brand: String(s.color_brand || ''), accent: String(s.color_accent || '') },
    logoVersion: String(s.logo_file_id || ''),
    maxDogs: num_(s.max_dogs) || null,
    refPrefix: prefix_(),
    whatsapp: String(s.owner_whatsapp || ''),
    bank: s.account_number ? { bank: String(s.bank_name || ''), name: String(s.account_name || ''),
      acc: String(s.account_number), branch: String(s.branch_code || ''), type: String(s.account_type || '') } : null
  };
}

function appendRow_(tab, cols, obj) {
  const sh = SpreadsheetApp.getActive().getSheetByName(tab);
  sh.appendRow(cols.map(c => obj[c] === undefined ? '' : obj[c]));
}
function findRow_(tab, col, value) {
  const sh = SpreadsheetApp.getActive().getSheetByName(tab);
  if (!sh || sh.getLastRow() < 2) return null;
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const data = sh.getRange(2, 1, sh.getLastRow() - 1, head.length).getValues();
  const ci = head.indexOf(col);
  for (let i = data.length - 1; i >= 0; i--) {
    if (String(data[i][ci]) === String(value)) {
      const values = {}; head.forEach((h, j) => values[h] = data[i][j]);
      return { row: i + 2, values: values };
    }
  }
  return null;
}
function setCells_(tab, row, obj) {
  const sh = SpreadsheetApp.getActive().getSheetByName(tab);
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  Object.keys(obj).forEach(k => { const c = head.indexOf(k); if (c >= 0) sh.getRange(row, c + 1).setValue(obj[k]); });
}

/* Alerts to the owner: an EMAIL every time (from their own Gmail to themselves – nothing to set up),
   plus WhatsApp through CallMeBot if they have a key. */
function alertEmail_(s) {
  const e = String(s.alert_email || s.business_email || '').trim();
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return e;
  try { return Session.getEffectiveUser().getEmail(); } catch (x) { return ''; }
}
function notify_(text) {
  const s = readSettings_();
  if (String(s.email_alerts || 'yes').toLowerCase() !== 'no') {
    const to = alertEmail_(s);
    if (to) {
      try {
        const first = String(text).split('\n')[0].replace(/^[^A-Za-z0-9]+/, '').slice(0, 90);
        MailApp.sendEmail({ to: to, subject: (s.business_name ? s.business_name + ': ' : '') + first, body: text, name: s.business_name || 'Booking app' });
      } catch (err) { console.error('Email alert failed: ' + err); }
    }
  }
  if (!s.callmebot_apikey || !s.owner_whatsapp) { console.log('WhatsApp not set up. Message:\n' + text); return; }
  try {
    UrlFetchApp.fetch('https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(String(s.owner_whatsapp)) +
      '&text=' + encodeURIComponent(text) + '&apikey=' + encodeURIComponent(String(s.callmebot_apikey)), { muteHttpExceptions: true });
  } catch (err) { console.error('WhatsApp failed: ' + err); }
}
function testWhatsApp() {
  notify_('🐾 ' + (readSettings_().business_name || 'Booking app') + ' back office: alerts are working.');
  ui_('Test sent to your email (' + alertEmail_(readSettings_()) + ')' + (readSettings_().callmebot_apikey ? ' and WhatsApp' : '') + '. It can take a minute.');
}
function ui_(msg) { try { SpreadsheetApp.getUi().alert(msg); } catch (e) { console.log(msg); } }
function showAdminKey() { ui_('Confirm-link secret:\n' + readSettings_().admin_key + '\n\nKeep this private.'); }

function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
