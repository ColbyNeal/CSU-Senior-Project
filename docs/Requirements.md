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

## Functional 

### Requirement: <ID>

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

**ID:**  
FR-07

**Type:**  
Functional

**Description:**  
The system shall allow users to edit their budget at any time during gameplay.

**Rationale:**  
Budgeting is an iterative process that requires adjustments.

**Fit Criterion:**  
Users can modify income, expenses, and goals without restarting the simulation.

**Priority:**  
Must

**Dependencies:**  
FR‑01

---

**ID:**  
FR‑08

**Type:**  
Functional

**Description:**  
The system shall allow users to set and track savings goals.

**Rationale:**  
Savings goals help reinforce long‑term financial planning.

**Fit Criterion:**    
Users can create at least one savings goal and view progress toward it.

**Priority:**  
Should

**Dependencies:**  
FR‑01

---

**ID:**  
FR‑09

**Type:**  
Functional

**Description:**  
The system shall categorize expenses into predefined groups (e.g., housing, food, transportation).

**Rationale:**  
Categorization helps users understand spending habits.

**Fit Criterion:**  
Expenses are automatically sorted into at least 5 categories.

**Priority:**  
Must

**Dependencies:**  
FR‑01

---

**ID:**  
FR‑10

**Type:**  
Functional

**Description:**  
The system shall generate a monthly summary showing income, expenses, and net savings.

**Rationale:**  
Summaries help users reflect on their financial decisions.

**Fit Criterion:**  
A summary is generated at the end of each simulated month.

**Priority:**  
Should

**Dependencies:**
FR‑01

---

**ID:**  
FR‑11

**Type:**  
Functional

**Description:**  
The system shall calculate the financial impact of each scenario and update the user’s budget accordingly.

**Rationale:**  
Scenarios must meaningfully affect gameplay.

**Fit Criterion:**  
Each scenario modifies at least one budget category.

**Priority:**  
Must

**Dependencies:**  
FR‑03

---

**ID:**  
FR‑12

**Type**  
Functional

**Description:**  
The system shall allow users to create accounts and log in securely.

**Rationale:**  
User data must be tied to individual accounts.

**Fit Criterion:**  
Users can register, log in, and log out successfully.

**Priority:**  
Must

**Dependencies:**  
SEC‑01

---

**ID:**  
FR‑13

**Type:**  
Functional

**Description:**  
The system shall store user progress so it can be resumed later.

**Rationale:**  
Students may complete the simulation over multiple sessions.

**Fit Criterion:**  
Progress is saved automatically at least once per session.

**Priority:**  
Must

**Dependencies**  
FR‑12

---

**ID:**
FR‑14

**Type:**
Functional

**Description:**  
The system shall notify users when they exceed their budget in any category.

**Rationale:**  
Alerts help users correct overspending.

**Fit Criterion:**  
Notifications appear within 2 seconds of overspending.

**Priority:**
Should

**Dependencies:**
FR‑09

---

**ID:**  
FR‑15

**Type:**  
Functional

**Description:**  
The system shall provide an optional tutorial explaining how to use the application.

**Rationale:**  
New users may need guidance.

**Fit Criterion:**  
Tutorial can be completed in under 5 minutes.

**Priority:**  
Could

**Dependencies:**  
None

---

## Usability

### Requirement: <ID>

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

**ID**  
US‑02

**Type:**  
Usability

**Description:**  
The system shall maintain consistent navigation across all screens.

**Rationale:**  
Consistency reduces cognitive load.

**Fit Criterion:**  
All screens use the same menu layout and navigation structure.

**Priority:**  
Should

**Dependencies:**  
None

---

**ID:**  
US‑03
**Type:**  
Usability

**Description:**  
The system shall meet WCAG AA text contrast standards.

**Rationale:**  
Ensures accessibility for visually impaired users.

**Fit Criterion:**  
Contrast ratios meet WCAG AA guidelines.

**Priority:**  
Must

**Dependencies:**  
None

---

## Performance
### Requirement: <ID>

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

**ID:**  
PERF‑02

**Type:**  
Performance

