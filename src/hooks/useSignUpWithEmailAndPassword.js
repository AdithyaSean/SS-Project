import axios from 'axios';
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, firestore } from "../firebase/firebase";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";

const useSignUpWithEmailAndPassword = () => {
    const [createUserWithEmailAndPassword, , loading, error] = useCreateUserWithEmailAndPassword(auth);
    const showToast = useShowToast();
    const loginUser = useAuthStore((state) => state.login);

    const signup = async (inputs) => {
        if (!inputs.email || !inputs.password || !inputs.username || !inputs.fullName) {
            showToast("Error", "Please fill all the fields", "error");
            return;
        }

        const usersRef = collection(firestore, "users");

        const q = query(usersRef, where("username", "==", inputs.username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            showToast("Error", "Username already exists", "error");
            return;
        }

        try {
            const newUser = await createUserWithEmailAndPassword(inputs.email, inputs.password);
            if (!newUser) {
                return;
            }

            const userDoc = {
                uid: newUser.user.uid,
                email: inputs.email,
                username: inputs.username,
                fullName: inputs.fullName,
                bio: "",
                profilePicURL: "",
                followers: [],
                following: [],
                posts: [],
                createdAt: Date.now(),
            };

            await setDoc(doc(firestore, "users", newUser.user.uid), userDoc);
            localStorage.setItem("user-info", JSON.stringify(userDoc));
            loginUser(userDoc);

            // Send a request to the backend to insert into PostgreSQL
            await axios.post('http://localhost:5033/api/signup', {
                email: inputs.email,
                username: inputs.username,
                fullName: inputs.fullName,
                password: inputs.password, // Plain password sent, hashing done on the server
            });

            showToast("Success", "User created successfully", "success");
        } catch (error) {
            showToast("Error", error.message, "error");
        }
    };

    return { loading, error, signup };
};

export default useSignUpWithEmailAndPassword;