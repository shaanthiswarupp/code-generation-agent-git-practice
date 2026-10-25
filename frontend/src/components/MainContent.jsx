
import WelcomeCard from "./WelcomeCard";
import AnalysisButton from "./AnalysisButton";
import Dashboard from "./Dashboard";
import JiraConfig from "./JiraConfig";
import RepositoryAnalysis from "./RepositoryAnalysis";
import CodeGeneration from "./CodeGeneration";

import CreateJob from "./CreateJob";
import Jobs from "./Jobs";
import JobDetails from "./JobDetails";
import EditJob from "./EditJob";

function MainContent({ activePage, onViewJobDetails,onEditJob, selectedJobId, onBackToJobs,}) {
  return (
    <main className="main-content">
      {activePage === "Overview"  &&  <Dashboard/> }


      {activePage === "Jobs"      &&   <Jobs  onViewDetails={onViewJobDetails} onEditJob={onEditJob}  /> }

      {activePage === "Job Details" && ( <JobDetails jobId={selectedJobId} onBack={onBackToJobs} /> )}

      {activePage === "Edit Job" && (<EditJob jobId={selectedJobId} onCancel={onBackToJobs} onSaved={onBackToJobs} />)}

      {activePage === "Create Job" && (<CreateJob onCancel={onBackToJobs} onCreated={() => onBackToJobs()} /> )}
      

      
      {activePage === "Jira Configuration"  &&  <JiraConfig/> }
      {activePage === "Repository Analysis" && <RepositoryAnalysis/>  }
      {activePage === "Code Generation"     &&  <CodeGeneration/> }

      {activePage === "Pull Requests"       && ( <><h1>Pull Requests</h1>
                                                 <p>Monitor your pull requests here.</p></>
                                               )}
    </main>
  );
}

export default MainContent;
