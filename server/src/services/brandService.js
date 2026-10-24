
const { db } = require("../config/firebase");

const brandsCollection = db.collection("brands");

async function getAllBrands() {
  const snapshot = await brandsCollection.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getBrandById(id) {
  const doc = await brandsCollection.doc(id).get();

  if (!doc.exists) return null;

  return { id: doc.id, ...doc.data() };
}

async function createBrand(data) {
  const now = new Date().toISOString();

  const brand = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await brandsCollection.add(brand);

  return { id: docRef.id, ...brand };
}

async function updateBrand(id, data) {
  const docRef = brandsCollection.doc(id);
  const existing = await docRef.get();

  if (!existing.exists) return null;

  const updatedData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  // Preserve the original creation date.
  delete updatedData.createdAt;

  await docRef.update(updatedData);

  return {
    id,
    ...existing.data(),
    ...updatedData,
  };
}

async function deleteBrand(id) {
  const docRef = brandsCollection.doc(id);
  const existing = await docRef.get();

  if (!existing.exists) return false;

  await docRef.delete();
  return true;
}

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
