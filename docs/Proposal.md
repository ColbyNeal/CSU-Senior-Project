Senior Project Proposal  
===================================================

**Student Name(s)**: Colby Neal  
**Degree and Major**: B.S. in Cybersecurity    
**Project Advisor Name**: Dr. Hayes    
**Expected Graduation Date**: May 2027


Problem Statement
-----------------

As young adults transition from college into independent living, they are expected to manage finances, maintain a household, and make responsible long-term decisions. However, many students are not taught practical budgeting skills before entering the workforce. According to the Pew Research Center, only 37% to 47% of young adults have created a budget or received formal financial education. Without these skills, students often struggle to manage expenses, prepare for emergencies, or avoid financial pitfalls.
This project aims to address that gap by creating an interactive budgeting application that simulates real-world financial scenarios. By giving students a safe environment to practice budgeting, the application will help them build confidence and avoid financial crises after graduation.

Project Description
-------------------

The goal of this project is to transform the existing budgeting worksheet used by the CSU Financial Department into a modern, interactive web application. The new application will provide students with a visual, game-based budgeting experience that is more engaging and intuitive than the current spreadsheet format.
The application will:
- pull updated cost-of-living and wage data from the Bureau of Labor Statistics
- Simulate real-life financial events such as:
    - Moving to a new city
    - Having a child
    - Paying off student loans
    - Receiving a raise or promotion
    - Car payments
    - Paying for groceries
    - House payments
- Present budgeting as a video-game-style progression system, where students complete tasks, advance through stages, and maintain positive income
- Include a leaderboard to compare budgeting performance among students
- Provide an animated character to motivate and guide users
- Offer interactive decision-making scenarios that test financial literacy
By presenting budgeting concepts in a familiar, gameified format, the application will help students better understand financial responsibility and apply these skills in real life.

**Features**
- interactive user interface with real-time feedback
- Animated character to motivate and guide the user
- Scenario-based financial challenges
- Leaderboard for comparing progress
- Integration with BLS data for realistic financial modeling
- Multi-stage budgeting "levels" that simulate life progression

Proposed Implementation Language(s) 
-----------------------------------

- JavaScript  
- HTML


Libraries, Packages, Development Kits, etc., to be used in the proposed implementation language(s)
--------------------------------------------------------------------------------------------------

- Buns
    - a JavaScript runtime, package manager, and test runner designed as a drop-in replacement for Node.js
- Vue
    - a JavaScript framework for building user interfaces.



Additional Software/Equipment Needed
------------------------------------

- Codium (IDE)
- GitHub (version control and collaboration)
- Standard Development hardware (Windows PC)
- Browser-based testing tools
- Deployment platform 

Alternative Solutions and Rationale 🔍
--------------------------------------

### Alternative 1

*Node.js + Express.js + React*
- **Description**:  
  A full JavaScript stack where both frontend and backend use the same language. Express handles APIs, React handles the UI, and Node runs the server. 
- **Pros**:  
  - one language across the entire stack
  - massive ecosystem and community support
  - tons of tutorials and job market demand
  - flexible and customizable
  - easy deployment options
- **Cons**:  
  - More setup/config compared to all-in-one frameworks
  - can become messy without structure
  - requires more manual configuration

### Alternative 2

  *FastAPI + Vue.js*
- **Description**:  
  a Python backend using FastAPI for high-performance APIs, paired with Vue for the frontend. Strong for data-driven or backend-heavy applications. 
- **Pros**:  
  - Very fast backend performance
  - Automatic API documentation
  - Clean, modern Python syntax
  - Great for APIs, data apps, or AI integrations
  - Strong typing support
- **Cons**:  
  - Two different languages (Python + JavaScript)
  - Smaller ecosystem than Node for frontend-focused apps
  - Requires managing separate environments

### Chosen Solution and Rationale
- **Chosen Solution**:  
  Bun + Vue.js
- **Rationale**:  
  Bun and Vue were selected because they provide a fast, streamlined, single-language development experience with minimal configuration overhead. Compared to Node + React, this stack reduces boilerplate and improves runtime performance. Compared to FastAPI + Vue, it avoids cross-language complexity while still delivering strong API capabilities. For the scope and size of this project, Bun + Vue offers the best balance of speed, simplicity, and modern tooling. 



