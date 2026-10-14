# Test Plan Document

**Product:** BLS Career Explorer  
**Project:** CSU Senior Project  
**Course:** CSCI 498  
**Version:** 1.0 — First Draft for Review  
**Date:** October 14, 2026  
**Status:** Draft; requirements traceability and test execution are pending.

---

## IDENTIFICATION INFORMATION

### Product
- **Product Name:** BLS Career Explorer

### Project Description
BLS Career Explorer is a web application intended to help users explore careers using occupational and wage information from the U.S. Bureau of Labor Statistics (BLS). It includes career browsing, education-level filtering, career details and wage information, and a multiplayer budgeting game in which players select a career and review estimated income information. The current stack includes Vue 3 and Vite for the frontend, Bun for the backend, SQLite for local storage, and Bootstrap for interface styling.

### Testing Objectives
This plan defines the scope and approach for testing BLS Career Explorer. Testing will evaluate whether career information is retrieved and displayed correctly, income calculations follow the application's rules, frontend and backend components work together, and users can complete supported career-selection and game workflows. Results will be recorded as tests are executed. A test case will not be marked passed until its expected result has been compared with the observed result.

### Features to be Tested

| Feature ID | Feature | Test focus | Requirements reference |
|---|---|---|---|
| F-01 | Career data and database | Correct retrieval and display of available career fields | Pending CSCI 497 review |
| F-02 | Career browsing and search | Browse careers and search by title | Pending |
| F-03 | Education-level filter | Options reflect stored education levels; results match selected level | Pending |
| F-04 | Career details | Selected career details and wage information load | Pending |
| F-05 | BLS wage data | Wage, source, year, and period correspond to stored data | Pending |
| F-06 | Monthly income breakdown | Gross income, taxes, net income, tithe, and spendable income follow implemented rules | Pending |
| F-07 | Career confirmation | Selected career is confirmed for the correct player | Pending |
| F-08 | Multiplayer flow | Supported joining, lobby, and game-start workflow works | Pending |
| F-09 | API/database integration | Frontend, backend routes, and SQLite work together | Pending |
| F-10 | Error handling | Missing data, failed requests, and unavailable services are handled clearly | Pending |
| F-11 | Interface/navigation | Main controls and screens remain usable after changes | Pending |

**Requirements traceability:** The CSCI 497 Requirements Document and each requirement's fit criterion must be reviewed before this plan is baselined. Replace “Pending” with the actual requirement IDs. Feature IDs above are planning identifiers, not formal course requirement IDs.

### Features Not to Be Tested
- The correctness of BLS's original published statistics; testing will focus on the application's handling and presentation of data.
- Production-scale load with thousands of simultaneous users.
- A formal independent penetration test or security audit.
- Payment processing or financial transactions.
- Tax advice or guarantees that estimates match an individual's actual tax liability.
- Deployment infrastructure not included in the project's required deliverables.

These exclusions do not remove the need to test ordinary error handling, input validation, or safe behavior.

---

## UNIT TEST

### UNIT TEST STRATEGY / EXTENT OF UNIT TESTING:
Unit testing will evaluate isolated functions and logic, prioritizing income calculations and input validation. Automated tests will be used where available. Where automated tests have not yet been implemented, checks may be performed manually using known inputs and independently calculated expected results; manual checks must not be described as automated tests.

The current development environment includes Windows, VSCodium, Bun, Vue 3/Vite, and Python. Before formal execution, record the exact Windows edition/version, browser version, and test framework/version. Expected tax values must use the calculation rules and rounding assumptions implemented by the application.

### UNIT TEST CASES

