import * as d3 from "d3";
import * as d3Collection from "d3-collection";

export default async (container, size, margin) => {
  container.style("width", size.width + "px");
  const colors = {
    sb: "#4e79a7",
    university: "#d3d3d399",
  };

  container
    .append("h2")
    .style("width", size.width + "px")
    .style("margin-bottom", 0)
    .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif")
    .style("font-weight", "100")
    .style("letter-spacing", "0px")
    .text("UCSB Freshman Admissions by Race/Ethnicity");

  container
    .append("p")
    .style("margin", "5px 0")
    .style("width", size.width + "px")
    .text(
      "Percentage of asian and white admitted freshman fall as chicano / latino rises in line with the overall UC trend."
    )
    .style("letter-spacing", "0px")
    .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif");

  const legendArea = container
    .append("div")
    .style("display", "flex")
    .style("flex-wrap", "wrap")
    .style("width", size.width + "px")
    .style("justify-content", "center");

  legendArea
    .selectAll("div")
    .data([
      { campus: "sb", name: "UCSB" },
      { campus: "university", name: "UC Campuses Average" },
    ])
    .enter()
    .append("div")
    .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif")
    .html(
      (d) =>
        `<div style="display: flex; align-items: center; margin: 0 10px; white-space: nowrap;"><div style='background-color: ${
          colors[d.campus]
        }; height: 20px; width: 20px; margin-right: 5px;'></div>${d.name}</div>`
    );

  const svg = container.append("svg");
  svg.attr("width", size.width).attr("height", size.height);

  const data = d3Collection
    .nest()
    .key((d) => d.eth)
    .key((d) => d.campus)
    .entries(
      (
        await d3.csv(
          "https://raw.githubusercontent.com/dailynexusdata/uc-admissions/main/data/demographics.csv"
        )
      ).sort((a, b) => (a.eth < b.eth ? -1 : 1))
    )
    .sort((a, b) =>
      a.key === "z"
        ? 1
        : b.key === "z"
        ? 1
        : a.values[1].values[2].pct < b.values[1].values[2].pct
        ? 1
        : -1
    );

  const y = d3
    .scalePoint()
    .domain(data.map((d) => d.key))
    .range([margin.top, size.height - margin.bottom]);

  const x = d3
    .scaleLinear()
    .domain([0, 0.4])
    .range([margin.left, size.width - margin.right]);

  const z = d3
    .scalePoint()
    .domain(["s2019", "u2019", "s2020", "u2020", "s2021", "u2021"])
    .range([0, y.step() - 35]);
  console.log(data);
  const group = svg
    .append("g")
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("transform", (d) => `translate(0, ${y(d.key)})`);

  const barHeight = 6;
  group
    .selectAll("bars")
    .data((d) => d.values[1].values)
    .enter()
    .append("rect")
    .attr("x", x(0))
    .attr("height", barHeight)
    .attr("y", (d) => {
      console.log(d);
      return z("s" + d.year);
    })
    .attr("width", (d) => x(+d.pct) - x(0))
    .attr("fill", colors.sb);

  group
    .selectAll("bars")
    .data((d) => d.values[0].values)
    .enter()
    .append("rect")
    .attr("x", x(0))
    .attr("height", barHeight)
    .attr("y", (d) => {
      console.log(d);
      return z("u" + d.year);
    })
    .attr("width", (d) => x(+d.pct) - x(0))
    .attr("fill", colors.university);

  const textLabels = {
    aa: "African American",
    ai: "American Indian",
    cl: "Chicano / Latino",
    pi: "Pacific Islander",
    asian: "Asian American",
    white: "White",
    international: "International",
    z: "Declined to State",
  };
  group
    .append("text")
    .style("letter-spacing", "0px")
    .style("user-select", "none")
    .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif")
    .style("font-weight", "bold")
    .text((d) => textLabels[d.key])
    // .attr("text-anchor", "middle")
    .attr("x", 5)
    .attr("y", -8);
  group
    .append("g")
    .style("font-size", "16px")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("color", "#adadad")
    .call(
      d3
        .axisLeft(z)
        .tickValues(["u2019", "u2020", "u2021"])
        .tickFormat((d) => d.slice(1))
    );
  const getBarColor = (d, i) => {
    return +(d.campus === "sb" && i !== 1);
  };

  group
    .selectAll("labs")
    .data((d) => d.values[1].values)
    .enter()
    .append("text")
    .text((d) => (d.pct < 0.005 ? "<1" : Math.round(d.pct * 100)) + "%")
    .attr("y", (d) => {
      return z("s" + d.year) + barHeight + 2;
    })
    .attr("x", (d) => x(+d.pct) + 5)
    .attr("fill-opacity", (d, i) => +(i !== 1))
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
    .style("letter-spacing", "0px")
    .attr("fill", colors.sb)
    .attr("class", (d) => "uBarVar" + d.eth)
    .style("pointer-events", "none");

  group
    .selectAll("labs")
    .data((d) => d.values[0].values)
    .enter()
    .append("text")
    .text((d) => (d.pct < 0.005 ? "<1" : Math.round(d.pct * 100)) + "%")
    .attr("y", (d) => {
      return z("u" + d.year) + barHeight;
    })
    .attr("x", (d) => x(+d.pct) + 1)
    .attr("fill-opacity", 0)
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
    .style("letter-spacing", "0px")
    .attr("fill", "#adadad")
    .attr("class", (d) => "uBarVar" + d.eth)
    .style("pointer-events", "none");

  const overlay = group
    .append("rect")
    .attr("x", margin.left)
    .attr("width", size.width - margin.left - margin.right)
    .attr("y", 0)
    .attr("height", y.step() - 30)
    .attr("id", (d) => d.key)
    .attr("fill-opacity", 0);

  overlay.on("mouseenter touchstart", function () {
    const which = d3.select(this).attr("id");
    group.selectAll(".uBarVar" + which).attr("fill-opacity", 1);
  });
  overlay.on("mouseleave touchend touchcancel", function () {
    group.selectAll("[class^='uBarVar']").attr("fill-opacity", getBarColor);
  });
  svg
    .append("g")
    .attr("class", "xaxis")
    .attr("transform", `translate(0, ${size.height - 30})`)
    .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif")
    .style("font-size", "16px")
    .attr("color", "#adadad")
    .style("letter-spacing", "0px")
    .call(
      d3.axisBottom(x).tickFormat((d, i) => d * 100 + (d === 0.4 ? "%" : ""))
    );
  container
    .append("p")
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
    .style("letter-spacing", "0px")
    .html(
      "<a style='text-decoration: none; color: black' href='https://www.ucop.edu/institutional-research-academic-planning/_files/factsheets/2021/fall-2021-admission-table-2-1.pdf'>Source: University of California freshman admissions 2019-2021.</a>"
    )
    .style("margin", "5px 0 0 0");
};
