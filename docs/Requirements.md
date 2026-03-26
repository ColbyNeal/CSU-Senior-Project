# Software Requirements Specification

## Project Name
*Enter project name here*

## Requirement Author
Colby Neal

## Version
*e.g., v1.0*

## Date
2026-03-26

---

## Requirement: <ID>

**ID:**  
<e.g., FR-01, US-03, SEC-02>

**Type:**  
<Functional | Usability | Performance | Security | etc.>

**Description:**  
<A clear, concise statement of what the system must do or how well it must perform.  
Avoid vague language and avoid describing implementation details.>

**Rationale:**  
<Explain why this requirement exists.  
What stakeholder need, business goal, or risk does this requirement address?>

**Fit Criterion:**  
<A measurable and testable condition that defines when this requirement is satisfied.  
Specify objective criteria such as thresholds, limits, frequencies, success rates, or test outcomes.  
If this cannot be tested, the requirement is incomplete.>

**Priority:**  
<Must | Should | Could | Won’t  
—or—  
High | Medium | Low>

**Dependencies:**  
<List the ID(s) of any requirement(s) that must be implemented or satisfied before this one, or write “None”.>

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
<e.g., FR-02>

**Type:**  
<Functional | Usability | Performance | Security | etc.>

**Description:**  
<Description here>

**Rationale:**  
<Rationale here>

**Fit Criterion:**  
<Fit criterion here>

**Priority:**  
<Priority here>

**Dependencies:**  
<Dependencies here>

---

## Requirement: <ID>

**ID:**  
<e.g., FR-02>

**Type:**  
<Functional | Usability | Performance | Security | etc.>

**Description:**  
<Description here>

**Rationale:**  
<Rationale here>

**Fit Criterion:**  
<Fit criterion here>

**Priority:**  
<Priority here>

**Dependencies:**  
<Dependencies here>

---
