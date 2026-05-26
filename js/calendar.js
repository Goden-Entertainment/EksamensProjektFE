const calendarDates = document.querySelector('.calendar-dates');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
//DENNE API_URL SKAL ÆNDRES NÅR VI DEPLOYER
const API_URL = 'http://20.251.162.251/api';

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
// Gemmer blokerede datoer som et Map i stedet for et Set, så vi kan slå bookingId op via dato når admin vil fjerne en blokering
let blockedDates = new Map(); // dato → { bookingId, reason }

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
        const res = await fetch(`${API_URL}/booking/all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const bookings = await res.json();

        //Tomme lister der bliver udfyldt.
        bookedDates = new Set();
        blockedDates = new Map(); // Nulstilles som Map så bookingId og årsag kan gemmes ved hver genindlæsning

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
                    blockedDates.set(date, { bookingId: booking.bookingId, reason: booking.reason });
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

        const cellDate = new Date(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);

        if(cellDate < today) {
            day.classList.add('date-past');
            day.dataset.type = "past";
        }

        const key = toDateKey(i, month, year);

        // tjek om datoen er blokeret eller booket og tilføj CSS klasse
        if (blockedDates.has(key)) {
            const blockData = blockedDates.get(key);
            day.classList.add('date-blocked');
            day.dataset.type = 'blocked';
            day.dataset.bookingId = blockData.bookingId; // Sætter bookingId direkte på kalenderfeltet i DOM'en, så klik-handleren kan læse det uden at søge i Map'et igen
            if (isAdminCalendar) {
                const reasonLabel = blockData.reason === 'PRIVATE' ? 'Privat' : 'Vedligeholdelse';
                day.title = `Blokeret: ${reasonLabel}`;
            }
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

// Tjekker om vi befinder os på admin-kalenderen ved at se om blokeringsformularen findes i DOM'en
const isAdminCalendar = !!document.getElementById('Block-form');

calendarDates.addEventListener('click', async (e) => {
    const target = e.target;
    if (!target.textContent) return;

    const type = target.dataset.type;

    if (type === 'blocked') {
        if (isAdminCalendar) {
            // Henter bookingId'et fra kalenderfeltet som blev sat under rendering
            const bookingId = target.dataset.bookingId;
            // Viser en bekræftelsesdialog så admin ikke fjerner en blokering ved et uheld
            if (!confirm('Vil du fjerne blokeringen af denne dato?')) return;
            try {
                // Sender en DELETE-anmodning til backend med det specifikke bookingId
                const res = await fetch(`${API_URL}/booking/delete/${bookingId}`, {
                    method: 'DELETE',
                    headers: {
                        // Vedlægger JWT-token fra localStorage så backend kan verificere at brugeren er admin
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    // Genindlæser kalenderen så den fjernede blokering forsvinder fra visningen
                    renderCalendar(currentMonth, currentYear);
                } else {
                    // Viser en fejlbesked hvis backend returnerer en fejlkode
                    alert('Kunne ikke fjerne blokeringen. Prøv igen.');
                }
            } catch (err) {
                // Fanges hvis der slet ikke kan oprettes forbindelse til serveren
                console.error('Fejl ved fjernelse af blokering:', err);
                alert('Kunne ikke oprette forbindelse til serveren.');
            }
        } else {
            // På bruger-kalenderen må blokerede datoer ikke kunne klikkes, så vi viser blot en besked
            alert('Denne dato er blokeret af admin.');
        }
        return;
    }
    if (type === 'booked') {
        alert('Denne dato er allerede booket.');
        return;
    }

    if(type === 'past')
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

    // // TODO: Udskift med din booking logik
    //alert(`Du klikkede på ${target.textContent} ${months[currentMonth]} ${currentYear}`);
});

// Henter blokeringsformularen fra DOM'en — den findes kun på adminCalendar.html
const blockForm = document.getElementById('Block-form');
// Tilføjer kun submit-lytteren hvis formularen faktisk findes på siden
if (blockForm) {
    blockForm.addEventListener('submit', async (e) => {
        // Forhindrer siden i at genindlæse sig selv ved indsendelse, som er standardadfærd for HTML-formularer
        e.preventDefault();
        // Henter fejlbesked-elementet og rydder en eventuel tidligere fejl
        const errorEl = document.getElementById('block-error');
        errorEl.textContent = '';

        // Læser de tre felter fra formularen
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const reason = document.getElementById('Blocking').value;

        // Validerer at alle felter er udfyldt inden vi sender til backend
        if (!startDate || !endDate || !reason) {
            errorEl.textContent = 'Udfyld venligst alle felter.';
            return;
        }

        // Validerer at slutdatoen ikke ligger før startdatoen
        if (new Date(endDate) < new Date(startDate)) {
            errorEl.textContent = 'Slutdato må ikke være før startdato.';
            return;
        }

        try {
            // Sender en POST-anmodning til backend med de valgte datoer og årsagen til blokeringen
            const res = await fetch(`${API_URL}/booking/block`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Fortæller backend at vi sender JSON
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Vedlægger JWT-token så backend kan verificere admin-adgang
                },
                body: JSON.stringify({ startDate, endDate, reason }) // Omdanner JavaScript-objektet til en JSON-streng
            });

            // Viser en fejlbesked hvis backend afviser anmodningen
            if (!res.ok) {
                errorEl.textContent = 'Noget gik galt. Prøv igen.';
                return;
            }

            // Nulstiller formularen så felterne er tomme til næste blokering
            blockForm.reset();
            // Nulstiller de gemte datoer så kalendermarkeringerne forsvinder
            selectedStart = null;
            selectedEnd = null;
            // Genindlæser kalenderen så de nyblokerede datoer vises med det samme
            renderCalendar(currentMonth, currentYear);
        } catch (err) {
            // Fanges hvis der slet ikke kan oprettes forbindelse til serveren
            console.error('Fejl ved blokering:', err);
            errorEl.textContent = 'Kunne ikke oprette forbindelse til serveren.';
        }
    });
}