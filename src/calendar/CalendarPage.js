import React, {useEffect, useRef, useState} from 'react';
import './CalendarPage.css';
import sendAPICall from "../auth/APIs";
import {useAuth} from "../auth/AuthContext";
import {getScheduleForWeek, isPast} from "./SchoolClassesCalendar";
import {useNavigate} from "react-router-dom";
import {ReactComponent as FullScreenIcon} from '../icons/up-right-and-down-left-from-center-solid.svg';
import {ReactComponent as MinimizeScreenIcon} from '../icons/down-left-and-up-right-to-center-solid.svg';
import {ReactComponent as XIcon} from '../icons/xmark-solid.svg';
import {toast} from "react-toastify";


const CalendarPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [allEvents, setAllEvents] = useState([]);
    const [sequentialEvents, setSequentialEvents] = useState([]);
    const [allSubscribedClubs, setAllSubscribedClubs] = useState([]);
    const [allClubs, setAllClubs] = useState([]);
    const [allClasses, setAllClasses] = useState([]);
    const [allLedClubs, setAllLedClubs] = useState([]);
    const [isOnline, setIsOnline] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [loadingCalendar, setLoadingCalendar] = useState(true);

    const [showingAll, setShowingAll] = useState(false);

    const scrollRef = useRef(null);
    const [currentFullScreen, setCurrentFullScreen] = useState(null);

    const loadSequentialEvents = (events) => {
        // Assuming `allEvents` exists in the outer scope and is an array of event objects.
        if (!events || !Array.isArray(events)) {
            console.error("allEvents should be an array");
            return;
        }

        // Sort events chronologically
        const sortedEvents = events.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

        const getDateKey = (date) => {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const inOneWeek = new Date(today);
            inOneWeek.setDate(today.getDate() + 7);

            const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

            if (date.toDateString() === today.toDateString()) {
                return "Today";
            } else if (date.toDateString() === tomorrow.toDateString()) {
                return "Tomorrow";
            } else if (date >= today && date <= inOneWeek) {
                return "Next " + daysOfWeek[date.getDay()];
            } else {
                return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
            }
        };

        const getTimeString = (date) => {
            let hours = date.getHours();
            let minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            return `${hours}:${minutes} ${ampm}`;
        };

        const result = {};

        sortedEvents.forEach(event => {
            const eventDate = new Date(event.datetime);
            const key = getDateKey(eventDate);

            if (!result[key]) {
                result[key] = {
                    dayTitle: key,
                    day: `${eventDate.getMonth() + 1}-${eventDate.getDate()}-${eventDate.getFullYear()}`,
                    eventsList: []
                };
            }

            const eventWithTime = {
                ...event,
                time: getTimeString(eventDate)
            };

            result[key].eventsList.push(eventWithTime);
        });

        //console.log('Sequential events:', result);

        setSequentialEvents(result);
    };

    const fetchData = async () => {
        setIsOnline(false);
        setLoadingCalendar(true);

        let savedAllEvents = localStorage.getItem('allEvents');
        let savedAllClubs = localStorage.getItem('allClubs');
        if (savedAllEvents && savedAllClubs) {
            setAllEvents(JSON.parse(savedAllEvents));
            setAllClubs(JSON.parse(savedAllClubs));
        }

        sendAPICall('/allData', 'GET', {}, currentUser)
            .then((data) => {
                //console.log(data)
                //console.log(currentUser)
                setAllEvents(data.allEvents);
                setAllClubs(data.allClubs);
                setAllSubscribedClubs(data.subscribedClubs);
                setAllLedClubs(data.ledClubs);


                setIsOnline(true);
                saveLastUpdated(new Date());
                setLoadingCalendar(false);

                loadSequentialEvents(data.allEvents);

                // Save to local storage
                localStorage.setItem('allEvents', JSON.stringify(data.allEvents));
                localStorage.setItem('allClubs', JSON.stringify(data.allClubs));
            })
            .catch((error) => {
                console.error(error);

                updateLastUpdated();

                toast.warning("You are offline. Some data may be outdated.");
                setLoadingCalendar(false);
            });
    }

    useEffect(() => {
        fetchData().then(r => console.log("Fetched data!"));
    }, [currentUser]);


    useEffect(()=> {
        async function loadSchedule() {
            try {
                const schedule = await getScheduleForWeek();
                setAllClasses(schedule);
                //console.log(schedule);
            } catch (error) {
                console.error('Error fetching schedule:', error);
            } finally {
                setLoadingCalendar(false);
            }
        }
        loadSchedule();
    }, []);

    const saveLastUpdated = async (date) => {
        try {
            localStorage.setItem('lastUpdated', JSON.stringify(date));
            setLastUpdated(date);
        } catch (error) {
            console.error(error);
        }
    }

    const updateLastUpdated = async () => {
        try {
            const value = localStorage.getItem('lastUpdated');
            if (value !== null) {
                setLastUpdated(JSON.parse(value));
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        // Set initial scroll position
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;

        scrollClassesToToday();
    });

    const scrollClassesToToday = () => {
        for(let i = 0; i < allClasses.length; i++) {
            for(let j = 0; j < allClasses[i].classTimes.length; j++) {
                const hasPast = isPast(allClasses[i].day, allClasses[i].classTimes[j].endTime);
                if(!hasPast) {
                    const element = document.getElementById(`${allClasses[i].day} – ${allClasses[i].classTimes[j].block}`);
                    if(element) {
                        element.scrollIntoView({behavior: "smooth", block: "center"});
                        return;
                    }
                }
            }
        }
    }

    const clickedClub = (clubId) => {
        navigate('/club/' + clubId)
    }

    async function deleteEventDialog(id) {

        if (!currentUser) {
            window.alert("You must be logged in to delete an event");
            return;
        }

        if (window.confirm("Are you sure you want to delete this event?"))
            deleteEvent(id).then(r => fetchData());
    }

    const deleteEvent = async (id) => {
        sendAPICall(`/events/${id}`, 'DELETE', {}, currentUser)
            .then((data)=>{

            })
            .catch(err => {

            })
    }

    const zoomInView = (index) => {
        // Get the indexth calendarColumn column and make its width 100%
        const calendarView = document.getElementsByClassName('calendarColumn')[index];
        calendarView.classList.add('fullscreen');

        // Make the other views display hidden.
        for(let i = 0; i < 3; i++) {
            if(i !== index) {
                const otherCalendarView = document.getElementsByClassName('calendarColumn')[i];
                otherCalendarView.classList.add('hidden');
            }
        }

        setCurrentFullScreen(index);
    }
    const zoomOutView = (index) => {
        // Get the indexth calendarColumn column and make its width 100%
        const calendarView = document.getElementsByClassName('calendarColumn')[index];
        calendarView.classList.remove('fullscreen');

        // Make the other views display hidden.
        for(let i = 0; i < 3; i++) {
            if(i !== index) {
                const otherCalendarView = document.getElementsByClassName('calendarColumn')[i];
                otherCalendarView.classList.remove('hidden');
            }
        }

        setCurrentFullScreen(-1);
    }

    return (
        <div className={'calendarViewsCollection'} ref={scrollRef}>
            <div className={'calendarColumn'}>
                <div className={'calendarView'}>
                    <div className={'corner-button fullscreen-button'} onClick={() => {if(currentFullScreen !== 0) {
                        zoomInView(0)
                    } else{
                        zoomOutView(0);
                    }}}>
                        {currentFullScreen === 0 && <MinimizeScreenIcon width={20} height={20} color={'#BEBEBEA0'} />}
                        {currentFullScreen !== 0 && <FullScreenIcon width={20} height={20} color={'#BEBEBEA0'} />}
                    </div>
                    <h1>Clubs</h1>
                    {allClubs && allClubs.map((club) => {
                        return (
                            <div onClick={()=> {clickedClub(club.id)}} key={club.name} style={{backgroundColor: club.color+"33", borderColor: club.color+"cc"}} className={'eventCard'}>
                                <h3>{club.name}</h3>
                                <p>{club.description}</p>
                            </div>
                        )}
                    )}
                    {(!allClubs || allClubs.length === 0) && <p>No clubs yet!</p>}
                </div>
                <div className={'footer'}>
                    <p className={'footer-left'}></p>
                    <p className={'footer-right'}>Club Events →</p>
                </div>
            </div>
            <div className={'calendarColumn'}>
                <div className={'calendarView'}>
                    <div className={'corner-button fullscreen-button'} onClick={() => {if(currentFullScreen !== 1) {
                        zoomInView(1)
                    } else{
                        zoomOutView(1);
                    }}}>
                        {currentFullScreen === 1 && <MinimizeScreenIcon width={20} height={20} color={'#BEBEBEA0'} />}
                        {currentFullScreen !== 1 && <FullScreenIcon width={20} height={20} color={'#BEBEBEA0'} />}
                    </div>
                    <h1>Club Events</h1>
                    <div className={currentFullScreen === 1 ? 'dayCollection' : ''}>
                        {sequentialEvents && Object.values(sequentialEvents) && Object.values(sequentialEvents).map((day) => {
                            const dayItem = day;

                            return (
                                <div className={currentFullScreen === 1 ? 'dayColumn' : ''}>
                                    <h2>{dayItem.dayTitle}</h2>
                                {dayItem.eventsList && dayItem.eventsList.map((event) => {

                                    let isSubbed = false;
                                    let isLed = false;

                                    if (allLedClubs !== [] && allSubscribedClubs !== [] && event.club != null) {
                                        const ledNames = allLedClubs.map((club) => club.name);
                                        const SubNames = allSubscribedClubs.map((club) => club.name);
                                        isLed = ledNames.includes(event.club);
                                        isSubbed = SubNames.includes(event.club);
                                    }

                                    return (
                                        <div key={event.name} style={{borderColor: event.color+"cc", backgroundColor: event.color+"33", position: 'relative'}} className={'eventCard'}>
                                            {isLed && (
                                                <div className={'corner-button close'} color={"#DD0000"} onClick={async () => {
                                                        await deleteEventDialog(event.id)
                                                }}>
                                                    <XIcon color={'#fff'} width={20} height={20} />
                                                </div>
                                            )}
                                            <h3 className={'clubName'}>{event.club}</h3>
                                            <h4 className={'title'}>{event.title}</h4>
                                            <div className={'eventDetails'}>
                                                <p>{event.location}</p>
                                                <p>{event.time}</p>
                                            </div>
                                        </div>
                                    )}
                                )}
                                </div>
                            )}
                        )}
                    </div>
                    {(!allEvents || allEvents.length === 0) && <p>No events yet!</p>}
                </div>
                <div className={'footer'}>
                    <p className={'footer-left'}> ← Clubs</p>
                    <p className={'footer-right'}>Classes →</p>
                </div>
            </div>
            <div className={'calendarColumn'}>
                <div className={'calendarView'}>
                    <div className={'corner-button fullscreen-button'} onClick={() => {if(currentFullScreen !== 2) {
                        zoomInView(2)
                    } else{
                        zoomOutView(2);
                    }}}>
                        {currentFullScreen === 2 && <MinimizeScreenIcon width={20} height={20} color={'#BEBEBEA0'} />}
                        {currentFullScreen !== 2 && <FullScreenIcon width={20} height={20} color={'#BEBEBEA0'} />}
                    </div>
                    <h1>Classes</h1>
                    <div className={currentFullScreen === 2 ? 'dayCollection' : ''}>
                        {allClasses && allClasses.map((day) => {
                            const dayItem = day;

                            return (
                                <div className={currentFullScreen === 2 ? 'dayColumn' : ''}>

                                <h2>{dayItem.day}</h2>
                                    {dayItem.classTimes.map((event) => {
                                        const hasPast = isPast(dayItem.day, event.endTime);

                                        return (
                                            <div id={`${dayItem.day} – ${event.block}`} key={`${dayItem.day} – ${event.block}`} style={ hasPast ? {backgroundColor: "#40604030", borderColor: "#406040CC", height: event.duration} : {backgroundColor: event.color+"33", borderColor: event.color+"cc", height: event.duration}} className={'eventCard'}>
                                                <div key={`details ${dayItem.day} – ${event.block}`} className={'eventDetails'}>
                                                    <span>{event.block + (event.name === '' ? '' : (" - " + event.name))}</span>
                                                    <span style={{padding: 30}}>{event.startTime} - {event.endTime}</span>
                                                </div>
                                            </div>
                                        )}
                                    )}
                                </div>
                            )}
                        )}
                        {(!allClasses || allClasses.length === 0) && <p>No classes yet!</p>}
                    </div>
                    <div className={'footer'}>
                        <p className={'footer-left'}> ← Club Events</p>
                        <p className={'footer-right'}></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CalendarPage;
