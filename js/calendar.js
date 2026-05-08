const calendarDates = document.querySelector('.calendar-dates');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const months = [
    'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'December'
];

function renderCalendar(month, year) {
    //Clear previous render.
    calendarDates.innerHTML = '';

    //update header text.
    monthYear.textContent = `${months[month]} ${year}`;

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
    if (e.target.textContent !== '') {

        //TODO: Replace alert with functionality.
        alert(`Du klikkede på ${e.target.textContent} ${months[currentMonth]} ${currentYear}`);
    }
});