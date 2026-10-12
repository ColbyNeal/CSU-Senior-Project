import { Database } from "bun:sqlite";

const db = new Database("data/career_explorer.db");

const careers = [
  { soc_code: "15-1252", title: "Software Developers" },
  { soc_code: "15-1212", title: "Information Security Analysts" },
  { soc_code: "15-1211", title: "Computer Systems Analysts" }
];

try {
  db.run("BEGIN");

  const insert = db.prepare(`
    INSERT INTO careers (
      soc_code,
      title,
      data_source,
      bls_title,
      mapping_type
    )
    SELECT ?, ?, 'BLS OEWS', ?, 'direct'
    WHERE NOT EXISTS (
      SELECT 1 FROM careers WHERE soc_code = ?
    )
  `);

  for (const career of careers) {
    const result = insert.run(
      career.soc_code,
      career.title,
      career.title,
      career.soc_code
    );

    console.log(
      `${career.title}: ${
        result.changes === 1 ? "ADDED" : "already exists; skipped"
      }`
    );
  }

  db.run("COMMIT");
  console.log("\nCareer records updated successfully.");
} catch (error) {
  db.run("ROLLBACK");
  console.error("Update failed; changes rolled back.", error);
  process.exitCode = 1;
} finally {
  db.close();
}
