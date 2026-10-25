
import { useState } from "react";
import api from "../api";
import "./CreateJob.css";

function CreateJob({ onCancel, onCreated }) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PENDING");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {setError("Please enter a job title.");return;}

    try {
      setLoading(true);
      setError("");

      const newJob = {
        title: title.trim(),
        description: description.trim(),
        status: status,
      };

      const response = await api.post("/jobs",newJob);
      alert("Job created successfully!");

      if (onCreated) {onCreated(response.data);}
    } catch (err) {setError(err.response?.data?.detail ||"Unable to create job. Please check the backend.");
    } finally {setLoading(false);}
  }

  return (
    <div className="create-job-page">
      <h1>Create New Job</h1>
      <p>Create a job and save it to the database.</p>

      {error && (<p className="create-job-error">{error}</p>)}

      <form className="create-job-form"onSubmit={handleSubmit}>

        <label htmlFor="job-title">Job Title</label>
        <input id="job-title"type="text"value={title}onChange={(event) => setTitle(event.target.value)}placeholder="Enter job title"required/>

        <label htmlFor="job-description">Description</label>
        <textarea id="job-description"rows="5"value={description}onChange={(event) =>setDescription(event.target.value)}placeholder="Enter job description"/>

        <label htmlFor="job-status">Status</label>
        <select id="job-status"value={status}onChange={(event) => setStatus(event.target.value)}>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <div className="create-job-actions">
          <button type="button"onClick={onCancel} disabled={loading}>Cancel</button>

          <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Job"}</button>
        </div>

      </form>

    </div>
  );
}

export default CreateJob;
