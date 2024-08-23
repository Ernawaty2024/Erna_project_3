let jsonData; // To hold the parsed JSON data
const ctx = document.getElementById('myChart').getContext('2d');
let chart;
const months = ["BILL_AMT6", "BILL_AMT5", "BILL_AMT4", "BILL_AMT3", "BILL_AMT2", "BILL_AMT1"];
const monthLabels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const colors = ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 159, 64, 1)', 'rgba(153, 102, 255, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'];

fetch('Credit_card_converted.json')
    .then(response => response.json())
    .then(data => {
        jsonData = data;
        updateChart(); // Initial chart update
    });

function updateChart() {
    const ageRange = document.getElementById('ageRange').value;
    
    if (!ageRange) return; // Do nothing if no age range is selected

    // Filter data by selected AGE_RANGE
    const filteredData = jsonData.filter(item => item.AGE_RANGE === ageRange);

    if (filteredData.length === 0) return; // Do nothing if no data for selected age range

    // Calculate the average BILL_AMT for each month
    const averages = months.map(month => {
        const sum = filteredData.reduce((acc, item) => acc + item[month], 0);
        return filteredData.length > 0 ? sum / filteredData.length : 0;
    });

    // Add a new dataset to the chart
    if (chart) {
        const existingColors = chart.data.datasets.map(dataset => dataset.borderColor);
        const nextColor = colors[chart.data.datasets.length % colors.length];
        chart.data.datasets.push({
            label: `Average Bill Amount (${ageRange})`,
            data: averages,
            borderColor: nextColor,
            backgroundColor: 'transparent',
            borderWidth: 2,
            fill: false,
        });
        chart.update();
    } else {
        // Create the chart for the first time
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: `Average Bill Amount (${ageRange})`,
                    data: averages,
                    borderColor: colors[0],
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    fill: false,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(0); // Adjust y-axis labels to whole numbers
                            }
                        }
                    }
                }
            }
        });
    }
}

function resetChart() {
    if (chart) {
        chart.destroy(); // Destroy the current chart
        chart = null; // Reset the chart variable
    }
    document.getElementById('ageRange').value = ''; // Clear selection
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear canvas
}
