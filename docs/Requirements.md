# Software Requirements Specification

## Project Name
Budget Game

## Requirement Author
Colby Neal

## Version
v1.0

## Date
2026-03-26

---

## Requirement: <ID>

**ID:**  
FR-01

**Type:**  
Functional

**Description:**  
The system shall allow the user to create a personal budgeting profile that includes income, expenses, and financial goals

**Rationale:**  
Students need a starting point for their budgeting simulation. A personalized profile ensures the system can generate accurate financial scenarios

**Fit Criterion:**  
A user can successfully create a profile, save it, and reload it later with all data intact. 

**Priority:**  
Must

**Dependencies:**  
None

---

 ## Requirement: <ID>

**ID:**  
FR-02

**Type:**  
Functional

**Description:**  
The system shall retrieve updated cost-of-living and wage data from the Bureau of Labor Statistics (BLS) API.

**Rationale:**  
Realistic financial scenarios require accurate, up-to-date economic data.

**Fit Criterion:**  
The system successfully pulls BLS data at least once every 24 hours and updates internal values without errors.

**Priority:**  
Must

**Dependencies:**  
FR-01 (profile must exist to apply data)

---

## Requirement: <ID>

**ID:**
FR‑03

**Type:**
Functional

**Description:**
The system shall present users with scenario‑based financial events (e.g., moving, having a child, student loans, raises).

**Rationale:**
Scenario‑based learning helps students understand real‑world financial decision‑making.

**Fit Criterion:**
At least 10 unique scenarios appear during gameplay, and each scenario affects the user’s budget.

**Priority:**
Must

**Dependencies:**
FR‑01, FR‑02

---
## Requirement: <ID>

**ID:**  
FR-04

**Type:**  
Functional

**Description:**  
The system shall include an animated character that provides guidance, encouragement, and feedback to the user.

**Rationale:**  
A character increases engagement and helps students stay motivated throughout the budgeting simulation.

**Fit Criterion:**  
The character appears on-screen during all major interactions and displays at least 5 unique messages or animations

**Priority:**  
Should

**Dependencies:**  
None

---

## Requirement: <ID>

**ID:**  
FR-05

**Type:**  
Functional

**Description:**  
The system shall include a leaderboard that compares user performance with other students.

**Rationale:**  
Competition increases engagement and encourages students to improve their budgeting skills.

**Fit Criterion:**  
Leaderboard displays at least 5 metrics (e.g., savings rate, debt reduction, net worth) and updates after each session.

**Priority:**  
could

**Dependencies:**  
FR-01

---

## Requirement: <ID>

**ID:**
US‑01

**Type:**
Usability

**Description:**
The system shall provide a clean, intuitive user interface that is easy for first‑time users to navigate.

**Rationale:**
Students with limited financial knowledge must be able to use the system without confusion.

**Fit Criterion:**
At least 80% of test users can complete the onboarding tutorial without assistance.

**Priority:**
Must

**Dependencies:**
None

---

## Requirement: <ID>

**ID:**
PERF‑01

**Type:**
Performance

**Description:**
The system shall load all major screens (dashboard, scenarios, leaderboard) within 3 seconds.

**Rationale:**
Slow performance reduces engagement and disrupts the learning experience.

**Fit Criterion:**
During testing, 95% of page loads complete within the 3‑second threshold.

**Priority:**
Should

**Dependencies:**
None

---

## Requirement: <ID>

**ID:**
SEC‑01

**Type:**
Security

**Description:**
The system shall store all user data securely and prevent unauthorized access.

**Rationale:**
User financial information is sensitive and must be protected.

**Fit Criterion:**
All stored data is encrypted, and penetration testing reveals no critical vulnerabilities.

**Priority:**
Must

**Dependencies:**
FR‑01

---

## Requirement: <ID>

**ID:**
FR‑06

**Type:**
Functional

**Description:**
The system shall track the user’s financial progress across multiple “levels” or stages of life.

**Rationale:**
Progression reinforces learning and mirrors real‑world financial growth.

**Fit Criterion:**
Users can advance through at least 5 stages, each with unique financial challenges.

**Priority:**
Should

**Dependencies:**
FR‑03

---