**Description:**  
The system shall retrieve BLS data within 5 seconds.

**Rationale:**  
Slow API responses disrupt gameplay.

**Fit Criterion:**  
90% of API calls complete within 5 seconds.

**Priority:**  
Should
**Dependencies:**  
FR‑02

---

**ID:**  
PERF‑03

**Type:**  
Performance

**Description:**  
The system shall update the leaderboard within 2 seconds after new data is submitted.

**Rationale:**  
Real‑time feedback improves competitiveness.

**Fit Criterion:**  
Leaderboard refreshes within 2 seconds.

**Priority:**  
Could

**Dependencies:**  
FR‑05

---

## Security
### Requirement: <ID>

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

**ID:**  
SEC‑02

**Type:**  
Security

**Description:**  
The system shall require login credentials to access user profiles.

**Rationale:**  
Prevents unauthorized access.

**Fit Criterion:**  
Only authenticated users can access profile data.

**Priority:**  
Must

**Dependencies:**  
FR‑12

---

**ID:**  
SEC‑03

**Type:**  
Security

**Description:**  
The system shall automatically log out users after 15 minutes of inactivity.

**Rationale:**  
Reduces risk of unauthorized access.

**Fit Criterion:**  
Session expires after 15 minutes.

**Priority:**  
Should

**Dependencies:**  
SEC‑02

---
## Data

### Requirement: <ID>

**ID:**  
DATA‑01

**Type:**  
Data

**Description:**  
The system shall back up user data at least once every 24 hours.

**Rationale:**  
Prevents data loss.

**Fit Criterion:**  
Backups occur automatically every 24 hours.

**Priority:**  
Should

**Dependencies:**  
FR‑13

---

**ID:**  
DATA‑02

**Type:**  
Data

**Description:**  
The system shall ensure BLS data is no more than 24 hours old.

**Rationale:**  
Ensures accuracy of financial scenarios.

**Fit Criterion:**  
Timestamp of last update is within 24 hours.

**Priority:**  
Must

**Dependencies:**  
FR‑02

---

**ID:**  
DATA‑03

**Type:**  
Data

**Description:**  
The system shall allow users to export their budgeting history as a CSV file.

**Rationale:**  
Students may want to review or submit their data.

**Fit Criterion:**  
CSV export downloads successfully.

**Priority:**  
Could

**Dependencies:**  
FR‑13

---

## UI

### Requirement: <ID>

**ID:**  
UI‑01

**Type:**  
UI

**Description:**  
The dashboard shall display income, expenses, savings, and current stage.

**Rationale:**  
Users need a clear overview of their financial status.

**Fit Criterion:**  
Dashboard shows all four elements at all times.

**Priority:**  
Must

**Dependencies:**  
FR‑01

---

**ID:**  
UI‑02

**Type:**  
UI

**Description:**  
Expense categories shall be color‑coded for clarity.

**Rationale:**  
Color coding improves readability.

**Fit Criterion:**  
Each category uses a unique color.

**Priority:**  
Should

**Dependencies:**  
FR‑09

---

**ID:**  
UI‑03

**Type:**  
UI

**Description:**  
Scenarios shall appear in modal pop‑ups with clear accept/decline options.

**Rationale:**  
Ensures users understand scenario choices.

**Fit Criterion:**  
Pop‑ups appear centered with two clear action buttons.

**Priority:**  
Must

**Dependencies:**  
FR‑03

---

## System

### Requirement: <ID>

**ID:**  
SYS‑01

**Type:** 
System

**Description:**  
The system shall run on Chrome, Firefox, Edge, and Safari.

**Rationale:**  
Ensures compatibility for all students.

**Fit Criterion:**  
Application loads successfully on all four browsers.

**Priority:**  
Must

**Dependencies:**
 None

---

**ID:**  
 SYS‑02

**Type:**  
 System

**Description:**  
 The system shall be responsive on mobile devices.

**Rationale:**  
 Students may access the game on phones or tablets.

**Fit Criterion:**  
 UI adjusts correctly on screens 360px wide or larger.

**Priority:**  
 Should

**Dependencies:**  
 UI‑01
