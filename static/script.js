$(document).ready(function() {
  $.get("/api/discovery-check", function(data) {
    if (data.reachable) {
      $("#BackToMainsail").show();  // o rimuovi classe .d-none
    } else {
      $("#BackToMainsail").hide();  // o aggiungi classe .d-none
    }
  });
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
    alert(JSON.stringify(data));
}

async function powerOn() {
    const res = await fetch(`${baseUrl}power`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ on: true })
    });
}

async function powerOff() {

    const res = await fetch(`${baseUrl}power`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ on: false })
    });
}

async function getStatus() {
    const res = await fetch(`${baseUrl}status`);
    const data = await res.json();
    document.getElementById("statusOutput").innerText = JSON.stringify(data);
}