document.addEventListener('DOMContentLoaded', function() {
    const filterSelect = document.getElementById('filter');
    const latePaymentsLinks = document.querySelectorAll('#latePayments a');
    const chart = d3.select('#chart');

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

        // Update chart on late payments link click
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
            console.log('Filtered Data:', data);
            chart.selectAll('*').remove(); // Clear previous chart

            // Filter data based on the number of late payments
            let filteredData = data;
            if (latePayments !== 'all') {
                filteredData = data.filter(d => d.late_payments == latePayments);
            }

            console.log('Filtered Data:', filteredData);

            let aggregatedData;
            switch (filter) {
                case 'default':
                    aggregatedData = d3.rollup(filteredData, v => d3.sum(v, d => d.count), d => d.late_payments);
                    renderBarChart(aggregatedData, 'Number of Late Payments', 'Count');
                    break;
                case 'gender':
                    aggregatedData = d3.rollup(filteredData, v => d3.sum(v, d => d.count), d => d.sex);
                    renderPieChart(aggregatedData, 'Gender');
                    break;
                case 'marriage':
                    aggregatedData = d3.rollup(filteredData, v => d3.sum(v, d => d.count), d => d.marriage);
                    renderPieChart(aggregatedData, 'Marital Status');
                    break;
                case 'age_bin':
                    aggregatedData = d3.rollup(filteredData, v => d3.sum(v, d => d.count), d => d.age_bin);
                    renderHistogram(aggregatedData, 'Age Group', 'Count');
                    break;
                case 'education':
                    aggregatedData = d3.rollup(filteredData, v => d3.sum(v, d => d.count), d => d.education);
                    renderBarChart(aggregatedData, 'Education Level', 'Count');
                    break;
                default:
                    console.warn('Unknown filter type:', filter);
            }

            console.log('Aggregated Data:', aggregatedData);
        }

        function renderBarChart(data, xLabel, yLabel) {
            const margin = { top: 20, right: 30, bottom: 40, left: 50 };
            const width = 600 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;
            const svg = chart.append('svg')
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
                .enter().append('rect')
                .attr('class', 'bar')
                .attr('x', d => x(d[0]))
                .attr('y', d => y(d[1]))
                .attr('width', x.bandwidth())
                .attr('height', d => height - y(d[1]))
                .attr('fill', '#007bff');
            svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x));
            svg.append('g')
                .attr('class', 'y-axis')
                .call(d3.axisLeft(y));
            svg.append('text')
                .attr('transform', `translate(${width / 2},${height + margin.bottom})`)
                .attr('text-anchor', 'middle')
                .text(xLabel);
            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left)
                .attr('x', 0 - height / 2)
                .attr('dy', '1em')
                .attr('text-anchor', 'middle')
                .text(yLabel);
        }

        function renderPieChart(data, label) {
            const margin = { top: 20, right: 30, bottom: 40, left: 30 };
            const width = 400 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;
            const radius = Math.min(width, height) / 2;
            const color = d3.scaleOrdinal(d3.schemeCategory10);
            const svg = chart.append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);
            const pie = d3.pie()
                .sort(null)
                .value(d => d[1]);
            const arc = d3.arc()
                .outerRadius(radius - 10)
                .innerRadius(0);
            const arcLabel = d3.arc()
                .outerRadius(radius - 40)
                .innerRadius(radius - 40);
            const dataArray = Array.from(data.entries());
            const g = svg.selectAll('.arc')
                .data(pie(dataArray))
                .enter().append('g')
                .attr('class', 'arc');
            g.append('path')
                .attr('d', arc)
                .attr('fill', d => color(d.data[0]));
            g.append('text')
                .attr('transform', d => `translate(${arcLabel.centroid(d)})`)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .text(d => d.data[0]);

            // Add legend
            const legend = chart.append('div')
                .attr('class', 'legend')
                .style('position', 'absolute')
                .style('top', '0')
                .style('right', '0')
                .style('padding', '10px')
                .style('background', '#fff')
                .style('border', '1px solid #ddd')
                .style('border-radius', '5px');

            dataArray.forEach((d, i) => {
                const legendRow = legend.append('div')
                    .style('display', 'flex')
                    .style('align-items', 'center')
                    .style('margin-bottom', '5px');
                legendRow.append('div')
                    .style('width', '18px')
                    .style('height', '18px')
                    .style('background-color', color(d[0]))
                    .style('margin-right', '10px');
                legendRow.append('span')
                    .text(d[0]);
            });
        }

        function renderHistogram(data, xLabel, yLabel) {
            const margin = { top: 20, right: 30, bottom: 40, left: 50 };
            const width = 600 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;
            const svg = chart.append('svg')
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
                .enter().append('rect')
                .attr('class', 'bar')
                .attr('x', d => x(d[0]))
                .attr('y', d => y(d[1]))
                .attr('width', x.bandwidth())
                .attr('height', d => height - y(d[1]))
                .attr('fill', '#007bff');
            svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x));
            svg.append('g')
                .attr('class', 'y-axis')
                .call(d3.axisLeft(y));
            svg.append('text')
                .attr('transform', `translate(${width / 2},${height + margin.bottom})`)
                .attr('text-anchor', 'middle')
                .text(xLabel);
            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left)
                .attr('x', 0 - height / 2)
                .attr('dy', '1em')
                .attr('text-anchor', 'middle')
                .text(yLabel);
        }
    });
});