| # | OBJECTIVE | INPUT | EXPECTED RESULTS | TEST DELIVERABLES |
|---|---|---|---|---|
| UT-01 | Verify monthly gross income conversion. | Annual salary of $60,000. | Monthly gross income is $5,000 (annual salary divided by 12). | Input/output record and pass/fail status. |
| UT-02 | Verify federal income tax calculation. | Known salary and implemented tax assumptions. | Result matches an independently calculated expected value using the same assumptions and rounding. | Calculation comparison. |
| UT-03 | Verify Social Security and Medicare calculations. | Known salary and implemented rates/limits. | Each tax matches the expected result under the application's rules. | Calculation comparison. |
| UT-04 | Verify South Carolina income tax. | Known salary and implemented state-tax assumptions. | Result matches the expected value under those assumptions. | Calculation comparison. |
| UT-05 | Verify total taxes and net income. | Known gross income and individual tax amounts. | Total taxes equal applicable taxes added together; net income equals gross income minus total taxes. | Calculation comparison. |
| UT-06 | Verify tithe and spendable income. | Known gross income and net income after taxes. | Tithe equals 10% of gross; spendable income equals net income after taxes minus tithe. | Calculation comparison. |
| UT-07 | Verify invalid/unavailable salary handling. | Missing, nonnumeric, zero, or negative salary as applicable. | Invalid/unavailable data is handled without a crash or misleading income figures. | Input/output and defect record. |
| UT-08 | Verify income function input contract. | Annual salary passed to `calculateMonthlyIncomeBreakdown`. | Annual salary is passed to the function; it is not divided by 12 before the function divides annual values into monthly values. | Function input/output record. |

---

## REGRESSION TEST

Ensure that previously developed and tested software still performs after change.

### Regression Test Strategy
After changes to career selection, filtering, salary data, income calculations, API routes, or multiplayer behavior, rerun relevant tests. Record the build or Git commit tested so results can be reproduced.

### Regression Test Cases

| # | OBJECTIVE | INPUT | EXPECTED RESULTS | OBSERVED |
|---|---|---|---|---|
| RT-01 | Verify career list loads. | Open career selection with frontend and backend running. | Available careers display without a blocking error. | Not run; record after execution. |
| RT-02 | Verify education filter. | Select an education level. | Only matching careers appear. | Informally observed working during development; formal test date, specific input, and evidence not recorded. |
| RT-03 | Verify all-levels option. | Select “All Education Levels.” | Full available list returns. | Informally observed working during development; formal test date and evidence not recorded. |
| RT-04 | Verify career search. | Enter a full or partial career title. | Matching titles appear; nonmatching titles are excluded. | Informally observed working during development; formal test date and evidence not recorded. |
| RT-05 | Verify career list presentation. | Scroll the list and select a career. | List scrolls; selected career is visibly identified. | Informally observed working during development; formal test date and evidence not recorded. |
| RT-06 | Verify career confirmation. | Select and confirm a career. | Confirmation screen shows the selected career and available details. | Informally observed working during development; formal test date and evidence not recorded. |
| RT-07 | Verify income breakdown. | Confirm a career with valid annual wage data. | Gross income, taxes, net income, tithe, and spendable income display using the correct calculation. | Observed working after connecting `calculateMonthlyIncomeBreakdown()` to the annual wage in `loadCareerDetails()`. Exact tax amounts and spendable-income values have not been independently verified; formal calculation test remains outstanding. |
| RT-08 | Verify missing wage data. | Open a career with unavailable wage information. | Missing data is communicated; stale figures from another career are not displayed. | Not run; record after execution. |
| RT-09 | Verify retry behavior. | Cause or simulate a details request failure and select retry. | Error is shown and retry attempts to load the selected career again. | Not run; record after execution. |
| RT-10 | Verify game workflow after UI changes. | Join a test game, confirm a career, and proceed through the supported flow. | Career selection remains compatible with lobby and gameplay. | Not run; record after execution. |

---

## INTEGRATION TEST

Combine individual software modules and test as a group.

### Integration Test Strategy and Extent of Integration Testing
Integration testing will cover Vue frontend requests, Bun backend routes, SQLite data, BLS data storage/update, the income calculation utility, and multiplayer communication. API responses will be compared with relevant database records or expected values. Failure scenarios will verify that missing data and unavailable services are handled without crashing the application.

### Integration Test Cases

