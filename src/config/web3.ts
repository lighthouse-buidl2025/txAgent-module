import Web3 from 'web3';
import dotenv from 'dotenv';

dotenv.config();

const  rpcUrl = process.env.RPC_URL;
export const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl as string));