/**
 * Mongoose Table Schema & Model
 */
export async function getTableModel() {
  const { default: mongoose } = await import('mongoose');

  const tableSchema = new mongoose.Schema(
    {
      tableKey: { type: String, required: true, unique: true }, // e.g. 'T1' to 'T6'
      help: {
        type: new mongoose.Schema(
          {
            type: String,
            ts: Number,
          },
          { _id: false }
        ),
        default: null,
      },
      resolved: {
        type: new mongoose.Schema(
          {
            type: String,
            at: Number,
          },
          { _id: false }
        ),
        default: null,
      },
      paid: { type: Boolean, default: false },
      receipt: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    { timestamps: true }
  );

  return mongoose.models.Table || mongoose.model('Table', tableSchema);
}
