// ✅ ruleRunner.ts
import { RuleModel } from './models/rule.model';
import { executeRule } from './services/rule.service';

export const startRuleScheduler = () => {
  setInterval(async () => {
    const now = Date.now();
    const rules = await RuleModel.find({ "extra.intervalSeconds": { $exists: true } });

    for (const rule of rules) {
      const extra = rule.extra || {};
      const interval = extra.intervalSeconds * 1000;
      const last = extra.lastExecutedAt || 0;
      const executedCount = extra.executedCount || 0;
      const maxExecutions = extra.maxExecutions || Infinity;

      if (executedCount >= maxExecutions) {
        console.log(`🛑 Rule ${rule._id} skipped: maxExecutions reached.`);
        continue;
      }

      if (now - last >= interval) {
        const timeout = (extra.timeoutSeconds || 0) * 1000;

        setTimeout(async () => {
          try {
            await executeRule(rule);
            rule.extra = {
              ...extra,
              executedCount: executedCount + 1,
              lastExecutedAt: Date.now(),
            };
            await rule.save();

            console.log(`✅ Executed rule ${rule._id} [${executedCount + 1}/${maxExecutions}]`);
          } catch (err: any) {
            console.error(`❌ Failed to execute rule ${rule._id}:`, err.message);
          }
        }, timeout);
      }
    }
  }, 10 * 1000);
};