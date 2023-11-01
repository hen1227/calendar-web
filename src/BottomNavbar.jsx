import {Link} from "react-router-dom";
// import { ReactComponent as CreateIcon } from './icons/calendar-plus-solid.svg';
import { ReactComponent as CalendarIcon } from './icons/calendar-solid.svg';
import { ReactComponent as AccountIcon } from './icons/user-solid.svg';
import { ReactComponent as DiningIcon } from './icons/burger-solid.svg';
import {useState} from "react";



const BottomNavbar = () => {

    // const [currentPath, setCurrentPath] = useState(window.location.href);
    const [currentPath, setCurrentPath] = useState("");

    return (
        <div className="bottom-navbar">
            {/* Highlight the current link */}
            {/*<Link to={'/create'} className={'navbar-link'} style={{color: currentPath.endsWith('/create') ? '#3030ff' : '#BEBEBE'}}>*/}
            {/*    <CreateIcon color={ currentPath.endsWith('/create') ? '#3030ff' : '#BEBEBE'} width={'2em'} height={'2em'}/>*/}
            {/*    <span>Create</span>*/}
            {/*</Link>*/}
            <Link to={'/account'} className={'navbar-link'} style={{color: currentPath.endsWith('/account') ? '#3030ff' : '#BEBEBE'}}>
                <AccountIcon color={ currentPath.endsWith('/account') ? '#3030ff' : '#BEBEBE'} width={'2em'} height={'2em'}/>
                <span>Account</span>
            </Link>
            <Link to={'/'} className={'navbar-link'} style={{color: currentPath.endsWith('/') ? '#3030ff' : '#BEBEBE'}}>
                <CalendarIcon color={ currentPath.endsWith('/') ? '#3030ff' : '#BEBEBE'} width={'2em'} height={'2em'}/>
                <span>Calendar</span>
            </Link>
            <Link to={'/dining'} className={'navbar-link'} style={{color: currentPath.endsWith('/dining') ? '#3030ff' : '#BEBEBE'}}>
                <DiningIcon color={ currentPath.endsWith('/dining') ? '#3030ff' : '#BEBEBE'} width={'2em'} height={'2em'}/>
                <span>Dining</span>
            </Link>
        </div>
    );
}

export default BottomNavbar;
