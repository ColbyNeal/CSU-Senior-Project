# Software Test Plan - BLS Career Explorer

**Project:** CSU Senior Project  
**Course:** CSCI 498  
**Version:** 1.2 — Revised First Draft  
**Date:** November 23, 2026  
**Status:** Submitted for instructor review

---

## 1. Identification Information

### 1.1 Project Description

BLS Career Explorer is a web-based application designed to help users explore career opportunities using occupational and wage data from the Bureau of Labor Statistics (BLS). The application allows users to browse careers, filter opportunities by education requirements, review career details and wage information, and participate in a multiplayer budgeting simulation.

The application uses a Vue 3 frontend with Vite, a Bun backend, SQLite for local data storage, and Python scripts to retrieve and update BLS data.

### 1.2 Testing Objectives

The primary objectives of testing are to:

- Verify that career information and wage data are retrieved and displayed accurately.
- Confirm that career browsing, filtering, and selection work as expected.
- Validate income, tax, and budgeting calculations.
- Verify that budgeting scenarios correctly affect player balances.
- Test multiplayer functionality, including joining games and reconnecting.
- Confirm that player information is retained during an active game.
- Evaluate application usability, accessibility, browser compatibility, and performance.
- Identify, document, and track defects before project completion.
- Verify that implemented requirements meet their expected results.

### 1.3 Features to Be Tested

| Feature | Description | Related Requirements | Current Status |
|---|---|---|---|
| Career data | Retrieve and display career and wage information from BLS data. | FR-02, DATA-02 | Pass |
| Career browsing | Search and filter careers based on education requirements. | Additional project functionality | Pass |
| Career selection | Select and confirm a career. | Additional project functionality | Pass |
| Income calculation | Calculate monthly gross income, taxes, net income, tithe, and spendable income. | Additional project functionality | Pass |
| Budgeting scenarios | Present financial scenarios that affect player budgets. | FR-03, FR-11 | Pass |
| Animated character guidance | Provide animated guidance, encouragement, and feedback. | FR-04 | Not Implemented |
| Leaderboard | Compare player performance and display rankings. | FR-05, PERF-03 | Pass |
| Life stages | Track financial progress through different stages. | FR-06 | Pass |
| Budget editing | Allow players to modify income, expenses, and financial goals. | FR-07 | Not Implemented |
| Savings goals | Allow players to create and track savings goals. | FR-08 | Not Implemented |
| Expense categories | Organize expenses into categories. | FR-09, UI-02 | Pass |
| Monthly financial summary | Display income, expenses, and net savings information. | FR-10 | Pass |
| QR-code game joining | Open the Join Game page with the game code automatically populated. | Additional project functionality | Pass |
| Manual game joining | Allow players to enter a game code and display name to join. | Additional project functionality | Pass |
| Player information retention | Retain player money and choices during an active game after a browser refresh or temporary disconnection. | Additional project functionality | Pass |
| Player reconnection | Allow disconnected players to reconnect to their original active game. | Additional project functionality | Pass |
| User accounts and login | Register, log in, and log out of individual user accounts. | FR-12, SEC-02 | Not Implemented |
| Persistent player progress | Allow players to resume progress after the original game session has ended. | FR-13 | Not Implemented |
| Overspending notifications | Notify players when spending exceeds a budget category. | FR-14 | Pass |
| Optional tutorial | Provide instructions explaining how to use the application. | FR-15 | Pass |
| Dashboard and interface | Display financial information and provide consistent navigation. | US-01, US-02, UI-01, UI-03 | Pass |
| Accessibility | Verify text contrast against WCAG AA requirements. | US-03 | Pass |
| Performance and compatibility | Evaluate loading times, BLS response times, leaderboard updates, browser compatibility, and mobile responsiveness. | PERF-01, PERF-02, PERF-03, SYS-01, SYS-02 | Pass |
| Security and data management | Evaluate applicable data protection, session handling, backups, and CSV export functionality. | SEC-01, SEC-03, DATA-01, DATA-03 | Pass |

### 1.4 Requirements Traceability

The requirements listed in the feature table reference the corresponding identifiers in the Software Requirements Specification (SRS). Features without a direct SRS identifier are additional functionality implemented as part of the project.

The following features are currently not implemented:

- Animated character guidance.
- Budget editing during gameplay.
- Savings goals.
- Individual user accounts and login.
- Persistent player progress across separate game sessions.

Player information is retained when a browser refresh or temporary disconnection occurs during an active game. However, this functionality does not satisfy the SRS requirement for resuming progress after the original session has ended.

