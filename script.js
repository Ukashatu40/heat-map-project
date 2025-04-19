const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const padding = 60;

const tooltip = d3.select("#tooltip");

fetch(url)
  .then(res => res.json())
  .then(data => {
    const baseTemp = data.baseTemperature;
    const dataset = data.monthlyVariance;

    d3.select("#description")
      .text(`Base Temperature: ${baseTemp}℃ | 1753 - 2015`);

    const years = dataset.map(d => d.year);
    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    const xScale = d3.scaleBand()
      .domain(years)
      .range([padding, width - padding]);

    const yScale = d3.scaleBand()
      .domain(d3.range(0, 12))
      .range([padding, height - padding]);

    const tempExtent = d3.extent(dataset, d => baseTemp + d.variance);
    const colorScale = d3.scaleThreshold()
      .domain(d3.range(tempExtent[0], tempExtent[1], (tempExtent[1] - tempExtent[0]) / 4))
      .range(["#4575b4", "#91bfdb", "#fee090", "#fc8d59", "#d73027"]);

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .tickValues(xScale.domain().filter((d, i) => d % 10 === 0))
      .tickFormat(d => d);

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(m => months[m]);

    svg.append("g")
      .attr("transform", `translate(0, ${height - padding})`)
      .attr("id", "x-axis")
      .call(xAxis);

    svg.append("g")
      .attr("transform", `translate(${padding}, 0)`)
      .attr("id", "y-axis")
      .call(yAxis);

    // Cells
    svg.selectAll("rect.cell")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", d => d.month - 1)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => baseTemp + d.variance)
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d.month - 1))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(baseTemp + d.variance))
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .attr("data-year", d.year)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px")
          .html(`${d.year} - ${months[d.month - 1]}<br>
                 Temp: ${(baseTemp + d.variance).toFixed(2)}℃<br>
                 Variance: ${d.variance.toFixed(2)}℃`);
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // Legend
    const legendWidth = 400;
    const legendHeight = 30;
    const legendColors = colorScale.range();

    const legendX = d3.scaleLinear()
      .domain(tempExtent)
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendX)
      .tickValues(colorScale.domain())
      .tickFormat(d3.format(".1f"));

    const legend = svg.append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${(width - legendWidth) / 2}, ${height - 30})`);

    legend.selectAll("rect")
      .data(colorScale.range().map((color, i) => {
        return {
          x0: i > 0 ? colorScale.domain()[i - 1] : tempExtent[0],
          x1: colorScale.domain()[i] || tempExtent[1],
          color: color
        };
      }))
      .enter()
      .append("rect")
      .attr("x", d => legendX(d.x0))
      .attr("y", 0)
      .attr("width", d => legendX(d.x1) - legendX(d.x0))
      .attr("height", legendHeight)
      .attr("fill", d => d.color);

    legend.append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis);
  });
