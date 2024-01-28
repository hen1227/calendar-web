import React from 'react';
import {createContext, useContext, useEffect, useState} from "react";
import sendAPICall from "../APIs";
import {subscribeUserToPush} from "../Notifications";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    async function fetchUserData() {
        try {
            // From local storage, get the token
            const token = localStorage.getItem('token');

            if (token) {
                const user = {token: token}
                sendAPICall( '/account', 'GET', null, user, true)
                    .then((data) => {
                        // //console.log("Got user data", data)
                        data.token = token;
                        //console.log("Logging in ", data);
                        subscribeUserToPush()
                            .then(pushSubscription => {
                                sendAPICall('/saveDeviceToken', 'POST', {deviceToken: JSON.stringify(pushSubscription), platform: "web"}, data, false)
                            })
                            .catch(err => console.log(err));
                        setCurrentUser(data);
                    })
                    .catch(err => {
                        console.log("Error getting user data", err);
                        setCurrentUser(null);
                    });
            }
        } catch (error) {
            localStorage.removeItem('token');
        } finally {
            setIsAuthLoading(false);
        }
    }

    useEffect(() => {
        fetchUserData().then(r => console.log('fetched user data'));
    }, []);

    const login = async (token, user) => {
        await localStorage.setItem('token', token);
        user.token = token;
        setCurrentUser(user);
    };

    const logout = async () => {
        localStorage.removeItem('token');
        setCurrentUser(null);
    };

    const refreshCurrentUser = async () => {
        fetchUserData().then(r => console.log('fetched user data'));
    }

    const value = {
        currentUser,
        isAuthLoading,
        login,
        logout,
        refreshCurrentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
