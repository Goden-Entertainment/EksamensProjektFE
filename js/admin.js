const API_URL = 'http://20.251.162.251/api/';

async function fetchBookings(){
    const res = await fetch(`${API_URL}/booking/all`);
    const bookings = await res.json();
    console.log(bookings);
}

fetchBookings();