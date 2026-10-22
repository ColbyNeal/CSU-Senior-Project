# Software Test Plan - BLS Career Explorer

**Project:** CSU Senior Project  
**Course:** CSCI 498  
**Version:** 1.1 — Revised First Draft  
**Date:** October 16, 2026  
**Status:** Draft for instructor review

---

## IDENTIFICATION INFORMATION

### Project Description
BLS Career Explorer is a web application that uses occupational and wage information from the U.S. Bureau of Labor Statistics (BLS) to help users explore careers and understand how income relates to budgeting. The project includes career browsing, education-level filtering, career details, wage information, and a multiplayer budgeting simulation.

The current development stack includes Vue 3 and Vite for the frontend, Bun for the backend, SQLite for local data storage, and Python for the BLS data-update process.

### Testing Objectives

The objectives of this test plan are to:
- Verify that career information is retrieved, filtered, and displayed correctly.
- Verify income calculations using known inputs and independently calculated expected results.
- Test integration between the frontend, backend, database, BLS data-update process, and income calculation utility.
- Verify that supported career-selection and multiplayer workflows operate correctly.
- Evaluate usability, accessibility, browser compatibility, and performance against the CSCI 497 requirements.
- Conduct user-acceptance testing (UAT) to evaluate whether intended users can complete common tasks and understand the financial information.
- Document test results, defects, evidence, and unresolved risks.
A test will be marked Pass only after the observed result meets its expected result. Tests that have not been executed will remain Not Run.

### Features to be Tested

| Feature | Description | Related requirements |
|---|---|---|
| Career data | Retrieve and display career information | FR-02 |
| Career browsing | Search and filter available careers | |
| Career selection | Select and confirm a career for the simulation | |
| Income calculation | Calculate monthly gross income, taxes, net income, tithe, and spendable income. | FR-07 |
| Budgeting simulation | Modify income, expenses, and goals during gameplay | FR-03, FR-06, FR-07, FR-08, FR-11 |
| User accounts and progress | Register, log in, save profiles, and preserve progress | FR-01, FR-12, FR-13 |
| BLS data update | Retrieve and store updated BLS data | FR-02, DATA-02 |
| Multiplayer gameplay | Support multiple players and game-state updates | |
| Dashboard and interface | Display required financial information and provide consistent navigation | US-01, UI-01, UI-02, UI-03 |
| Performance and compatibility | Verify response times, browser support, and responsive layout | PERF-01, PERF-02, PERF-03, SYS-01, SYS-02 |
| Security and data management | Verify access control, session expiration, backups, and exports | SEC-01, SEC-02, SEC-03, DATA-01, DATA-03 |

**Traceability note:** The feature list above is a testing summary, not a replacement for the CSCI 497 requirements document. Where a feature does not have a confirmed requirement ID, its mapping must be verified against the original document before final approval.

### Features Not Included in This Test Plan
The following are outside the current testing scope:
- Verifying the scientific or statistical correctness of the original BLS publications.
- Production-scale load testing with thousands of simultaneous users.
- Independent third-party penetration testing.
- Real financial transactions or payment processing.
- Providing tax, investment, or other professional financial advice.
Ordinary input validation, error handling, access control, and the security requirements explicitly identified in CSCI 497 remain within scope.

---

## UNIT TEST

### UNIT TEST STRATEGY / EXTENT OF UNIT TESTING:
Unit testing will focus on individual functions and calculations without depending on the complete application workflow. Priority will be given to income calculations, input validation, budget calculations, and other independently testable business logic.

Automated unit tests should be used for repeatable calculations and logic. Vitest is a candidate testing framework for the Vue/Vite project; the installed framework and exact version must be verified before recording the final test environment. Manual checks will be identified as manual and will not be reported as automated tests.

For income calculations, expected values must be calculated independently using the same tax assumptions, rates, limits, and rounding rules as the application.

### UNIT TEST CASES

