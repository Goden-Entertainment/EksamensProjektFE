const API_URL = 'http://20.251.162.251/api/';
const EMPTY_MESSAGE = 'Der er ingen anmodninger at vise i øjeblikket';

async function fetchBookings() {
    const res = await fetch(`${API_URL}/booking/all`);
    const bookings = await res.json();
    console.log(bookings);

    const list = document.getElementById('bookings-list');

    if (bookings.length === 0) {
        list.innerHTML = `<p>${EMPTY_MESSAGE}</p>`;
    } else {
        bookings.forEach(booking => {
            list.innerHTML += `
        <div class="table-row">
            <div>${booking.startDate} - ${booking.endDate}</div>
            <div>${booking.companyName}</div>
            <div>${booking.addOns}</div>
            <div>${booking.guests}</div>
            <div>${booking.bookingStatus}</div>
        </div>
    `;});
    }
}

fetchBookings();