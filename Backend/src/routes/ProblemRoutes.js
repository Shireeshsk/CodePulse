import express from 'express'
import { createProblem } from '../controllers/problem/createProblem.js'
import { createTestCases } from '../controllers/problem/createTestCases.js'
import { createLanguageBoilerPlate } from '../controllers/problem/createLanguageBoilerPlate.js'
import { getProblemsList } from '../controllers/problem/getProblemsList.js'
import { ProblemStructure } from '../controllers/problem/problemStructure.js'
import { updateProblem } from '../controllers/problem/updateProblem.js'
import { updateTestCase } from '../controllers/problem/updateTestCase.js'
import { deleteTestCase } from '../controllers/problem/deleteTestCase.js'
import { getProblemForEdit } from '../controllers/problem/getProblemForEdit.js'
import { updateLanguageBoilerPlate } from '../controllers/problem/updateLanguageBoilerPlate.js'
import { deleteProblem } from '../controllers/problem/deleteProblem.js'

import { authenticate, authorize } from '../middleware/Auth.js'
export const router = express.Router()

// Create operations
router.post('/create-problem', authenticate, authorize('ADMIN'), createProblem)
router.post('/create-language', authenticate, authorize('ADMIN'), createLanguageBoilerPlate)
router.post('/create-testcases', authenticate, authorize('ADMIN'), createTestCases)

// Update operations
router.put('/update-problem/:problemId', authenticate, authorize('ADMIN'), updateProblem)
router.put('/update-testcase/:testCaseId', authenticate, authorize('ADMIN'), updateTestCase)
router.put('/update-boilerplate/:id', authenticate, authorize('ADMIN'), updateLanguageBoilerPlate)
router.delete('/delete-testcase/:testCaseId', authenticate, authorize('ADMIN'), deleteTestCase)
router.delete('/delete-problem/:problemId', authenticate, authorize('ADMIN'), deleteProblem)

// Read operations
router.get('/get-problems', authenticate, getProblemsList)
router.get('/edit/:problemId', authenticate, authorize('ADMIN'), getProblemForEdit)
router.get('/:id', authenticate, ProblemStructure)