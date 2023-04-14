import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

// with the help of chatGPT and https://sharkcoder.com/data-visualization/d3-react
const LineChart = ({ data }) => {
  const svgRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    // Clear previous plot
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.rate)])
      .range([height, 0]);

    const line = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.rate));

    const handleMouseMove = (e) => {
      const bisect = d3.bisector((d) => d.date).left; //to perform binary search and take the element to the left od the mouse
      const x0 = xScale.invert(d3.pointer(e)[0]);
      const index = bisect(data, x0, 1);
      setActiveIndex(index);
    };

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

      const xAxisTickValues = data
  .filter((d, i) => {
    // Filter to get only dates that are multiples of 10 days apart
    const prevDate = i > 0 ? data[i - 1].date : null;
    return prevDate ? Math.floor((d.date - prevDate) / (1000 * 60 * 60 * 24)) >= 10 : true;
  })
  .map((d) => d.date);

const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m/%d/%Y")).tickValues(xAxisTickValues);
const yAxis = d3.axisLeft(yScale);

    svg
      .append("text")
      .attr("class", "axis-title")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height+ margin.bottom) 
      .text("Date"); 

    svg
      .append("text")
      .attr("class", "axis-title")
      .attr("text-anchor", "middle")
      .attr("x", -height/2)
      .attr("y", -margin.left/2-10)
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
      .on("mousemove", handleMouseMove)
      .on("mouseleave", () => setActiveIndex(null));

    return () => {
        //to ensure that the event listeners are properly cleaned up
      svg
      .on("mousemove", null)
      .on("mouseleave", null);
    };
  }, [data, setActiveIndex]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      {activeIndex !== null && (
        <div>
          <p>
            Date: {data[activeIndex].date.toLocaleDateString()} | Rate:{" "}
            {data[activeIndex].rate}
          </p>
        </div>
      )}
    </div>
  );
};
export default LineChart;