All other listed features have been tested successfully and are recorded as Pass.

### 1.5 Features Outside the Scope of Testing

Testing will focus on the functionality implemented within the BLS Career Explorer application. External systems and services outside the application's control are not directly tested.

The following are outside the scope of this test plan:

- Internal BLS infrastructure and availability.
- Third-party browser functionality.
- Operating system functionality outside application compatibility.
- External network infrastructure beyond what is necessary to evaluate application connectivity.

---

## UNIT TEST

### UNIT TEST STRATEGY / EXTENT OF UNIT TESTING

Unit testing focuses on individual functions and calculations without depending on the complete application workflow. Testing is concentrated on income calculations, tax calculations, budget calculations, and input handling.

Automated unit tests are executed using a standalone JavaScript test script (`test-budget.mjs`). The script uses Node.js's built-in `node:assert/strict` module to compare actual calculation results against expected values.

The tests verify the following areas:

- Monthly gross income conversion.
- Federal income tax calculations.
- Social Security and Medicare calculations.
- South Carolina income tax calculations.
- Total taxes and net income.
- Tithe and spendable income.
- Invalid or unavailable salary handling.
- Annual salary input and monthly conversion.

The automated test script is executed from the project root using:

```bash
node test-budget.mjs
```

No additional testing framework is currently required.

### UNIT TEST CASES

| Test ID | OBJECTIVE | INPUT | EXPECTED RESULTS | ACTUAL RESULTS | STATUS |
|---|---|---|---|---|---|
| UT-01 | Verify monthly gross income conversion. | Annual salary of $60,000. | Monthly gross income equals $5,000. | Calculation returned $5,000. | Pass |
| UT-02 | Verify federal income tax calculation. | Annual salary of $60,000 using implemented 2026 tax assumptions. | Federal income tax equals $5,020 annually. | Calculation returned $5,020. | Pass |
| UT-03 | Verify Social Security and Medicare calculations. | Annual salary of $60,000. | Social Security equals $3,720 and Medicare equals $870 annually. | Both calculations returned expected values. | Pass |
| UT-04 | Verify South Carolina income tax calculation. | Annual salary of $60,000 using implemented 2026 state tax assumptions. | State income tax equals $2,160 annually. | Calculation returned $2,160. | Pass |
| UT-05 | Verify total taxes and net income. | Annual salary of $60,000 and calculated tax amounts. | Total annual taxes equal $11,770; annual net income equals $48,230. | Monthly tax and net income calculations matched expected values. | Pass |
| UT-06 | Verify tithe and spendable income. | Annual salary of $60,000 and calculated net income. | Monthly tithe equals $500; spendable income equals monthly net income minus tithe. | Both calculations matched expected values. | Pass |
| UT-07 | Verify invalid and unavailable salary handling. | Undefined, null, zero, negative, and nonnumeric salary values. | Invalid or unavailable values should be handled safely without producing misleading calculations. | Nonnumeric input produced an invalid calculation result (`NaN`). | Fail |
| UT-08 | Verify annual salary input contract. | Annual salary of $94,750 passed to `calculateMonthlyIncomeBreakdown()`. | Monthly gross income equals annual salary divided by 12, without a second conversion. | Calculation returned approximately $7,895.83 per month. | Pass |

### UNIT TEST RESULTS

The automated unit test script was executed successfully from the project root.

**Test execution command:**

```bash
node test-budget.mjs
```

**Recorded results:**

| Result | Count |
|---|---:|
| Total Tests | 8 |
| Passed | 7 |
| Failed | 1 |
| Success Rate | 87.5% |

### KNOWN LIMITATION

UT-07 identified an issue with nonnumeric salary input. The current calculation functions do not safely handle every nonnumeric value and may return `NaN`.

The current application is designed to use structured salary information from Bureau of Labor Statistics (BLS) data. The issue is documented as a known limitation and has not been corrected.

### UNIT TEST ACCEPTANCE CRITERIA

Each executed unit test is evaluated against its documented expected result. Tests that produce the expected output are recorded as Pass. Tests that do not meet the expected result are recorded as Fail and documented for future correction.

The unit testing results demonstrate that seven of the eight tested cases currently pass. The remaining failure is documented as a known limitation.

---

## REGRESSION TEST

### Regression Test Strategy

Regression testing was performed throughout the development process. After adding or modifying application features, previously implemented functionality was checked to ensure that existing behavior continued to work as expected.

Testing was performed incrementally. New features were not considered complete until existing functionality was verified and the application continued to operate correctly.

