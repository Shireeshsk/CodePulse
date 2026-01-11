import fs from "fs";
import { pool } from "../../config/database.js";
import { generateFile } from "../../utils/generateFile.js";
import { executeInDocker } from "../../utils/executeInDocker.js";

export const Submit = async (req, res) => {
  const client = await pool.connect();
  let filepath = null;

  try {
    const { language, code, input = "" } = req.body;
    const userId = req.user.id;

    if (!userId || !language || !code) {
      return res.status(400).json({
        success: false,
        message: "userId, language, and code are required",
      });
    }

    await client.query("BEGIN");

    const { rows } = await client.query(
      `
      INSERT INTO submissions (user_id, code, status)
      VALUES ($1, $2, 'PENDING')
      RETURNING id
      `,
      [userId, code]
    );

    const submissionId = rows[0].id;

    filepath = await generateFile(language, code);

    await client.query(
      `UPDATE submissions SET status = 'RUNNING' WHERE id = $1`,
      [submissionId]
    );

    await client.query("COMMIT");

    let output = "";
    let finalStatus = "EXECUTED";

    try {
      output = await executeInDocker(language, filepath, input);
    } catch (err) {
      output = err.toString();
      finalStatus = output.includes("Timeout") ? "TIMEOUT" : "ERROR";
    }

    await pool.query(
      `
      UPDATE submissions
      SET status = $1,
          output = $2,
          executed_at = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [finalStatus, output, submissionId]
    );

    return res.status(201).json({
      success: true,
      submissionId,
      status: finalStatus,
      output,
    });
  } catch (err) {
    await client.query("ROLLBACK");

    return res.status(500).json({
      success: false,
      message: "Submission failed",
      error: err.message,
    });
  } finally {
    client.release();

    if (filepath && fs.existsSync(filepath)) {
      try {
        await fs.promises.unlink(filepath);
      } catch {}
    }
  }
};
