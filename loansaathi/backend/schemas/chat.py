"""
Pydantic schemas for AI conversational assistant.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ChatMessageRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Borrower financial question or inquiry")
    context: Optional[Dict[str, Any]] = Field(None, description="Optional active underwriting and report metrics")


class ChatMessageResponse(BaseModel):
    reply: str
    suggested_followups: List[str] = Field(default_factory=list)
    disclaimer: str = "Informational guidance only. Not financial or credit counseling advice."

