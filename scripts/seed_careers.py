import sqlite3
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATABASE_PATH = PROJECT_ROOT / "data" / "career_explorer.db"

careers = [
    # No College
    {
        "title": "Secretary",
        "education_level": "No College",
        "soc_code": "43-6014",
        "bls_title": "Secretaries and Administrative Assistants",
        "mapping_type": "direct",
    },
    {
        "title": "Actor",
        "education_level": "No College",
        "soc_code": "27-2011",
        "bls_title": "Actors",
        "mapping_type": "direct",
    },
    {
        "title": "Plumber",
        "education_level": "No College",
        "soc_code": "47-2152",
        "bls_title": "Plumbers, Pipefitters, and Steamfitters",
        "mapping_type": "direct",
    },
    {
        "title": "Cashier",
        "education_level": "No College",
        "soc_code": "41-2011",
        "bls_title": "Cashiers",
        "mapping_type": "direct",
    },
    {
        "title": "Influencer",
        "education_level": "No College",
        "soc_code": None,
        "bls_title": None,
        "mapping_type": "project_defined",
    },
    {
        "title": "Waitress",
        "education_level": "No College",
        "soc_code": "35-3031",
        "bls_title": "Waiters and Waitresses",
        "mapping_type": "direct",
    },
    {
        "title": "Uber Driver",
        "education_level": "No College",
        "soc_code": "53-3054",
        "bls_title": "Taxi Drivers",
        "mapping_type": "approximate",
    },
    {
        "title": "Military",
        "education_level": "No College",
        "soc_code": None,
        "bls_title": None,
        "mapping_type": "project_defined",
    },

    # Certificate
    {
        "title": "Police Officer",
        "education_level": "Certificate",
        "soc_code": "33-3051",
        "bls_title": "Police and Sheriff's Patrol Officers",
        "mapping_type": "direct",
    },
    {
        "title": "Mechanic",
        "education_level": "Certificate",
        "soc_code": "49-3023",
        "bls_title": "Automotive Service Technicians and Mechanics",
        "mapping_type": "direct",
    },
    {
        "title": "Paramedic",
        "education_level": "Certificate",
        "soc_code": "29-2043",
        "bls_title": "Emergency Medical Technicians",
        "mapping_type": "approximate",
    },
    {
        "title": "Audio Technician",
        "education_level": "Certificate",
        "soc_code": "27-4011",
        "bls_title": "Broadcast, Sound, and Video Technicians",
        "mapping_type": "approximate",
    },
    {
        "title": "Firefighter",
        "education_level": "Certificate",
        "soc_code": "33-2011",
        "bls_title": "Firefighters",
        "mapping_type": "direct",
    },
    {
        "title": "Massage Therapist",
        "education_level": "Certificate",
        "soc_code": "31-9011",
        "bls_title": "Massage Therapists",
        "mapping_type": "direct",
    },
    {
        "title": "Paralegal",
        "education_level": "Certificate",
        "soc_code": "23-2011",
        "bls_title": "Paralegals and Legal Assistants",
        "mapping_type": "direct",
    },
    {
        "title": "Air Traffic Controller",
        "education_level": "Certificate",
        "soc_code": "53-2021",
        "bls_title": "Air Traffic Controllers",
        "mapping_type": "direct",
    },
    {
        "title": "Web Developer",
        "education_level": "Certificate",
        "soc_code": "15-1254",
        "bls_title": "Web Developers",
        "mapping_type": "direct",
    },
    {
        "title": "Dental Hygienist",
        "education_level": "Certificate",
        "soc_code": "29-1292",
        "bls_title": "Dental Hygienists",
        "mapping_type": "direct",
    },
    {
        "title": "Radiation Therapist",
        "education_level": "Certificate",
        "soc_code": "29-1124",
        "bls_title": "Radiation Therapists",
        "mapping_type": "direct",
    },
    {
        "title": "Pilot",
        "education_level": "Certificate",
        "soc_code": "53-2012",
        "bls_title": "Commercial Pilots",
        "mapping_type": "approximate",
    },

    # Undergraduate
    {
        "title": "Dietician",
        "education_level": "Undergraduate",
        "soc_code": "29-1031",
        "bls_title": "Dietitians and Nutritionists",
        "mapping_type": "direct",
    },
    {
        "title": "Writer",
        "education_level": "Undergraduate",
        "soc_code": "27-3043",
        "bls_title": "Writers and Authors",
        "mapping_type": "direct",
    },
    {
        "title": "Civil Engineer",
        "education_level": "Undergraduate",
        "soc_code": "17-2051",
        "bls_title": "Civil Engineers",
        "mapping_type": "direct",
    },
    {
        "title": "Teacher",
        "education_level": "Undergraduate",
        "soc_code": None,
        "bls_title": None,
        "mapping_type": "project_defined",
    },
    {
        "title": "Computer Engineer",
        "education_level": "Undergraduate",
        "soc_code": "17-2061",
        "bls_title": "Computer Hardware Engineers",
        "mapping_type": "direct",
    },
    {
        "title": "Graphic Design",
        "education_level": "Undergraduate",
        "soc_code": "27-1024",
        "bls_title": "Graphic Designers",
        "mapping_type": "approximate",
    },
    {
        "title": "Nurse",
        "education_level": "Undergraduate",
        "soc_code": "29-1141",
        "bls_title": "Registered Nurses",
        "mapping_type": "approximate",
    },
    {
        "title": "Librarian",
        "education_level": "Undergraduate",
        "soc_code": "25-4022",
        "bls_title": "Librarians and Media Collections Specialists",
        "mapping_type": "direct",
    },
    {
        "title": "Financial Planner",
        "education_level": "Undergraduate",
        "soc_code": "13-2052",
        "bls_title": "Personal Financial Advisors",
        "mapping_type": "approximate",
    },
    {
        "title": "Chef",
        "education_level": "Undergraduate",
        "soc_code": "35-1011",
        "bls_title": "Chefs and Head Cooks",
        "mapping_type": "direct",
    },

    # Graduate
    {
        "title": "Accountant",
        "education_level": "Graduate",
        "soc_code": "13-2011",
        "bls_title": "Accountants and Auditors",
        "mapping_type": "direct",
    },
    {
        "title": "Economist",
        "education_level": "Graduate",
        "soc_code": "19-3011",
        "bls_title": "Economists",
        "mapping_type": "direct",
    },
    {
        "title": "Head Pastor",
        "education_level": "Graduate",
        "soc_code": "21-2011",
        "bls_title": "Clergy",
        "mapping_type": "approximate",
    },
    {
        "title": "Youth Pastor",
        "education_level": "Graduate",
        "soc_code": "21-2011",
        "bls_title": "Clergy",
        "mapping_type": "approximate",
    },
    {
        "title": "Social Worker",
        "education_level": "Graduate",
        "soc_code": "21-1020",
        "bls_title": "Social Workers",
        "mapping_type": "direct",
    },
    {
        "title": "Principal",
        "education_level": "Graduate",
        "soc_code": "11-9032",
        "bls_title": "Education Administrators, Kindergarten through Secondary",
        "mapping_type": "approximate",
    },
    {
        "title": "Music Pastor",
        "education_level": "Graduate",
        "soc_code": "21-2011",
        "bls_title": "Clergy",
        "mapping_type": "approximate",
    },

    # Doctoral / Professional
    {
        "title": "Veterinarian",
        "education_level": "Doctoral/Professional",
        "soc_code": "29-1131",
        "bls_title": "Veterinarians",
        "mapping_type": "direct",
    },
    {
        "title": "Lawyer",
        "education_level": "Doctoral/Professional",
        "soc_code": "23-1011",
        "bls_title": "Lawyers",
        "mapping_type": "direct",
    },
    {
        "title": "Doctor",
        "education_level": "Doctoral/Professional",
        "soc_code": None,
        "bls_title": None,
        "mapping_type": "project_defined",
    },
    {
        "title": "Physical Therapist",
        "education_level": "Doctoral/Professional",
        "soc_code": "29-1123",
        "bls_title": "Physical Therapists",
        "mapping_type": "direct",
    },
    {
        "title": "Dentist",
        "education_level": "Doctoral/Professional",
        "soc_code": "29-1021",
        "bls_title": "Dentists, General",
        "mapping_type": "direct",
    },
    {
        "title": "Scientist",
        "education_level": "Doctoral/Professional",
        "soc_code": None,
        "bls_title": None,
        "mapping_type": "project_defined",
    },
    {
        "title": "College Professor",
        "education_level": "Doctoral/Professional",
        "soc_code": "25-1000",
        "bls_title": "Postsecondary Teachers",
        "mapping_type": "approximate",
    },
]

connection = sqlite3.connect(DATABASE_PATH)
cursor = connection.cursor()

# Remove the old career catalog.
cursor.execute("DELETE FROM careers")

# Insert the new career catalog.
for career in careers:
    cursor.execute(
        """
        INSERT INTO careers (
            soc_code,
            title,
            data_source,
            education_level,
            bls_title,
            mapping_type
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            career["soc_code"],
            career["title"],
            "BLS OEWS" if career["soc_code"] else "Project-defined",
            career["education_level"],
            career["bls_title"],
            career["mapping_type"],
        ),
    )

connection.commit()
connection.close()

print(f"Career catalog updated: {len(careers)} careers.")