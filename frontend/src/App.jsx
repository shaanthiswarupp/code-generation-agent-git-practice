import { useState } from "react";

import Login from "./components/Login";
import Register from "./components/Register";

import Header from "./components/Header";
import WelcomeCard from "./components/WelcomeCard";

import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";

import Dashboard from "./components/Dashboard";
import JiraConfig from "./components/JiraConfig";

import Jobs from "./components/Jobs";
import JobDetails from "./components/JobDetails";


function App() {
  const [page, setPage] = useState("login");// login to jira changed or bypass login page 
  const [userEmail, setUserEmail] = useState("");

  const [activePage, setActivePage] = useState("Overview");
  const [selectedJobId, setSelectedJobId] = useState(null);


  function handleLogin(email) {setUserEmail(email);setPage("dashboard");}
  function handleRegister(name, email) {setUserEmail(email);setPage("dashboard");}

  function handleViewJobDetails(jobId) { setSelectedJobId(jobId); setActivePage("Job Details"); }
  function handleEditJob(jobId) {setSelectedJobId(jobId);setActivePage("Edit Job");}



  if (page === "login") {
    return ( <Login onLogin={handleLogin} onShowRegister={() => setPage("register")} /> ); }
  if (page === "register") {
    return (<Register onRegister={handleRegister} onShowLogin={() => setPage("login")} /> ); }
  if (page === "jira") { return <JiraConfig />; }


  return (
    <>
    <Header/>
    <WelcomeCard/> 

    <div className="app-layout">
        <Sidebar      activePage={activePage}       onNavigate={setActivePage}/>
        
        <MainContent  activePage={activePage}       onViewJobDetails={handleViewJobDetails} 
                      selectedJobId={selectedJobId} onBackToJobs={() => setActivePage("Jobs")} 
                      onEditJob={handleEditJob}
                      
                      
                      
                      />  

    </div> 
    






          
    </>   

  );

}

export default App;
