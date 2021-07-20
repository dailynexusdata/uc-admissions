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

  const data = d3Collection
    .nest()
    .key((d) => d.eth)
    .key((d) => d.campus)
    .entries(
      (await d3.csv("data/demographics.csv")).filter((d) => d.year === "2021")
    );

  const y = d3
    .scalePoint()
    .domain(data.map((d) => d.key))
    .range([margin.top, size.height - margin.bottom]);

  const x = d3
    .scaleLinear()
    .domain([0, 0.5])
    .range([margin.left, size.width - margin.right]);

  const z = d3
    .scaleBand()
    .domain(["university", "sb"])
    .range([0, y.step() - 30]);

  const group = svg
    .append("g")
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("transform", (d) => `translate(0, ${y(d.key)})`);

  const colors = {
    sb: "#005AA3",
    university: "#d3d3d3bb",
  };

  group
    .selectAll("rect")
    .data((d) => d.values)
    .enter()
    .append("rect")
    .attr("y", (d) => z(d.key))
    .attr("height", 12)
    .attr("x", x(0))
    .attr("width", (d) => x(d.values[0].pct) - x(0))
    .attr("fill", (d) => colors[d.key]);

  svg
    .append("g")
    .attr("class", "xaxis")
    .attr("transform", `translate(0, ${size.height - 30})`)
    .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif")
    .style("font-size", "16px")
    .attr("color", "#adadad")
    .call(
      d3.axisBottom(x).tickFormat((d, i) => d * 100 + (d === 0.35 ? "%" : ""))
    );

  const textLabels = {
    aa: "African American",
    ai: "American Indian",
    cl: "Chicano / Latino",
    pi: "Pacific Islander",
    asian: "Asian American",
    white: "White",
    international: "International",
  };

  group
    .append("text")
    .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif")
    .style("font-size", "13pt")
    .text((d) => textLabels[d.key])
    // .attr("text-anchor", "middle")
    .attr("x", margin.left)
    .attr("y", -5);

  group
    .selectAll("text")
    .data((d) => d.values)
    .enter()
    .append("text")
    .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif")
    .style("font-size", "13pt")
    .text((d) =>
      d.values[0].pct < 0.01 ? "<1%" : Math.round(d.values[0].pct * 100) + "%"
    )
    .attr("alignment-baseline", "middle")
    .attr("x", (d) => x(d.values[0].pct) + 5)
    .attr("y", (d) => z(d.key) + 8)
    .attr("fill", (d) => colors[d.key]);

  container
    .append("p")
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
    .style("letter-spacing", "0px")
    .html(
      "Data includes adult arrest info from 2013, 2018-2020. <a style='text-decoration: none; color: black' href='https://docs.google.com/spreadsheets/d/1NosIFv3dq5Qqc3nLblS60ADb4w1Dtax8PBzKNr1hvcU/edit'>Source: IVFP.</a>"
    )
    .style("margin", 0);
};