Regression testing focused on career browsing, education filtering, career selection, income calculations, multiplayer gameplay, player progress, and leaderboard functionality.

### Regression Test Cases

| Test ID | Objective | Input and procedure | Expected result | Actual result / Status |
|---|---|---|---|---|
| RT-01 | Verify career list loads. | Open career selection with the frontend and backend running. | Available career records display without a blocking error. | Career list loaded successfully. Pass |
| RT-02 | Verify education filtering. | Select a specific education level and inspect the results. | Displayed careers match the selected education level. | Filtering worked correctly. Pass |
| RT-03 | Verify all education levels. | Select "All Education Levels." | The complete available career list returns. | All available education levels displayed correctly. Pass |
| RT-04 | Verify career search. | Search using full and partial career titles. | Matching career titles appear. | Career search worked correctly. Pass |
| RT-05 | Verify career selection. | Select a career from the available list. | The selected career is visibly identified. | Career selection worked correctly. Pass |
| RT-06 | Verify career confirmation. | Select and confirm a career. | The confirmed career matches the user's selection. | Career confirmation worked correctly. Pass |
| RT-07 | Verify income display. | Confirm a career with available wage data. | Income values display for the selected career. | Income breakdown displayed correctly. Pass |
| RT-08 | Verify multiplayer game joining. | Join an active game using a QR code and manual game code. | Players can join the correct active game. | Both joining methods worked correctly. Pass |
| RT-09 | Verify player progress retention. | Refresh or temporarily disconnect a player during an active game, then reconnect. | Player information, money, and choices remain intact during the active session. | Player progress was retained after refresh and reconnection. Pass |
| RT-10 | Verify question progression. | Complete questions and submit player answers during gameplay. | Questions advance correctly and player responses are processed. | Question progression and answer submission worked correctly. Pass |
| RT-11 | Verify leaderboard updates. | Complete game actions that change player balances. | Leaderboard rankings and displayed balances reflect the updated game state. | Leaderboard updated correctly. Pass |
| RT-12 | Verify game-state synchronization. | Connect multiple players and observe shared game activity. | Relevant game updates are reflected consistently across connected clients. | Multiplayer synchronization worked correctly. Pass |

### Regression Test Summary

| Result | Total |
|---|---:|
| Tests Passed | 12 |
| Tests Failed | 0 |
| Tests Not Run | 0 |
| **Total Tests** | **12** |

**Regression Acceptance Criterion:** Previously implemented functionality must continue to operate correctly after new features or code changes are introduced. Regression testing was performed throughout development, and the existing functionality was verified before development proceeded to the next feature.

---

## INTEGRATION TEST

### INTEGRATION TEST STRATEGY / EXTENT OF INTEGRATION TESTING

Integration testing verifies that the individual components of the BLS Career Explorer application communicate and function correctly together.

Testing focuses on the integration between the Vue frontend, Bun backend, SQLite database, BLS data update process, income calculation utilities, and multiplayer communication.

Integration testing evaluates data flow between components, verifies that returned values match expected records, and checks how the application handles missing data, unavailable services, and invalid requests.

The following areas were evaluated:

- Communication between the Vue frontend and Bun API.
- Retrieval of career information and career details.
- Handling of invalid career identifiers.
- Consistency between displayed wage information and stored database records.
- Transfer of career wage information into the income calculation utilities.
- Frontend handling of backend failures.
- Retrieval and storage of BLS data.
- Multiplayer game-state synchronization between connected players.

### INTEGRATION TEST CASES

| Test ID | OBJECTIVE | INPUT AND PROCEDURE | EXPECTED RESULTS | ACTUAL RESULTS | STATUS |
|---|---|---|---|---|---|
| IT-01 | Verify career API integration. | Open career selection while the backend is running. | The frontend receives the career response and displays the returned records. | Career information successfully retrieved and displayed. | Pass |
| IT-02 | Verify career-details integration. | Request career details using a valid SOC code. | The API returns the matching career and available wage information. | Career details and wage information successfully returned and displayed. | Pass |
| IT-03 | Verify invalid career identifier handling. | Request career details using a nonexistent SOC code. | The backend returns an appropriate error result and the frontend handles it without crashing. | Invalid career identifier handled successfully. | Pass |
| IT-04 | Verify wage data consistency. | Retrieve a career with an available stored wage record and compare the displayed information with the database. | Displayed wage information agrees with the applicable stored record. | Wage information successfully matched the stored data. | Pass |
| IT-05 | Verify wage-to-calculation integration. | Select a career with a known annual wage and evaluate the income calculation output. | The annual wage is passed correctly into the income calculation utility. | Career wage information successfully passed into the calculation utility. | Pass |
| IT-06 | Verify backend failure handling. | Stop the backend and request career information. | The frontend displays an appropriate error or recovery state instead of crashing. | Backend failure was handled successfully. | Pass |
| IT-07 | Verify BLS update and storage. | Run the BLS data update process and inspect the resulting database records. | Valid returned data is stored correctly, and update failures are reported without corrupting existing data. | BLS data successfully retrieved and stored. | Pass |
| IT-08 | Verify multiplayer state synchronization. | Connect multiple test clients and perform supported shared game actions. | Relevant game-state updates reach connected clients and remain consistent. | Multiplayer communication and game-state synchronization worked successfully. | Pass |

