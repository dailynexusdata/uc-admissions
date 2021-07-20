import * as d3 from "d3";

import makeAdmissionsPlot from "./admissions";
// import makeDemographicsPlot from "./demographicsLine";
import makeDemographicsPlot from "./demographics1";

const update = () => {
  alert("resize");
  const width = Math.min(600, window.innerWidth - 40);

  const admissionsPlot = d3.select("#uc-admissions-admissions-d3");
  admissionsPlot.selectAll("*").remove();
  makeAdmissionsPlot(
    admissionsPlot,
    width,
    { height: 200, width: width === 600 ? 200 : 140 },
    {
      left: 20,
      right: 20,
      top: 35,
      bottom: 40,
    }
  );
  const demographicsPlot = d3.select("#uc-admissions-demographics-d3");
  demographicsPlot.selectAll("*").remove();
  makeDemographicsPlot(
    demographicsPlot,
    { height: 550, width },
    {
      left: 50,
      right: 60,
      top: 30,
      bottom: 80,
    }
  );
};

window.addEventListener("resize", update);

// d3.select("#uc-admissions-admissions-d3").selectAll("*").remove();
// d3.select("#uc-admissions-demographics-d3").selectAll("*").remove();
update();
