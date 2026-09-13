// This is the same Google Apps Script Web App URL already used by the main website.
// After adding Code.gs to that Apps Script project, update/redeploy the Web App.
const SEAT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxH223DCEVeVRjaia4Bb7qtKVC13RzpPjQJnlYW-TOLvoDKRpPKNNIvwE5i1h6qPdpr0Q/exec';

const EVENT = {
    date: '2026-09-28',
    startTime: '18:00',
    endTime: '20:00'
};

const ALL_SEATS = [
    'A1-1','A1-2','A1-3','A1-4','A1-5','A1-6',
    'B1-1','B1-2','B1-3','B1-4',
    'B2-1','B2-2','B2-3','B2-4',
    'B3-1','B3-2','B3-3','B3-4',
    'B4-1','B4-2','B4-3','B4-4',
    'B5-1','B5-2','B5-3','B5-4'
];

const state = {
    reserved: new Set(),
    selected: new Set(),
    lookup: null
};

function $(id) { return document.getElementById(id); }
function openModal(id) { $(id).classList.remove('hidden'); }
function closeModal(id) { $(id).classList.add('hidden'); }
function setError(id, message) {
    const el = $(id);
    el.textContent = message || '';
    el.classList.toggle('hidden', !message);
}
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

function makeSeat(id) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = `seat-${id}`;
    btn.className = 'seat';
    btn.addEventListener('click', () => toggleSeat(id));
    return btn;
}

function appendSeats(targetId, ids) {
    const target = $(targetId);
    ids.forEach(id => target.appendChild(makeSeat(id)));
}

function buildLayout() {
    appendSeats('A1Top', ['A1-1','A1-2','A1-3']);
    appendSeats('A1Bottom', ['A1-4','A1-5','A1-6']);

    // B1 is intentionally one horizontal row of four connected seats.
    appendSeats('B1Row', ['B1-1','B1-2','B1-3','B1-4']);

    appendSeats('B2Top', ['B2-1','B2-2']);
    appendSeats('B2Bottom', ['B2-3','B2-4']);

    const wrap = $('B3B5');
    ['B3','B4','B5'].forEach(table => {
        const block = document.createElement('div');
        block.className = 'table-four';
        block.innerHTML = `
            <div id="${table}Top" class="seat-row"></div>
            <div class="table-box four-table-box">${table} · 4P</div>
            <div id="${table}Bottom" class="seat-row"></div>`;
        wrap.appendChild(block);
        appendSeats(`${table}Top`, [`${table}-1`,`${table}-2`]);
        appendSeats(`${table}Bottom`, [`${table}-3`,`${table}-4`]);
    });
}

function renderSeat(id) {
    const el = $(`seat-${id}`);
    const reserved = state.reserved.has(id);
    const selected = state.selected.has(id);
    el.disabled = reserved;
    el.className = `seat${reserved ? ' reserved' : selected ? ' selected' : ''}`;
    el.setAttribute('aria-label', `${id} ${reserved ? 'reserved' : selected ? 'selected' : 'available'}`);
    el.title = `${id} · ${reserved ? 'Reserved' : selected ? 'Selected' : 'Available'}`;
    el.innerHTML = `<span>${id}</span>`;
}

function renderAll() { ALL_SEATS.forEach(renderSeat); }

function toggleSeat(id) {
    if (state.reserved.has(id)) return;
    state.selected.has(id) ? state.selected.delete(id) : state.selected.add(id);
    renderSeat(id);
    updateSelection();
}

function updateSelection() {
    $('selectedCount').textContent = state.selected.size;
    const dock = $('selectionDock');
    if (dock) dock.classList.toggle('hidden', state.selected.size === 0);
}

function clearSelection() {
    const previous = [...state.selected];
    state.selected.clear();
    previous.forEach(renderSeat);
    updateSelection();
}

async function readJson(response) {
    const text = await response.text();
    try { return JSON.parse(text); }
    catch { throw new Error('The reservation service returned an invalid response.'); }
}

async function gasGet(params) {
    const url = new URL(SEAT_SCRIPT_URL);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    url.searchParams.set('_', Date.now().toString());
    const response = await fetch(url.toString(), { method: 'GET', cache: 'no-store', redirect: 'follow' });
    const data = await readJson(response);
    if (!data.success) throw new Error(data.message || 'Request failed.');
    return data;
}

async function gasPost(payload) {
    const response = await fetch(SEAT_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    });
    const data = await readJson(response);
    if (!data.success) {
        const error = new Error(data.message || 'Request failed.');
        error.code = data.code;
        error.takenSeats = data.takenSeats || [];
        throw error;
    }
    return data;
}

async function loadSeats() {
    const status = $('availabilityStatus');
    status.textContent = 'Loading seat availability…';
    try {
        const data = await gasGet({ action: 'seats' });
        state.reserved = new Set(data.reservedSeats || []);
        [...state.selected].forEach(id => {
            if (state.reserved.has(id)) state.selected.delete(id);
        });
        renderAll();
        updateSelection();
        const openCount = ALL_SEATS.length - state.reserved.size;
        status.textContent = `${openCount} seats available · Updated ${new Date().toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})}`;
    } catch (error) {
        status.textContent = 'Could not load live seat availability. Use Refresh Seats to try again.';
        console.error(error);
    }
}

function openBooking() {
    if (!state.selected.size) return;
    $('bookingSeats').textContent = [...state.selected].join(', ');
    $('bookingGuests').textContent = String(state.selected.size);
    setError('bookingError', '');
    openModal('bookingModal');
}