| Test ID | OBJECTIVE | INPUT | EXPECTED RESULTS | DELIVERABLES |
|---|---|---|---|---|
| UT-01 | Verify monthly gross income conversion. | Annual salary of $60,000. | Monthly gross income is $5,000 | Input/output record |
| UT-02 | Verify federal income tax calculation. | Known annual income and the application's tax assumptions. | Calculated result matches an independently calculated expected value. | Calculation comparison. |
| UT-03 | Verify Social Security and Medicare calculations. | Known income and applicable implemented rates and limits. | Each result matches the expected calculation. | Calculation comparison. |
| UT-04 | Verify South Carolina income tax calculation. | Known income and the application's state-tax assumptions. | Result matches the expected calculation under those assumptions. | Calculation comparison. |
| UT-05 | Verify net income. | Known gross income and individual tax amounts. | Total taxes equal the applicable taxes added together; net income equals gross income minus total taxes. | Calculation comparison. |
| UT-06 | Verify tithe and spendable income. | Known gross income and net income after taxes. | Tithe equals 10% of gross income; spendable income equals net income after taxes minus tithe. | Calculation comparison. |
| UT-07 | Verify invalid/unavailable salary handling. | Missing, nonnumeric, zero, or negative salary as applicable. | Invalid or unavailable values are handled safely without a crash or misleading figures. | Input/output and defect record. |
| UT-08 | Verify income function input contract. | Annual salary passed to `calculateMonthlyIncomeBreakdown`. | Annual salary is passed according to the function's expected input contract and is not incorrectly divided by 12 twice. | Function test record. |

**Unit test acceptance criterion:** Every executed test must produce the expected result for its documented inputs. Any discrepancy must be logged and corrected or documented as an unresolved defect.

---

## REGRESSION TEST

### Regression Test Strategy
Regression testing verifies that previously developed behavior continues to work after code changes. Tests will be rerun when changes affect career filtering, search, career selection, income calculations, API responses, or supported game workflows.

The test record will identify the application version or Git commit, test inputs, expected result, actual result, date, and evidence.

### Development Observations

The following behavior was observed during development:

- Education-level filtering.

- Returning to the “All Education Levels” option.

- Career-title search and career-list selection.

- Career confirmation.

- Display of the monthly income breakdown after connecting calculateMonthlyIncomeBreakdown() to the selected career's annual wage.

These are informal development observations, not formal passing test results. They must be rerun using the test procedures below before being marked Pass. The income display also requires independent verification of the calculation values.

### Regression Test Cases

| Test ID | Objective | Input and procedure | Expected result | Current status |
|---|---|---|---|---|
| RT-01 | Verify career list loads. | Start the frontend and backend, then open career selection. | Available career records display without a blocking error. | Not Run |
| RT-02 | Verify education filtering. | Select a specific education level and inspect the results. | Displayed careers match the selected level. | Informally observed; formal retest required |
| RT-03 | Verify all education levels. | Select “All Education Levels.” | The complete available career list returns. | Informally observed; formal retest required |
| RT-04 | Verify career search. | Search using a full and a partial career title. | Matching career titles appear and unrelated titles are excluded. | Informally observed; formal retest required |
| RT-05 | Verify career selection. | Scroll the list and select a career. | The list remains usable and the selected career is visibly identified. | Informally observed; formal retest required |
| RT-06 | Verify career confirmation. | Select a career and confirm the selection. | The confirmed career matches the user's selection. |Informally observed; formal retest required |
|RT-07 |Verify income display. |Confirm a career with valid wage data. |Income values display for the selected career and follow the calculation rules. |Display observed; independent calculation verification required |
| RT-08 | Verify missing wage data. | Open a career with missing or unavailable wage information. | The application communicates unavailable information and does not display stale values from another career. | Not Run |
| RT-09 | Verify request-failure recovery. | Simulate a failed career-details request. | An appropriate error or recovery state is displayed. | Not Run |

** Regression acceptance criterion:** Previously working behavior must remain corrct after changes. Any regression must be documented, corrected, and retested.
---

## INTEGRATION TEST

### Integration Test Strategy and Extent of Integration Testing
Integration testing verifies that application components work together correctly. Testing will focus on the Vue frontend, Bun API routes, SQLite data, BLS update process, income calculation utility, and multiplayer communication where implemented.

Integration tests will verify data flow between components, compare returned values against appropriate stored records, and check how the application handles missing data, unavailable services, and invalid requests.

Unlike regression testing, which checks that existing behavior still works after changes, integration testing focuses on communication and data exchange between components.

### Integration Test Cases

