from sqlalchemy import Column, Integer, String, Text, DateTime , Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


# ======================= users table model ==========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255), unique=True, nullable=False)

    username = Column(String(100), unique=True, nullable=False)

    password_hash = Column(String(255), nullable=False)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, server_default=func.now())

    jobs = relationship("Job", back_populates="user")



# ======================= jobs  table model ==========================

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    description = Column(Text)

    status = Column(String(50), default="PENDING")

    created_at = Column(DateTime, server_default=func.now())

    user_id = Column(Integer, ForeignKey("users.id"))    

    user = relationship("User", back_populates="jobs")



