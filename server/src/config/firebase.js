
require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env'),
});

const {
  initializeApp,
  applicationDefault,
  cert,
  getApps,
} = require('firebase-admin/app');

const { getFirestore } = require('firebase-admin/firestore');

if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error('FIREBASE_PROJECT_ID is missing');
}

function getFirebaseCredential() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    let serviceAccount;

    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
    }

    return cert(serviceAccount);
  }

  return applicationDefault();
}

const firebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: getFirebaseCredential(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

const db = getFirestore(firebaseApp);

module.exports = { db };