| Test ID| Objective| Input and procedure| Expected result| Deliverable |
|---|---|---|---|---|
| IT-01 | Verify career API integration. | Open career selection while the backend is running. | The frontend receives the career response and displays the returned records. | API response and screenshot. |
| IT-02 | Verify career-details integration. | Request details using a valid SOC code. | The API returns the matching career and available wage fields. | API response and database comparison. |
| IT-03 | Verify invalid career identifier handling. | Request details for a nonexistent SOC code. | The backend returns an appropriate error result and the frontend handles it without crashing. | Request/response record. |
| IT-04 | Verify wage data consistency. | Retrieve a career with an available stored wage record. | The displayed wage and available source, year, and period agree with the applicable stored record. | Database query and comparison. |
| IT-05 | Verify wage-to-calculation integration. | Select a career with a known annual wage. | The annual wage is passed correctly into the income calculation utility and the output is displayed for the selected career. | Input/output comparison. |
| IT-06 | Verify backend failure handling. | Stop the backend and request career data. | The frontend displays a useful error or recovery state rather than silently presenting incorrect data. | Screenshot and console output. |
| IT-07 | Verify BLS update and storage. | Run the data-update process against the available service or a controlled test response. | Valid returned data is stored correctly, and failures are reported without corrupting existing data. | Update log and database comparison. |
| IT-08 | Verify multiplayer state synchronization. | Connect two test clients and perform a supported shared action. | The relevant game-state update reaches the appropriate clients and remains consistent. | Event sequence and observations. |

**Integration acceptance criterion:** Data exchange between components must match the expected contract and values. Error scenarios must be handled without application crashes or misleading displayed data.

---
# SYSTEM AND REQUIREMENTS-BASED TESTING

### Strategy

System testing verifies complete application workflows against the measurable fit criteria in the CSCI 497 Requirements Document. The following cases address requirements that cannot be adequately verified through unit tests alone.

### Functional and Nonfunctional Test Cases

| Test ID | Requirement | Test objective and procedure | Expected result / fit criterion | Status |
|---|---|---|---|---|
| SYS-01 | FR-01 | Create a profile, save it, and reload it. | Profile data remains intact after reloading. | Not Run |
| SYS-02 | FR-02 | Trigger or inspect the scheduled BLS update and compare internal values. | BLS data is pulled at least every 24 hours and internal values update without errors. | Not Run |
| SYS-03 | FR-03, FR-11 | Exercise available scenarios and compare the budget before and after each scenario. | At least 10 unique scenarios appear during gameplay, and each affects at least one budget category. | Not Run |
| SYS-04 | FR-04 | Observe character behavior during major interactions. | Character appears during major interactions and displays at least five unique messages or animations. | Not Run |
| SYS-05 | FR-05, PERF-03 | Complete a session, submit results, and refresh the leaderboard. | Leaderboard displays at least five metrics and updates within two seconds after new data is submitted. | Not Run |
| SYS-06 | FR-06 | Progress through the simulation and record the stages. | At least five stages are reachable, each with a unique financial challenge. | Not Run | 
| SYS-07 | FR-07 | Change income, expenses, and goals during an active simulation. | Changes are accepted and reflected in calculations without restarting the simulation. | Not Run | 
| SYS-08 | FR-08 | Create a savings goal and change savings contributions. | At least one savings goal can be created and its progress viewed. | Not Run | 
| SYS-09 | FR-09 | Enter or load expenses from supported categories. | Expenses are automatically sorted into at least five categories. | Not Run |
| SYS-10 | FR-10 | Complete a simulated month. | A monthly summary is generated at the end of each simulated month. | Not Run |
| SYS-11 | FR-12 | Register, log in, and log out. | Each supported account operation completes correctly. | Not Run |
| SYS-12 | FR-13 | Perform a session action and reload or resume the session. | Progress is saved automatically at least once per session. | Not Run |
| SYS-13 | FR-14 | Trigger an overspending condition and measure notification delay. | Overspending notification appears within two seconds. | Not Run |
| SYS-14 | FR-15, US-01 | Ask a participant to complete the optional tutorial without assistance. | Tutorial can be completed in under five minutes; at least 80% of test users complete it without assistance. | Not Run | 
| SYS-15 | US-02 | Navigate between the application screens. | All screens use the same menu layout and navigation structure. | Not Run |
| SYS-16 | US-03 | Check text contrast using an accessibility contrast checker. | Text contrast meets WCAG AA criteria. | Not Run | 
|  SYS-17 | PERF-01 | Measure major-screen load times using a consistent test method. | At least 95% of measured major-screen loads complete within three seconds. | Not Run | 
| SYS-18 | PERF-02 | Measure BLS API response times over repeated calls. | At least 90% of measured BLS API calls complete within five seconds. | Not Run | 
| SYS-19 | SEC-01 | Review data protection and available security-test evidence. | Stored data is encrypted and penetration testing reveals no critical vulnerabilities. | Not Run | 
| SYS-20 | SEC-02 | Attempt to access profile data without authentication. | Only authenticated users can access profile data. | Not Run | SYS-21 | SEC-03 | Log in, remain inactive, and test the session after 15 minutes. | Session expires after 15 minutes of inactivity. | Not Run | 
| SYS-22 | DATA-01 | Inspect scheduled backup behavior and backup artifacts. | Backups are created automatically every 24 hours. | Not Run |
| SYS-23 | DATA-02 | Inspect the recorded timestamp of the last BLS update. | The displayed or stored timestamp of the last BLS update is within 24 hours. | Not Run |
| SYS-24 | DATA-03 | Export budgeting history to CSV and open the downloaded file. | CSV export downloads successfully and contains the expected budgeting history. | Not Run | 
| SYS-25 | UI-01 | Open the dashboard and inspect the displayed summary. | Income, expenses, savings, and current stage are visible at all times on the dashboard. | Not Run |
| SYS-26 | UI-02 | Inspect all expense categories. | Each expense category uses a unique color. | Not Run |
| SYS-27 | UI-03 | Trigger a scenario pop-up. | Pop-up is centered and has clear accept and decline buttons. | Not Run |
| SYS-28 | SYS-01 | Run the core application smoke-test checklist in each required browser. | Application loads successfully in Chrome, Firefox, Edge, and Safari. Record browser versions individually. | Not Run |
| SYS-29 | SYS-02 | Test the interface at viewport widths beginning at 360 pixels. | The interface adjusts correctly at widths of 360 pixels and larger. | Not Run |

