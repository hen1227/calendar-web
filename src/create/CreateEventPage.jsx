import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import sendAPICall from "../auth/APIs";
import {useAuth} from "../auth/AuthContext";
import {toast} from "react-toastify";
// import 'react-calendar/dist/Calendar.css';
// import 'react-clock/dist/Clock.css';
import Datetime from 'react-datetime';
import './Datetime.css';


const CreateEventPage = () => {
    const { currentUser } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();

    const dateToNearest15Minutes = (date) => {
        const minutes = date.getMinutes();
        date.setMinutes(minutes + (15 - (minutes % 15)));
        return date;
    }

    const [name, setName] = useState('');
    const [locationInput, setLocation] = useState('');
    const [datetime, setDatetime] = useState(dateToNearest15Minutes(new Date()));

    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if(!location.state) {
            navigate('/');
        }
    }, [location]);

    const handleSubmit = async () => {
        if(!name || !locationInput || !datetime) {
            setErrorMessage('Please fill out all fields.');
            return;
        }
        const event = {
            title: name,
            location: locationInput,
            datetime: datetime,
            sendNotification: true
        }

        sendAPICall(`/${location.state.club.id}/events`, 'POST', event, currentUser, false)
            .then(data => {
                //console.log(data);
                toast.success('Created event!');
                navigate(`/edit/${location.state.club.id}`);
            })
            .catch(error => {
                console.error('Error creating event:', error);
                toast.error('Failed to create event!');
                setErrorMessage('Failed to create event.');
            })
    }

    return (
        <div className={'main-view'}>
            <h1>Create Event for <span style={{color: location.state.club.color}}>{location.state.club.name}</span></h1>
            <form className={'login-form'}>
                <p>Event title</p>
                <input className={'input'} type="text" name="eventName" placeholder={'e.g., Weekly Meeting'} value={name} onChange={(e) => {setName(e.target.value)}} />
                <p>Location</p>
                <input className={'input'} type="text" name="eventLocation" placeholder={'e.g., Lindsay 213.'} value={locationInput} onChange={(e) => {setLocation(e.target.value)}} />
                <p>Date & Time</p>
                <Datetime timeConstraints={{minutes: {min: 0, max: 59, step: 15}, seconds: {min: 0, max: 0, step: 60}}} onChange={(e)=>{
                    setDatetime(e);
                }} value={datetime} />
                <p className={'error-text'}>{errorMessage}</p>
                <button className={'button'} type={'button'} style={{backgroundColor: '#1040AA30', borderColor: '#1040AACC'}} onClick={handleSubmit}>Submit</button>
            </form>
        </div>
    )
}

export default CreateEventPage;
