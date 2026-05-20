const API_URL = 'http://20.251.162.251/api';
const EMPTY_MESSAGE = 'Der er ingen anmodninger at vise i øjeblikket';
const addOnsLabels = {
    OMF: "Overnatning med forplejning",
    OUF: "Overnatning uden forplejning",
    DM: "Dagsmøde"
};

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
            <div>${addOnsLabels[booking.addOns] ?? booking.addOns}</div>
            <div>${booking.guests}</div>
            <div>${booking.bookingStatus}</div>`;

            list.appendChild(bookingRow);
        });
    }
}

fetchBookings();