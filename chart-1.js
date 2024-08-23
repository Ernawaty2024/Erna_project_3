document.addEventListener('DOMContentLoaded', function() {
    const filterSelect = document.getElementById('filter');
    const latePaymentsLinks = document.querySelectorAll('#latePayments a');
    const chart1Container = document.getElementById('chart1');
    
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
            // Clear previous chart
            chart1Container.innerHTML = '';

            // Filter data based on the number of late payments
            let filteredData = data;
            if (latePayments !== 'all') {
                filteredData = data.filter(d => d.late_payments == latePayments);
            }

            // Prepare the late payments text for the title
            let latePaymentsText = latePayments === 'all' ? 'All' : `${latePayments} times`;

            let aggregatedData;
            switch (filter) {
                case 'default':
                    aggregatedData = d3.rollup(filteredData, v => v.length, d => d.late_payments);
                    aggregatedData = new Map([...aggregatedData.entries()].sort((a, b) => a[0] - b[0]));
                    renderBarChart(Array.from(aggregatedData), 'NUMBER OF LATE PAYMENTS', 'COUNT');
                    break;
                case 'gender':
                    aggregatedData = d3.rollup(filteredData, v => v.length, d => d.sex);
                    renderPieChart(aggregatedData, `${latePaymentsText} LATE ACC GENDER DISTRIBUTION`, true);
                    break;
                case 'marriage':
                    aggregatedData = d3.rollup(filteredData, v => v.length, d => d.marriage);
                    renderPieChart(aggregatedData, `${latePaymentsText} LATE ACC MARITAL STATUS DISTRIBUTION`, true);
                    break;
                case 'age_bin':
                    aggregatedData = d3.rollup(filteredData, v => v.length, d => d.age_bin);
                    renderBarChart(Array.from(aggregatedData), `${latePaymentsText} LATE ACC AGE DISTRIBUTION`, 'COUNT');
                    break;
                case 'education':
                    aggregatedData = d3.rollup(filteredData, v => v.length, d => d.education);
                    renderBarChart(Array.from(aggregatedData), `${latePaymentsText} LATE ACC EDUCATION DISTRIBUTION`, 'COUNT');
                    break;
                default:
                    console.warn('Unknown filter type:', filter);
            }
        }

        function renderBarChart(data, xLabel, yLabel) {
            const margin = { top: 40, right: 20, bottom: 40, left: 50 }; // Increased top margin
            const width = chart1Container.clientWidth - margin.left - margin.right;
            const height = chart1Container.clientHeight - margin.top - margin.bottom;
        
            const svg = d3.select('#chart1')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);
        
            const x = d3.scaleBand()
                .domain(data.map(d => d[0]))
                .range([0, width])
                .padding(0.1);
        
            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d[1])])
                .nice()
                .range([height, 0]);
        
            svg.append('g')
                .selectAll('.bar')
                .data(data)
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
                .call(d3.axisLeft(y).tickFormat(d3.format('d')));
        
           
            svg.selectAll('.bar-label')
                .data(data)
                .enter()
                .append('text')
                .attr('class', 'bar-label')
                .attr('x', d => x(d[0]) + x.bandwidth() / 2)
                .attr('y', d => y(d[1]) - 5)
                .attr('text-anchor', 'middle')
                .text(d => d[1]);
        
            // Add title
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', -margin.top / 2)
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .style('font-weight', 'bold')
                .text(xLabel.toUpperCase());
        }

        function renderPieChart(data, title, showLegend) {
            const width = chart1Container.clientWidth;
            const height = chart1Container.clientHeight;
            const radius = Math.min(width, height) / 2 * 0.75; // Set to 75%
        
            const svg = d3.select('#chart1')
                .append('svg')
                .attr('width', width)
                .attr('height', height);
        
            const g = svg.append('g')
                .attr('transform', `translate(${width / 3},${height / 2})`);
        
            const color = d3.scaleOrdinal(d3.schemeCategory10);
        
            const pie = d3.pie()
                .sort(null)
                .value(d => d[1]);
        
            const arc = d3.arc()
                .outerRadius(radius - 10)
                .innerRadius(0);
        
            const pieData = pie(Array.from(data.entries()));
        
            g.selectAll('path')
                .data(pieData)
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('fill', d => color(d.data[0]));
        
            if (showLegend) {
                const legendRectSize = 18;
                const legendSpacing = 4;
                const legend = svg.selectAll('.legend')
                    .data(color.domain())
                    .enter()
                    .append('g')
                    .attr('class', 'legend')
                    .attr('transform', (d, i) => {
                        const height = legendRectSize + legendSpacing;
                        const offset = height * color.domain().length / 2;
                        const horizontal = width * 2 / 3; // Legend positioned to the right of the pie chart
                        const vertical = i * height + (svg.attr('height') / 2 - offset);
                        return `translate(${horizontal},${vertical})`;
                    });
        
                legend.append('rect')
                    .attr('width', legendRectSize)
                    .attr('height', legendRectSize)
                    .style('fill', color)
                    .style('stroke', color);
        
                legend.append('text')
                    .attr('x', legendRectSize + legendSpacing)
                    .attr('y', legendRectSize - legendSpacing)
                    .text(d => `${d}: ${data.get(d)}`);
            }
        
            // Add title
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .style('font-weight', 'bold')
                .text(title.toUpperCase()); // Ensure title is in uppercase
        }
    });
});