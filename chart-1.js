document.addEventListener('DOMContentLoaded', function() {
    const filterSelect = document.getElementById('filter');
    const latePaymentsLinks = document.querySelectorAll('#latePayments a');
    const chart1Container = document.getElementById('chart1');
    const chart1LegendContainer = document.getElementById('chart1Legend');
    
    // Load the data
    d3.json('data2.json').then(data => {
        if (!data || !Array.isArray(data)) {
            console.error('Invalid data format');
            return;
        }
        
        // Initial render
        updateChart('default', 'all', data);
        
        // Update chart on filter change
        filterSelect.addEventListener('change', function() {
            updateChart(filterSelect.value, getSelectedLatePayments(), data);
        });
        
        latePaymentsLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const value = this.getAttribute('data-value');
                updateChart(filterSelect.value, value, data);
            });
        });

        function getSelectedLatePayments() {
            const selectedLink = document.querySelector('#latePayments a.selected');
            return selectedLink ? selectedLink.getAttribute('data-value') : 'all';
        }

        function updateChart(filter, latePayments, data) {
            // Clear previous chart and legend
            chart1Container.innerHTML = '';
            chart1LegendContainer.innerHTML = '';

            // Filter data based on the number of late payments
            let filteredData = data;
            if (latePayments !== 'all') {
                filteredData = data.filter(d => d.late_payments == latePayments);
            }

            let aggregatedData;
            switch (filter) {
                case 'default':
                    aggregatedData = d3.rollup(filteredData, v => d3.sum(v, d => d.count), d => d.late_payments);
                    renderBarChart(aggregatedData, 'Number of Late Payments', 'Count');
                    break;
                case 'gender':
                    aggregatedData = d3.rollup(filteredData, v => d3.sum(v, d => d.count), d => d.sex);
                    renderPieChart(aggregatedData, 'Gender', true);
                    break;
                case 'marriage':
                    aggregatedData = d3.rollup(filteredData, v => d3.sum(v, d => d.count), d => d.marriage);
                    renderPieChart(aggregatedData, 'Marital Status', false);
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
                    console.warn('Unknown filter type:', filter);
            }
        }

        function renderBarChart(data, xLabel, yLabel) {
            const margin = { top: 20, right: 20, bottom: 40, left: 70 };
            const width = 600 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            const svg = d3.select('#chart1')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleBand()
                .domain(Array.from(data.keys()))
                .range([0, width])
                .padding(0.1);

            const y = d3.scaleLinear()
                .domain([0, d3.max(Array.from(data.values()))])
                .nice()
                .range([height, 0]);

            svg.append('g')
                .selectAll('.bar')
                .data(Array.from(data.entries()))
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', d => x(d[0]))
                .attr('y', d => y(d[1]))
                .attr('width', x.bandwidth())
                .attr('height', d => height - y(d[1]))
                .attr('fill', '#4A90E2');

            svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .append('text')
                .attr('class', 'x-axis-label')
                .attr('x', width / 2)
                .attr('y', 30)
                .attr('fill', '#333')
                .text(xLabel);

            svg.append('g')
                .attr('class', 'y-axis')
                .call(d3.axisLeft(y))
                .append('text')
                .attr('class', 'y-axis-label')
                .attr('x', -40)
                .attr('y', height / 2)
                .attr('fill', '#333')
                .attr('transform', 'rotate(-90)')
                .text(yLabel);
        }

        function renderPieChart(data, title, showLegend) {
            const width = 400;
            const height = 400;
            const radius = Math.min(width, height) / 2;

            const svg = d3.select('#chart1')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', `translate(${width / 2},${height / 2})`);

            const color = d3.scaleOrdinal(d3.schemeCategory10);

            const pie = d3.pie()
                .sort(null)
                .value(d => d[1]);

            const arc = d3.arc()
                .outerRadius(radius - 10)
                .innerRadius(0);

            const pieData = pie(Array.from(data.entries()));

            svg.selectAll('path')
                .data(pieData)
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('fill', d => color(d.data[0]));

            if (showLegend) {
                // Add legend
                const legend = d3.select('#chart1Legend');
                Array.from(data.entries()).forEach(d => {
                    legend.append('div')
                        .text(d[0])
                        .style('color', color(d[0]));
                });
            }
        }
    });
});
