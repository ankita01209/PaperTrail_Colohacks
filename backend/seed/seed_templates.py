"""
seed/seed_templates.py
Seeds Phase 1 templates into Firestore.
Run once: python seed/seed_templates.py

Seeds: caste_certificate_mh_v1, form_20_election_mh_v1, form_16_education_mh_v1
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firebase_config import db
from datetime import datetime, timezone

CASTE_CERT_TEMPLATE = {
    "template_id": "caste_certificate_mh_v1",
    "name": "Caste Certificate",
    "department": "Social Justice and Special Assistance",
    "available_departments": ["Social Justice and Special Assistance", "Revenue Department"],
    "field_schema": [
        {"field_name": "applicant_name", "label": "Applicant Name", "data_type": "text", "bounding_box": {"x": 0.30, "y": 0.18, "width": 0.55, "height": 0.05}},
        {"field_name": "caste_category", "label": "Caste Category", "data_type": "text", "bounding_box": {"x": 0.30, "y": 0.25, "width": 0.30, "height": 0.05}},
        {"field_name": "religion", "label": "Religion", "data_type": "text", "bounding_box": {"x": 0.30, "y": 0.32, "width": 0.30, "height": 0.05}},
        {"field_name": "address", "label": "Address", "data_type": "text", "bounding_box": {"x": 0.30, "y": 0.40, "width": 0.55, "height": 0.08}},
        {"field_name": "date_of_application", "label": "Date of Application", "data_type": "date", "bounding_box": {"x": 0.30, "y": 0.52, "width": 0.30, "height": 0.05}},
    ],
    "approved_by": "system",
    "created_at": datetime.now(timezone.utc).isoformat(),
}

FORM_20_ELECTION_TEMPLATE = {
    "template_id": "form_20_election_mh_v1",
    "name": "Form 20 - Final Result of Counting",
    "department": "Election Commission",
    "available_departments": ["Election Commission", "General Administration"],
    "field_schema": [
        {"field_name": "polling_station_number", "label": "Polling Station Number", "data_type": "number", "bounding_box": {"x": 0.30, "y": 0.18, "width": 0.20, "height": 0.05}},
        {"field_name": "constituency_name", "label": "Constituency Name", "data_type": "text", "bounding_box": {"x": 0.30, "y": 0.25, "width": 0.55, "height": 0.05}},
        {"field_name": "total_voters", "label": "Total Voters", "data_type": "number", "bounding_box": {"x": 0.30, "y": 0.32, "width": 0.30, "height": 0.05}},
        {"field_name": "votes_polled", "label": "Total Votes Polled", "data_type": "number", "bounding_box": {"x": 0.30, "y": 0.40, "width": 0.30, "height": 0.05}},
        {"field_name": "date_of_poll", "label": "Date of Poll", "data_type": "date", "bounding_box": {"x": 0.30, "y": 0.48, "width": 0.30, "height": 0.05}},
    ],
    "approved_by": "system",
    "created_at": datetime.now(timezone.utc).isoformat(),
}

FORM_16_EDUCATION_TEMPLATE = {
    "template_id": "form_16_education_mh_v1",
    "name": "Form 16 - Student Record",
    "department": "School Education",
    "available_departments": ["School Education", "Higher and Technical Education"],
    "field_schema": [
        {"field_name": "student_name", "label": "Student Name", "data_type": "text", "bounding_box": {"x": 0.30, "y": 0.18, "width": 0.55, "height": 0.05}},
        {"field_name": "school_name", "label": "School Name", "data_type": "text", "bounding_box": {"x": 0.30, "y": 0.25, "width": 0.55, "height": 0.05}},
        {"field_name": "udise_code", "label": "UDISE Code", "data_type": "number", "bounding_box": {"x": 0.30, "y": 0.32, "width": 0.30, "height": 0.05}},
        {"field_name": "academic_year", "label": "Academic Year", "data_type": "text", "bounding_box": {"x": 0.30, "y": 0.40, "width": 0.30, "height": 0.05}},
        {"field_name": "grade", "label": "Grade / Standard", "data_type": "text", "bounding_box": {"x": 0.30, "y": 0.48, "width": 0.30, "height": 0.05}},
    ],
    "approved_by": "system",
    "created_at": datetime.now(timezone.utc).isoformat(),
}


def seed():
    templates = [CASTE_CERT_TEMPLATE, FORM_20_ELECTION_TEMPLATE, FORM_16_EDUCATION_TEMPLATE]
    for tmpl in templates:
        tid = tmpl["template_id"]
        # Allow updating templates iteratively by just setting it
        db.collection("templates").document(tid).set(tmpl)
        print(f"[OK]   Seeded template: {tid}")
    print("Seeding complete.")


if __name__ == "__main__":
    seed()
