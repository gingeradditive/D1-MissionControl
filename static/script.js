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

//----------------------------------------------

function updateGauge(currentTemp, setTemp) {
    const maxTemp = 120;
    const angle = (currentTemp / maxTemp) * 180;
    const setAngle = (setTemp / maxTemp) * 180;

    // Aggiorna progress bar conic-gradient
    document.getElementById('gaugeFill').style.background =
        `conic-gradient(#0d6efd ${angle}deg, #ddd ${angle}deg 180deg)`;

    // Aggiorna temperature
    document.getElementById('currentTemperature').textContent = currentTemp;
    document.getElementById('setTemperature').textContent = setTemp;

    const tolerance = 0.05 * setTemp;
    if (setTemp === 0) {
        tolerance = infinity;
    }

    // change color progress bar to green if currentTemp is +-5% setTemp
    if (currentTemp >= setTemp - tolerance && currentTemp <= setTemp + tolerance) {
        document.getElementById('gaugeFill').style.background =
            `conic-gradient(#198754 ${angle}deg, #ddd ${angle}deg 180deg)`;
    } else {
        document.getElementById('gaugeFill').style.background =
            `conic-gradient(#0d6efd ${angle}deg, #ddd ${angle}deg 180deg)`;
    }

    // change color progress bar to red if currentTemp is +5% setTemp
    if (currentTemp > setTemp + tolerance) {
        document.getElementById('gaugeFill').style.background =
            `conic-gradient(#dc3545 ${angle}deg, #ddd ${angle}deg 180deg)`;
    }


    // Ruota marker del set point
    const marker = document.getElementById('setPointMarker');
    marker.style.transform = `rotate(${setAngle}deg)`;
}

function updateDryerStatus(powerOn, mode, minutesLeft) {
    const powerStatus = document.getElementById('dryerPowerStatus');
    const dryerMode = document.getElementById('dryerMode');
    const timeLeft = document.getElementById('dryerTimeLeft');

    // Stato acceso/spento
    powerStatus.textContent = powerOn ? 'ON' : 'OFF';
    powerStatus.className = `badge ${powerOn ? 'bg-success' : 'bg-secondary'}`;

    // Modalità: Drying o Regeneration
    dryerMode.textContent = mode;
    if (mode === 'Drying') {
        dryerMode.className = 'badge bg-primary';
    } else if (mode === 'Regeneration') {
        dryerMode.className = 'badge bg-warning text-dark';
    } else {
        dryerMode.className = 'badge bg-light text-dark';
    }

    // Tempo rimanente
    timeLeft.textContent = `${minutesLeft} min`;
}
//---------------------------------------------

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
    $.get("/api/status", function (data) {
        if (data.status == "error") {
            if ($("#liveToast").hasClass("show")) {
                return;
            }

            var toastEl = $('#liveToast');
            var toast = new bootstrap.Toast(toastEl[0], {
                autohide: false
            });

            $("#liveToast .toast-body").text(data.message);
            $("#liveToast .me-auto").text("ERROR");
            $("#liveToast .taost-time").text(new Date().toLocaleTimeString());
            toast.show();
            return;
        }

        updateGauge(data.CurrentTemperature, data.TemperatureSet)
        updateDryerStatus(data.DryerStatus, "---", "---")
        // $("#dryerStatus").text(data.DryerStatus);
    });
}