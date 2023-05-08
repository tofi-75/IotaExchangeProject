import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

// with the help of chatGPT and https://sharkcoder.com/data-visualization/d3-react and https://d3-graph-gallery.com/line
const LineChart = ({ data, movingAvg }) => {
  const svgRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const renderChart = () => {
      // Clear previous plot
      d3.select(svgRef.current).selectAll("*").remove();

      let selectedData;

      const margin = { top: 20, right: 30, bottom: 50, left: 80 };
      const container = document.getElementById("chart-container");
      if (!container) return;
      const containerWidth = container.offsetWidth;
      const width = containerWidth - margin.left - margin.right;
      const height = 0.5 * containerWidth - margin.top - margin.bottom;

      var bisect = d3.bisector(function (d) {
        return d.date;
      }).center;

      const xScale = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => d.date))
        .range([0, 0.5 * width]);
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

      let xAxisTickValues = [];
      console.log(data);
      if (data.length > 0) {
        const firstDate = data[0].date;
        const lastDate = data[data.length - 1].date;
        const dayDifference = Math.floor(
          (lastDate - firstDate) / (1000 * 60 * 60 * 24)
        );
        if (dayDifference >= 30) {
          xAxisTickValues = [];
          let tickDate = firstDate;
          while (tickDate <= lastDate) {
            xAxisTickValues.push(tickDate);
            tickDate = new Date(tickDate);
            tickDate.setDate(tickDate.getDate() + 10);
          }
        } else {
          xAxisTickValues = data.map((d) => d.date);
        }
      }

      const xAxis = d3
        .axisBottom(xScale)
        .tickFormat(d3.timeFormat("%m/%d/%Y"))
        .tickValues(xAxisTickValues);
      const yAxis = d3.axisLeft(yScale).ticks(6);

      svg
        .append("text")
        .attr("class", "axis-title")
        .attr("text-anchor", "middle")
        .attr("x", (0.5 * width) / 2)
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
        if (selectedData) {
          focus
            .attr("cx", xScale(selectedData.date))
            .attr("cy", yScale(selectedData.rate));
          focusText
            .html(
              "Date: " +
                selectedData.date.toLocaleDateString() +
                "<br/>" +
                " Rate: " +
                selectedData.rate
            )
            .attr("x", xScale(selectedData.date) + 15)
            .attr("y", yScale(selectedData.rate))
            .style("display", "block");
        }
      }
      function mouseout() {
        focus.style("opacity", 0);
        focusText.style("opacity", 0);
      }
    };
    renderChart();

    window.addEventListener("resize", renderChart);

    return () => {
      window.removeEventListener("resize", renderChart);
    };
  }, [data, movingAvg]);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <svg ref={svgRef}> </svg>
      {selectedDay && (
        <div style={{ margin: "10%" }}>
          <p>Selected Day: {selectedDay.date.toLocaleDateString()}</p>
          <p>Min: {selectedDay.min.toFixed(2)}</p>
          <p>Max: {selectedDay.max.toFixed(2)}</p>
          <p>Avg: {selectedDay.rate.toFixed(2)}</p>
          <p>Number of Transactions: {selectedDay.num_transactions}</p>
        </div>
      )}
    </div>
  );
};
export default LineChart;
