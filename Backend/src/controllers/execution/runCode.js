import fs from "fs";
import { pool } from "../../config/database.js";
import { generateFile } from "../../utils/generateFile.js";
import { executeInDocker } from "../../utils/executeInDocker.js";
import { combineCodeWithTemplate, getTestRunnerTemplate } from "../../utils/codeTemplate.js";

/**
 * RUN CODE - Execute against visible test cases + custom input
 * NOT saved to database
 */
export const runCode = async (req, res) => {
    let filepath = null;

    try {
        const { problem_id, language, code, customInputs = [] } = req.body;

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

        // Fetch visible (sample) test cases
        const { rows: testCases } = await pool.query(
            `SELECT input, output FROM test_cases 
       WHERE problem_id = $1 AND visibility = 'SAMPLE' 
       ORDER BY created_at`,
            [problem_id]
        );

        // Generate code file with combined code
        filepath = await generateFile(language, finalCode);

        const results = [];

        // Run against sample test cases
        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            try {
                const startTime = Date.now();
                const output = await executeInDocker(language, filepath, tc.input);
                const executionTime = Date.now() - startTime;

                const passed = output.trim() === tc.output.trim();

                results.push({
                    type: 'sample',
                    testCase: i + 1,
                    passed,
                    input: tc.input,
                    expectedOutput: tc.output,
                    actualOutput: output,
                    executionTime,
                    status: passed ? 'PASSED' : 'WRONG_ANSWER'
                });
            } catch (err) {
                const errorMsg = err.toString();
                results.push({
                    type: 'sample',
                    testCase: i + 1,
                    passed: false,
                    input: tc.input,
                    expectedOutput: tc.output,
                    actualOutput: errorMsg,
                    status: errorMsg.includes("Timeout") ? "TIMEOUT" : "ERROR",
                });
            }
        }

        // Run against custom inputs if provided
        for (let i = 0; i < customInputs.length; i++) {
            const customInput = customInputs[i];
            try {
                const startTime = Date.now();
                const output = await executeInDocker(language, filepath, customInput);
                const executionTime = Date.now() - startTime;

                results.push({
                    type: 'custom',
                    testCase: i + 1,
                    passed: null, // No expected output for custom
                    input: customInput,
                    expectedOutput: null,
                    actualOutput: output,
                    executionTime,
                    status: 'EXECUTED'
                });
            } catch (err) {
                const errorMsg = err.toString();
                results.push({
                    type: 'custom',
                    testCase: i + 1,
                    passed: false,
                    input: customInput,
                    expectedOutput: null,
                    actualOutput: errorMsg,
                    status: errorMsg.includes("Timeout") ? "TIMEOUT" : "ERROR",
                });
            }
        }


        // Determine overall status based on results
        let overallStatus = 'ACCEPTED';
        if (results.some(r => r.status === 'TIMEOUT')) {
            overallStatus = 'TIME_LIMIT_EXCEEDED';
        } else if (results.some(r => r.status === 'ERROR')) {
            overallStatus = 'RUNTIME_ERROR';
        } else if (results.some(r => r.passed === false)) {
            overallStatus = 'WRONG_ANSWER';
        }

        return res.status(200).json({
            success: true,
            status: overallStatus,
            results,
            summary: {
                totalTests: results.length,
                sampleTests: testCases.length,
                customTests: customInputs.length,
                passed: results.filter(r => r.passed === true).length,
                failed: results.filter(r => r.passed === false).length
            }
        });


    } catch (err) {
        console.error("Run code error:", err);
        return res.status(500).json({
            success: false,
            message: "Code execution failed",
            error: err.message,
        });
    } finally {
        if (filepath && fs.existsSync(filepath)) {
            try {
                await fs.promises.unlink(filepath);
            } catch { }
        }
    }
};
