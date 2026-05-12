document.getElementById('bookingForm').addEventListener('submit', function (event) {
    event.preventDefault();

    var toast = new bootstrap.Toast(document.getElementById('liveToast'));
    toast.show();
});
