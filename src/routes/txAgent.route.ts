import { Router } from 'express';
import { createAccount, getAgentAddress, executeAgent, createAgentRule } from '../controllers/txAgent.controller';

const router = Router();

router.get('/agent', getAgentAddress);
router.post('/createAccount', createAccount);
router.post('/executeTransaction', executeAgent);
router.post('/createAgentRule', createAgentRule);

export default router;