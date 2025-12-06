import { MigraineAttackCollection, type MigraineAttack } from "../database/models/migraineAttacks.js";
import { Types } from "mongoose";
import { createCrudService } from "./crudServiceFactory.js";

const service = createCrudService<MigraineAttack>(MigraineAttackCollection, "Migraine attack");

export const createMigraineAttack = service.create;
export const getAllMigraineAttacks = service.getAll;
export const getMigraineAttackById = service.getById;
export const updateMigraineAttackById = service.updateById;
export const deleteMigraineAttackById = service.deleteById;

export const getMigraineAttacksForPatient = (patientId: string, from?: Date, to?: Date) => {
  const query: Record<string, unknown> = { patientId: new Types.ObjectId(patientId) };
  if (from || to) {
    const range: Record<string, Date> = {};
    if (from) range.$gte = from;
    if (to) range.$lte = to;
    query.startDateTime = range;
  }
  return MigraineAttackCollection.find(query).sort({ startDateTime: -1 });
};

export const completeMigraineAttack = (id: string, payload: Partial<MigraineAttack>) => {
  return MigraineAttackCollection.findByIdAndUpdate(
    id,
    { ...payload, endDateTime: payload.endDateTime ?? new Date() },
    { new: true, runValidators: true }
  );
};

export const getMigraineCalendar = async (patientId: string, month: number, year: number) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  const patientObjectId = new Types.ObjectId(patientId);

  const items = await MigraineAttackCollection.aggregate([
    {
      $match: {
        patientId: patientObjectId,
        startDateTime: { $gte: start, $lte: end },
      },
    },
    {
      $project: {
        day: { $dateToString: { format: "%Y-%m-%d", date: "$startDateTime" } },
      },
    },
    {
      $group: {
        _id: "$day",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return items.map((item) => ({ date: item._id as string, count: item.count as number }));
};

export default service;
