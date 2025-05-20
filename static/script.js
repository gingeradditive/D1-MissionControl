$(document).ready(function () {
    $.get("/api/discovery-check", function (data) {
        if (data.reachable) {
            $("#BackToMainsail").show();  // o rimuovi classe .d-none
        } else {
            $("#BackToMainsail").hide();  // o aggiungi classe .d-none
        }
    });

    //   Run function every 5 seconds
    setInterval(function () {
        updateStatus();
    }, 5000);

    updateStatus();
});

const baseUrl = "/api/";

async function setTemperature() {
    const value = document.getElementById("tempInput").value;
    const res = await fetch(`${baseUrl}setTemperature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: parseFloat(value) })
    });
    const data = await res.json();
    updateStatus();
}

async function powerOn() {
    const res = await fetch(`${baseUrl}power`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ on: true })
    });
    updateStatus();
}

async function powerOff() {

    const res = await fetch(`${baseUrl}power`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ on: false })
    });
    updateStatus();
}

function updateStatus() {
    // const res = await fetch(`${baseUrl}status`);
    // const data = await res.json();
    // document.getElementById("statusOutput").innerText = JSON.stringify(data);
    $.get("/api/status", function (data) {
        if (data.status == "error") {
            // show #liveToast 
            $("#liveToast .toast-body").text(data.message);
            $("#liveToast .me-auto").text("ERROR");
            $("#liveToast").toast("show");
        }

        $("#currentTemperature").text(data.CurrentTemperature);
        $("#setTemperature").text(data.TemperatureSet);
        // $("#dryerStatus").text(data.DryerStatus);
    });
}