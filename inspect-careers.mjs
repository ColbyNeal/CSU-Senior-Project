import { Database } from "bun:sqlite";

const db = new Database("data/career_explorer.db", {
  readonly: true
});

console.log("\n--- TABLE STRUCTURES ---");
console.log(
  db.query(`
    SELECT name, sql
    FROM sqlite_master
    WHERE type = 'table'
      AND name IN ('careers', 'bls_occupation_snapshots')
  `).all()
);

const codes = ["15-1252", "15-1212", "15-1211"];

console.log("\n--- EXISTING CAREERS ---");
console.log(
  db.query(`
    SELECT soc_code, title
    FROM careers
    WHERE soc_code IN (?, ?, ?)
    ORDER BY title
  `).all(...codes)
);

console.log("\n--- EXISTING WAGE SNAPSHOTS ---");
console.log(
  db.query(`
    SELECT soc_code, occupation_title, data_year, data_period,
           mean_annual_wage
    FROM bls_occupation_snapshots
    WHERE soc_code IN (?, ?, ?)
    ORDER BY soc_code, data_year DESC
  `).all(...codes)
);

db.close();
