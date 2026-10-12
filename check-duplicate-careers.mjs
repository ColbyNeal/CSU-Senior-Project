import { Database } from "bun:sqlite";

const db = new Database("data/career_explorer.db", {
  readonly: true
});

console.log("\n--- Duplicate career titles ---");
console.log(
  db.query(`
    SELECT title, COUNT(*) AS record_count,
           GROUP_CONCAT(soc_code, ', ') AS soc_codes
    FROM careers
    GROUP BY title
    HAVING COUNT(*) > 1
    ORDER BY title
  `).all()
);

console.log("\n--- Music Pastor records ---");
console.log(
  db.query(`
    SELECT id, soc_code, title, education_level, data_source
    FROM careers
    WHERE title LIKE '%Music Pastor%'
  `).all()
);

db.close();
