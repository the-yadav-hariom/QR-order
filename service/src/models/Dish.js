/**
 * Mongoose Dish Schema & Model
 */
export async function getDishModel() {
  const { default: mongoose } = await import('mongoose');

  const dishSchema = new mongoose.Schema(
    {
      id: { type: String, required: true, unique: true },
      name: { type: String, required: true, trim: true },
      price: { type: Number, required: true },
      station: { type: String, enum: ['TANDOOR', 'CURRY', 'DRINKS'], default: 'CURRY' },
      prep: { type: Number, default: 10 },
      cat: { type: String, default: 'Mains' },
      emoji: { type: String, default: '🍽️' },
      bg: { type: String, default: '#FFE9D6' },
      desc: { type: String, default: '' },
      al: [{ type: String }],
      size: { type: Boolean, default: false },
      spice: { type: Boolean, default: false },
      img: { type: String, default: '' },
      avail: { type: Boolean, default: true },
    },
    { timestamps: true }
  );

  return mongoose.models.Dish || mongoose.model('Dish', dishSchema);
}
