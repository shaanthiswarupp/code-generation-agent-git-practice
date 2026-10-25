
import { useEffect, useState } from "react";
import api from "../api";
import "./EditJob.css";

function EditJob({ jobId, onCancel, onSaved }) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PENDING");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step A: Load the selected job into the form.
  useEffect(() => {
    async function fetchJob() {

      if (jobId == null) {setError("No job was selected.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Use your existing GET endpoint.
        const response = await api.get(`/jobs/${jobId}`);
        const job = response.data;

        setTitle(job.title || "");
        setDescription(job.description || "");
        setStatus(job.status || "PENDING");

      } catch (err) {setError(err.response?.data?.detail ||"Unable to load the job.");
      } finally {setLoading(false);}

    }

    fetchJob();

  }, [jobId] );


  // Step B: Send the edited values to FastAPI.
  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {setError("Please enter a job title.");return;}

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedJob = {
        title: title.trim(),
        description: description.trim(),
        status: status,
      };

      await api.put(`/jobs/${jobId}`, updatedJob);

      setSuccess("Job updated successfully!");

      // Return to Jobs after the update succeeds.
      onSaved();
    } catch (err) {setError(err.response?.data?.detail ||"Unable to update the job. Check your backend endpoint.");
    } finally {setSaving(false);}
  }

  if (loading) {return <p className="edit-message">Loading job...</p>;}

  return (
    <div className="edit-job-page">
      <button type="button"className="edit-back-button"onClick={onCancel}>← Cancel</button>

      <div className="edit-job-heading">
        <h1>Edit Job #{jobId}</h1>
        <p>Update the job information below.</p>
      </div>

      {error && <p className="edit-error">{error}</p>}
      {success && <p className="edit-success">{success}</p>}

      {!error || title !== "" ? (
        <form className="edit-job-form" onSubmit={handleSubmit}>
          <label htmlFor="edit-title">Job Title</label>
          <input id="edit-title"type="text"value={title}onChange={(event) => setTitle(event.target.value)}required/>

          <label htmlFor="edit-description">Description</label>
          <textarea id="edit-description"rows="5"value={description}onChange={(event) =>setDescription(event.target.value)}/>

          <label htmlFor="edit-status">Status</label>
          <select id="edit-status"value={status}onChange={(event) => setStatus(event.target.value)}>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <div className="edit-job-actions">
            <button type="button"className="edit-cancel-button"onClick={onCancel}disabled={saving}>Cancel</button>

            <button type="submit"className="edit-save-button"disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>

        </form> ) : null}


    </div>
  );
}

export default EditJob;
