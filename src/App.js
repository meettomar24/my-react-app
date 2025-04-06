// import logo from './logo.svg';
import "./App.css";
import Container from "@mui/material/Container";
import Accordion from "@mui/material/Accordion";
// import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useState } from "react";
import StarIcon from '@mui/icons-material/Star';
import Pagination from '@mui/material/Pagination';
import Highcharts from 'highcharts'
// import HighchartsReact from 'highcharts-react-official'
// import Button from "@mui/material/Button";

function App() {
  const [repoData, setrepoData] = useState([]);
  const [paginate, setPaginate] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [chartData, setChartData] = useState();

  // fetching API data
  useEffect(() => {
    async function fetchApi() {
      try{
        const res = await fetch(
          `https://api.github.com/search/repositories?q=created:>2017-10-22&sort=stars&order=desc&page=${paginate}`
        );
        const json = await res.json();
        setrepoData(json.items || []);
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
      catch(err){
        console.error(err.message);
      }
    }

    fetchApi();
  }, [paginate]);

  // fetching Chart Data
  useEffect(()=>{
    async function fetchCodeFrequency(owner, repo) {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/stats/code_frequency`);
      const data = await res.json();
      if (!Array.isArray(data)) return null;
    
      const weeks = data.map(week => new Date(week[0] * 1000).toLocaleDateString());
      const additions = data.map(week => week[1]);
      const deletions = data.map(week => Math.abs(week[2]));
    
      return { weeks, additions, deletions };
    }
    repoData.forEach(async (repo, index) => {
      if (expanded === index) {
        const result = await fetchCodeFrequency(repo.owner.login, repo.name);
        if (!result) return;
    
        Highcharts.chart(`chart-container-${index}`, {
          title: {
            text: `${repo.name} – Total Changes`,
            align: 'center',
          },
          xAxis: {
            categories: result.weeks,
            title: { text: 'Week' }
          },
          yAxis: {
            title: { text: 'Number of Changes' }
          },
          series: [
            {
              name: 'Additions',
              data: result.additions,
              color: '#28a745',
            },
            {
              name: 'Deletions',
              data: result.deletions,
              color: '#d73a49',
            }
          ]
        });
      }
    });
    fetchCodeFrequency();  
  },)
  
  
// useEffect((index) => {
//   if(expanded){
//     Highcharts.chart(`chart-container-${index}`, {
//       title: {
//         text: 'Total Changes',
//         align: 'Center',
//       },
//       // subtitle: {
//       //   text: 'By Job Category. Source: <a href="https://irecusa.org/programs/solar-jobs-census/" target="_blank">IREC</a>.',
//       //   align: 'left',
//       // },
//       yAxis: {
//         title: {
//           text: 'Number of Employees',
//         },
//       },
//       xAxis: {
//         accessibility: {
//           rangeDescription: 'Range: 2010 to 2022',
//         },
//       },
//       legend: {
//         layout: 'vertical',
//         align: 'right',
//         verticalAlign: 'middle',
//       },
//       plotOptions: {
//         series: {
//           label: {
//             connectorAllowed: false,
//           },
//           pointStart: 2010,
//         },
//       },
//       series: [
//         {
//           name: 'Installation & Developers',
//           data: [43934, 48656, 65165, 81827, 112143, 142383, 171533, 165174, 155157, 161454, 154610, 168960, 171558],
//         },
//         {
//           name: 'Manufacturing',
//           data: [24916, 37941, 29742, 29851, 32490, 30282, 38121, 36885, 33726, 34243, 31050, 33099, 33473],
//         },
//         {
//           name: 'Sales & Distribution',
//           data: [11744, 30000, 16005, 19771, 20185, 24377, 32147, 30912, 29243, 29213, 25663, 28978, 30618],
//         },
//         {
//           name: 'Operations & Maintenance',
//           data: [null, null, null, null, null, null, null, null, 11164, 11218, 10077, 12530, 16585],
//         },
//         {
//           name: 'Other',
//           data: [21908, 5548, 8105, 11248, 8989, 11816, 18274, 17300, 13053, 11906, 10073, 11471, 11648],
//         },
//       ],
//       responsive: {
//         rules: [
//           {
//             condition: {
//               maxWidth: 500,
//             },
//             chartOptions: {
//               legend: {
//                 layout: 'horizontal',
//                 align: 'center',
//                 verticalAlign: 'bottom',
//               },
//             },
//           },
//         ],
//       },
//     });
//   }
// }, [expanded]);
  
  
  return (
    <div className="App">
      <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
          <div class="navbar-brand text-center w-100">
            Most stared repository
          </div>
        </div>
      </nav>
      <Container fixed>
        {repoData.map((repo, index) => {
          return (
            <div class="mt-3" key={index}>
              <Accordion expanded={expanded===index} onChange={() => setExpanded(expanded === index ? null : index)} class="accordion">
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel1-content-${index}`}
                  id={`panel1-header-${index}`}
                >
                  {repo.owner.avatar_url && (
                    <img class="img-fluid avatar-img" src={repo.owner.avatar_url} alt="Avatar"/>
                  )}
                  <div class="details ms-3">
                    <Typography class="username f-25 f-600" component="span">{repo.name}</Typography>
                    <div class="description f-16">{repo.description}</div>
                    <div class="d-flex align-items-center">
                      <div class="stars"><StarIcon />({repo.stargazers_count})</div>
                      <div class="issues ms-3">Issues({repo.open_issues})</div>
                    </div>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div id={`chart-container-${index}`} style={{ width: '100%', height: '400px' }}></div>
                </AccordionDetails>
              </Accordion>
            </div>
          );
        })}
        <div class="m-5 mx-0 d-flex justify-content-end">
        <Pagination count={2} variant="outlined" color="primary" page={paginate} onChange={(event, value) => setPaginate(value)}/>
        </div>
      </Container>
    </div>
  );
}

export default App;
