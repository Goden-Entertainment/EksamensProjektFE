const API_URL = 'http://localhost:8080';
let currentBooking = null;
const alleBtn = document.getElementById('btn-alle');
const afventerBtn = document.getElementById('btn-afventer');
const godkendtBtn = document.getElementById('btn-godkendt');
const afvistBtn = document.getElementById('btn-afvist');
const newestBtn = document.getElementById('btn-newest')
const oldestBtn = document.getElementById('btn-oldest')
const addOnsLabels = {
    OMF: "Overnatning med forplejning",
    OUF: "Overnatning uden forplejning",
    DM: "Dagsmøde"
};

const token = localStorage.getItem('token');

async function fetchBookings() {
    const res = await fetch(`${API_URL}/booking/all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const bookings = await res.json();

    const pendingBookingRequestCount = bookings.filter(booking => booking.bookingStatus === 'PENDING').length;
    const badge = document.getElementById('notifCount');
    badge.textContent = pendingBookingRequestCount;
    badge.style.display = pendingBookingRequestCount > 0 ? 'inline-block' : 'none';

    //Update count in browser tab title
    showNotificationCount(pendingBookingRequestCount);

    const list = document.getElementById('bookings-list');
    list.innerHTML = '';

    if (bookings.length === 0) {
        list.innerHTML = '<p>Der er ingen anmodninger at vise i øjeblikket</p>';
        return;
    }

    bookings.forEach(function(booking) {
        if(booking.bookingStatus === 'BLOCKED') return;
        const row = document.createElement('div');
        row.classList.add('table-row');
        row.dataset.status = booking.bookingStatus;
        const addOnsDisplay = addOnsLabels[booking.addOns] ?? booking.addOns;
        row.dataset.date = booking.startDate;
        row.innerHTML = `
            <div>${booking.startDate} - ${booking.endDate}</div>
            <div>${booking.companyName}</div>
            <div>${addOnsDisplay}</div>
            <div>${booking.guests}</div>
            <div><span class="${statusClass(booking.bookingStatus)}">${translateStatus(booking.bookingStatus)}</span></div>
        `;
        row.addEventListener('click', function () {
            openPanel(booking);
        });
        list.appendChild(row);
    });
    updateNotificationDropdown(bookings);
}

//show new booking request in title.
function showNotificationCount (count) {
    //Looks for count
    const pattern = /^\(\d+\)/;

    if(count === 0 || pattern.test(document.title)) {
        document.title = document.title.replace(pattern, count === 0 ? "" : "(" + count + ")");
    }else {
        document.title = "(" + count + ") " + document.title;
    }
}

function sortBookings(order) {
    const list = document.getElementById('bookings-list')
    const rows = Array.from(list.querySelectorAll('.table-row'));

    rows.sort(function (a, b) {
        const dateA = new Date(a.dataset.date);
        const dateB = new Date(b.dataset.date);

        if (order === 'newest') {
            return dateB - dateA;
        } else {
            return dateA - dateB;
        }
    });

    rows.forEach(function (row) {
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
    rows.forEach(function (row) {
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
    currentBooking = booking;

    document.getElementById('panelTitle').textContent = 'Anmodning fra ' + booking.companyName;
    document.getElementById('panelStart').textContent = booking.startDate;
    document.getElementById('panelEnd').textContent = booking.endDate;
    document.getElementById('panelGuests').textContent = booking.guests;
    document.getElementById('panelType').textContent = addOnsLabels[booking.addOns] ?? booking.addOns;
    document.getElementById('panelStatus').textContent = translateStatus(booking.bookingStatus);
    document.getElementById('panelName').textContent = booking.companyName;
    document.getElementById('panelEmail').textContent = booking.email;
    document.getElementById('panelPhone').textContent = booking.phonenumber ?? '';
    document.getElementById('panelDescription').textContent = booking.description;
    document.getElementById('panelError').textContent = '';

    document.getElementById('editStart').value = booking.startDate;
    document.getElementById('editEnd').value = booking.endDate;
    document.getElementById('editGuests').value = booking.guests;
    document.getElementById('editType').value = booking.addOns;
    document.getElementById('editStatus').value = booking.bookingStatus;
    document.getElementById('editName').value = booking.companyName;
    document.getElementById('editEmail').value = booking.email;
    document.getElementById('editPhone').value = booking.phonenumber ?? '';
    document.getElementById('editDescription').value = booking.description;

    const panel = document.getElementById('bookingPanel');
    panel.classList.remove('editing');
    panel.classList.add('active');
    document.getElementById('overlay').classList.add('active');

}

// Luk panel
function closePanel() {
    const panel = document.getElementById('bookingPanel');
    panel.classList.remove('active', 'editing');
    document.getElementById('overlay').classList.remove('active');
    currentBooking = null;
}

function toggleEdit() {
    document.getElementById('bookingPanel').classList.toggle('editing');
    document.getElementById('panelError').textContent = '';
}

async function saveBooking() {
    const token = localStorage.getItem('token');
    const body = {
        companyName: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        phonenumber: document.getElementById('editPhone').value,
        guests: parseInt(document.getElementById('editGuests').value),
        startDate: document.getElementById('editStart').value,
        endDate: document.getElementById('editEnd').value,
        description: document.getElementById('editDescription').value,
        addOns: document.getElementById('editType').value,
        bookingStatus: document.getElementById('editStatus').value
    };

    try {
        const res = await fetch(`${API_URL}/booking/update/${currentBooking.bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (res.status === 409) {
            const message = await res.text();
            showToast('overlapToast', message);
            return;
        }

        if (!res.ok) {
            document.getElementById('panelError').textContent = 'Kunne ikke gemme ændringerne. Prøv igen.';
            return;
        }

        closePanel();
        fetchBookings();
    } catch (e) {
        document.getElementById('panelError').textContent = 'Netværksfejl. Prøv igen.';
    }
}

function updateNotificationDropdown(bookings) {
    const dropdown = document.getElementById('notificationsDropdown');
    dropdown.querySelectorAll('.notification-item').forEach(el => el.remove());
    bookings.filter(b => b.bookingStatus === 'PENDING' && !getReadIds().includes(b.bookingId)).forEach(function(booking) {
        if (booking.bookingStatus === 'BLOCKED') return;

        const item = document.createElement('a');
        item.classList.add('notification-item');
        item.href = '#';
        item.dataset.bookingId = booking.bookingId;
        item.textContent = `${booking.companyName} — ${booking.startDate}`;
        item.addEventListener('click', function(e) {
            e.preventDefault();
            markAsRead(booking.bookingId);
            item.remove();
            updateBadge();
            openPanel(booking);
        });

        dropdown.appendChild(item);
    });
    updateBadge();
}

function getReadIds() {
    return JSON.parse(localStorage.getItem('readBookingIds') || '[]');
}

function markAsRead(bookingId) {
    const readIds = getReadIds();
    if (!readIds.includes(bookingId)) {
        readIds.push(bookingId);
        localStorage.setItem('readBookingIds', JSON.stringify(readIds));
    }
}

function updateBadge() {
    const count = document.querySelectorAll('.notification-item').length;
    const badge = document.getElementById('notifCount');
    const btn = document.querySelector('.notificationBtn');

    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';

    if (count > 0) {
        btn.classList.add('has-notifications');
    } else {
        btn.classList.remove('has-notifications');
    }
}

async function approveRequest() {
    currentBooking.bookingStatus = 'APPROVED';

    const response = await fetch(API_URL + "/booking/update/" + currentBooking.bookingId, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(currentBooking)
    });

    if (response.status === 409) {
        const message = await response.text();
        showToast('overlapToast', message);
        return;
    }

    if(response.ok){
        closePanel();
        fetchBookings();
    }
}

