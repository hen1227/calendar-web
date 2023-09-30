import {useState} from "react";
import './ColorPicker.css'
import Sketch from "@uiw/react-color-sketch";
import sendAPICall from "../auth/APIs";
import {Navigate} from "react-router-dom";
import {useAuth} from "../auth/AuthContext";
import {useNavigate} from "react-router-dom";

const CreateClubPage = () => {
    const {currentUser} = useAuth();
    const navigate = useNavigate();

    const [color, setColor] = useState('#ff6600');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async () => {

        if(!name || !description){
            setErrorMessage('Please fill out all fields.');
            return;
        }

        const clubData = {
            name: name,
            description: description,
            color: color
        };

        sendAPICall('/club', 'POST', clubData, currentUser)
            .then((response) => {
                navigate('/create');
            })
            .catch((error) => {
                console.log(error);
                setErrorMessage(`${error}`);
            });
    }

    if(!currentUser){
        return <Navigate to={'/create'} />
    }

    return (
        <div className={'main-view'} data-color-mode={'dark'}>
            <h1>Create Club Page</h1>

            <form className={'login-form'}>
                <p>Club Name</p>
                <input className={'input'} type="text" name="clubName" placeholder={'e.g., Computer Science Club'} value={name} onChange={(e) => {setName(e.target.value)}} />
                <p>Description / Mission Statement</p>
                <input className={'input'} type="text" name="clubDescription" placeholder={'e.g., A place for everyone to learn and explore all things Computer Science.'} value={description} onChange={(e) => {setDescription(e.target.value)}} />
                <p>Color</p>
                <Sketch
                    color={color}
                    onChange={(color) => setColor(color.hex)}
                    disableAlpha={true}
                    style={{width: '75%', margin:'auto'}}
                    presetColors={[]}
                />
                <p className={'error-text'}>{errorMessage}</p>
                <button className={'button'} type={'button'} style={{backgroundColor: '#1040AA30', borderColor: '#1040AACC'}} onClick={handleSubmit}>Submit</button>
            </form>
        </div>
    );
}

export default CreateClubPage;
