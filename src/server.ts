import app from './app';
import dotenv from 'dotenv';
import { startRuleScheduler } from './ruleRunner';

dotenv.config();

startRuleScheduler();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`User module listening on port ${PORT}`);
});
