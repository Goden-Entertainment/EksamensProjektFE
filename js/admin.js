const API_URL = 'http://20.251.162.251/api';
const EMPTY_MESSAGE = 'Der er ingen anmodninger at vise i øjeblikket';
const alleBtn = document.getElementById('btn-alle');
const afventerBtn = document.getElementById('btn-afventer');
const godkendtBtn = document.getElementById('btn-godkendt');
const afvistBtn = document.getElementById('btn-afvist');
const addOnsLabels = {
    OMF: "Overnatning med forplejning",
    OUF: "Overnatning uden forplejning",
    DM: "Dagsmøde"
};

async function fetchBookings() {
    const res = await fetch(`${API_URL}/booking/all`);
    const bookings = await res.json();

    const list = document.getElementById('bookings-list');
    list.innerHTML = '';

    if (bookings.length === 0) {
        list.innerHTML = '<p>Der er ingen anmodninger at vise i øjeblikket</p>';
        return;
    }

    bookings.forEach(function(booking) {
        const row = document.createElement('div');
        row.classList.add('table-row');
        row.dataset.status = booking.bookingStatus;
        const addOnsDisplay = addOnsLabels[booking.addOns] ?? booking.addOns;
        row.innerHTML = `
            <div>${booking.startDate} - ${booking.endDate}</div>
            <div>${booking.companyName}</div>
            <div>${addOnsDisplay}</div>
            <div>${booking.guests}</div>
            <div><span class="${statusClass(booking.bookingStatus)}">${translateStatus(booking.bookingStatus)}</span></div>
        `;
        row.addEventListener('click', function() { openPanel(booking); });
        list.appendChild(row);
    });
}

// Funktion til at give statuserne farver
function statusClass(status) {
    if (status === 'PENDING') return 'status-afventer';
    if (status === 'APPROVED') return 'status-godkendt';
    if (status === 'REJECTED') return 'status-afvist';
    return '';
}

// Så det bliver på dansk
function translateStatus(status) {
    if (status === 'PENDING') return 'AFVENTER';
    if (status === 'APPROVED') return 'GODKENDT';
    if (status === 'REJECTED') return 'AFVIST';
    if (status === 'CANCELLED') return 'ANNULLERET';
    if (status === 'BLOCKED') return 'BLOKERET';
    return status;
}

function filterBookings(status) {
    const rows = document.querySelectorAll('.table-row');
    rows.forEach(function(row) {
        if (status === 'ALLE') {
            row.style.display = 'grid';
        } else if (row.dataset.status === status) {
            row.style.display = 'grid';
        } else {
            row.style.display = 'none';
        }
    });
}

// Åbn panel med booking data
function openPanel(booking) {
    document.getElementById('panelTitle').textContent = 'Anmodning fra ' + booking.companyName;
    document.getElementById('panelStart').textContent = booking.startDate;
    document.getElementById('panelEnd').textContent = booking.endDate;
    document.getElementById('panelGuests').textContent = booking.guests;
    document.getElementById('panelType').textContent = addOnsLabels[booking.addOns] ?? booking.addOns;
    document.getElementById('panelName').textContent = booking.companyName;
    document.getElementById('panelEmail').textContent = booking.email;
    document.getElementById('panelDescription').textContent = booking.description;

    document.getElementById('bookingPanel').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

// Luk panel
function closePanel() {
    document.getElementById('bookingPanel').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

fetchBookings();

alleBtn.addEventListener('click', function() {
    filterBookings('ALLE');
});

afventerBtn.addEventListener('click', function() {
    filterBookings('PENDING');
});

godkendtBtn.addEventListener('click', function() {
    filterBookings('APPROVED');
});

afvistBtn.addEventListener('click', function() {
    filterBookings('REJECTED');
});