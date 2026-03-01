import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
  subscriber: {
    type: Schema.Types.ObjectId, // one who is subscribing to a channel
    ref: "User",
  },
  channel: {
    type: Schema.Types.ObjectId, // one to whom the subsrciber is subscribing
    ref: "User",
  },
});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
