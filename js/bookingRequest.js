//Fetch Booking.
document.getElementById("submitButton").addEventListener("click", function (e) {
    e.preventDefault();

    //Find all checkboxes in enum addOns.
    const addOns = Array.from(document.querySelectorAll('input[name="addOns"]:checked'))
        .map(cb => cb.value);

    //Create object with all the booking information.
    const bookingData = {
        companyName: document.getElementById("companyName").value,
        address: document.getElementById("address").value,
        email: document.getElementById("email").value,
        guests: parseInt(document.getElementById("guests").value),
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value,
        description: document.getElementById("description").value,
        bookingStatus: "PENDING",
        addOns: addOns
    };

    //Send to backend server.
    fetch("http://localhost:8080/booking/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
    })
        //after, it sends a response.
        .then(response => {
            if (response.ok) {
                console.log("booking response: ok.");
            }
        })
        .catch(error => {
            console.error("error: ", error);
        });
});