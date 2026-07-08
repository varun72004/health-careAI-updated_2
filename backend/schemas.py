# backend/schemas.py
# ---------------------------------------------------------
# Pydantic models for data validation and API serialization.
# ---------------------------------------------------------

from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- User Schemas ---

# Fields required when creating a new user account
class UserCreate(BaseModel):
    name: str
    username: str
    password: str
    age: int
    contact: str
    email: EmailStr

# Public-facing user representation (excludes password)
class UserOut(BaseModel):
    id: int
    name: str
    username: str
    email: str
    age: int
    contact: str

    class Config:
        from_attributes = True

# Optional fields for partial profile updates
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    contact: Optional[str] = None

# --- Auth Schemas ---

# JWT token response returned after successful login
class Token(BaseModel):
    access_token: str
    token_type: str

# Decoded token payload carrying the username claim
class TokenData(BaseModel):
    username: Optional[str] = None

# --- AI Prediction Schemas ---

# Incoming symptom list from the frontend
class PredictionRequest(BaseModel):
    symptoms: List[str]

# Full prediction result returned to the frontend
class PredictionResponse(BaseModel):
    predicted_disease: str
    confidence: float
    top_predictions: List[dict]
    disease_description: Optional[str] = None
    medicines: str
    medicine_description: Optional[str] = None
    diet: str
    workout: str

# Payload for saving a prediction to the user's history
class SaveRecordRequest(BaseModel):
    symptoms: List[str]
    predicted_disease: str
    medicines: str
    diet: str
    workout: str

# Single history record returned from the database
class PredictionHistoryOut(BaseModel):
    id: int
    symptoms: str
    predicted_disease: str
    medicines: str
    diet: str
    workout: str
    created_at: datetime

    class Config:
        from_attributes = True

# Paginated wrapper around a list of history records
class PaginatedHistoryOut(BaseModel):
    total_records: int
    total_pages: int
    current_page: int
    records: List[PredictionHistoryOut]