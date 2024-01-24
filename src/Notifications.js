
export function subscribeUserToPush() {
    return navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: 'BNHlym0Av_2cO0381dGke89WoanLw4Uzt0Fnc8cszJyl09dWpFPkiksLKMaWIp6KkKxCQnuYBfPUd51ojqTW0Ew' // Public Key
            };
            return registration.pushManager.subscribe(subscribeOptions);
        })
        .then(pushSubscription => {
            //console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
            return pushSubscription;
        });
}

export const displayNotificationDirectly = async () => {
    if (Notification.permission !== 'granted') {
        //console.log('notification permission missing');
        return;
    }

    const options = {
        body: 'This notification is send without a server, directly by the browser',
        icon: 'images/checkmark.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore this new world',
                icon: 'images/checkmark.png',
            },
            {
                action: 'close',
                title: 'Close notification',
                icon: 'images/xmark.png',
            },
        ],
    };

    const registration = await navigator.serviceWorker.getRegistration();
    await registration.showNotification('Notification without Push API', options);
};
