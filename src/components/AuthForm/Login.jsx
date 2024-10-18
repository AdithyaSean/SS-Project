import { Alert, AlertIcon, Button, Input } from "@chakra-ui/react";
import { useState } from "react";
import useLogin from "../../hooks/useLogin";
import ReCAPTCHA from "react-google-recaptcha";
import DOMPurify from "dompurify";

const Login = () => {
    const [inputs, setInputs] = useState({
        email: "",
        password: "",
    });
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const { loading, error, login } = useLogin();

    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    };

    const handleLogin = () => {
        if (recaptchaToken) {
            login(inputs);
        } else {
            alert("Please complete the reCAPTCHA");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs((prevInputs) => ({
            ...prevInputs,
            [name]: DOMPurify.sanitize(value),
        }));
    };

    return (
        <>
            <Input
                placeholder='Email'
                fontSize={14}
                type='email'
                size={"sm"}
                name="email"
                value={inputs.email}
                onChange={handleInputChange}
            />
            <Input
                placeholder='Password'
                fontSize={14}
                size={"sm"}
                type='password'
                name="password"
                value={inputs.password}
                onChange={handleInputChange}
            />
            <ReCAPTCHA
                sitekey="6LfE-icqAAAAAK86ptEg_5_yHv-yaa5TS1FhknLj"
                onChange={handleRecaptchaChange}
            />
            {error && (
                <Alert status='error' fontSize={13} p={2} borderRadius={4}>
                    <AlertIcon fontSize={12} />
                    {error.message}
                </Alert>
            )}
            <Button
                w={"full"}
                colorScheme='blue'
                size={"sm"}
                fontSize={14}
                isLoading={loading}
                onClick={handleLogin}
            >
                Log in
            </Button>
        </>
    );
};

export default Login;