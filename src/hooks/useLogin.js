import axios from 'axios';
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import useShowToast from "./useShowToast";
import { auth, firestore } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import useAuthStore from "../store/authStore";
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT;

const useLogin = () => {
    const showToast = useShowToast();
    const [signInWithEmailAndPassword, , loading, error] = useSignInWithEmailAndPassword(auth);
    const loginUser = useAuthStore((state) => state.login);

    const login = async (inputs) => {
        if (!inputs.email || !inputs.password) {
            return showToast("Error", "Please fill all the fields", "error");
        }
        try {
            const userCred = await signInWithEmailAndPassword(inputs.email, inputs.password);

            if (userCred) {
                const docRef = doc(firestore, "users", userCred.user.uid);
                const docSnap = await getDoc(docRef);
                localStorage.setItem("user-info", JSON.stringify(docSnap.data()));
                loginUser(docSnap.data());

                // Fetch user data from PostgreSQL
                const response = await axios.post(`http://localhost:${port}/api/login`, {
                    uid: userCred.user.uid,
                });

                if (response.data) {
                    localStorage.setItem("user-info", JSON.stringify(response.data));
                    loginUser(response.data);
                }
            }
        } catch (error) {
            showToast("Error", error.message, "error");
        }
    };

    return { loading, error, login };
};

export default useLogin;