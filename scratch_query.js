import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrqBu0oL1GSw59Ge-zUsudaevEpcA3RYw",
  authDomain: "endocompany-app.firebaseapp.com",
  projectId: "endocompany-app",
  storageBucket: "endocompany-app.firebasestorage.app",
  messagingSenderId: "957097292902",
  appId: "1:957097292902:web:ca2c231138dd8f27f7e9a7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("=== LENDO COLEÇÃO: tipos_equipamento ===");
  try {
    const snapTipos = await getDocs(collection(db, 'tipos_equipamento'));
    console.log("Encontrados %d documentos em tipos_equipamento:", snapTipos.size);
    snapTipos.forEach(doc => {
      console.log("ID:", doc.id, "-> Data:", doc.data());
    });
  } catch (err) {
    console.error("Erro ao ler tipos_equipamento:", err.message);
  }

  console.log("\n=== LENDO COLEÇÃO: equipamentos_endocompany ===");
  try {
    const snapEquips = await getDocs(collection(db, 'equipamentos_endocompany'));
    console.log("Encontrados %d documentos em equipamentos_endocompany:", snapEquips.size);
    snapEquips.forEach(doc => {
      console.log("ID:", doc.id, "-> Tipo:", doc.data().tipo_equipamento, "| Nome:", doc.data().nome_produto);
    });
  } catch (err) {
    console.error("Erro ao ler equipamentos_endocompany:", err.message);
  }
}

run();
