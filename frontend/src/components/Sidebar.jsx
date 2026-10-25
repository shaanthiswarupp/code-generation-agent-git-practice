const menuItems = [ "Overview","Jobs","Create Job","Jira Configuration","Repository Analysis","Code Generation","Pull Requests",];

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <h2>Code Agent</h2>
      <nav>
        { menuItems.map((item) => (

          <button key={item} className={activePage === item ? "nav-button active" : "nav-button" }
                  onClick={() => onNavigate(item)} >  {item} 
          </button> ) ) }
          
      </nav>
    </aside>
  );
}




export default Sidebar;
