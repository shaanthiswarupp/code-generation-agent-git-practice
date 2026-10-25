
import { useEffect, useState } from "react";
import api from "../api";
import "./Jobs.css";

function Jobs({ onViewDetails , onEditJob }) {

  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState("");

  const [deletingId, setDeletingId] = useState(null);


  const [searchText, setSearchText] = useState(""); // for filters
  const [sortBy, setSortBy] = useState("newest");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/jobs", {params: status ? { status } : {},});
        setJobs(response.data);
      } catch (err) {setError(err.response?.data?.detail || "Unable to load jobs. Please check your backend." );
      } finally {setLoading(false); }
    }

    fetchJobs();
  }, [status]);

  async function handleDeleteJob(jobId) {    
    // Ask the user before deleting
    const confirmed = window.confirm(`Are you sure you want to delete job #${jobId}?`    );
    // Stop if the user clicks Cancel
    if (!confirmed) {   return;}

    try {
        setDeletingId(jobId);
        setError("");
        // Send DELETE request to FastAPI
        await api.delete(`/jobs/${jobId}`);
        // Fetch the latest jobs from FastAPI
        const response = await api.get("/jobs", {params: status ? { status } : {},});
        // Update the table with the latest data
        setJobs(response.data);

    } catch (err) {setError(err.response?.data?.detail ||"Unable to delete the job. Please try again."); }
    finally {setDeletingId(null);}
  }
  
  const filteredJobs = jobs.filter((job) => {    
    const search = searchText.toLowerCase().trim();
    return (String(job.title || "").toLowerCase().includes(search) ||
            String(job.description || "").toLowerCase().includes(search)
          );
  }).sort((a, b) => {
    if (sortBy === "title") {
      return (a.title || "").localeCompare(b.title || "");
    }

    if (sortBy === "oldest") {
      return new Date(a.created_at) - new Date(b.created_at);
    }

    if (sortBy === "newest") {
      return new Date(b.created_at) - new Date(a.created_at);
    }

    if (sortBy === "id") {
      return Number(a.id) - Number(b.id);
    }

    return 0;
  });



  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <div>
          <h1>Jobs</h1>
          <p>View and manage your code generation jobs.</p>
        </div>

        <div className="jobs-filter">
          <label htmlFor="job-status">Filter by status</label>
          <select
            id="job-status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All Jobs</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

      </div>



      <div className="jobs-summary">

        <div className="summary-card">
          <span>Total jobs shown</span>
          <strong>{jobs.length}</strong>
        </div>

        <div className="summary-card">
          <span>Pending jobs shown</span>
          <strong>
            {jobs.filter((job) => job.status === "PENDING").length}
          </strong>
        </div>

        <div className="summary-card">
          <span>Completed jobs shown</span>
          <strong>
            {jobs.filter((job) => job.status === "COMPLETED").length}
          </strong>
        </div>

      </div>

      <div className="jobs-toolbar">
        <input type="text"placeholder="Search by title or description..." value={searchText}onChange={(event) => setSearchText(event.target.value)}className="jobs-search"/>

        <select value={status}onChange={(event) => setStatus(event.target.value)}className="jobs-status-filter">
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select value={sortBy}onChange={(event) => setSortBy(event.target.value)}className="jobs-sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title A–Z</option>
          <option value="id">ID: Low to high</option>
        </select>
      </div>



      <div className="jobs-table-card">

        <h2>Job List</h2>

        {loading && <p className="jobs-message">Loading jobs...</p>}
        {!loading && error && (<p className="jobs-error">{error}</p>)}
        {!loading && !error && jobs.length === 0 && (<p className="jobs-message">No jobs found for this status.</p>)}

        {!loading && !error && jobs.length > 0 && (
          <div className="jobs-table-wrapper">

            <table className="jobs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>User ID</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                { filteredJobs.map((job) => (
                    <tr key={job.id}>

                        <td>{job.id}</td>
                        <td className="job-title">{job.title}</td>
                        <td>{job.description}</td>
                        <td><span className={`status-badge ${job.status.toLowerCase()}`}>{job.status}</span></td>
                        <td>{job.user_id ?? "N/A"}</td>

                        <td> 
                            <button className="view-details-button" onClick={() => onViewDetails(job.id)}>
                                View Details </button>

                             <button className="edit-job-button"onClick={() => onEditJob(job.id)} >Edit </button>

                             <button className="delete-job-button" onClick={() => handleDeleteJob(job.id)} disabled={deletingId === job.id}>
                                {deletingId === job.id ? "Deleting..." : "Delete"} </button>


                                
                        </td>                                
                    </tr> ))
                }                
               </tbody>

            </table>            
          </div>
        )}

      </div>
    </div>
  );
}

export default Jobs;
