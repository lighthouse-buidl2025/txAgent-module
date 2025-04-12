import { Request, Response } from 'express';
import { getMappedAccount, createAccountOnChain, excuteTransaction } from '../services/core.service';
import { createAgentRuleService,getRulesByUserAddressService } from '../services/rule.service';


export const createAccount = async (req: Request, res: Response): Promise<void> => {
  const { address } = req.body;

  if (!address) {
    res.status(400).json({ success: false, message: 'address is required' });
  }

  try {
    const userAddress = address.toLowerCase();

    // 1. 컨트랙트 상에서 맵핑 조회
    const onChainMapped = await getMappedAccount(userAddress);

    // 2. 없으면 새로 생성
    const agentAddress = await createAccountOnChain(userAddress);

    res.status(201).json({ success: true, message: 'Account mapping created', data: agentAddress });
  } catch (err: any) {
    console.error('❌ createAccount controller error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAgentAddress = async (req: Request, res: Response): Promise<void> => {
    const { address } = req.query;
    
    if (!address) {
        res.status(400).json({ success: false, message: 'address is required' });
        return;
    }
    
    try {
        const userAddress = address.toString().toLowerCase();
        const agentAddress = await getMappedAccount(userAddress);

        res.status(200).json({ success: true, message: 'Agent address fetched', data: agentAddress });
    } catch (err: any) {
        console.error('❌ getAgentAddress controller error:', err.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
        return;
    }
}

export const executeAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const txHash = await excuteTransaction(req.body);
    res.status(200).json({ success: true, message: 'Transaction executed', txHash });
  } catch (err: any) {
    console.error('❌ executeAgent controller error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export const createAgentRule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { interval, timeout, maxExecutions, ...rest } = req.body;

    const extra = {
      ...(rest.extra || {}),
      ...(interval ? { intervalSeconds: interval } : {}),
      ...(timeout ? { timeoutSeconds: timeout } : {}),
      ...(maxExecutions ? { maxExecutions } : {}),
    };

    const rule = await createAgentRuleService({ ...rest, extra });

    res.status(201).json({
      success: true,
      message: 'Agent rule created',
      data: rule,
    });
  } catch (err: any) {
    console.error('❌ createAgentRule error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getRules = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;

    if (!address) {
      res.status(400).json({ success: false, message: 'Address is required' });
      return;
    }

    const rules = await getRulesByUserAddressService(address);

    res.status(200).json({
      success: true,
      message: 'Rules fetched',
      data: rules,
    });
  } catch (err: any) {
    console.error('❌ getRules error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};