| Factor              | Bun + Vue     | Node + React   | FastAPI + Vue        |
|---------------------|--------------|---------------|----------------------|
| Setup Complexity    | Low          | Medium        | Medium               |
| Performance         | High         | Good          | High                 |
| Languages Used      | 1 (JavaScript) | 1 (JavaScript) | 2 (Python + JavaScript) |
| Development Speed   | Fast         | Moderate      | Moderate             |
| Best For            | Lean full-stack apps | Large ecosystem projects | API-heavy / data-driven apps |


Personal Motivation
-------------------

Budgeting is a skill many people struggle with, especially young adults who are just beginning to manage their own finances. By creating this application, I hope to give students a safe, engaging way to learn budgeting without risking their real money. Helping others build financial confidence is a meaningful and practical goal that aligns with my interests in cybersecurity, technology, and problem-solving.

Outline of Future Research Efforts
----------------------------------

I plan to continue learning JavaScript through the online platform Boot.dev, which provides structured lessons and hands-on practice. Additional research will include:
- Reviewing BLS data APIs
- Studying gamification techniques
- Learning best practices for Vue and Bun
- Exploring UI/UX design principles for educational apps

Schedule 📅
-----------

*   Spring 2026 - CSCI 497
    -   January 26 - Begin initial research
    -   February 9 - review existing CSU budgeting worksheet
    -   February 23 - Gather all information needed for the proposal
    -   March 6 - complete rough draft of proposal
    -   March 22 - Submit first draft of Requirements Document to advisor
    -   April 5 - Finalize proposal with advisor approval

*   Summer 2026 - Independent/Optional Project Work
    -   June 1 - Begin building foundational project structure,

*   Fall 2026 - CSCI 498
    ### Fall 2026 - CSCI 498
* August 24–28 - Set up development environment, GitHub repository, Bun, Vue, and initial project structure.
* August 31–September 4 - Finalize functional requirements, user flow, system architecture, and project scope.
* September 7–11 - Create application wireframes and establish the UI/UX design.
* September 14–18 - Research BLS data APIs and finalize backend, data, and API design.
* September 21–25 - Build the basic Vue frontend, Bun backend, routing, navigation, and data structures.
* September 28–October 2 - Implement the core budgeting system, including income, expenses, calculations, and budget summaries.
* October 5–9 - Implement and test BLS data integration.
* October 12–13 - Fall Break / project buffer.
* October 14–20 - Complete and test the basic project foundation.
* October 21–27 - Improve backend functionality, API endpoints, data handling, validation, and error handling.
* October 28–November 3 - Improve the frontend interface, navigation, dashboard, and budgeting screens.
* November 4–10 - Begin implementing major features, including financial scenarios and the budgeting progression system.
* November 11–17 - Complete all planned major features, including scenarios, leaderboard, animated character, and interactive decision-making.
* November 18–20 - Stabilize the application, fix critical bugs, test major functionality, and prepare a low-bug version.
* November 23–27 - Testing, documentation, bug fixes, and project buffer / Thanksgiving Break.
* November 30–December 4 - Complete final code cleanup, documentation, GitHub updates, screenshots, and project demonstration preparation.
* December 7 - Complete CSCI 498 project development before the final day of classes.
* December 8–14 - Complete any required CSCI 498 final presentation, demonstration, report, or submission during the final examination period.


*   Spring 2027 - CSCI 499 (more details will be added here once you are closer)
    -   Weeks 1-4 - Implement test plan
    -   Week 5 - Evaluate test results
    -   Week 6-10 - Apply updates and bug fixes based on the results
    -   Week 8 - Complete the first 4 chapters of the defense documentation.


References 📚
-------------

Minkin, R., Parker, K., Horowitz, J. M., & Aragão, C. (2024, January 25). Young adults’ financial independence. Pew Research Center. https://www.pewresearch.org/social-trends/2024/01/25/financial-help-and-independence-in-young-adulthood/ 
