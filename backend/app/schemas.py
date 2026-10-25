from datetime import datetime

from pydantic import BaseModel

# ======================== users  table model ==========================
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    #username: str
    password: str   

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool

    class Config:
        from_attributes = True


#======================= jobs  table model ==========================

class JobCreate(BaseModel):
    title: str
    description: str
    status: str = "PENDING"
    user_id: int | None = None


class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    created_at: datetime
    user_id: int | None=None

    class Config:
        from_attributes = True

class JobUpdate(BaseModel):
    title: str
    description: str
    status: str