import mongoose, { Schema, Document } from 'mongoose';

export interface IRule extends Document {
  dappName: string;
  method: string;
  params: Record<string, any>;
  userAddress?: string;
  extra?: Record<string, any>; // 추가 요청사항
}

const RuleSchema: Schema = new Schema<IRule>(
  {
    dappName: { type: String, required: true },
    method: { type: String, required: true },
    params: {
      type: Schema.Types.Mixed,
      required: true,
    },
    userAddress: {
      type: String,
      lowercase: true,
      required: false,
    },
    extra: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const RuleModel = mongoose.model<IRule>('Rule', RuleSchema);