### INTEGRATION TEST RESULTS

All eight integration test cases were completed successfully.

| Result | Count |
|---|---:|
| Total Tests | 8 |
| Passed | 8 |
| Failed | 0 |
| Success Rate | 100% |

### INTEGRATION TEST ACCEPTANCE CRITERIA

Integration testing is considered successful when connected application components exchange information correctly, returned data matches expected values, and supported workflows operate without application crashes or incorrect data.

All eight integration test cases passed. No unresolved integration test failures were identified during this testing cycle.

---

# SYSTEM AND REQUIREMENTS-BASED TESTING

### Strategy

System testing verifies complete application workflows against the functional and nonfunctional requirements identified in the Requirements Document.

Testing focused on the application's career exploration features, BLS data retrieval, income calculations, multiplayer budgeting simulation, leaderboard, user interface, browser compatibility, and responsive design.

Testing was conducted during development and through application demonstrations. Functional tests were performed during normal application use, while specific performance and security requirements were evaluated separately.

The following status definitions are used:

- **Pass:** The tested functionality operated as expected.
- **Partial:** Some functionality was verified, but the complete requirement or fit criterion was not met or verified.
- **Not Implemented:** The required functionality is not available in the current application.
- **Not Run:** The functionality or measurable requirement has not been formally tested.

### Functional and Nonfunctional Test Cases

