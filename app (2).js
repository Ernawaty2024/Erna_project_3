let jsonData; // To hold the parsed JSON data
const ctx = document.getElementById('myChart').getContext('2d');
let chart;

// Load the JSON data
fetch('default_rates.json')
    .then(response => response.json())
    .then(data => {
        jsonData = data;
        updateChart(); // Initial chart update
    });

function updateChart() {
    const category = document.getElementById('categorySelect').value;

    // Get the selected category data
    const categoryData = jsonData[category];
    const labels = categoryData.map(item => {
        switch(category) {
            case "gender":
                return item.gender;
            case "education":
                return item.education;
            case "marital_status":
                return item.marital_status;
            case "age_group":
                return item.age_group;
            case "customer_value_segment":
                return item.customer_value_segment;
        }
    });
    const defaultRates = categoryData.map(item => item.default_rate);

    // Destroy existing chart if it exists
    if (chart) {
        chart.destroy();
    }

    // Create a new bar chart
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Default Rates by ${category.replace('_', ' ').toUpperCase()}`,
                data: defaultRates,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(2) + '%'; // Format y-axis labels as percentages
                        }
                    }
                }
            }
        }
    });
}