function showToast(toastId, message) {
    const toastElement = document.getElementById(toastId);
    document.getElementById(toastId + 'Message').textContent = message;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

async function rejectRequest() {
    currentBooking.bookingStatus = 'REJECTED';

    const response = await fetch(API_URL + "/booking/update/" + currentBooking.bookingId, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(currentBooking)
    });

    if(response.ok){
        closePanel();
        fetchBookings();
    }
}

 fetchBookings();

alleBtn.addEventListener('click', function() {
    document.querySelectorAll('.filter-buttons button').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    filterBookings('ALLE');
});

afventerBtn.addEventListener('click', function() {
    document.querySelectorAll('.filter-buttons button').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    filterBookings('PENDING');
});

godkendtBtn.addEventListener('click', function() {
    document.querySelectorAll('.filter-buttons button').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    filterBookings('APPROVED');
});

afvistBtn.addEventListener('click', function() {
    document.querySelectorAll('.filter-buttons button').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    filterBookings('REJECTED');
});

newestBtn.addEventListener('click', function (){
    sortBookings('newest');
});

oldestBtn.addEventListener('click', function (){
    sortBookings('oldest');
});

document.getElementById('markAllReadBtn').addEventListener('click', function () {
    document.querySelectorAll('.notification-item').forEach(element => {
        markAsRead(element.dataset.bookingId);
        element.remove();
    });
    updateBadge();
});

document.querySelector('.notificationBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    document.getElementById('notificationsDropdown').classList.toggle('open');
});

document.addEventListener('click', function () {
    document.getElementById('notificationsDropdown').classList.remove('open');
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '../index.html';
}