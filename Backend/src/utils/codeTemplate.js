/**
 * Combines user code with test runner template
 * @param {string} userCode - The user's submitted code
 * @param {string} template - The test runner template (optional)
 * @returns {string} - Combined code ready for execution
 */
export function combineCodeWithTemplate(userCode, template) {
    // If no template provided, return user code as-is (backward compatibility)
    if (!template || template.trim() === '') {
        return userCode;
    }

    // Replace {user_code} placeholder with actual user code
    const combinedCode = template.replace('{user_code}', userCode);

    return combinedCode;
}

/**
 * Get test runner template for a specific problem and language
 * @param {object} pool - Database pool
 * @param {string} problemId - Problem ID
 * @param {string} language - Programming language
 * @returns {Promise<string|null>} - Test runner template or null
 */
export async function getTestRunnerTemplate(pool, problemId, language) {
    try {
        const result = await pool.query(
            `SELECT test_runner_template 
             FROM problem_languages 
             WHERE problem_id = $1 AND language = $2`,
            [problemId, language]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0].test_runner_template;
    } catch (error) {
        console.error('Error fetching test runner template:', error);
        return null;
    }
}
