import mongoose, { Schema, Document } from 'mongoose';

export interface ICalldataParam {
  name: string;
  type: string;
}

export interface IDapp extends Document {
  name: string;
  address: string;
  method: string;
  calldataTemplate: ICalldataParam[];
  requiresApproval: boolean;
}

const CalldataParamSchema = new Schema<ICalldataParam>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
  },
  { _id: false }
);

const DappSchema: Schema = new Schema<IDapp>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true, lowercase: true },
    method: { type: String, required: true },
    calldataTemplate: {
      type: [CalldataParamSchema],
      required: true,
    },
    requiresApproval: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 유니크 키: 동일 dApp 내 동일 method 중복 방지
DappSchema.index({ name: 1, address: 1, method: 1 }, { unique: true });

export const DappModel = mongoose.model<IDapp>('Dapp', DappSchema);
