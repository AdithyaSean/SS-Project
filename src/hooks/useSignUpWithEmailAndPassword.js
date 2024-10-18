import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, firestore } from "../firebase/firebase";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";
import bcrypt from 'bcryptjs';
//import pool from '../postgres/db.js'; 

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
			if (!newUser && error) {
				showToast("Error", error.message, "error");
				return;
			}
			if (newUser) {
				// Hash the password before saving it to firestore
				const hashedPassword = await bcrypt.hash(inputs.password, 10);

				const userDoc = {
					uid: newUser.user.uid,
					email: inputs.email,
					username: inputs.username,
					password: hashedPassword,
					fullName: inputs.fullName,
					bio: "",
					profilePicURL: "",
					followers: [],
					following: [],
					posts: [],
					createdAt: Date.now(),
				};
				
				await setDoc(doc(firestore, "users", newUser.user.uid), userDoc);

				// Send user data to PostgreSQL through backend
				const response = await fetch('http://localhost:5033/api/signup', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(userDoc),
				});
				showToast("Success", "User Register successfully", "success");
				if (!response.ok) {
					throw new Error('Failed to save user data to PostgreSQL');
				}

				// Remove the password before storing in local storage or state management
                const { password, ...userDocWithoutPassword } = userDoc;
                localStorage.setItem("user-info", JSON.stringify(userDocWithoutPassword));
                loginUser(userDocWithoutPassword);
			}
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	return { loading, error, signup };
};

export default useSignUpWithEmailAndPassword;
