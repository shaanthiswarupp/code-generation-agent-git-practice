
import { useEffect, useState } from "react";
import api from "../api";
import "./JobDetails.css";

function JobDetails({ jobId, onBack }) {
    
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJobDetails() {

      if (jobId == null) {setError("No job was selected.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setJob(null);

        const response = await api.get(`/jobs/${jobId}`);
        setJob(response.data);
        } catch (err) {setError( err.response?.data?.detail || "Unable to load job details.");
      } finally {setLoading(false);}
    }    

    fetchJobDetails();

  }, [jobId] );

  return (
    <div className="job-details-page">
      <button className="back-button" onClick={onBack}>
        ← Back to Jobs
      </button>

      <div className="job-details-header">
        <h1>Job Details</h1>
        <p>View information about your selected job.</p>
      </div>

      {loading && <p>Loading job details...</p>}

      {!loading && error && (<p className="job-details-error">{error}</p>)}

      {!loading && !error && job && (
        <div className="job-details-card">

          <div className="detail-row">
            <span>Job ID</span>
            <strong>{job.id}</strong>
          </div>

          <div className="detail-row">
            <span>Title</span>
            <strong>{job.title || "N/A"}</strong>
          </div>

          <div className="detail-row">
            <span>Description</span>
            <strong>{job.description || "N/A"}</strong>
          </div>

          <div className="detail-row">
            <span>Status</span>
            <strong className={`detail-status ${ job.status?.toLowerCase() || ""}`} >
              {job.status || "N/A"}
            </strong>
          </div>

          <div className="detail-row">
            <span>User ID</span>
            <strong>{job.user_id ?? "N/A"}</strong>
          </div>

          <div className="detail-row">
            <span>Created At</span>
            <strong> {job.created_at ? new Date(job.created_at).toLocaleString() : "N/A"} </strong>
          </div>

        </div>
      )}
    </div>
  );
}

export default JobDetails;
