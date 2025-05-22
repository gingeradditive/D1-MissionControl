// 1. Istanza globale del grafico
let tempChart;

// 2. Inizializzazione solo una volta
function initChart(initialData, labels) {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature',
                data: initialData,
                borderColor: 'rgb(255, 193, 7)',
                backgroundColor: 'rgba(255, 193, 7, 0.2)',
                color: 'rgb(255, 193, 7)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                }
            }
        },
    });
}

// 3. Update senza ricreare
function updateChart(newData, newLabels) {
    if (!tempChart) return;

    const removeCount = newData.length;

    // Rimuove gli elementi più vecchi
    tempChart.data.labels.splice(0, removeCount);
    tempChart.data.datasets[0].data.splice(0, removeCount);

    // Aggiunge i nuovi elementi
    tempChart.data.labels.push(...newLabels);
    tempChart.data.datasets[0].data.push(...newData);

    // Aggiorna il grafico
    tempChart.update();
}


function fetchAndUpdate(from) {

    $.getJSON(`/history?from=${from}`, function (data) {
        const labels = data.History.map(item => {
            const date = new Date(item.timestamp * 1000);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        });
        const temps = data.History.map(item => item.temperature);
        if (!tempChart) {
            initChart(temps, labels);
        }
        else {
            updateChart(temps, labels);
        }
    });
}

$(document).ready(function () {
    const now = Math.floor(Date.now() / 1000);
    const from = now - 3600;
    fetchAndUpdate(from);

    // Aggiorna ogni minuto
    setInterval(() => {
        try {
            // get last data timestamp
            const lastDataTimestampTXT = tempChart.data.labels[tempChart.data.labels.length - 1]; //string as HH:mm
            //Parse time 
            const lastDataTimestamp = new Date();
            lastDataTimestamp.setHours(lastDataTimestampTXT.split(':')[0]);
            lastDataTimestamp.setMinutes(lastDataTimestampTXT.split(':')[1]);
            lastDataTimestamp.setSeconds(0);

            fetchAndUpdate(Math.floor(lastDataTimestamp / 1000));
        } catch (error) {
            console.error("Error updating chart:", error);
        }
    }, 60 * 1000);

    // Cambio selezione
    $('#rangeSelector').on('change', function () {
        currentRange = parseInt($(this).val());
        const now = Math.floor(Date.now() / 1000);
        const from = now - (currentRange * 3600);

        fetchAndUpdate(from);
    });
});