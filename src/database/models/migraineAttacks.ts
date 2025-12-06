import { HydratedDocument, InferSchemaType, Schema, model, Types } from "mongoose";

const medicationSchema = new Schema(
  {
    // Опціональне посилання на довідник препаратів
    medicationId: { type: Types.ObjectId, ref: "medications" },
    // Назва препарату (якщо немає довідника або для дублікації назви)
    name: { type: String, trim: true, required: true },
    // Доза в міліграмах
    doseMg: { type: Number },
    // Шлях введення
    route: {
      type: String,
      enum: ["oral", "sublingual", "intranasal", "iv", "im", "sc", "other"],
      default: "oral",
    },
    // Час прийому
    takenAt: { type: Date, required: true },
    // Через скільки хвилин відчуте полегшення
    reliefAfterMinutes: { type: Number },
    // Зміна інтенсивності болю за шкалою VAS (наприклад, -3)
    vasChange: { type: Number },
    // Суб'єктивна оцінка ефективності
    effective: { type: Boolean },
    // Побічні ефекти
    sideEffects: { type: [String], default: [] },
  },
  { _id: false }
);

const migraineAttackSchema = new Schema(
  {
    // Пацієнт, якому належить запис нападу
    patientId: { type: Types.ObjectId, ref: "patients", required: true },

    // --- Часові параметри нападу ---

    // Початок нападу (перші симптоми, за суб'єктивною оцінкою пацієнта)
    startDateTime: { type: Date, required: true },
    // Завершення нападу (може бути null, якщо ще триває)
    endDateTime: { type: Date },
    // Кешована тривалість у хвилинах
    durationMinutes: { type: Number },

    // Початок/кінець головного болю (можуть відрізнятися від загального початку/кінця нападу)
    headacheStartDateTime: { type: Date },
    headacheEndDateTime: { type: Date },

    // Початок/кінець аури (якщо була)
    auraStartDateTime: { type: Date },
    auraEndDateTime: { type: Date },

    // --- Інтенсивність болю ---

    // Інтенсивність болю за шкалою VAS 0-10 (поточна / загальна)
    intensityVAS: { type: Number, min: 0, max: 10 },
    // Інтенсивність на початку нападу
    intensityVASAtOnset: { type: Number, min: 0, max: 10 },
    // Максимальна інтенсивність
    intensityVASPeak: { type: Number, min: 0, max: 10 },
    // Інтенсивність після лікування (через певний час)
    intensityVASAfterTreatment: { type: Number, min: 0, max: 10 },

    // --- Локалізація і характер болю ---

    // Локації головного болю (структуровані теги)
    headacheLocations: {
      type: [String],
      default: [],
      // Приклад: ["left", "right", "bilateral", "frontal", "temporal", "occipital", "orbital", "neck", "diffuse"]
    },
    // Опис болю в інших частинах тіла
    otherBodyPainLocation: { type: String, trim: true },

    // --- Аура та симптоми ---

    // Чи була аура
    auraPresent: { type: Boolean, default: false },
    // Типи аури (зорові, сенсорні, мовні тощо)
    auraTypes: { type: [String], default: [] },

    // Додаткові симптоми під час нападу (вільний список)
    additionalSymptoms: { type: [String], default: [] },

    // Структуровані симптоми
    hasNausea: { type: Boolean, default: false },
    hasVomiting: { type: Boolean, default: false },
    hasPhotophobia: { type: Boolean, default: false },
    hasPhonophobia: { type: Boolean, default: false },
    hasOsmophobia: { type: Boolean, default: false },
    hasDizziness: { type: Boolean, default: false },

    // Продромальні симптоми (до початку болю)
    prodromeSymptoms: { type: [String], default: [] },
    // Постдромальні симптоми (після завершення болю)
    postdromeSymptoms: { type: [String], default: [] },

    // --- Тригери та контекст ---

    // Сирі (як ввів пацієнт) ймовірні тригери
    suspectedTriggers: { type: [String], default: [] },
    // Нормалізовані категорії тригерів
    triggerCategories: { type: [String], default: [] },
    // Текстовий опис/уточнення щодо тригерів
    triggerNotes: { type: String, trim: true },

    // Сон перед нападом
    sleepHoursPreviousNight: { type: Number },
    sleepQuality: {
      type: String,
      enum: ["very_good", "good", "normal", "poor", "very_poor"],
    },

    // Стрес та емоційний стан
    stressLevel: { type: Number, min: 0, max: 10 },
    significantStressEvent: { type: String, trim: true },
    moodBeforeAttack: {
      type: String,
      enum: ["normal", "anxious", "irritable", "depressed", "elevated"],
    },

    // Фізичне навантаження та екранний час
    physicalExertionLevel: {
      type: String,
      enum: ["none", "mild", "moderate", "intense"],
    },
    longScreenTimeHours: { type: Number },

    // Гормональні фактори (для жінок)
    isMenstrualRelated: { type: Boolean },
    cycleDay: { type: Number },

    // --- Медикаментозне лікування під час нападу ---

    medications: { type: [medicationSchema], default: [] },

    // --- Функціональний вплив нападу ---

    // Чи довелося пропустити роботу/навчання
    missedWorkOrSchool: { type: Boolean },
    // Скільки годин/днів втрачено
    missedHours: { type: Number },
    // Чи був потрібен постільний режим
    bedRestRequired: { type: Boolean },
    // Наскільки напад обмежив повсякденну активність (0–10)
    disabilityLevel: { type: Number, min: 0, max: 10 },

    // --- Оцінки, опитувальники, класифікація ---

    // Позначка, чи заповнений опитувальник McGill
    mcgillCompleted: { type: Boolean, default: false },
    // Короткий опис профілю болю за McGill
    mcgillPainProfile: { type: String, trim: true },

    // Клінічний тип нападу (за рішенням лікаря)
    attackType: {
      type: String,
      enum: [
        "migraine_without_aura",
        "migraine_with_aura",
        "probable_migraine",
        "tension_like",
        "cluster_like",
        "other",
      ],
    },

    // Статус-мігренозус (тривалий напад > 72 год)
    statusMigrainosus: { type: Boolean, default: false },

    // Індикатор виявлених "red flags"
    isRedFlag: { type: Boolean, default: false },
    // Які саме "red flags" спрацювали
    redFlags: { type: [String], default: [] },

    // --- Нотатки ---

    // Власні нотатки пацієнта про напад
    patientNotes: { type: String, trim: true },
    // Коментарі лікаря
    doctorNotes: { type: String, trim: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

migraineAttackSchema.index({ patientId: 1, startDateTime: -1 });
migraineAttackSchema.index({ isRedFlag: 1 });

export type MigraineAttack = InferSchemaType<typeof migraineAttackSchema>;
export type MigraineAttackDocument = HydratedDocument<MigraineAttack>;
export const MigraineAttackCollection = model<MigraineAttack>(
  "migraine_attacks",
  migraineAttackSchema
);
