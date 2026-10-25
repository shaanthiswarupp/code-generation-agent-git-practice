
import { useState } from "react";
import api from "../api";

function JiraConfig() {

  const [jiraUrl, setJiraUrl] = useState("");
  const [email, setEmail] = useState("");
  const [apiToken, setApiToken] = useState("");

  const [epics, setEpics] = useState([]);
  const [selectedEpic, setSelectedEpic] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleConfigure(event) {    
    event.preventDefault();
    setMessage("");
    setError("");
    setEpics([]);
    setSelectedEpic("");

    if (!jiraUrl.trim() || !email.trim() || !apiToken) {setError("Please fill in all Jira configuration fields.");return; }

    try {
      setLoading(true);
      // post data to jira config
      await api.post( "/jira/configure", { jira_url: jiraUrl.trim().replace(/\/+$/, ""),
                                            email: email.trim(),
                                            api_token: apiToken,  }                             );

      setMessage("Jira configuration submitted successfully."); 
      // Load epics after configuration succeeds.

      const response = await api.get("/jira/epics");
      const data = response.data;
      const epicList = Array.isArray(data) ? data : data.epics || [];
      setEpics(epicList);

    } catch (err) {setError(err.response?.data?.detail ||"Unable to configure Jira or load epics.");
    } finally {setLoading(false);}
  }



  return (

    <div className="jira-page">

      <h1>Jira Configuration</h1>
      <p>Connect Jira and select an epic for code generation.</p>

      <form className="jira-card" onSubmit={handleConfigure}>

        <label htmlFor="jira-url">Jira URL</label>
        <input id="jira-url" type="url" placeholder="https://your-company.atlassian.net" value={jiraUrl} onChange={(e) => setJiraUrl(e.target.value)} required />

        <label htmlFor="jira-email">Jira Email</label>
        <input id="jira-email" type="email"placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="jira-token">Jira API Token</label>
        <input id="jira-token"type="password"placeholder="Enter your Jira API token"value={apiToken}onChange={(e) => setApiToken(e.target.value)}required />

        <button type="submit" disabled={loading}>
          {loading ? "Connecting..." : "Connect Jira & Load Epics"}
        </button>

      </form>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      {epics.length > 0 && (
        <div className="jira-card">

          <h2>Select an Epic</h2>

          <label htmlFor="epic-select">Available Jira Epics</label>

          <select id="epic-select" value={selectedEpic} onChange={(e) => setSelectedEpic(e.target.value)} >
            <option value="">Choose an epic</option>

            {epics.map((epic) => (
              <option key={epic.key || epic.id} value={epic.key || epic.id} >
                {epic.key} - {epic.summary || epic.name}
              </option>
            ))}

          </select>

          {selectedEpic && ( <p> Selected epic: <strong>{selectedEpic} </strong> </p> ) }

          <button type="button" disabled={!selectedEpic} onClick={() =>setMessage(`Epic ${selectedEpic} selected successfully.`) } >
            Confirm Epic Selection
          </button>

        </div>
      )}

    </div>
  );
}

export default JiraConfig;