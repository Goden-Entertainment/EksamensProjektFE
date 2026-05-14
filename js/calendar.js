const calendarDates = document.querySelector('.calendar-dates');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
//DENNE API_URL SKAL ÆNDRES NÅR VI DEPLOYER
const API_URL = 'http://localhost:8080';

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Variabler til at gemme valgte datoer på tværs af måneder
let selectedStart = null;
let selectedEnd = null;

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

    // Opdater header tekst
    monthYear.textContent = `${months[month]} ${year}`;

    //Henter data fra backend før vi renderer kalenderen.
    await fetchCalendarData();

    //Get the first day of the month
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

    // Find antal dage i måneden
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Hent dagens dato til markering
    const today = new Date();

    // Opret tomme pladsholdere hvis måneden ikke starter på mandag
    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement('div');
        calendarDates.appendChild(blank);
    }

    // Loop gennem alle dage og opret en celle for hver
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.textContent = i.toString();

        // Markér dagens dato
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

    // Genfarv valgte datoer EFTER alle dage er tilføjet til DOM
    if (selectedStart && selectedEnd) {
        const start = new Date(selectedStart);
        const end = new Date(selectedEnd);

        document.querySelectorAll('.calendar-dates div').forEach(d => {
            if (d.textContent !== '') {
                const cellDay = d.textContent.padStart(2, '0');
                const cellMonth = String(month + 1).padStart(2, '0');
                const cellDate = new Date(`${year}-${cellMonth}-${cellDay}`);

                // Tilføj grøn markering hvis datoen er inden for det valgte interval
                if (cellDate >= start && cellDate <= end) {
                    d.classList.add('selected-date');
                }
            }
        });
    }
}

renderCalendar(currentMonth, currentYear);

// Naviger til forrige måned
prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});

// Naviger til næste måned
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
        // Byg datostrengen i formatet yyyy-mm-dd
        const day = e.target.textContent.padStart(2, '0');
        const month = String(currentMonth + 1).padStart(2, '0');
        const dateString = `${currentYear}-${month}-${day}`;

        // Hent referencer til de to dato input felter
        const startDate = document.getElementById("startDate");
        const endDate = document.getElementById("endDate");

        // Hvis begge felter allerede er udfyldt, nulstil alt og start forfra
        if (startDate.value && endDate.value) {
            startDate.value = '';
            endDate.value = '';
            selectedStart = null;
            selectedEnd = null;
            document.querySelectorAll('.calendar-dates div').forEach(d => d.classList.remove('selected-date'));
        }

        // Hvis startDate er tom, sæt den første valgte dato
        if (!startDate.value) {
            startDate.value = dateString;
            selectedStart = dateString;
            e.target.classList.add('selected-date');
        } else {
            // Ellers sæt den anden valgte dato som slutdato
            endDate.value = dateString;
            selectedEnd = dateString;

            // Markér alle datoer mellem start og slut med grøn
            const start = new Date(startDate.value);
            const end = new Date(endDate.value);

            document.querySelectorAll('.calendar-dates div').forEach(d => {
                if (d.textContent !== '') {
                    const cellDay = d.textContent.padStart(2, '0');
                    const cellDate = new Date(`${currentYear}-${month}-${cellDay}`);

                    // Tilføj grøn markering hvis datoen er inden for intervallet
                    if (cellDate >= start && cellDate <= end) {
                        d.classList.add('selected-date');
                    }
                }
            });
        }
    }
    if (type === 'booked') {
        alert('Denne dato er allerede booket.');
        return;
    }

    // TODO: Udskift med din booking logik
    alert(`Du klikkede på ${target.textContent} ${months[currentMonth]} ${currentYear}`);
});