async function confirmBooking() {
    const name = $('guestName').value.trim();
    const email = $('guestEmail').value.trim().toLowerCase();
    const seats = [...state.selected];
    if (!name) return setError('bookingError', 'Please enter your name.');
    if (!validEmail(email)) return setError('bookingError', 'Please enter a valid email address.');
    if (!seats.length) return setError('bookingError', 'Please select at least one seat.');

    const btn = $('confirmBookingBtn');
    btn.disabled = true;
    btn.textContent = 'Submitting…';
    setError('bookingError', '');
    try {
        const data = await gasPost({
            action: 'book',
            name,
            email,
            seats,
            date: EVENT.date,
            startTime: EVENT.startTime,
            endTime: EVENT.endTime
        });
        closeModal('bookingModal');
        clearSelection();
        await loadSeats();
        const customerMail = data.emailCustomer ? 'Customer confirmation email sent.' : 'Customer confirmation email could not be sent.';
        const ownerMail = data.emailOwner ? 'Store notification email sent.' : 'Store notification email could not be sent.';
        showNotice(
            '✓',
            'Reservation Confirmed',
            `Your reservation is confirmed.<br><span class="code-box">${escapeHtml(data.bookingCode)}</span><br><br>${escapeHtml(customerMail)}<br>${escapeHtml(ownerMail)}<br><br>Please save your reservation number. You can use it with your email address to withdraw the reservation from any device.`
        );
    } catch (error) {
        if (error.code === 'SEAT_TAKEN' && error.takenSeats.length) {
            setError('bookingError', `These seats were just reserved by someone else: ${error.takenSeats.join(', ')}. Please close this window and choose another seat.`);
            await loadSeats();
        } else {
            setError('bookingError', error.message || 'Reservation failed. Please try again.');
        }
    } finally {
        btn.disabled = false;
        btn.textContent = 'Confirm Reservation';
    }
}

function openManage() {
    state.lookup = null;
    setError('manageError', '');
    openModal('manageModal');
}

async function findBooking() {
    const email = $('manageEmail').value.trim().toLowerCase();
    const bookingCode = $('manageCode').value.trim().toUpperCase();
    if (!validEmail(email)) return setError('manageError', 'Please enter the email used for the reservation.');
    if (!bookingCode) return setError('manageError', 'Please enter your reservation number.');
    const btn = $('findBookingBtn');
    btn.disabled = true;
    btn.textContent = 'Looking up…';
    setError('manageError', '');
    try {
        const data = await gasPost({ action: 'find', email, bookingCode });
        state.lookup = { email, bookingCode, reservation: data.reservation };
        closeModal('manageModal');
        const r = data.reservation;
        $('reservationDetail').innerHTML = `
            <div><strong>Reservation:</strong> ${escapeHtml(r.bookingCode)}</div>
            <div><strong>Name:</strong> ${escapeHtml(r.name)}</div>
            <div><strong>Date:</strong> September 28, 2026</div>
            <div><strong>Time:</strong> 6:00 PM–8:00 PM</div>
            <div><strong>Seats:</strong> ${escapeHtml(r.seats.join(', '))}</div>
            <div><strong>Guests:</strong> ${r.seats.length}</div>`;
        openModal('detailModal');
    } catch (error) {
        setError('manageError', error.message || 'Reservation not found.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Find Reservation';
    }
}

async function withdrawReservation() {
    if (!state.lookup) return;
    if (!window.confirm('Withdraw this reservation and release all of its seats?')) return;
    const btn = $('withdrawBtn');
    btn.disabled = true;
    btn.textContent = 'Withdrawing…';
    try {
        const data = await gasPost({
            action: 'cancel',
            email: state.lookup.email,
            bookingCode: state.lookup.bookingCode
        });
        state.lookup = null;
        closeModal('detailModal');
        await loadSeats();
        showNotice(
            '✓',
            'Reservation Withdrawn',
            `The reservation has been cancelled and the seats are available again.<br><br>${data.emailCustomer ? 'Cancellation email sent to the customer.' : 'Customer cancellation email could not be sent.'}<br>${data.emailOwner ? 'Cancellation notice sent to the store.' : 'Store cancellation email could not be sent.'}`
        );
    } catch (error) {
        showNotice('!', 'Withdrawal Failed', escapeHtml(error.message || 'Could not withdraw the reservation.'));
    } finally {
        btn.disabled = false;
        btn.textContent = 'Withdraw Reservation';
    }
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function showNotice(icon, title, html) {
    $('noticeIcon').textContent = icon;
    $('noticeTitle').textContent = title;
    $('noticeBody').innerHTML = html;
    openModal('noticeModal');
}

$('refreshSeatsBtn').addEventListener('click', loadSeats);
$('manageBtn').addEventListener('click', openManage);
$('reserveBtn').addEventListener('click', openBooking);
$('clearBtn').addEventListener('click', clearSelection);
$('confirmBookingBtn').addEventListener('click', confirmBooking);
$('findBookingBtn').addEventListener('click', findBooking);
$('withdrawBtn').addEventListener('click', withdrawReservation);
document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.close)));
['bookingModal','manageModal','detailModal','noticeModal'].forEach(id => {
    $(id).addEventListener('click', event => { if (event.target === $(id)) closeModal(id); });
});

buildLayout();
renderAll();
loadSeats();
