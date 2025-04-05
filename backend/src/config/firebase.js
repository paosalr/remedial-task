const admin = require('firebase-admin');

const serviceAccount = process.env.FIREBASE_CONFIG 
  ? JSON.parse(process.env.FIREBASE_CONFIG)
  : require('../../firebase-key.json'); 

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key.replace(/\\n/g, '\n') 
  }),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

console.log(`Firebase conectado a proyecto: ${serviceAccount.project_id}`);
const db = admin.firestore();

db.listCollections()
  .then(cols => console.log('Colecciones accesibles:', cols.map(c => c.id)))
  .catch(err => console.error('Error conectando a Firestore:', err));

module.exports = db;
