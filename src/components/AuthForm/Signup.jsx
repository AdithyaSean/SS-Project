import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, Button, Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { useState } from "react";
import useSignUpWithEmailAndPassword from "../../hooks/useSignUpWithEmailAndPassword";
import DOMPurify from 'dompurify';

const Signup = () => {
    const [inputs, setInputs] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const { loading, error, signup } = useSignUpWithEmailAndPassword();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs({ ...inputs, [name]: DOMPurify.sanitize(value) });
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
                placeholder='Username'
                fontSize={14}
                type='text'
                size={"sm"}
                name="username"
                value={inputs.username}
                onChange={handleInputChange}
            />
            <Input
                placeholder='Full Name'
                fontSize={14}
                type='text'
                size={"sm"}
                name="fullName"
                value={inputs.fullName}
                onChange={handleInputChange}
            />
            <InputGroup>
                <Input
                    placeholder='Password'
                    fontSize={14}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={inputs.password}
                    size={"sm"}
                    onChange={handleInputChange}
                />
                <InputRightElement h='full'>
                    <Button variant={"ghost"} size={"sm"} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                </InputRightElement>
            </InputGroup>

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
                onClick={() => signup(inputs)}
            >
                Sign Up
            </Button>
        </>
    );
};

export default Signup;