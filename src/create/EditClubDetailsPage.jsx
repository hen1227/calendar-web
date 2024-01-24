import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from 'react-router-dom';
import {useAuth} from "../auth/AuthContext";
import sendAPICall from "../auth/APIs";
import Button from "../components/Button";
import Sketch from "@uiw/react-color-sketch";
import {toast} from "react-toastify";

const EditClubDetailsPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [color, setColor] = useState('#ff6600');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [updated, setUpdated] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    const { clubId } = useParams();
    const [clubData, setClubData] = useState(null);


    const reloadClubData = () => {
        sendAPICall(`/club/${clubId}`, 'GET', {}, null, false)
            .then((data) => {
                //console.log(data);
                setClubData(data);
                setName(data.name);
                setDescription(data.description);
                setColor(data.color);
            })
            .catch((error) => {
                console.error('Error:', error);
                toast.error('Failed to load club data!')
                navigate('/create');
            });
    }

    useEffect(() => {
        if (!clubId) return;

        reloadClubData();
    }, [clubId]);

    const onDeleteClicked = () => {
        if(window.confirm("Are you sure you want to delete this club? This action cannot be undone.")) {
            sendAPICall(`/club/${clubId}`, 'DELETE', {}, currentUser, false)
                .then((data) => {
                    //console.log(data);
                    toast.success('Deleted club!');
                    navigate('/create');
                })
                .catch((error) => {
                    console.error('Error:', error);
                    toast.error('Failed to delete club!');
                });
        }
    }

    const onUpdate = () => {
        if(!updated) return;
        if(!name || !description){
            setErrorMessage('Please fill out all fields.');
            return;
        }
        sendAPICall(`/club/${clubId}`, 'POST', {name: name, description: description, color: color}, currentUser, false)
            .then((data) => {
                toast.success('Successfully updated club!');
                navigate('/create');
            })
            .catch((error) => {
                toast.error('Failed to update club!');
            });
    }

    return (
        <div>
            <div className={'main-view'}  data-color-mode={'dark'}>
                {clubData && (
                    <div style={{overflowY: "scroll"}}>
                        <h1 style={{margin: '50px auto', width:'fit-content', borderBottomStyle: 'solid', borderBottomColor: clubData.color, borderBottomWidth: 2}}>{clubData.name}</h1>
                        <form className={'login-form'}>
                            <input className={'input'} type="text" name="clubName" placeholder={'e.g., Computer Science Club'} value={name} onChange={(e) => {setName(e.target.value); setUpdated(true)}} />
                            <input className={'input'} type="text" name="clubDescription" placeholder={'e.g., A place for everyone to learn and explore all things Computer Science.'} value={description} onChange={(e) => {setDescription(e.target.value)}} />
                            <Sketch
                                color={color}
                                onChange={(color) => setColor(color.hex)}
                                disableAlpha={true}
                                style={{width: '75%', margin:'auto'}}
                                presetColors={[]}
                            />
                            <p className={'error-text'}>{errorMessage}</p>
                            <button className={'button'} type={'button'} disabled={!updated} style={{color: updated ? '#fff' : '#aaa', backgroundColor: updated ? '#1040AA30' : '#43456030', borderColor: updated ? '#1040AACC' : '#434560CC'}} onClick={onUpdate}>Update</button>
                        </form>
                        <Button title={'Create Event'} onClick={()=>{navigate('/create/event', {state: {club: clubData}})}} />
                        <h3 style={{marginTop: 50}}>Leaders</h3>
                        {clubData.leaders && clubData.leaders.length > 0 && clubData.leaders.map((leader) => {
                            return (
                                <p key={leader.email}>{leader.email}</p>
                            )}
                        )}
                        {clubData.leaders && clubData.leaders.length === 0 && (
                            <p>This club somehow has no leaders!</p>
                        )}
                        <h3 style={{marginTop: 50}}>Members</h3>
                        {clubData.subscribers && clubData.subscribers.length > 0 && clubData.subscribers.map((subscriber) => {
                            return (
                                <p key={subscriber.email}>{subscriber.email}</p>
                            )}
                        )}
                        {clubData.subscribers && clubData.subscribers.length === 0 && (
                            <p>This club has no members yet. :(</p>
                        )}
                        <button style={{backgroundColor: '#f003', borderColor: '#f00c'}} className={'button corner-button'} onClick={onDeleteClicked}>Delete</button>

                    </div>
                )}
                {!clubData && (
                    <div>
                        <h1>Club not found</h1>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EditClubDetailsPage;