**Important:** A requirement's inclusion in this table does not establish that the feature is implemented. If a required feature is not available to test, record the case as Blocked and identify the missing implementation or dependency. Do not mark it Pass.

**Fit-criterion clarification:** DATA-02 is interpreted here as requiring a timestamp within 24 hours, consistent with the supplied requirement. Confirm with the instructor whether this means the time of the last successful retrieval or the age of the underlying BLS source data.

---

## USER-ACCEPTANCE TEST (UAT)

### UAT Strategy

User-acceptance testing will evaluate whether intended users can complete common career-exploration and budgeting tasks, understand the income information presented, and navigate the application without unnecessary assistance.

UAT participants will use the same identified application build. The developer will observe task completion, record errors and requests for help, and collect feedback through a short questionnaire or interview.

### Participants and Consent

- **Proposed participant count:** Five to eight volunteers, subject to instructor approval and availability.

- **Participant profile:** Intended users with varied levels of familiarity with career research, budgeting applications, and financial terminology.

- **Consent:** Explain the purpose of the test, what will be observed, and how feedback will be used. Obtain consent where required by the course or institution.

- **Privacy:** Do not request real account passwords, bank details, Social Security numbers, or unnecessary personal financial information. Use test accounts and sample data.

- **Recording:** Record anonymous participant IDs, task completion, assistance required, feedback, date, and application build. Do not collect identifying information unless explicitly approved and necessary.

### Script to Read to Participants

Thank you for participating. We are evaluating the application, not your ability. Please complete the tasks as you normally would. You may tell me when something is confusing. I will record whether the tasks can be completed and collect your feedback. Please use only the sample information provided for this test.

### UAT Scenarios

| Test ID | Task | Expected result / acceptance criterion | Data to collect |
|---|---|---|---|
| UAT-01 | Find a career using the education-level filter. | Participant selects an education level and locates a matching career. | Completion, assistance, confusion. |
| UAT-02 | Search for a career by title. | Participant finds the intended career using search. | Completion, assistance, search difficulties. |
| UAT-03 | Review the selected career's wage information. | Participant identifies the displayed wage and available source/reporting period. | Correct interpretation and questions. |
| UAT-04 | Explain the income breakdown. | Participant can distinguish gross income, taxes, net income, tithe, and spendable income using the application's definitions. | Correct answers and misunderstandings. |
| UAT-05 | Join a test game and select a career. | Participant completes the supported workflow without a blocking defect. | Completion, assistance, navigation issues. |
| UAT-06 | Review a budgeting scenario and its effect. | Participant identifies the scenario choice and the resulting budget change where implemented. | Understanding and feedback. |
| UAT-07 | Complete the optional tutorial. | Participant completes it in under five minutes without assistance; the aggregate target is at least 80% completion without assistance. | Completion time and assistance. |
| UAT-08 | Provide overall usability feedback. | Participant identifies confusing labels, navigation issues, or useful features. |Questionnaire or interview responses. |

