import createHttpError from "http-errors";
import { HydratedDocument, Model } from "mongoose";

export type CrudService<TRaw> = {
  create: (payload: Partial<TRaw>) => Promise<HydratedDocument<TRaw>>;
  getAll: () => Promise<HydratedDocument<TRaw>[]>;
  getById: (id: string) => Promise<HydratedDocument<TRaw>>;
  updateById: (id: string, payload: Partial<TRaw>) => Promise<HydratedDocument<TRaw>>;
  deleteById: (id: string) => Promise<HydratedDocument<TRaw>>;
};

export const createCrudService = <TRaw>(
  collection: Model<TRaw>,
  entityName: string
): CrudService<TRaw> => {
  const notFoundError = () => createHttpError(404, `${entityName} not found`);

  return {
    create: (payload) => collection.create(payload),
    getAll: () => collection.find(),
    getById: async (id) => {
      const doc = await collection.findById(id);
      if (!doc) {
        throw notFoundError();
      }
      return doc;
    },
    updateById: async (id, payload) => {
      const doc = await collection.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });
      if (!doc) {
        throw notFoundError();
      }
      return doc;
    },
    deleteById: async (id) => {
      const doc = await collection.findByIdAndDelete(id);
      if (!doc) {
        throw notFoundError();
      }
      return doc;
    },
  };
};
