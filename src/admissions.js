import * as d3 from "d3";
import * as d3Collection from "d3-collection";

export default async (container, totalWidth, size, margin) => {
  container.style("width", totalWidth + "px");

  container
    .append("h2")
    // .style("width", totalWidth + "px")
    .style("margin-bottom", 0)
    .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif")
    .style("font-weight", "100")
    .style("line-spacing", "none")
    .text("UCSB Freshman Admissions Drop from 2020");

  container
    .append("p")
    .style("margin", "5px 0 0 0")
    .text(
      "Number of students admitted in the fall quarter of 2019-2021 by UC campus."
    )
    .style("line-spacing", "none")
    .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif");

  const data = (
    await d3.csv(
      "https://raw.githubusercontent.com/dailynexusdata/uc-admissions/main/data/admits.csv"
    )
  )
    .map((d) => {
      return { campus: d.campus, values: d3Collection.entries(d).slice(0, -1) };
    })
    .splice(1)
    .sort((a, b) => (+a.values[2].value < +b.values[2].value ? -1 : 1));

  const y = d3
    .scaleLinear()
    .domain([0, 43000])
    .range([size.height - margin.bottom, margin.top]);

  const x = d3
    .scalePoint()
    .domain([2019, 2020, 2021])
    .range([margin.left, size.width - margin.right]);

  const line = d3
    .line()
    .x((d) => x(+d.key))
    .y((d) => y(+d.value));

  const colors = {
    sb: "#005AA3",
    university: "#d3d3d3dd",
  };

  const titles = {
    berkeley: "Berkeley",
    davis: "Davis",
    irvine: "Irvine",
    la: "Los Angeles",
    merced: "Merced",
    riverside: "Riverside",
    sd: "San Diego",
    sb: "Santa Barbara",
    santacruz: "Santa Cruz",
  };

  data.forEach((campus) => {
    const svg = container.append("svg");
    svg.attr("width", size.width).attr("height", size.height);

    svg
      .append("text")
      .text(titles[campus.campus])
      .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif")
      .style("font-weight", "bold")
      .attr("x", margin.left)
      .attr("y", 25);

    svg
      .selectAll("lines")
      .data(
        data.map((d) => {
          return { ...d, selected: campus.campus };
        })
      )
      .enter()
      .append("path")
      .attr("d", (d) => line(d.values))
      .attr("stroke-width", (d) => (d.campus === d.selected ? 2 : 1))
      .attr("stroke", (d) =>
        d.campus === d.selected ? "#005AA3" : "#d3d3d3dd"
      )
      .attr("fill", "none");

    const overlay = svg.append("g");

    overlay
      .selectAll("circs")
      .data(campus.values)
      .enter()
      .append("circle")
      .attr("class", (_, i) => (i !== 2 ? "overlay-" + campus.campus : ""))
      .attr("r", 4)
      .attr("fill", "#005AA3")
      .attr("fill-opacity", (_, i) => +(i === 2))
      .attr("cx", (d) => x(+d.key))
      .attr("cy", (d) => y(+d.value));

    overlay
      .selectAll("points")
      .data(campus.values)
      .enter()
      .append("text")
      .style("user-select", "none")
      .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif")
      // .attr("font-weight", "bold")
      .attr("class", (_, i) => (i !== 2 ? "overlay-" + campus.campus : ""))
      .text((d) => d3.format(",")(d.value))
      .attr("fill", "#005AA3")
      .attr("fill-opacity", (_, i) => +(i === 2))
      .attr("text-anchor", (d, i) =>
        i === 2 ? "end" : totalWidth === 600 && i == 1 ? "middle" : "start"
      )
      .attr(
        "x",
        (d, i) =>
          x(+d.key) + (i === 2 ? 10 : totalWidth === 600 && i == 1 ? 0 : -10)
      )
      .attr("y", (d, i) =>
        totalWidth < 600 && i !== 2 ? y(+d.value) + 18 : y(+d.value) - 8
      );

    svg
      .datum(campus)
      .append("path")
      .attr("d", (d) => line(d.values))
      .attr("stroke-width", 20)
      .attr("stroke", (d) => "#005AA3")
      .attr("fill", "#005AA3")
      .attr("stroke-opacity", 0)
      .attr("fill-opacity", 0);

    svg.on("mouseenter touchstart", (event, d) => {
      container.selectAll(".overlay-" + d.campus).attr("fill-opacity", 1);
    });

    svg.on("mouseleave", () => {
      container.selectAll("[class^='overlay-']").attr("fill-opacity", 0);
    });

    svg
      .append("g")
      .attr("class", "xaxis")
      .attr("transform", `translate(0, ${size.height - 40})`)
      .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif")
      .style("font-size", "14px")
      .attr("color", "#adadad")
      .call(d3.axisBottom(x));
  });

  container
    .append("p")
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
    .style("letter-spacing", "0px")
    .html(
      "<a style='text-decoration: none; color: black' href='https://www.ucop.edu/institutional-research-academic-planning/_files/factsheets/2021/fall-2021-admission-table-1-1.pdf'>Source: University of California freshman admissions 2019-2021.</a>"
    )
    .style("margin", 0);
};
