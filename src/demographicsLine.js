import * as d3 from "d3";
import * as d3Collection from "d3-collection";

export default async (container, size, margin) => {
  const svg = container.append("svg");
  svg.attr("width", size.width).attr("height", size.height);

  const data = d3Collection
    .nest()
    .key((d) => d.eth)
    .key((d) => d.campus)
    .entries(await d3.csv("data/demographics.csv"));

  const y = d3
    .scalePoint()
    .domain(data.map((d) => d.key))
    .range([margin.top, size.height - margin.bottom]);

  const x = d3
    .scaleLinear()
    .domain([2019, 2021])
    .range([margin.left, size.width - margin.right]);

  const z = d3
    .scaleLinear()
    .domain([0, 0.4])
    .range([y.step() - 30, 0]);

  const group = svg
    .append("g")
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("transform", (d) => `translate(0, ${y(d.key)})`);

  const path = d3
    .line()
    .x((d) => {
      //   console.log(d);
      return x(+d.year);
    })
    .y((d) => z(+d.pct));

  const colors = {
    sb: "#005AA3",
    university: "#d3d3d3bb",
  };

  group
    .selectAll("path")
    .data((d) => d.values)
    .enter()
    .append("path")
    .attr("d", (d) => {
      console.log(d);
      console.log(path(d.values));
      return path(d.values);
    })
    .attr("fill", "none")
    .attr("stroke", (d) => colors[d.key])
    .attr("stroke-width", (d) => (d.key === "sb" ? 3 : 8));

  group
    .append("g")
    .style("font-size", "16px")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("color", "#adadad")
    .call(
      d3
        .axisLeft(z)
        .ticks(2)
        .tickFormat((d) => `${Math.round(d * 100)}`)
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
    .text((d) => textLabels[d.key])
    // .attr("text-anchor", "middle")
    .attr("x", margin.left + 5)
    .attr("y", z.range()[1] - 5);

  //   group
  //     .append("path")
  //     .attr("d", (d) => {
  //       console.log(d.values);
  //       console.log(path(d.values));
  //       return path(d.values);
  //     })
  //     .attr("stroke", "black")
  //     .attr("stroke-width", 2);
};
