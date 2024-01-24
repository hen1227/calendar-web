import React, {useEffect, useState} from "react";
import { useParams } from 'react-router-dom';
import sendAPICall from "../auth/APIs";
import Button from "../components/Button";
import {useAuth} from "../auth/AuthContext";
import {toast} from "react-toastify";

const ClubDetailsPage = () => {
    const { currentUser } = useAuth();

    const { clubId } = useParams();
    const [clubData, setClubData] = useState(null);


    const reloadClubData = () => {
        sendAPICall(`/club/${clubId}`, 'GET', {}, null, false)
            .then((data) => {
                //console.log(data);
                setClubData(data);
            })
    }

    useEffect(() => {
        if (!clubId) return;
        reloadClubData();
    }, [clubId]);

    const becomeMember = () => {
        sendAPICall(`/${clubId}/subscribe`, 'POST', {}, currentUser, false)
            .then((data) => {
                //console.log(data);
                reloadClubData();
                toast.success(`You are now a member of ${clubData.name}`)
            })
            .catch((error) => {
                console.error('Error:', error);
                toast.error('Failed to join club!')
            });
    }

    const leaveClub = () => {
        sendAPICall(`/${clubId}/unsubscribe`, 'POST', {}, currentUser, false)
            .then((data) => {
                //console.log(data);
                reloadClubData();
                toast.success(`You are no longer a member of ${clubData.name}`)
            })
            .catch((error) => {
                console.error('Error:', error);
                toast.error('Failed to leave club!')
            });
    }

    return (
        <div className={'main-view'}>
            {clubData && (
                <div>
                    <h1 style={{margin: '50px auto', width:'fit-content', borderBottomStyle: 'solid', borderBottomColor: clubData.color, borderBottomWidth: 2}}>{clubData.name}</h1>
                    <p>{clubData.description}</p>
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

                    {currentUser && clubData.subscribers && clubData.subscribers.length > 0 && !clubData.subscribers.find((subscriber) => subscriber.email === currentUser.email) && (
                        <Button style={{marginTop: 50}} title={'Join Club'} onClick={becomeMember}/>
                    )}
                    {currentUser && clubData.subscribers && clubData.subscribers.length === 0 && (
                        <Button style={{marginTop: 50}} title={'Join Club'} onClick={becomeMember}/>
                    )}
                    {currentUser && clubData.subscribers && clubData.subscribers.length > 0 && clubData.subscribers.find((subscriber) => subscriber.email === currentUser.email) && (
                        <Button style={{marginTop: 50}} title={'Leave Club'} color={'#1040AA30'} borderColor={'#1040AACC'} onClick={leaveClub}/>
                    )}

                </div>
            )}
            {!clubData && (
                <div>
                    <h1>Club not found</h1>
                </div>
            )}
        </div>
    )
}

export default ClubDetailsPage;
