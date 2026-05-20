const API_URL = 'http://20.251.162.251/api/';
const EMPTY_MESSAGE = 'Der er ingen anmodninger at vise i øjeblikket';

async function fetchBookings() {
    const res = await fetch(`${API_URL}booking/all`);
    const bookings = await res.json();
    console.log(bookings);

    const list = document.getElementById('bookings-list');
    list.innerHTML = '';

    if (bookings.length === 0) {
        list.innerHTML = `<p>${EMPTY_MESSAGE}</p>`;
    } else {
        bookings.forEach(booking => {
            const bookingRow = document.createElement('div');
            bookingRow.classList.add('table-row');
            bookingRow.innerHTML = `
            <div>${booking.startDate} - ${booking.endDate}</div>
            <div>${booking.companyName}</div>
            <div>${booking.addOns}</div>
            <div>${booking.guests}</div>
            <div>${booking.bookingStatus}</div>`;

            // Tilføj klik event der åbner panelet med booking data
            bookingRow.addEventListener('click', () => openPanel(booking));

            list.appendChild(bookingRow);
        });
    }
}

// Åbn panel med booking data
function openPanel(booking) {
    document.getElementById('panelTitle').textContent = 'Anmodning fra ' + booking.companyName;
    document.getElementById('panelStart').textContent = booking.startDate;
    document.getElementById('panelEnd').textContent = booking.endDate;
    document.getElementById('panelGuests').textContent = booking.guests;
    document.getElementById('panelType').textContent = booking.addOns;
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