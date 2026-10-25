
import { useState } from "react";
import api from "../api";

function RepositoryAnalysis() {

  const [repositoryPath, setRepositoryPath] = useState("");
  const [requirement, setRequirement] = useState("");  

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [report, setReport] = useState(null);
 

  async function handleAnalyze(event) {
    event.preventDefault();
    setError("");
    setReport(null);

    if (!repositoryPath.trim() || !requirement.trim()) {setError("Please enter the repository path and requirement.");return;}

    try {
      setLoading(true);
      const response = await api.post("/analysis/request", {repository_path: repositoryPath.trim(),requirement: requirement.trim(),});
      /* data = response.data */
      setReport(response.data);
    } catch (err) {setError(err.response?.data?.detail ||"Repository analysis failed. Check the backend.");
    } finally {setLoading(false);}
  }

  return (

    <div className="analysis-page">

      <h1>Repository Analysis</h1>
      <p> Analyze your source code to identify files relevant to the selected requirement.</p>

      <form className="analysis-card" onSubmit={handleAnalyze}>

        <label htmlFor="repository-path">Repository Path</label>
        <input id="repository-path" type="text" value={repositoryPath} onChange={(event) =>setRepositoryPath(event.target.value)}
          placeholder="Example: C:\projects\my-app"
          required
        />

        <label htmlFor="requirement">Requirement</label>
        <textarea id="requirement" value={requirement} onChange={(event) =>setRequirement(event.target.value)}
          placeholder="Describe what you want to implement..."
          rows={9}
          required
        />

        <button type="submit" disabled={loading}>{loading ? "Analyzing..." : "Analyze Repository"}</button>

      </form>

      { error && (<p className="error-message">{error}</p> ) }

      {report && (
                    <div className="analysis-card">
                    <h2>Analysis Result</h2>
                    <pre className="report-output">{JSON.stringify(report, null, 2)} </pre>
                    </div> )
      }

    </div>

  );
}

export default RepositoryAnalysis;
