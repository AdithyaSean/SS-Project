import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import useShowToast from "./useShowToast";
import { auth, firestore } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import useAuthStore from "../store/authStore";

const useLogin = () => {
	const showToast = useShowToast();
	const [signInWithEmailAndPassword, , loading, error] = useSignInWithEmailAndPassword(auth);
	const loginUser = useAuthStore((state) => state.login);

	const login = async (inputs) => {
		if (!inputs.email || !inputs.password) {
			return showToast("Error", "Please fill all the fields", "error");
		}
		try {
			// Check PostgreSQL first
			const response = await fetch('http://localhost:5033/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: inputs.email, password: inputs.password }),
			});

			if (response.ok) {
				const userData = await response.json();
				console.log("User authenticated successfully with PostgreSQL");
				// Ensure all necessary fields are present
				const userDocWithoutPassword = {
					uid: userData.uid,
					email: userData.email,
					username: userData.username,
					fullName: userData.full_name,
					bio: userData.bio || "",
					profilePicURL: userData.profile_pic_url || "",
					followers: userData.followers || [],
					following: userData.following || [],
					posts: userData.posts || [],
					createdAt: userData.created_at,
				};
				localStorage.setItem("user-info", JSON.stringify(userDocWithoutPassword));
				loginUser(userDocWithoutPassword);
				showToast("Success", "Logged in successfully", "success");
			}else {
				console.log("PostgreSQL authentication failed. Falling back to Firebase...");
			}

			// If not found in PostgreSQL, try Firebase
			console.log("Attempting to authenticate with Firebase...");
			const userCred = await signInWithEmailAndPassword(inputs.email, inputs.password);

			if (userCred) {
				console.log("User authenticated successfully with Firebase");
				const docRef = doc(firestore, "users", userCred.user.uid);
				const docSnap = await getDoc(docRef);
				if (docSnap.exists()) {
					const userData = docSnap.data();
					localStorage.setItem("user-info", JSON.stringify(userData));
					loginUser(userData);
				} else {
					console.log("No user data found in Firestore");
					showToast("Error", "User data not found", "error");
				}
			} else {
				console.log("Firebase authentication failed");
				showToast("Error", "Invalid email or password", "error");
			}
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};
	

	return { loading, error, login };
};

export default useLogin;