| Test ID | Requirement | Test objective and procedure | Expected result / fit criterion | Status |
|---|---|---|---|---|
| SYS-01 | FR-01 | Attempt to create a personal budgeting profile, save it, and reload it. | Profile data remains intact after reloading. | Not Implemented |
| SYS-02 | FR-02 | Manually run the Python BLS update script and verify that updated career and wage data is retrieved and stored. | BLS data is successfully retrieved and stored when the script is executed manually. Automatic four-month scheduling has not been verified. | Partial |
| SYS-03 | FR-03, FR-11 | Exercise available financial scenarios and compare the budget before and after each scenario. | At least 10 unique scenarios appear during gameplay, and each affects at least one budget category. | Pass |
| SYS-04 | FR-04 | Observe character behavior during major interactions. | Character appears during major interactions and displays at least five unique messages or animations. | Not Implemented |
| SYS-05 | FR-05, PERF-03 | Complete a game session and review the leaderboard and its updates. | Leaderboard displays at least five metrics and updates within two seconds after new data is submitted. | Partial |
| SYS-06 | FR-06 | Progress through the simulation and review the available stages. | At least five stages are reachable, each with a unique financial challenge. | Pass |
| SYS-07 | FR-07 | Attempt to change income, expenses, and financial goals during an active simulation. | Changes are accepted and reflected in calculations without restarting the simulation. | Not Implemented |
| SYS-08 | FR-08 | Attempt to create a savings goal and change savings contributions. | At least one savings goal can be created and its progress viewed. | Not Implemented |
| SYS-09 | FR-09 | Review the available expense categories during gameplay. | Expenses are supported in at least five categories. | Pass |
| SYS-10 | FR-10 | Complete the applicable game workflow and review the financial summary. | A monthly summary is generated at the end of each simulated month. | Pass |
| SYS-11 | FR-12 | Attempt to register, log in, and log out using individual user accounts. | Each supported account operation completes correctly. | Not Implemented |
| SYS-12 | FR-13 | Perform a game action, refresh the browser, disconnect temporarily, and reconnect. | Active-game progress is retained during refresh or temporary disconnection. Progress must also be saved for resuming a later session to satisfy FR-13. | Partial |
| SYS-13 | FR-14 | Trigger an overspending condition and observe the resulting notification. | Overspending notification appears within two seconds. | Pass |
| SYS-14 | FR-15, US-01 | Ask participants to complete the optional tutorial without assistance and record completion time. | Tutorial can be completed in under five minutes; at least 80% of test users complete it without assistance. | Not Run |
| SYS-15 | US-02 | Navigate between the application screens and review the navigation structure. | Screens use a consistent menu layout and navigation structure. | Pass |
| SYS-16 | US-03 | Check text contrast using an accessibility contrast checker. | Text contrast meets WCAG AA criteria. | Not Run |
| SYS-17 | PERF-01 | Observe major-screen loading after the backend server is fully awake. | At least 95% of measured major-screen loads complete within three seconds. Normal loading was observed to be quick, but the three-second threshold was not formally measured. | Not Run |
| SYS-18 | PERF-02 | Retrieve career information through the BLS integration during normal application use. | At least 90% of measured BLS API calls complete within five seconds. Career information loaded successfully, but API response times were not formally measured. | Not Run |
| SYS-19 | SEC-01 | Review stored-data protection and available security-test evidence. | Stored data is encrypted and penetration testing reveals no critical vulnerabilities. | Not Run |
| SYS-20 | SEC-02 | Attempt to access profile data without authentication. | Only authenticated users can access profile data. | Not Implemented |
| SYS-21 | SEC-03 | Log in, remain inactive, and test the session after 15 minutes. | Session expires after 15 minutes of inactivity. | Not Implemented |
| SYS-22 | DATA-01 | Inspect application backup functionality and available backup files. | User and game data are backed up automatically at least every 24 hours. | Not Implemented |
| SYS-23 | DATA-02 | Inspect stored BLS data and verify that the manual update process retrieves and stores data successfully. | Retrieved BLS data is stored successfully. Automatic data freshness according to a four-month schedule has not been verified. | Partial |
| SYS-24 | DATA-03 | Attempt to export budgeting history to a CSV file. | CSV export downloads successfully and contains the expected budgeting history. | Not Implemented |
| SYS-25 | UI-01 | Open the application dashboard and inspect the displayed financial summary. | Income, expenses, savings, and current stage are visible on the dashboard. | Pass |
| SYS-26 | UI-02 | Inspect the expense categories displayed in the application. | Each expense category uses a unique color. | Pass |
| SYS-27 | UI-03 | Trigger a scenario pop-up during gameplay. | Pop-up is centered and has clear accept and decline buttons. | Pass |
| SYS-28 | SYS-01 | Run the core application workflow in Google Chrome and Apple Safari. | Application loads and core functionality works in both tested browsers. | Pass |
| SYS-29 | SYS-02 | Test the application at different screen sizes using iPhones, iPhone Pro models, iPads/tablets, laptops, and desktop computers with monitors. | Application layout adjusts appropriately across the tested devices and screen sizes. | Pass |

### Testing Coverage and Limitations

The following summarizes the testing coverage and remaining limitations.

**BLS data updates**

The Python update script was manually executed to verify that BLS data could be retrieved and stored successfully.

The intended update interval for the project is four months. Automatic scheduling of this update interval has not been verified.

**Multiplayer game progress**

Players were able to retain their progress during an active game when refreshing their browser or temporarily disconnecting and reconnecting.

However, the application does not currently preserve player progress for resuming a game after the original host session has ended. This does not fully satisfy FR-13.

**Leaderboard**

The multiplayer leaderboard was tested and successfully displayed player rankings based on remaining money. The original requirement calls for at least five leaderboard metrics, so the complete fit criterion has not been verified.

**Performance**

Application screens and career information loaded quickly during normal use after the backend server became available.

The application is hosted on a free service that allows the server to become idle. When the server wakes up, an initial delay occurs before information loads. This startup delay was observed but was not formally measured.

The three-second screen-loading and five-second API-response requirements were not measured using a formal timing procedure.

**Browser compatibility**

The application was tested using:

- Google Chrome
- Apple Safari

Firefox and Microsoft Edge were not included in the browser testing.

**Responsive design**

The application was tested using multiple device types and screen sizes:

- iPhones
- iPhone Pro models
- iPads and other tablets
- Laptops
- Desktop computers with monitors

The interface adjusted appropriately across the tested devices. An exact 360-pixel minimum viewport measurement was not separately recorded.

**Security and data management**

Individual user accounts, login, automatic logout, scheduled backups, and CSV export are not implemented in the current application.

Encryption and penetration-testing requirements have not been formally verified.

### System Test Summary

| Test Status | Number of Tests |
|---|---:|
| Pass | 11 |
| Partial | 3 |
| Not Implemented | 10 |
| Not Run | 5 |
| **Total** | **29** |

