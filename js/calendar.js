const calendarDates = document.querySelector('.calendar-dates');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
//DENNE API_URL SKAL ÆNDRES NÅR VI DEPLOYER
const API_URL = 'http://localhost:8080';

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const months = [
    'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'December'
];

let bookedDates = new Set();
let blockedDates = new Set();

//Modtager en startDato og endDato, og returnerer alle dage imellem som individuelle datoer i et Set(List)
function expandDateRange(startDate, endDate) {
    const dates = new Set();
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        dates.add(current.toISOString().split('T')[0]); // Converts JS Date object from earlier to a string like this: "2025-05-15T00:00:00.000Z"
        current.setDate(current.getDate() + 1); //Makes the day loop from the current date to the end date. Instead of only having 15th may and 20th may it will be 15, 16, 17 etc.
    }
    return dates;
}

async function fetchCalendarData() {
    try {
        //Henter Backend Booking objekter ned og omdanner til JS.
        const res = await fetch(`${API_URL}/booking/all`)
        const bookings = await res.json();

        //Tomme lister der bliver udfyldt.
        bookedDates = new Set();
        blockedDates = new Set();

        //Benytter de forskellige parameter siden vi har tilgået backend nu.
        bookings.forEach(function (booking) {
            const status = booking.bookingStatus;
            const start = booking.startDate;
            const end = booking.endDate;

            if (status === 'APPROVED') {
                const dates = expandDateRange(start, end);
                dates.forEach(function (date) {
                    bookedDates.add(date);
                });
            }

            if (status === 'BLOCKED') {
                const dates = expandDateRange(start, end);
                dates.forEach(function (date) {
                    blockedDates.add(date);
                });
            }
        });

    } catch (err) {
        console.error('Fejl ved hentning af kalenderdata:', err);
    }
}

//func gør at den måde vi har kalender skrevet i frontend og backend bliver ens, så de kan sammenlignes. Fx fra '2025, 05, 17' til 2025-05-17.
function toDateKey(day, month, year) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

async function renderCalendar(month, year) {
    //Clear previous render.
    calendarDates.innerHTML = '';

    //update header text.
    monthYear.textContent = `${months[month]} ${year}`;

    //Henter data fra backend før vi renderer kalenderen.
    await fetchCalendarData();

    //Get the first day of the month
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

    //Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    //Get today's date for highlighting
    const today = new Date();

    //Create empty placeholder, if the 1st of the month is not on Monday.
    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement('div');
        calendarDates.appendChild(blank);
    }

    //Loop through every day in the month, and create cell for each one.
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.textContent = i.toString();

        //Check if this cell matches today's date. Highlight today's date
        if (
            i === today.getDate() &&
            year === today.getFullYear() &&
            month === today.getMonth()
        ) {
            day.classList.add('current-date');
        }


        const key = toDateKey(i, month, year);

        // tjek om datoen er blokeret eller booket og tilføj CSS klasse
        if (blockedDates.has(key)) {
            day.classList.add('date-blocked');
            day.dataset.type = 'blocked';
        } else if (bookedDates.has(key)) {
            day.classList.add('date-booked');
            day.dataset.type = 'booked';
        }

        calendarDates.appendChild(day);
    }
}

renderCalendar(currentMonth, currentYear);

//Navigate to previous month
prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});

//Navigate to next month
nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
});

calendarDates.addEventListener('click', (e) => {
    const target = e.target;
    if (!target.textContent) return;

    const type = target.dataset.type;

    // Blokerede og bookede datoer kan ikke klikkes
    if (type === 'blocked') {
        alert('Denne dato er blokeret af admin.');
        return;
    }
    if (type === 'booked') {
        alert('Denne dato er allerede booket.');
        return;
    }

    // TODO: Udskift med din booking logik
    alert(`Du klikkede på ${target.textContent} ${months[currentMonth]} ${currentYear}`);
});