| # | OBJECTIVE | INPUT | EXPECTED RESULTS | TEST DELIVERABLES |
|---|---|---|---|---|
| IT-01 | Verify frontend-to-career-API integration. | Open career selection with backend running. | Frontend receives a successful response and displays returned career records. | API response, screenshot, result. |
| IT-02 | Verify details API and database integration. | Request details for a valid SOC code. | API returns the corresponding career record and available wage fields. | API response and database comparison. |
| IT-03 | Verify invalid career identifier handling. | Request a nonexistent SOC code. | Backend returns an appropriate error result; frontend displays a useful message. | Request/response and screenshot. |
| IT-04 | Verify wage display against stored data. | Retrieve a career with a wage snapshot. | Displayed wage and available source/year/period match the applicable stored record. | Database query and comparison. |
| IT-05 | Verify wage-to-calculation integration. | Confirm a career with a known annual wage. | Annual wage from the details response is passed to the calculation utility using its correct input contract. | Input/output comparison. |
| IT-06 | Verify backend-unavailable behavior. | Stop backend and request career data. | Frontend shows a useful error or recovery state. | Screenshot and console output. |
| IT-07 | Verify BLS update and storage. | Run update process with an available service or controlled test response. | Valid data is stored correctly; failures are reported without corrupting existing records. | Update log and database comparison. |
| IT-08 | Verify multiplayer career confirmation. | Join a test game and confirm a career. | Correct player/game state is updated with the selected career. | Event/server log and observations. |
| IT-09 | Verify WebSocket events. | Connect at least two test clients and perform a supported action. | Relevant events are received and handled as expected. | Event sequence and result record. |

---

## USER-ACCEPTANCE TEST

Verify that the solution works for potential users. Include the method, number of participants and demographics, consent form if required, scenarios, scripts to read, and data collection methods.

### User-Acceptance Test Strategy
Representative users will complete common career-exploration and game tasks without step-by-step assistance. The developer will observe task completion and confusion, then collect feedback using a short questionnaire or interview. The participant count and participant characteristics will be agreed upon with the instructor before execution. Obtain consent if required by the course or institution, and do not collect unnecessary personal information.

Suggested opening script:

> Please use the application to complete each task as you normally would. I am evaluating the application, not your ability. Tell me if anything is confusing. I may take notes about task completion and usability.

Record task completion, errors or assistance required, optional task-completion time, feedback, date, and test build/commit.

### User-Acceptance Test Cases

| # | TEST ITEM | EXPECTED RESULTS | ACTUAL RESULTS | DATE |
|---|---|---|---|---|
| UAT-01 | Find a career using the education dropdown. | Participant selects a level and locates a matching career. | Not run; record participant observations. | Pending |
| UAT-02 | Search for a career by title. | Participant locates the intended career using search. | Not run; record participant observations. | Pending |
| UAT-03 | Review salary information. | Participant identifies annual salary and available source/reporting period. | Not run; record participant observations. | Pending |
| UAT-04 | Confirm a career and interpret income breakdown. | Participant identifies gross income, taxes, net income, tithe, and spendable income. | Not run; record participant observations. | Pending |
| UAT-05 | Join a game and complete career selection. | Participant completes the supported workflow without a blocking defect. | Not run; record participant observations. | Pending |
| UAT-06 | Give feedback on labels, navigation, and readability. | Feedback is documented and potential improvements are logged. | Not run; record feedback. | Pending |

Acceptance criteria will be checked against the CSCI 497 requirements and fit criteria before final acceptance.

---

## Test Deliverables

Planned test deliverables:

- **Test Plan:** This document and its revision history.
- **Test Scripts:** Automated tests where implemented and documented manual procedures for remaining cases.
- **Defect/Enhancement Logs:** Failures, reproducible steps, priority/severity, and corrective actions.
- **Test Result Reports:** Completed test tables with actual observations, status, dates, test build/Git commit, and evidence.
- **Requirements Traceability:** Mapping from CSCI 497 requirement IDs and fit criteria to test cases.

Results must reflect tests actually executed. Planned tests remain not run until evidence is recorded.

---

## Schedule

This is a proposed sequence. Add actual dates and completion status based on the course deadline and instructor feedback.

| Milestone | Activity | Completion evidence |
|---|---|---|
| 1 | Review requirements and revise this plan. | Requirement IDs and fit criteria mapped to cases. |
| 2 | Execute unit tests for income calculations and input handling. | Recorded inputs, expected values, and observed results. |
| 3 | Execute career browsing/filter/search/confirmation regression tests. | Completed regression table. |
| 4 | Execute API, database, wage-data, and income integration tests. | API/database comparisons and results. |
| 5 | Execute multiplayer and WebSocket tests. | Observations from a multi-client session. |
| 6 | Conduct user-acceptance testing. | Completed cases and feedback summary. |
| 7 | Correct defects and retest affected features. | Updated defect log and retest evidence. |
| 8 | Prepare final test summary. | Coverage, outcomes, known defects, and remaining risks. |

---

## Risks

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