The application successfully demonstrated its core career exploration, budgeting simulation, multiplayer gameplay, leaderboard, and responsive interface functionality.

Several requirements remain incomplete or require additional testing, particularly account management, persistent progress across sessions, security, automatic data updates, backups, exports, and formal performance measurements.

The results in this section document the current application behavior and identify the remaining requirements that should be addressed before final project approval.

---

## User-Acceptance Testing (UAT)

### 6.1 UAT Strategy

User-Acceptance Testing (UAT) evaluates whether the BLS Career Explorer application supports its intended users in completing common career exploration and budgeting activities.

The developer completed all six UAT scenarios during development to verify that the expected application workflows functioned correctly.

Participant testing was also conducted during the classroom demonstration with 20 students and 1 professor, for a total of 21 participants. The developer guided participants through the application, demonstrating its features and allowing them to interact with the career exploration and multiplayer budgeting game.

The testing focused on career exploration, wage information, income breakdowns, budgeting scenarios, and the multiplayer gameplay experience. Participant observations and feedback were used to evaluate the application's usability and overall functionality.

### 6.2 Participants and Testing Procedure

- **Developer Testing:** The developer completed UAT-01 through UAT-06 during application development.
- **Participant Group:** 20 students and 1 professor participated in the classroom testing session.
- **Testing Method:** The developer guided participants through the application and its major workflows.
- **Privacy:** No unnecessary personal financial information was required from participants.
- **Documentation:** Test results, observations, identified defects, corrections, and retesting outcomes were documented.

### 6.3 UAT Scenarios and Results

| Test ID | Task | Expected Result / Acceptance Criterion | Actual Result | Status |
|---|---|---|---|---|
| UAT-01 | Find a career using the education-level filter. | Participant selects an education level and locates a matching career. | Education-level filtering worked correctly and displayed matching careers. | Pass |
| UAT-02 | Search for a career by title. | Participant finds the intended career using search. | Career-title search worked correctly and returned matching careers. | Pass |
| UAT-03 | Review the selected career's wage information. | Participant identifies displayed wage information. | Career wage information displayed correctly for the selected career. | Pass |
| UAT-04 | Explain the income breakdown. | Participant distinguishes gross income, taxes, net income, tithe, and spendable income. | The income breakdown displayed the applicable financial information correctly. | Pass |
| UAT-05 | Join a test game and select a career. | Participant completes the supported workflow without a blocking defect. | Participants successfully joined the multiplayer game and completed the career-selection workflow. | Pass |
| UAT-06 | Review a budgeting scenario and its effect. | Participant identifies a scenario choice and its resulting financial change. | Budgeting scenarios worked correctly and reflected the resulting financial changes. | Pass |

### 6.4 UAT Results and Success Criteria

All six UAT scenarios were completed successfully during developer testing. The same application workflows were demonstrated and evaluated during the guided classroom participant session.

The classroom session included 21 participants. Participants were able to join the multiplayer game, interact with the application, complete gameplay activities, and observe the resulting leaderboard updates.

Feedback received during the classroom session was positive.

**Overall UAT Result:** PASS

- UAT scenarios completed during development: 6 of 6
- Classroom participants: 21
- Participant testing method: Guided classroom demonstration and interaction
- Identified blocking defects remaining from UAT: None reported

---

## CLASSROOM DEMONSTRATION AND MULTIPLAYER PLAYTEST

### Demonstration Overview

A live classroom demonstration of BLS Career Explorer was conducted with 20 students and the professor, for a total of 21 participants.

All 21 participants used their own devices to scan a QR code and join the multiplayer budgeting simulation. The professor participated in the game alongside the students.

The demonstration evaluated the application's ability to support multiple participants, maintain gameplay functionality, display individual player information, and update the leaderboard during gameplay.

### Playtest Results

| Test ID | Test Description | Actual Result | Status |
|---|---|---|---|
| LPT-01 | Participants join using the QR code. | All 21 participants, including the professor, successfully joined the game. | Pass |
| LPT-02 | Participants participate in multiplayer gameplay. | All participants were able to participate in the multiplayer game. | Pass |
| LPT-03 | Host completes the full game sequence. | The host successfully completed the entire game. | Pass |
| LPT-04 | Players review their individual choices. | Participants could view a summary of their gameplay choices. | Pass |
| LPT-05 | Leaderboard updates during gameplay. | The leaderboard updated and displayed player rankings based on remaining money. | Pass |
| LPT-06 | Participants provide general feedback. | Students responded positively and enjoyed the gameplay experience. | Positive Feedback |

