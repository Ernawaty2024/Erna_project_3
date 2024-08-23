document.addEventListener('DOMContentLoaded', function() {
    const curButton = document.getElementById('curButton');
    const curDropdown = document.getElementById('curDropdown');
    const chart2Container = document.getElementById('chart2');
    const chart2LegendContainer = document.getElementById('chart2Legend');
    
    // Load the data
    d3.json('data2.json').then(data => {
        if (!data || !Array.isArray(data)) {
            console.error('Invalid data format');
            return;
        }

        // Populate the CUR dropdown
        const curCategories = [...new Set(data.map(d => d.cur_sept_category))];
        curCategories.forEach(category => {
            const link = document.createElement('a');
            link.href = '#';
            link.setAttribute('data-value', category);
            link.textContent = category;
            link.addEventListener('click', function(event) {
                event.preventDefault();
                updateChart(document.getElementById('filter').value, category, data);
            });
            curDropdown.appendChild(link);
        });
        
        // Initial render
        updateChart('default', 'all', data);
        
        // Update chart on filter change
        document.getElementById('filter').addEventListener('change', function() {
            updateChart(this.value, getSelectedCUR(), data);
        });

        function getSelectedCUR() {
            const selectedLink = document.querySelector('#curDropdown a.selected');
            return selectedLink ? selectedLink.getAttribute('data-value') : 'all';
        }

        function updateChart(filter, CUR, data) {
            // Clear previous chart and legend
            chart2Container.innerHTML = '';
            chart2LegendContainer.innerHTML = '';

            // Filter data based on the CUR category
            let filteredData = data;
            if (CUR !== 'all') {
                filteredData = data.filter(d => d.cur_sept_category == CUR);
            }

            let aggregatedData;
            switch (filter) {
                case 'default':
                    aggregatedData = d3.rollup(filteredData, v => d3.sum(v, d => d.count), d => d.cur_sept_category);
                    renderBarChart(aggregatedData, 'Credit Utilization Ratio', 'Count');
                    break;
                case 'gender':
                    aggregatedData = d3.rollup(filteredData, v => d3.sum(v, d => d.count), d => d.sex);
                    renderPieChart(aggregatedData, 'Gender', true);
                    break;
                case 'marriage':
                    aggregatedData = d3.rollup(filteredData, v => d3.sum(v, d => d.count), d => d.marriage);
                    renderPieChart(aggregatedData, 'Marital Status', true);
                    break;
                case 'age_bin':
                    aggregatedData = d3.rollup(filteredData, v => d3.sum(v, d => d.count), d => d.age_bin);
                    renderBarChart(aggregatedData, 'Age Group', 'Count');
                    break;
                case 'education':
                    aggregatedData = d3.rollup(filteredData, v => d3.sum(v, d => d.count), d => d.education);
                    renderBarChart(aggregatedData, 'Education Level', 'Count');
                    break;
                default:
                    console.error('Unknown filter');
                    break;
            }
        }

        function renderBarChart(data, xLabel, yLabel) {
            const ctx = document.createElement('canvas');
            chart2Container.appendChild(ctx);
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Array.from(data.keys()),
                    datasets: [{
                        label: yLabel,
                        data: Array.from(data.values()),
                        backgroundColor: '#007bff',
                        borderColor: '#0056b3',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: xLabel
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: yLabel
                            }
                        }
                    }
                }
            });
        }

        function renderPieChart(data, label, showLegend) {
            const ctx = document.createElement('canvas');
            chart2Container.appendChild(ctx);
            const chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Array.from(data.keys()),
                    datasets: [{
                        label: label,
                        data: Array.from(data.values()),
                        backgroundColor: ['#007bff', '#28a745', '#dc3545', '#ffc107'],
                        borderColor: '#fff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: showLegend,
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }).catch(error => {
        console.error('Error loading data:', error);
    });
});
