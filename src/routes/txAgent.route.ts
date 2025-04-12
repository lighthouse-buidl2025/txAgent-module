import { Router } from 'express';
import { createAccount, getAgentAddress, executeAgent, createAgentRule, getRules } from '../controllers/txAgent.controller';

const router = Router();

router.get('/agent', getAgentAddress);
router.post('/createAccount', createAccount);
router.post('/executeTransaction', executeAgent);
router.post('/createAgentRule', createAgentRule);
router.get('/getRules/:address', getRules);

export default router;