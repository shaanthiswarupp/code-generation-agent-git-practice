
import { useEffect, useState } from "react";
import api from "../api";

const stats = [ {title: "Repositories Analyzed",value: 12,description: "Repositories reviewed",},
                {title: "Code Generation Jobs",value: 8,    description: "Jobs created",},
                {title: "Pull Requests",value: 3,description: "Pull requests created",},
                {title: "Successful Jobs",value: 6,description: "Jobs completed successfully",},  ];


function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      try { const response = await api.get("/jobs");
        // The backend should return a list of jobs.
        setJobs(response.data);
      } catch (err) {setError(err.response?.data?.detail ||"Unable to load jobs. Check your backend.");        
      }finally {setLoading(false);}
    }

    fetchJobs();
  }, []);

  if (loading) {return <p>Loading jobs...</p>;}
  if (error) {return <p className="error-message">{error}</p>;}

  return (

    <div className="dashboard">

      <h1>Code Generation Agent</h1>
      <p>Dashboard — Saved Jobs</p>


      {jobs.length === 0 ? (<p>No jobs found. Create your first job!</p>) : (

        <div className="job-list">
          {jobs.map((job) => (
            <div className="job-card" key={job.id}>
              <h3>{job.title || `Job ${job.id}`}</h3>
              <p>Description: {job.description || "Not specified"}</p>
              <p>Status: {job.status || "Not specified"}</p>
              { /*  <p>Created at:  {job.created_at}  </p>  */ }
            </div>
          ))}
        </div>

      )}


    </div>
    



  );
}

export default Dashboard;







// function Dashboard() {
//   return (

//     <div className="dashboard">
//       <div className="dashboard-heading">
//         <div>
//           <h1>Overview Dashboard</h1>
//           <p>Monitor your AI code generation activities.</p>
//         </div>
//       </div>


//       <div className="stats-grid">
//         {stats.map( (stat) => (
//                                 <div className="stat-card" key={stat.title}>
//                                     <p className="stat-title">{stat.title}</p>
//                                     <h2>{stat.value}</h2>
//                                     <p className="stat-description">{stat.description}</p>
//                                 </div> 
//                             ) ) }
//       </div>


//       <div className="dashboard-section">
//         <h2>Quick Actions</h2>

//         <div className="quick-actions">
//           <button onClick={() =>alert("Jira integration will be implemented later.")}>Configure Jira</button>
//           <button onClick={() =>alert("Repository Analysis will be implemented later.")}>Analyze Repository</button>
//           <button onClick={() =>alert("AI Code Generation will be implemented later.")}>Generate Code</button>

//         </div>
//       </div>


//       <div className="dashboard-section">
//         <h2>Recent Activity</h2>

//         <div className="activity-item">
//           <div>
//             <strong>Repository Analysis</strong>
//             <p>Sample repository analysis task</p>
//           </div>
//           <span className="status completed">Completed</span>
//         </div>

//         <div className="activity-item">
//           <div>
//             <strong>Code Generation</strong>
//             <p>Sample AI code generation task</p>
//           </div>
//           <span className="status pending">Pending</span>
//         </div>

//         <div className="activity-item">
//           <div>
//             <strong>Pull Request</strong>
//             <p>Sample pull request task</p>
//           </div>
//           <span className="status review">In Review</span>
//         </div>


//       </div>
//     </div>
//   );
// }

// export default Dashboard;

