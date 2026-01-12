import fs from "fs";
import { pool } from "../../config/database.js";
import { generateFile } from "../../utils/generateFile.js";
import { executeInDocker } from "../../utils/executeInDocker.js";
import { combineCodeWithTemplate, getTestRunnerTemplate } from "../../utils/codeTemplate.js";

/**
 * SUBMIT CODE - Execute against ALL test cases (visible + hidden)
 * Saved to database in problem_submissions table
 */
export const submitCode = async (req, res) => {
    const client = await pool.connect();
    let filepath = null;

    try {
        const { problem_id, language, code } = req.body;
        const userId = req.user.id;

        if (!problem_id || !language || !code) {
            return res.status(400).json({
                success: false,
                message: "problem_id, language, and code are required",
            });
        }

        // Fetch test runner template for this problem+language combination
        const template = await getTestRunnerTemplate(pool, problem_id, language);

        // Combine user code with template (if template exists)
        const finalCode = combineCodeWithTemplate(code, template);

        // Fetch ALL test cases (both SAMPLE and HIDDEN)
        const { rows: testCases } = await pool.query(
            `SELECT id, input, output, visibility FROM test_cases 
       WHERE problem_id = $1 
       ORDER BY visibility DESC, created_at`,
            [problem_id]
        );

        if (testCases.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No test cases found for this problem",
            });
        }

        // Generate code file with combined code
        filepath = await generateFile(language, finalCode);

        const results = [];
        let finalStatus = 'ACCEPTED';
        let totalExecutionTime = 0;

        // Execute against all test cases
        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];

            try {
                const startTime = Date.now();
                const output = await executeInDocker(language, filepath, tc.input);
                const executionTime = Date.now() - startTime;
                totalExecutionTime += executionTime;

                const passed = output.trim() === tc.output.trim();

                results.push({
                    testCaseId: i + 1,
                    visibility: tc.visibility,
                    passed,
                    input: tc.visibility === 'SAMPLE' ? tc.input : null, // Hide hidden test case inputs
                    expectedOutput: tc.visibility === 'SAMPLE' ? tc.output : null,
                    actualOutput: tc.visibility === 'SAMPLE' ? output : null,
                    executionTime,
                    status: passed ? 'PASSED' : 'WRONG_ANSWER'
                });

                // If any test case fails, mark as REJECTED
                if (!passed && finalStatus === 'ACCEPTED') {
                    finalStatus = 'REJECTED';
                }

            } catch (err) {
                const errorMsg = err.toString();
                const isTimeout = errorMsg.includes("Timeout");
                const status = isTimeout ? "TIMEOUT" : "ERROR";

                results.push({
                    testCaseId: i + 1,
                    visibility: tc.visibility,
                    passed: false,
                    input: tc.visibility === 'SAMPLE' ? tc.input : null,
                    expectedOutput: tc.visibility === 'SAMPLE' ? tc.output : null,
                    actualOutput: tc.visibility === 'SAMPLE' ? errorMsg : null,
                    status,
                });

                // Update final status
                if (isTimeout) {
                    finalStatus = 'TIME_LIMIT_EXCEEDED';
                } else if (finalStatus === 'ACCEPTED') {
                    finalStatus = 'RUNTIME_ERROR';
                }

                // Stop execution on first error (like LeetCode)
                break;
            }
        }

        // Calculate test results
        const passedTests = results.filter(r => r.passed === true).length;
        const totalTests = testCases.length;

        // Save submission to database
        await client.query("BEGIN");

        const { rows: submissionRows } = await client.query(
            `INSERT INTO problem_submissions 
       (problem_id, user_id, language, code, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, submitted_at`,
            [problem_id, userId, language, code, finalStatus]
        );

        const submission = submissionRows[0];

        await client.query("COMMIT");

        return res.status(201).json({
            success: true,
            submissionId: submission.id,
            status: finalStatus,
            testResults: {
                passed: passedTests,
                total: totalTests,
                percentage: Math.round((passedTests / totalTests) * 100)
            },
            executionTime: totalExecutionTime,
            results: results.map(r => ({
                testCase: r.testCaseId,
                visibility: r.visibility,
                passed: r.passed,
                status: r.status,
                // Only show details for sample test cases or if error occurred
                input: r.input,
                expectedOutput: r.expectedOutput,
                actualOutput: r.actualOutput,
                executionTime: r.executionTime
            })),
            submittedAt: submission.submitted_at
        });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Submit code error:", err);

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
            } catch { }
        }
    }
};
