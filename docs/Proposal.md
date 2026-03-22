Senior Project Proposal  
===================================================

**Student Name(s)**: Colby Neal  
**Degree and Major**: B.S. in Cybersecurity    
**Project Advisor Name**: Dr. Hayes    
**Expected Graduation Date**: May 2027


Problem Statement
-----------------

As young adults are finishing up school they are expected to understand how to live life in the real world, from working to household management, but they weren’t taught an efficient way to budget for their lifestyle. Imagine jumping into the deep end of the pool with only three limbs working, it’s hard to keep afloat. Pew Research Center states approximately 37% to 47% of young adults have actively created a budget or have received formal financial education. By creating an application to allow young adults to learn how to budget and get real world scenarios, they will have a better understanding on how to budget and not fall into a financial crisis. 


Project Description
-------------------

My senior project consists of taking the current worksheet simulation used by The Financial Department of CSU, which was designed to aid students in their monthly budgeting financial process, and reconstructing it into a web application. This application will create a visual representation for CSU students that provides a better understanding of the concept of budgeting before graduating college. The application will pull updated data from the Bureau of Labor Statistics to create features like moving to a new location, having a baby, taking care of student loans, or getting a raise. I will be recreating this worksheet in a videogame format that the current generation of students, and even generations to come, can better relate to. In the game a leaderboard will display how each student is doing through their financial journey. The game will include tasks that will be completed by the player that will test their ability to budget and include multiple stages that the student will have to get through with positive income. By learning through this familiar format, I believe students will have an easier time implementing financial or budgeting goals in real-life situations.

Features I would like in this project:
- A way for the program to interact with the user.
- Adding in an animated character to motivate the user. 


Proposed Implementation Language(s) 
-----------------------------------

- JavaScript  
- HTML


Libraries, Packages, Development Kits, etc., to be used in the proposed implementation language(s)
--------------------------------------------------------------------------------------------------

- Buns
- Vue



Additional Software/Equipment Needed
------------------------------------

List any hardware needed and software for planning, development (e.g., your IDE), testing, and deploying/distributing.

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
  - More steup/config compared to all-in-one frameworks
  - can become messy without structure
  - requires more manual configuration

### Alternative 2

  *FastAPI + Vue.js*
- **Description**:  
  a Python backend using FastAPI for high-performance APIs, paried with Vue for the frontend. Strong for data-driven or backend-heavy applications. 
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

People today struggle to budget thier money and creating this program will allow young adults to experience budgeting money without the risk of losing their personal money.

Outline of Future Research Efforts
----------------------------------

I have found an application that will teach me the basics of JavaScript. The application is called boot.dev

Schedule 📅
-----------

> Update the dates and add your tasks by replacing the examples. Remove this note.

*   Spring 2026 - CSCI 497
    -   January 26 - 
    -   February 9 - 
    -   February 23 - Have all the information I need to create the Proposal completely 
    -   March 6 - Have the rough draft of the proposal finished and graded
    -   March 22 - Send First-Draft of the Requirements Document to advisor for feedback
    -   April 5 - Have the entire Proposal completed with the approval of my advisor 

*   Summer 2026 - Independent/Optional Project Work
    -   June 1 - Start the basic foundations of the project

*   Fall 2026 - CSCI 498
    -   October 20 - I would like the basic foundation of the project complete.
    -   October 27 - improve the back end of the program 
    -   November 3 - improve the front end of the program
    -   November 10 - start applying features into the program
    -   November 17 - have all the features included in the program that i want
    -   November 20 - Have the Project working with little to no bugs 

*   Spring 2027 - CSCI 499 (more details will be added here once you are closer)
    -   Weeks 1-4 - Implement test plan
    -   Week 5 - Evaluate test results
    -   Week 6-10 - Apply updates and bug fixes based on the results
    -   Week 8 - Complete the first 4 chapters of the defense documentation.
    -   Add the rest…


References 📚
-------------

> List any references you cited in this proposal.
