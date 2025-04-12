import { web3 } from '../config/web3';
import dotenv from 'dotenv';

dotenv.config();

const privateKey = process.env.PRIVATE_KEY!;
export const account = web3.eth.accounts.privateKeyToAccount(privateKey);

web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
