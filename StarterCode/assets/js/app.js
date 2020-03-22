const graphSize = {
    width: 1000,
    height: 610 
};

const padding = {
    top: 35,
    right: 40, 
    bottom: 160,
    left: 110
};

const graphEastWest = graphSize.width - padding.left - padding.right;
const graphNorthSouth = graphSize.height - padding.top - padding.bottom;

const attach = d3.select('#scatter')
    .append('svg')
    .attr('width', graphSize.width)
    .attr('height', graphSize.height);

const graph = attach.append('g')
    .attr('width', graphEastWest)
    .attr('height', graphNorthSouth)
    .attr('transform', `translate(${padding.left}, ${padding.top})`);    

const x = d3.scaleLinear().range([0, graphEastWest]);
const y = d3.scaleLinear().range([graphNorthSouth, 0]);

const GroupX = graph.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(${0}, ${graphNorthSouth})`);
    
const GroupY = graph.append('g')
    .attr('class', 'y-axis');

createPlot = [
    {
        x_category: 'poverty',
        x_legend: 'In Poverty (%)',
        y_category: 'obesity',
        y_legend: 'Obese (%)'
    },      
    {
        x_category: 'age',
        x_legend: 'Age (median)',
        y_category: 'smokes',
        y_legend: 'Smokes (%)'
    },
    {
        x_category: 'income',
        x_legend: 'Household Income (Median)',
        y_category: 'healthcare',
        y_legend: 'Lacks Healthcare (%)'
    }, 
];

let plotSelector = Object.assign({}, createPlot[0]);

let xLabel = graphNorthSouth + 45;
let yLabel = 0 - padding.left;

createPlot.forEach(item => {
    graph
        .append("text")
        .attr("transform", `translate(${graphEastWest / 2}, ${xLabel} )`)
        .attr("class", (item.x_category === plotSelector.x_category) ? 'active legend-x-axis' : 'inactive legend-x-axis')
        .attr("value", item.x_category)
        .text(item.x_legend)        
        .on('click', function() {            
            d3.selectAll('.legend-x-axis').classed('active', false);
            d3.selectAll('.legend-x-axis').classed('inactive', true);

            d3.select(this).classed('active', true);           
            d3.select(this).classed('inactive', false);

            let selection  = createPlot.filter( item => item.x_category == d3.select(this).attr("value"))[0];
            plotSelector.x_category = selection.x_category;
            plotSelector.x_legend = selection.x_legend;

            update(data);
        });

    graph
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", yLabel)
        .attr("x", 0 - (graphNorthSouth/2))
        .attr("dy","1em")
        .attr("class", (item.y_category === plotSelector.y_attribute) ? 'active legend-y-axis' : 'inactive legend-y-axis')
        .attr("value", item.y_category)
        .text(item.y_legend)
        .on('click', function() {
            d3.selectAll('.legend-y-axis').classed('active', false);
            d3.selectAll('.legend-y-axis').classed('inactive', true);

            d3.select(this).classed('active', true);           
            d3.select(this).classed('inactive', false);

            let selection  = createPlot.filter( item => item.y_category == d3.select(this).attr("value"))[0];
            plotSelector.y_category = selection.y_category;
            plotSelector.y_legend = selection.y_legend;

            update(data);
        });
    
    xLabel += 25;
    yLabel += 30;
});

const tip = d3.tip()
    .attr('class', 'd3-tip')
    .html(d => {
        return `${d.state} <br> ${plotSelector.x_category} : ${d[plotSelector.x_category]} <br>  ${plotSelector.y_category} : ${d[plotSelector.y_category]}`;
    });

graph.call(tip);

const update = (data) => {

    x.domain([d3.min(data, d => +d[plotSelector.x_category] * 0.95), d3.max(data, d => +d[plotSelector.x_category] * 1.05)]);
    y.domain([d3.min(data, d => +d[plotSelector.y_category] * 0.95), d3.max(data, d => +d[plotSelector.y_category] * 1.05)]);

    const xAxis = d3.axisBottom(x)
    const yAxis = d3.axisLeft(y)
    
    GroupX.call(xAxis);
    GroupY.call(yAxis);

    const circles = graph.selectAll('circle')
        .data(data);

    circles.enter()
        .append('circle')
            .attr('r', 9)
            .attr('cx', d => x(+d[plotSelector.x_category]))
            .attr('cy', d => y(+d[plotSelector.y_category]))
            .attr('class', 'stateCircle')
            .on('mouseover', (d, i, n) => {
                d3.select(n[i]).attr('class', 'hoverCircle');
                tip.show(d, n[i]);
            })
            .on('mouseout', (d, i, n) => {
                d3.select(n[i]).attr('class', 'stateCircle');
                tip.hide(d, n[i]);
            });            

    const chosenState = graph.selectAll("text")
        .data(data);

    chosenState.enter()        
        .append('text')
            .selectAll("tspan")
            .data(data)
            .enter()         
                .append("tspan")
                    .attr('class', 'stateText')
                    .style("font-size", "10px")
                    .attr("x", d => x(+d[plotSelector.x_category]))
                    .attr("y", d => y(+d[plotSelector.y_category] - 0.1))                
                    .text(d => d.abbr);
   
    circles.transition()
        .duration(500)
            .attr('cx', d => x(+d[plotSelector.x_category]))
            .attr('cy', d => y(+d[plotSelector.y_category]));

    chosenState.transition()
        .duration(500)
        .selectAll("tspan")
            .attr("x", d => x(+d[plotSelector.x_category]))
            .attr("y", d => y(+d[plotSelector.y_category] - 0.1));

   
    circles.exit().remove();
    chosenState.exit().remove();
};
    
let data = [];

d3.csv("assets/data/data.csv").then(response => {
    data = response.map(item => item);

    update(data);
});