UAT Success Criteria and Reporting
- Record completion and assistance for every task.
- Measure tutorial completion time and calculate the percentage completed without assistance.
- Record whether participants correctly interpret the five income concepts in UAT-04.
- Summarize recurring usability issues and suggested improvements.
- Compare results with applicable CSCI 497 fit criteria.
- Report the number of participants who completed each task and the number who required assistance.

The UAT report will distinguish measured outcomes from subjective feedback. Any criterion that has not been evaluated will be reported as not evaluated rather than assumed to have passed.

---
# TEST ENVIRONMENT

### Development Environment

The currently identified development stack is:
| Component | Environment |
|---|---|
| Operating system | Windows; exact edition and build must be confirmed |
| Editor | VSCodium | 
| Frontend | Vue 3 and Vite |
| Backend | Bun |
| Database | SQLite |
| BLS update process | Python |
| Browser | Chrome; record the exact version used for formal testing |
| Unit-test framework | Verify the installed framework and exact version before execution |

### Environment Record

- Windows edition and build: ____________________
- Browser and exact version: ____________________
- Application Git commit: ____________________
- Bun version: ____________________
- Node.js version, if used by the test process: ____________________
- Python version: ____________________
- Unit-test framework and version: ____________________
- SQLite version: ____________________
- Test date and tester: ____________________

---

## TEST DELIVERABLES

The following deliverables will be maintained throughout testing:
1. Software Test Plan: This document, including revisions.
2. Unit Test Results: Inputs, expected outputs, actual outputs, and automated test reports where available.
3. Regression Test Results: Completed regression cases with evidence and status.
4. Integration Test Results: API responses, relevant database comparisons, event observations, and error-handling results.
5. System Test Results: Measured outcomes against CSCI 497 requirement IDs and fit criteria.
6. UAT Results: Participant counts, consent process, task completion, tutorial results, and anonymized feedback.
7. Defect Log: Test ID, description, reproduction steps, severity, status, and retest results.
8. Requirements Traceability Matrix: Mapping from each CSCI 497 requirement and fit criterion to the test cases that verify it.
9. Final Test Summary: Test coverage, pass/fail/blocked/not-run counts, unresolved defects, and known limitations.

Every test record must identify the test ID, date, tester, application version or Git commit, inputs, expected result, actual result, status, evidence location, and related defect if applicable.

---

## SCHEDULE

The following is the planned testing sequence. Actual dates and completion status should reflect the course schedule and work completed.
| Phase | Activity | Deliverable |
|---|---|---|
| 1 | Review CSCI 497 requirements and finalize traceability. | Requirement-to-test mapping. |
| 2 | Verify the environment and configure the unit-test framework. | Completed environment record. |
| 3 | Execute income calculation and input-validation unit tests. | Unit test results. |
| 4 | Execute career browsing and selection regression tests. | Regression test results. |
| 5 | Execute frontend, API, database, wage-data, and calculation integration tests. | Integration test results. |
| 6 | Execute applicable functional, security, performance, and compatibility tests. | System test results and evidence. |
| 7 | Conduct UAT after instructor approval. | Participant results and feedback summary. |
| 8 | Correct defects and rerun affected tests. | Updated defect log and retest evidence. |
| 9 |Prepare the final testing report. | Coverage summary, unresolved risks, and final results. |

---

## RISKS

| Risk | Potential impact | Mitigation plan | Contingency plan |
|---|---|---|---|
| BLS service unavailable or response changes. | Wage data may not update or may be incomplete. | Validate response structure and log update results. | Use a controlled local dataset to test application behavior independently. |
| Career/wage data missing or inconsistent. | Career details may be incomplete or incorrect. | Validate fields and compare API responses with stored records. | Document affected records and test missing-data handling. |
| Income calculation defect. | Tax or spendable-income values may be incorrect. | Test each component with independent expected values. | Correct the defect and document any remaining limitation. |
| Frontend/backend contract mismatch. | Career screens may fail. | Run integration and regression tests after API changes. | Correct or revert incompatible changes and retest. |
| Multiplayer events missed or processed incorrectly. | Players may see inconsistent game states. | Test with multiple clients and record event behavior. | Document reproducible failures and prioritize core workflow fixes. |
| Code changes break existing behavior. | Previously working features may regress. | Run relevant regression tests after significant changes. | Fix or revert the change and rerun affected tests. |
| Limited time for testing. | Some defects may remain undiscovered. | Prioritize income calculations, career data, and core game flow. | Document untested areas and residual risks. |
| Requirements not mapped to tests. | Some fit criteria may not be verified. | Review CSCI 497 Requirements Document with instructor. | Keep plan marked as draft until traceability is complete. |

---
