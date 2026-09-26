/**
 * Mongoose's default `toJSON` emits only `{ ...fields, _id }` — it does not
 * include the `id` virtual. The frontend models every entity with `id: string`
 * and uses `.id` for every read/write path, so without this transform
 * `product.id` is `undefined` and any update/delete 500s with a CastError.
 *
 * Applying this to a schema makes the serialized shape:
 *   { ...fields, id: "<hex string>", _id: "<hex string>" }
 *
 * Populated sub-documents (e.g. `product.categoryId` after `.populate()`) get
 * the same treatment via the `id` virtual, so they carry both `id` and `_id`.
 */
export function applyIdVirtual(schema) {
  const options = {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      if (ret._id !== undefined && ret.id === undefined) {
        ret.id = String(ret._id);
      }
      return ret;
    },
  };

  schema.set('toJSON', options);
  schema.set('toObject', options);

  return schema;
}
