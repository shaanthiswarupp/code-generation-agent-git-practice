# from typing import List

# from fastapi import FastAPI
# from pydantic import BaseModel

# app = FastAPI(title="Mini Code Generation Agent",version="1.0.0")

# # user input from req body {requirement: "add two numbers"}
# class CodeRequest(BaseModel):
#     requirement: str


# @app.get("/")
# def home():
#     return {"message": "Mini Code Generation Agent is running"}

# @app.get("/health")
# def health():
#     return {"status": " status is healthy"}

    
# @app.post("/generate")
# def generate_code(request: CodeRequest):

#     requirement = request.requirement.lower()


#     if "add two numbers" in requirement:

#         code = """ @app.get("/add")
#                     def add(a: int, b: int):
#                         return {"result": a + b}  """        
    
#         return {  "requirement": request.requirement,  "generated_code": code}

    

#     elif "subtract two numbers" in requirement:

#         code = """ @app.get("/subtract")
#                     def subtract(a: int, b: int):
#                         return {"result": a - b}  """        
    
#         return {  "requirement": request.requirement,  "generated_code": code}

    

#     elif "multiply two numbers" in requirement:

#         code = """ @app.get("/multiply")
#                     def multiply(a: int, b: int):
#                         return {"result": a * b}  """        
    
#         return {  "requirement": request.requirement,  "generated_code": code}

    

#     elif "divide two numbers" in requirement:

#         code = """ @app.get("/divide")
#                     def divide(a: int, b: int):
#                         if b == 0:
#                             return {"error": "Division by zero is not allowed"}
#                         return {"result": a / b}  """        
    
#         return {  "requirement": request.requirement,  "generated_code": code}

    

#     return {"requirement": request.requirement, "generated_code": "# Code generation not supported yet" }

#==============================================================

from dotenv import load_dotenv

load_dotenv()
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app.models import Job , User
from app.schemas import JobCreate, JobResponse, JobUpdate , UserCreate, UserLogin , UserResponse 
from app.security import hash_password, verify_password , create_access_token

from app.routes.jira import router as jira_router 
from app.routes.git import router as git_router
from app.routes.analysis import router as analysis_router
from app.routes.generation import router as generation_router 
from app.routes.validation import router as validation_router
from app.routes.workflow import router as workflow_router

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Code Generation Agent")
#for frontend development, allow CORS from localhost:5173
app.add_middleware(
    CORSMiddleware, 
    allow_origins=[ "http://localhost:5173", "http://127.0.0.1:5173" ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"], )



app.include_router(jira_router)
app.include_router(git_router)
app.include_router(analysis_router)

app.include_router(generation_router)
app.include_router(validation_router)
app.include_router(workflow_router)

#======================================================================== post a new job
# load the database models and create the tables if they don't exist
@app.get("/")
def home():
    return {" ==============  Welcome to the Job Management API ========>>>>>>  CODDE GENERATION AGENT "}


@app.post("/api/v1/jobs", response_model=JobResponse)
def create_job( job: JobCreate, db: Session = Depends(get_db) ):
    new_job = Job( title=job.title,  description=job.description,  status=job.status , user_id=job.user_id )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job

#======================================================================= get all jobs
# get all jobs

@app.get("/api/v1/jobs", response_model=list[JobResponse])
def get_jobs( id: int |None=None, 
              status: str | None = None,
              user_id: int |None=None, 
              db: Session = Depends(get_db) ):
    # jobs = db.query(Job).all()
    query = db.query(Job)

    if status:
        query = query.filter(Job.status == status)

    if user_id:
        query = query.filter(Job.user_id == user_id )

    jobs = query.all()

    return jobs

#========================================================================= get a specific job by ID
# get a specific job by ID

@app.get("/api/v1/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int |None=None, db: Session = Depends(get_db)):

    job = db.query(Job).filter(Job.id == job_id).first()

    if job is None:
        raise HTTPException(status_code=404,detail="Job not found")

    return job


#============================================================================ update a specific job by ID
# update a specific job by ID

@app.put("/api/v1/jobs/{job_id}", response_model=JobResponse)

def update_job(job_id: int, job_data: JobUpdate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()

    if job is None:
        raise HTTPException(status_code=404,detail="Job not found")

    job.title = job_data.title
    job.description = job_data.description
    job.status = job_data.status

    db.commit()
    db.refresh(job)

    return job


#========================================================================= delete a specific job by ID
# delete a specific job by ID

@app.delete("/api/v1/jobs/{job_id}")
def delete_job(job_id: int,db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()

    if job is None:
        raise HTTPException(status_code=404,detail="Job not found")

    db.delete(job)
    db.commit()
    

    return {"message": "Job deleted successfully"}




#========================================================================= create a new user
@app.post("/api/v1/auth/register", response_model=UserResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter( (User.email == user_data.email) | (User.username == user_data.username) ).first()


    if existing_user:
        raise HTTPException(status_code=400, detail="Email or username already registered")


    hashed_password = hash_password(user_data.password)
    new_user = User(email=user_data.email, username=user_data.username, password_hash = hashed_password)
 
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    

    return new_user

@app.post("/api/v1/auth/login")
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(user.id, user.username)
    

    return {"access_token": access_token, "token_type": "bearer"}