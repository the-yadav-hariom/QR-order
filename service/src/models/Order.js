/**
 * Mongoose Order Schema & Model
 */
export async function getOrderModel() {
  const { default: mongoose } = await import('mongoose');

  const orderItemSchema = new mongoose.Schema(
    {
      id: String,
      name: String,
      qty: Number,
      size: String,
      spice: String,
      price: Number,
      station: String,
      deal: Boolean,
    },
    { _id: false }
  );

  const orderSchema = new mongoose.Schema(
    {
      id: { type: Number, required: true, unique: true },
      table: { type: String, required: true },
      items: [orderItemSchema],
      status: {
        type: String,
        enum: ['PENDING_APPROVAL', 'COOKING', 'READY', 'SERVED', 'PAID'],
        default: 'PENDING_APPROVAL',
      },
      createdAt: { type: Number, default: () => Date.now() },
      cookStart: { type: Number },
      tickets: { type: mongoose.Schema.Types.Mixed, default: {} },
      total: { type: Number, required: true },
      cleared: { type: Boolean, default: false },
    },
    { timestamps: true }
  );

  return mongoose.models.Order || mongoose.model('Order', orderSchema);
}
