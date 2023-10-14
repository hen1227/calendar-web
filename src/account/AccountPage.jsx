import {useAuth} from "../auth/AuthContext";
import Button from "../components/Button";
import './AccountPage.css';
import sendAPICall from "../auth/APIs";
import {useNavigate} from "react-router-dom";
import {sendVerificationEmail} from "../components/VerificationEmail";
import {toast} from "react-toastify";

const AccountPage = () => {
    const {currentUser, logout} = useAuth();
    const navigate = useNavigate();



    const onDeleteClicked = () => {
        console.log("delete clicked");
        // Alert to confirm
        if (window.confirm( "Are you sure you want to delete your account? This action cannot be undone.")){
            console.log("confirmed");
            // Delete account
            sendAPICall(`/account`, 'DELETE', {}, currentUser, true)
                .then(data => {
                    console.log('Success:', data);

                    toast.success('Successfully deleted account!')
                    // Logout
                    logout();
                })
                .catch((error) => {
                    console.error('Error:', error);
                    toast.error('Failed to delete account!')
                });
        }


    }

    return (
        <div className={'main-view'}>
            <div style={{height: '70vh'}}>
                <h1 style={{marginTop: 50}}>Account</h1>
                {currentUser && (
                    <>
                        <button style={{backgroundColor: '#f003', borderColor: '#f00c'}} className={'corner-button'} onClick={onDeleteClicked}>Delete</button>
                        <p>Hello, {currentUser.email}!</p>
                        {currentUser.isVerified ?
                            // <p>You are verified!</p>
                            <span></span>
                            :
                            <>
                                <p>Email not verified yet.</p>
                                <Button title={"Resend verification email"} onClick={async ()=> {await sendVerificationEmail(currentUser)}} />
                            </>
                        }
                        {/*<Button title={'Customize Classes'} color={'#10AA4030'} borderColor={'#10AA40CC'} />*/}

                        <div>
                            <h4>Club Membership</h4>
                            <div style={{flexDirection: 'row'}}>
                                {currentUser.subscriptions && currentUser.subscriptions.length !== 0 && currentUser.subscriptions.map((club) => (
                                    <div className={'eventCard'} style={{backgroundColor: club.color+'30', borderColor: club.color+'CC', width: 'fit-content', padding: '2px 20px'}}>
                                        <h4 style={{padding: 0, margin: 0}}>{club.name}</h4>
                                    </div>
                                ))}
                            </div>
                            {(!currentUser.subscriptions || currentUser.subscriptions.length === 0) && <p>You are not a member of any clubs</p>}
                            {currentUser.leaders && currentUser.leaders.length !== 0 && (
                                <>
                                    <h4>Club Leadership</h4>
                                    {currentUser.leaders.map((club) => (
                                        <div className={'eventCard'} style={{backgroundColor: club.color+'30', borderColor: club.color+'CC', width: 'fit-content', padding: '2px 20px'}}>
                                            <h4 style={{padding: 0, margin: 0}}>{club.name}</h4>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </>
                )}
                {!currentUser && (
                    <Button title={'Login'} onClick={()=> navigate('/login')}/>
                )}
            </div>
            {currentUser && (
                <Button title={'Logout'} onClick={()=>{
                    logout();
                }} />
            )}
        </div>
    );
}

export default AccountPage;