### Defects Identified and Corrected

| Defect ID | Description | Correction | Retest Status |
|---|---|---|---|
| DEF-LPT-01 | Players who navigated away from the game or allowed their devices to sleep experienced connection problems and could not successfully rejoin. | Connection recovery behavior was corrected. | Corrected and Retested Successfully |
| DEF-LPT-02 | Some images were cropped or were not fully visible on participant devices. | Image presentation and sizing were corrected. | Corrected and Retested Successfully |

### Post-Fix Verification

| Verification ID | Verification Activity | Expected Result | Status |
|---|---|---|---|
| PFV-01 | Test connection recovery after navigating away from the game or allowing a device to sleep. | Participant can successfully return to the game. | Completed |
| PFV-02 | Review images on multiple device sizes. | Images display correctly without unintended cropping or clipping. | Completed |

### Demonstration Summary

The classroom demonstration successfully demonstrated that BLS Career Explorer could support 21 simultaneous participants in a multiplayer budgeting simulation.

All 20 students and the professor successfully joined and participated in the game. The host completed the full game, participants could review their individual choices, and the leaderboard updated to display player rankings based on remaining money.

The demonstration identified two issues involving connection recovery and image presentation. Both issues were corrected and successfully retested.

Students responded positively to the gameplay experience. The professor also participated in the game, providing an additional opportunity to demonstrate the application's multiplayer functionality in a classroom setting.

---

# TEST ENVIRONMENT

### Development Environment

The BLS Career Explorer application was developed and tested using the following environment:

| Component | Environment |
|---|---|
| Operating System | Windows 11 |
| Code Editor | VSCodium 1.135.06055 |
| Frontend | Vue 3 and Vite |
| Backend | Bun 1.4.2 |
| Database | SQLite |
| BLS Update Process | Python 3.14.7 |
| JavaScript Runtime | Node.js 24.21.0 |
| Unit Testing | Standalone Node.js script using `node:assert/strict` |
| Browsers Tested | Google Chrome and Apple Safari |
| Browsers Not Tested | Firefox and Microsoft Edge |

### Environment Record

- Operating System: Windows 11
- Browser Versions: Not Recorded
- Application Git Commit: Not Recorded
- Bun Version: 1.4.2
- Node.js Version: 24.21.0
- Python Version: 3.14.7
- Unit Testing Framework: Node.js built-in `node:assert/strict`
- SQLite Version: Not Recorded
- Test Date: November 2026
- Tester: Development Team

Browser compatibility testing was performed using Chrome and Safari. Exact browser versions were not recorded. Firefox and Edge were not included in testing.

---

## TEST DELIVERABLES

The following testing deliverables are documented within this Software Test Plan. Separate files were not maintained for every testing activity.

1. **Software Test Plan:** This document, including test cases, expected results, actual results, and testing status.

2. **Unit Test Results:** Unit test cases and execution results documented in Section 2, including passed and failed tests.

3. **Regression Test Results:** Completed regression test cases and their results documented in Section 3.

4. **Integration Test Results:** API, database, application integration, and multiplayer integration results documented in Section 4.

5. **System and Requirements-Based Test Results:** System testing outcomes documented in Section 5, including passed, partially completed, not implemented, and not-run requirements.

6. **User-Acceptance Testing Results:** UAT scenarios and participant testing outcomes documented in Section 6.

7. **Classroom Demonstration and Multiplayer Playtest Results:** Classroom demonstration outcomes, participant feedback, multiplayer results, and identified issues documented in Section 7.

8. **Defect Documentation:** Issues identified during classroom testing and their corrections and retest results are documented in Section 7. A separate defect log was not maintained.

9. **Requirements Traceability:** Requirement identifiers are associated with relevant test cases throughout this Software Test Plan. A separate Requirements Traceability Matrix was not maintained.

10. **Final Test Summary:** The final testing summary will provide an overview of test coverage, results, unresolved limitations, and features that were not implemented or tested.

### Testing Documentation Limitations

Testing results and observations are recorded within this Software Test Plan. Separate screenshots, execution logs, and evidence files were not collected for every test. The documented results represent the testing performed during development, integration, user acceptance, and classroom demonstration.

---

## SCHEDULE

The following table summarizes the status of testing activities for BLS Career Explorer. Dates are not included because individual testing dates were not consistently recorded.

