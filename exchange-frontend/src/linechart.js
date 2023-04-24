import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

// with the help of chatGPT and https://sharkcoder.com/data-visualization/d3-react and https://d3-graph-gallery.com/line
const LineChart = ({ data, movingAvg }) => {
  const svgRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    // Clear previous plot
    d3.select(svgRef.current).selectAll("*").remove();

    let selectedData;

    const margin = { top: 20, right: 30, bottom: 50, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    var bisect = d3.bisector(function (d) {
      return d.date;
    }).center;

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([0, width - 250]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.rate)])
      .range([height, 0]);

    const line = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.rate))
      .curve(movingAvg ? d3.curveBasis : d3.curveLinear);

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var focus = svg
      .append("g")
      .append("circle")
      .style("fill", "none")
      .attr("stroke", "black")
      .attr("r", 8.5)
      .style("opacity", 0);

    // Create the text that travels along the curve of chart
    var focusText = svg
      .append("g")
      .append("text")
      .style("opacity", 0)
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "middle");

    const xAxisTickValues = data
      .filter((d, i) => {
        // Filter to get only dates that are multiples of 10 days apart
        const prevDate = i > 0 ? data[i - 1].date : null;
        return prevDate
          ? Math.floor((d.date - prevDate) / (1000 * 60 * 60 * 24)) >= 10
          : true;
      })
      .map((d) => d.date);

    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat(d3.timeFormat("%m/%d/%Y"))
      .tickValues(xAxisTickValues);
    const yAxis = d3.axisLeft(yScale);

    svg
      .append("text")
      .attr("class", "axis-title")
      .attr("text-anchor", "middle")
      .attr("x", (width - 250) / 2)
      .attr("y", height + margin.bottom)
      .text("Date");

    svg
      .append("text")
      .attr("class", "axis-title")
      .attr("text-anchor", "middle")
      .attr("x", -height / 2)
      .attr("y", -margin.left / 2 - 10)
      .attr("transform", "rotate(-90)")
      .text("1 USD in LBP");

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    svg.append("g").attr("class", "y-axis").call(yAxis);

    svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2);

    svg
      .append("rect")
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout)
      .on("click", dayClick);

    function dayClick(e) {
      var x0 = xScale.invert(d3.pointer(e)[0]);
      var i = bisect(data, x0, 1);
      const selectedDayData = data[i];
      setSelectedDay(selectedDayData);
    }

    function mouseover() {
      focus.style("opacity", 1);
      focusText.style("opacity", 1);
    }

    function mousemove(e) {
      // recover coordinate we need
      var x0 = xScale.invert(d3.pointer(e)[0]);
      var i = bisect(data, x0, 1);
      selectedData = data[i];
      focus
        .attr("cx", xScale(selectedData.date))
        .attr("cy", yScale(selectedData.rate));
      focusText
        .html(
          "Date:" +
            selectedData.date.toLocaleDateString() +
            "<br> Rate: " +
            selectedData.rate
        )
        .attr("x", xScale(selectedData.date) + 15)
        .attr("y", yScale(selectedData.rate));
    }
    function mouseout() {
      focus.style("opacity", 0);
      focusText.style("opacity", 0);
    }
  }, [data, movingAvg]);
  

  return (
    <div>
      <svg ref={svgRef}> </svg>
      {selectedDay && (
        <div>
          <p>Selected Day: {selectedDay.date.toLocaleDateString()}</p>
          <p>Min: {selectedDay.min}</p>
          <p>Max: {selectedDay.max}</p>
          <p>Avg: {selectedDay.rate}</p>
          <p>Number of Transactions: {selectedDay.num_transactions}</p>
        </div>
      )}
    </div>
  );
};
export default LineChart;
