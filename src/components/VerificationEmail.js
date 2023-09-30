import sendAPICall from "../auth/APIs";

export async function sendVerificationEmail(user){
    sendAPICall(`/sendVerificationEmail`, 'POST', {}, user)
    .then(data => {
        console.log('Success:', data);
        window.alert('Verification email sent!');
        return data;
    })
    .catch((error) => {
        console.error('Error:', error);
        window.alert('Verification email failed to send!');
    });
}
