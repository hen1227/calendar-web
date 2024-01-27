import {useEffect, useState} from "react";
import sendAPICall from "./APIs";
import {useAuth} from "./AuthContext";
import './LoginPage.css'
import {useNavigate} from "react-router-dom";


const LoginPage = () => {
    const { currentUser, login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoginView, setIsLoginView] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (currentUser) {
            navigate('/account');
        }
    }, [currentUser, navigate]);

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            // Alert.alert('Error', 'Passwords do not match!');
            setErrorMessage("Passwords do not match");
            return;
        }

        try {
            sendAPICall('/register', 'POST', {
                email,
                password
            }, null, true)
                .then((data) => {
                    setErrorMessage("");
                    login(data.accessToken, data.user);

                    navigate('/account');
                }).catch((err) => {
                    //console.log("error: " + err);
                setErrorMessage(err.message);
            });
        } catch (err) {
            //console.log("error: " + err);
            setErrorMessage(err.message);
        }
    };

    const handleLogin = async () => {
        try {
            sendAPICall('/login', 'POST', {
                email,
                password
            }, null, true)
                .then((data) => {
                    setErrorMessage("");

                    login(data.accessToken, data.user);

                    navigate('/account');
                }).catch((err) => {
                //console.log("error: " + err);
                setErrorMessage(err.message);
            });
        } catch (err) {
            //console.log("error: " + err);
            setErrorMessage(err.message);
        }
    };

    return (
        <div className={'main-view'} style={{justifyContent: "center", height: '100%'}}>
            <h1 style={{margin:0}}>Login</h1>
            <form className={'login-form'}>
                <p>Email</p>
                <input className={'input'} type="email" id="email" name="email" placeholder="Email" value={email} onChange={(e) => {setEmail(e.target.value)}} required/>
                <p>Password</p>
                {/* Set this input to password state */}
                <input className={'input'} type="password" id="password" name="password" placeholder="Password" value={password} onChange={(e) => {setPassword(e.target.value)}} required/>


                {isLoginView ? (
                    <div>
                        <p className={'error-text'}>{errorMessage}</p>
                        <button className={'button'} type='button' onClick={handleLogin}>Login</button>
                        <button className={'button'} type='button' onClick={() => setIsLoginView(false)}>Don't have an account? Sign Up</button>
                    </div>
                ) : (
                    <div>
                        <p>Confirm Password</p>
                        <input className={'input'} type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => {setConfirmPassword(e.target.value)}} required/>
                        <p className={'error-text'}>{errorMessage}</p>
                        <button className={'button'} type='button' onClick={handleSignUp}>Sign Up</button>
                        <button className={'button'} type='button' onClick={() => setIsLoginView(true)}>Already have an account? Login</button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default LoginPage;
