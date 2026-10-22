# BLS Career Explorer — Midterm Development Progress Update

**Course:** CSCI 498
**Date:** October 14, 2026

Development of BLS Career Explorer has progressed across the frontend, backend, database, career-data integration, and multiplayer budgeting-game functionality.

The application uses Vue 3 and Vite for its frontend, Bun for the backend, SQLite for local storage, and Bootstrap for styling. Career browsing and career-detail functionality have been developed to use stored occupational and wage information from the Bureau of Labor Statistics.

Recent work has focused on improving the career-selection experience in the multiplayer game. The player can filter careers by education level, search by career title, scroll through the available careers, and confirm a selection. The career confirmation screen displays available salary information and a monthly income breakdown, including estimated taxes, net income, tithe, and spendable income. The income breakdown was recently restored by connecting the existing calculation utility to the career-details loading process.

The application also includes game-lobby and multiplayer functionality. The next development priority is to test the full workflow, verify data and income calculations, identify and correct defects, and confirm that existing functionality remains stable after changes.

A first draft of the Software Test Plan has been prepared to organize unit, regression, integration, system, and user-acceptance testing. The plan will be revised to map test cases to the original CSCI 497 requirements and fit criteria. Planned tests must still be executed and their results documented; implementation progress alone does not establish that the software has passed testing.
