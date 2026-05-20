//Fetch Booking.
document.getElementById("bookingForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const AddOnEnum = document.querySelector('input[name="addOns"]:checked');
    //Create object with all the booking information.
    const bookingData = {
        companyName: document.getElementById("companyName").value,
        phonenumber: document.getElementById("phonenumber").value,
        email: document.getElementById("email").value,
        guests: parseInt(document.getElementById("guests").value),
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value,
        description: document.getElementById("description").value,
        bookingStatus: "PENDING",
        addOns: AddOnEnum.value
    };
    console.log("Sending:", JSON.stringify(bookingData));
    //Send to backend server.
    fetch("http://20.251.162.251/api/booking/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
    })
        .then(response => {
            if (response.ok) {
                //Success Toast
                var toast = new bootstrap.Toast(document.getElementById('liveToast'));
                toast.show();
            } else {
                return response.text().then(errorMessage => {
                    console.log("Error details:", errorMessage);
                    //Error Toast
                    new bootstrap.Toast(document.getElementById("errorToast")).show();
                });
            }
        })
        .catch(error => {
            console.error("error: ", error);
        });
});