import mongoose from "mongoose";

const registrationRuleSchema = new mongoose.Schema(
  {
    rules: { type: [String], default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.RegistrationRule ?? mongoose.model("RegistrationRule", registrationRuleSchema);
