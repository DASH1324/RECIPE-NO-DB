import os
from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, Field

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "a-secure-default-key-for-development") 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

class Token(BaseModel):
    access_token: str
    token_type: str
    full_name: str
    username: str

class User(BaseModel):
    username: str
    full_name: str
    email: EmailStr

class UserInDB(User):
    password: str

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_.-]+$")
    full_name: str
    email: EmailStr
    password: str

class VerificationData(BaseModel):
    email: EmailStr
    otp: str

class ProfileUpdate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_.-]+$")
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

HARDCODED_USER_DB = {
    "estanislao": UserInDB(
        username="Estanislao",
        full_name="Estanislao RNJL",
        email="estanislao@example.com",
        password="Rnjl@1027"
    )
}

def verify_password(plain_password: str, stored_password: str) -> bool:
    return plain_password == stored_password

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_user_by_email(email: str) -> UserInDB | None:
    for user in HARDCODED_USER_DB.values():
        if user.email.lower() == email.lower():
            return user
    return None

async def get_user_by_username(username: str) -> UserInDB | None:
    if username.lower() in HARDCODED_USER_DB:
        return HARDCODED_USER_DB[username.lower()]
    return None

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await get_user_by_username(form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "username": user.username, "full_name": user.full_name},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "full_name": user.full_name, "username": user.username}

@router.post("/request-verification", status_code=status.HTTP_403_FORBIDDEN)
async def request_verification(user: UserCreate):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User registration is currently disabled.")

@router.post("/verify-and-register", status_code=status.HTTP_403_FORBIDDEN)
async def verify_and_register(data: VerificationData):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User registration is currently disabled.")

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(request: PasswordResetRequest):
    user = await get_user_by_email(request.email)
    if user:
        expires_delta = timedelta(minutes=15)
        reset_token = create_access_token(
            data={"sub": user.email, "purpose": "password-reset"},
            expires_delta=expires_delta
        )
        reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
        print(f"\n--- PASSWORD RESET LINK (FOR DEMO) ---\nUser: {user.username}\nLink: {reset_link}\n--------------------------------------\n")
    return {"message": "If an account with that email exists, password reset instructions have been sent."}

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(data: PasswordResetConfirm):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials, invalid or expired token.",
    )
    try:
        payload = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") != "password-reset": raise credentials_exception
        email: str = payload.get("sub")
        if email is None: raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await get_user_by_email(email)
    if not user: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    user.password = data.new_password
        
    return {"message": "Your password has been reset successfully."}

async def get_current_active_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        if username is None: raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await get_user_by_username(username)
    if user is None: raise credentials_exception
    return user

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.put("/users/me", response_model=Token)
async def update_user_me(update_data: ProfileUpdate, current_user: UserInDB = Depends(get_current_active_user)):
    if update_data.new_password:
        if not update_data.current_password:
            raise HTTPException(status_code=400, detail="Current password is required to set a new password")
        if not verify_password(update_data.current_password, current_user.password):
            raise HTTPException(status_code=400, detail="Incorrect current password")
        current_user.password = update_data.new_password

    username_changed = update_data.username.lower() != current_user.username.lower()
    
    current_user.full_name = update_data.full_name
    current_user.email = update_data.email
    
    if username_changed:
        old_key = current_user.username.lower()
        current_user.username = update_data.username
        new_key = update_data.username.lower()
        HARDCODED_USER_DB[new_key] = HARDCODED_USER_DB.pop(old_key)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.email, "username": current_user.username, "full_name": current_user.full_name},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "full_name": current_user.full_name,
        "username": current_user.username
    }