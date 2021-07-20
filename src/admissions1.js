import * as d3 from "d3";
import * as d3Collection from "d3-collection";

export default async (container, size, margin) => {
  container
    .append("h1")
    .style("width", size.width + "px")
    .style("margin-bottom", 0)
    .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif")
    .text("UCSB Admission Demographics vs Rest of UC's 2021");
  const svg = container.append("svg");
  svg.attr("width", size.width).attr("height", size.height);

  // const data = d3Collection
  //   .nest()
  //   .key((d) => d.campus)
  //   .entries(
  //     (await d3.csv("data/admits.csv")).map((d) => {
  //       return { campus: d.campus, values: d3Collection.entries(d) };
  //     })
  //   )
  //   .splice(1);

  const data = (await d3.csv("data/admits.csv"))
    .map((d) => {
      return { campus: d.campus, values: d3Collection.entries(d).slice(0, -1) };
    })
    .splice(1);
  console.log(data);
  const y = d3
    .scalePoint()
    .domain(data.map((d) => d.campus))
    .range([margin.top, size.height - margin.bottom]);

  const x = d3
    .scaleLinear()
    .domain([2019, 2021])
    .range([margin.left, size.width - margin.right]);

  const z = d3
    .scaleLinear()
    .domain([0, 43000])
    .range([y.step() - 10, 0]);

  const group = svg
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("transform", (d) => `translate(0, ${y(d.campus)})`);

  const line = d3
    .line()
    .x((d) => x(+d.key))
    .y((d) => z(+d.value));
  const colors = {
    sb: "#005AA3",
    university: "#d3d3d3dd",
  };

  group
    .selectAll("path")
    .data((d) =>
      data.map((dat) => {
        return { ...dat, selected: d.campus };
      })
    )
    .enter()
    .append("path")
    .attr("d", (d) => line(d.values))
    .attr("stroke-width", (d) => (d.campus === d.selected ? 2 : 1))
    .attr("stroke", (d) => (d.campus === d.selected ? "#005AA3" : "#d3d3d3dd"))
    .attr("fill", "none");

  group
    .append("text")
    .text((d) => d.campus)
    .attr("x", 0)
    .attr("y", 0);

  container
    .append("p")
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
    .style("letter-spacing", "0px")
    .html(
      "Data includes adult arrest info from 2013, 2018-2020. <a style='text-decoration: none; color: black' href='https://docs.google.com/spreadsheets/d/1NosIFv3dq5Qqc3nLblS60ADb4w1Dtax8PBzKNr1hvcU/edit'>Source: IVFP.</a>"
    )
    .style("margin", 0);
};