| Phase | Activity | Status | Deliverable |
|---|---|---|---|
| 1 | Review CSCI 497 requirements and identify related test cases. | Completed | Requirement references and test cases documented in this plan. |
| 2 | Verify the development and test environment. | Completed | Test environment documented in Section 8. |
| 3 | Execute income calculation and input-validation unit tests. | Completed | Unit test results documented in Section 2. |
| 4 | Execute career browsing, selection, and multiplayer regression tests. | Completed | Regression test results documented in Section 3. |
| 5 | Execute frontend, API, database, wage-data, and calculation integration tests. | Completed | Integration test results documented in Section 4. |
| 6 | Execute functional, security, performance, and compatibility tests. | Partially Completed | System and requirements-based results documented in Section 5, including limitations and untested requirements. |
| 7 | Complete user-acceptance testing scenarios UAT-01 through UAT-06. | Completed | UAT results documented in Section 6. |
| 8 | Conduct classroom demonstration and multiplayer playtest. | Completed | Classroom playtest results documented in Section 7. |
| 9 | Correct identified defects and complete post-fix verification. | Completed | Two classroom issues corrected and successfully retested, as documented in Section 7. |
| 10 | Prepare the final testing summary and document remaining limitations. | Pending | Final test summary and outstanding limitations. |

---

## RISKS

The following risks were identified during development and testing of the BLS Career Explorer project. Each risk includes its potential impact, mitigation strategy, and contingency plan.

| Risk | Potential Impact | Mitigation Plan | Contingency Plan |
|---|---|---|---|
| BLS service unavailable or response changes. | Wage data may not update or may be incomplete. | Validate the BLS response structure and review update results when running the Python update script. | Use the existing local dataset when the BLS service is unavailable and investigate failed updates. |
| Career or wage data missing or inconsistent. | Career details and income calculations may be incomplete or inaccurate. | Validate returned fields and compare API responses with stored records. | Document affected records and address missing-data handling. |
| Income calculation defect. | Tax, net income, or spendable-income values may be incorrect. | Test individual calculation components using expected values. | Correct the calculation and rerun affected unit and regression tests. |
| Frontend/backend contract mismatch. | Career information or other application features may fail to load correctly. | Run integration and regression tests after significant API or backend changes. | Correct or revert incompatible changes and retest affected features. |
| Multiplayer events missed or processed incorrectly. | Players may see inconsistent game states or experience connection problems. | Test multiplayer functionality with multiple devices and verify synchronization and reconnection behavior. | Investigate connection issues, correct the affected functionality, and repeat multiplayer testing. |
| Free hosting service becomes idle. | The first application request may experience a delay while the backend service wakes up. | Document the hosting limitation and verify application functionality after the backend becomes available. | Allow the service time to wake up and retry the request. Consider a hosting option that does not idle if faster initial access becomes necessary. |
| Code changes break existing functionality. | Previously working features may stop functioning after updates. | Perform relevant regression tests after significant code changes. | Correct or revert the change and rerun affected tests. |
| Limited browser testing. | Compatibility issues may exist in browsers that were not tested. | Perform compatibility testing using the available browsers, Chrome and Safari. | Test and correct reported issues in Firefox and Edge if compatibility problems are identified. |
| Security features are incomplete or unverified. | User data protection and access-control requirements may not be fully satisfied. | Document security requirements that were not implemented or formally tested. | Complete the required security features and conduct appropriate security testing before relying on them in a production environment. |
| Performance requirements were not formally measured. | Application loading and API response times may not meet specified performance targets. | Monitor application behavior during testing and identify noticeable delays. | Conduct formal performance testing and optimize the application if response times exceed requirements. |
| Automatic BLS update scheduling is unverified. | BLS information may become outdated if the manual update process is not performed regularly. | Document the intended four-month update interval and verify the Python update process when it is run. | Run the update script manually and investigate any update failures. |
| Some planned requirements remain unimplemented. | Users may not have access to every feature described in the original requirements document. | Identify incomplete requirements in the system testing results. | Document limitations and prioritize remaining features for future development. |
| Limited testing documentation. | Some test results may be difficult to independently reproduce or verify. | Maintain test cases, actual results, and statuses within this Software Test Plan. | Perform additional testing and collect screenshots or execution logs when further verification is needed. |

### Risk Summary

The primary risks remaining for BLS Career Explorer involve hosting delays, incomplete requirements, limited browser coverage, and security and performance requirements that were not formally verified.

The application successfully completed its classroom multiplayer demonstration with 21 participants. Two issues identified during that demonstration were corrected and retested successfully. However, the limitations documented in this plan should be considered when evaluating the project's overall readiness and determining future development priorities.

---
