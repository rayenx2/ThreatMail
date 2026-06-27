"""
ThreatMail — Confidence Scoring Module
Computes multi-factor confidence scores for threat detections.
Author: Rayen Lassoued
"""
from .scorer import compute_confidence_score, ConfidenceResult

__all__ = ["compute_confidence_score", "ConfidenceResult"]
