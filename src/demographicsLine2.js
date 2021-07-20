import * as d3 from "d3";
import * as d3Collection from "d3-collection";

export default async (container, size, margin) => {
  const colors = {
    sb: "#005AA3",
    university: "#d3d3d3aa",
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
        }; height: 5px; width: 30px; margin-right: 5px;'></div>${d.name}</div>`
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
    .scaleLinear()
    .domain([2019, 2021])
    .range([0, y.step() - 40]);

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
      return x(+d.pct);
    })
    .y((d) => z(+d.year));

  const ethPath = group
    .selectAll("path")
    .data((d) => d.values)
    .enter()
    .append("path")
    .attr("d", (d) => path(d.values))
    .attr("fill", "none")
    .attr("stroke", (d) => colors[d.key])
    .attr("stroke-width", (d) => (d.key === "sb" ? 3 : 4));

  const getLength = (p) => p.node().getTotalLength();

  ethPath
    .attr("stroke-dasharray", function () {
      const len = getLength(d3.select(this));
      return len + " " + len;
    })
    .attr("stroke-dashoffset", function () {
      return getLength(d3.select(this));
    })
    .transition()
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0)
    .duration(2500);

  const overlay = group
    .selectAll("overlay")
    .data((d) => d.values)
    .enter()
    .append("path")
    .attr("d", (d) => path(d.values))
    .attr("fill-opacity", 0)
    .attr("stroke-opacity", 0)
    .attr("stroke", "red")
    .attr("stroke-width", 20)
    .on("mouseover touchstart", (event, d) => {
      const classKey = d.values[0].campus + d.values[0].eth;
      svg.selectAll("." + classKey).attr("fill-opacity", 1);
    })
    .on("mouseleave", (event, d) => {
      const classKey = d.values[0].campus + d.values[0].eth;
      svg.selectAll("." + classKey).attr("fill-opacity", fillColor);
    });

  group
    .append("g")
    .style("font-size", "16px")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("color", "#adadad")
    .call(
      d3
        .axisLeft(z)
        .ticks(2)
        .tickFormat((d) => d)
    );

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
    .attr("y", -10);

  group
    .append("line")
    .attr("stroke", (d, i) => (i === 6 ? "none" : "#adadad"))
    .attr("x1", margin.left)
    .attr("x2", size.width - margin.right)
    .attr("y1", z.range()[1] + 10)
    .attr("y2", z.range()[1] + 10);

  const lineLabels = group
    .selectAll(".lineLabels")
    .data((d) => d.values)
    .join("g")
    .selectAll(".lineText")
    .data((d) => d.values);

  const fillColor = (d) =>
    d.year !== "2020" && d.campus === "sb" && d.pct > 0.03 ? 1 : 0;

  const flipLabels = size.width < 440;

  const getSide = (d) => {
    if (flipLabels) {
      if (d.campus === "university") {
        if (["aa", "cl", "ai", "pi"].includes(d.eth)) {
          return [5, "start"];
        }
        return [-5, "end"];
      }
      if (d.eth === "cl" || d.eth === "aa") {
        return [-5, "end"];
      }
      return [5, "start"];
    } else {
      if (d.campus === "university") {
        if (["aa"].includes(d.eth)) {
          return [5, "start"];
        } else if (["z", "white"].includes(d.eth)) {
          return [-5, "end"];
        }
      }
      if (["z", "cl", "ai", "pi"].includes(d.eth)) {
        return [5, "start"];
      } else if (d.eth === "white") {
        return [8, "start"];
      }
      return [-5, "end"];
    }
  };

  lineLabels
    .enter()
    .append("text")
    .style("letter-spacing", "0px")
    .style("user-select", "none")
    .text((d) => {
      return Math.round(d.pct * 100) + "%";
    })
    .attr("x", (d) => x(d.pct) + getSide(d)[0])
    .attr("class", (d) => `${d.campus}${d.eth}`)
    .attr("y", (d) => z(d.year))
    .attr("fill", (d) => colors[d.campus])
    .attr("fill-opacity", fillColor)
    .attr("alignment-baseline", "middle")
    .attr("text-anchor", (d) => getSide(d)[1]);

  lineLabels
    .enter()
    .append("circle")
    .attr("class", (d) => `${d.campus}${d.eth}`)
    .attr("r", 3)
    .attr("cx", (d) => x(d.pct))
    .attr("cy", (d) => z(d.year))
    .attr("fill-opacity", fillColor)
    .attr("fill", (d) => colors[d.campus]);

  overlay.raise();

  svg
    .append("g")
    .attr("class", "xaxis")
    .attr("transform", `translate(0, ${size.height - 40})`)
    .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif")
    .style("font-size", "16px")
    .attr("color", "#adadad")
    .style("letter-spacing", "0px")
    .call(
      d3.axisBottom(x).tickFormat((d, i) => d * 100 + (d === 0.4 ? "%" : ""))
    );
  svg
    .append("text")
    .style("letter-spacing", "0px")
    .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif")
    .style("font-size", "16px")
    .attr("fill", "#adadad")
    .text("% of Applicants")
    .attr("x", size.width / 2)
    .attr("y", size.height - 5)
    .attr("text-anchor", "middle");

  // if (size.width < 600) {
  //   svg
  //     .append("text")
  //     .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
  //     .text("UCSB Below")
  //     .attr("x", size.width / 5)
  //     .attr("y", y("cl") + z(2020));

  //   svg
  //     .append("text")
  //     .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
  //     .text("UC Average")
  //     .attr("x", size.width / 5)
  //     .attr("y", y("cl") + z(2020) + 16);
  // } else {
  //   svg
  //     .append("text")
  //     .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
  //     .text("UCSB Below UC Average")
  //     .attr("x", size.width / 5)
  //     .attr("y", y("cl") + z(2020));
  // }

  container
    .append("p")
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
    .style("letter-spacing", "0px")
    .html(
      "<a style='text-decoration: none; color: black' href='https://www.ucop.edu/institutional-research-academic-planning/_files/factsheets/2021/fall-2021-admission-table-2-1.pdf'>Source: University of California freshman admissions 2019-2021.</a>"
    )
    .style("margin", "5px 0 0 0");
};
