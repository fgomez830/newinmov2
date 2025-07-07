// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from 'uuid'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
        apiKey: "AIzaSyDtCkksbpVRp4xoQVFG1LJUxgpEQsXkz0c",
 authDomain: "newinmobiliaria-c207f.firebaseapp.com",
projectId: "newinmobiliaria-c207f",
storageBucket: "newinmobiliaria-c207f.firebaseapp.com", // 🔥 CORRECTO
messagingSenderId: "577408488764",
appId: "1:577408488764:web:59283af902890cd4f47a39",
measurementId: "G-2C1HFC2KTQ"};
// const firebaseConfig = {
//   apiKey: "AIzaSyA4J8kdynv0nEqkl8nmpl_HOwVKXV1cx5w",
//   authDomain: "inmobiliaria-d4b5d.firebaseapp.com",
//   projectId: "inmobiliaria-d4b5d",
//   storageBucket: "inmobiliaria-d4b5d.appspot.com",
//   messagingSenderId: "555047143209",
//   appId: "1:555047143209:web:b66878ba63d3c694439938"
// };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export async function uploadFile(file: File): Promise<string> {
    const storageRef = ref(storage, v4());
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
}
