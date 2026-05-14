const calendarDates = document.querySelector('.calendar-dates');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Variabler til at gemme valgte datoer på tværs af måneder
let selectedStart = null;
let selectedEnd = null;

const months = [
    'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'December'
];

function renderCalendar(month, year) {
    // Ryd tidligere render
    calendarDates.innerHTML = '';

    // Opdater header tekst
    monthYear.textContent = `${months[month]} ${year}`;

    // Find første dag i måneden
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
    if (e.target.textContent !== '') {

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
});