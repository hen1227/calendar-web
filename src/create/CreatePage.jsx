import {useEffect, useState} from "react";
import sendAPICall from "../auth/APIs";
import {useAuth} from "../auth/AuthContext";
import LoginPage from "../auth/LoginPage";
import Button from "../components/Button";
import {Link, useNavigate} from "react-router-dom";


const CreatePage = () => {
    const {currentUser} = useAuth();
    const navigate = useNavigate();

    const [leadClubs, setLeadClubs] = useState([]);


    useEffect(() => {
        if (!currentUser || !currentUser.id) return;
        sendAPICall(`/${currentUser.id}/ledClubs`, 'GET', {}, null)
            .then(data => {
                setLeadClubs(data);
            })
            .catch(error => {
                console.error('Error fetching lead clubs:', error);
            });
    }, [currentUser]);

    if(!currentUser) {
        return (
            <LoginPage />
        );
    }else{
        return (
          <div className={'main-view'}>
                <h1>Lead Clubs</h1>
              {leadClubs.length !== 0 &&
                  <div style={{height: '70svh'}}>
                      {leadClubs.map((club) => (
                          <div className={'eventCard'} style={{backgroundColor: club.color+'30', borderColor: club.color+'CC'}} onClick={()=>{navigate(`/edit/${club.id}`)}}>
                              <h2>{club.name}</h2>
                              <p>{club.description}</p>
                          </div>
                      ))}
                  </div>
              }
              {leadClubs.length === 0 && <p style={{height: '70svh'}}>You are not leading any clubs</p>}
              <Link to='/create/club'>
                <Button title={'Create New Club'} color={'#105588'} />
              </Link>
          </div>
        );
    }
}

export default CreatePage;
