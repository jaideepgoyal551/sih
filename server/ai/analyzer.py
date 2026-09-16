import json
import re
import sys
from datetime import datetime, timezone


def analyze(problem):
    title = problem.get("title", "Innovation challenge")
    description = problem.get("description", "")
    text = f"{title} {description}".lower()

    category_rules = [
        ("urban", "Urban Mobility"),
        ("waste", "Environment"),
        ("transport", "Transport"),
        ("school", "Education"),
        ("health", "Healthcare"),
        ("safety", "Public Safety"),
    ]
    category = next((value for key, value in category_rules if key in text), "Public Sector Innovation")

    technology_rules = [
        (r"ai|machine learning|ml", "AI/ML"),
        (r"vision|image|camera", "Computer Vision"),
        (r"route|map|gps|geospatial", "Geospatial Analytics"),
        (r"cloud", "Cloud"),
        (r"iot|sensor", "IoT"),
        (r"safety|risk", "Risk Analytics"),
    ]
    technologies = [value for pattern, value in technology_rules if re.search(pattern, text)]
    if not technologies:
        technologies = ["AI/ML", "Cloud"]

    complexity = "Medium" if re.search(r"route|mobility|transport|safety|health|education", text) else "Low"
    innovation_potential = min(95, 82 + len(title) % 12)

    return {
        "provider": "python-rules",
        "category": category,
        "technologies": technologies,
        "requirements": [
            "Proven implementation capability",
            "Clear success metrics and deployment plan",
            "Ability to integrate with existing public systems",
        ],
        "suggestedKpis": [
            "Processing time reduction: 30%",
            "Cost reduction: 20%",
            "Citizen satisfaction improvement: 15%",
        ],
        "pilotDuration": "12 weeks" if re.search(r"waste|route", text) else "8 weeks",
        "complexity": complexity,
        "innovationPotential": f"{innovation_potential}%",
        "risks": ["Data quality", "Interoperability", "Change management"],
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }


if __name__ == "__main__":
    payload = json.loads(sys.stdin.read())
    print(json.dumps(analyze(payload)))
