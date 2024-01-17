

async function getCalendarEvents(dateFrom, dateTo) {
    const formatDate = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const url = `https://www.googleapis.com/calendar/v3/calendars/spsacademiccal%40gmail.com/events?key=AIzaSyBxoBIAkPxbC1hZNtFOmpHFv_z2ya9I838&timeMin=${formatDate(dateFrom)}T00%3A00%3A00-05%3A00&timeMax=${formatDate(dateTo)}T00%3A00%3A00-05%3A00&singleEvents=true&maxResults=9999`;

    try {
        const response = await fetch(url, { method: 'GET' });
        if (response.status === 200) {
            const data = await response.json();
            const calendarEvents = data.items.filter(item => item.status === 'confirmed')
                .map(item => {
                    return {
                        name: item.summary,
                        startDateTime: new Date(item.start.dateTime),
                        endDateTime: new Date(item.end.dateTime)
                    };
                });
            return calendarEvents;
        } else {
            console.error(`Failed to retrieve calendar. Status Code: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`Error: ${error}`);
        return null;
    }
}
// Usage example:
// getCalendarEvents(new Date('2024-01-01'), new Date('2024-12-31'))
// .then(events => console.log(events));


async function createWeekSchedule() {
    // Define the week range
    const weekStart = new Date('2024-01-22'); // Start of the week
    const weekEnd = new Date('2024-01-29');   // End of the week

    const events = await getCalendarEvents(weekStart, weekEnd);

    // Initialize week schedule
    const weekSchedule = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
    };

    // Helper function to format events
    function formatEvent(event) {
        const startTime = event.startDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const endTime = event.endDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const duration = (event.endDateTime - event.startDateTime) / (1000 * 60); // Convert duration to minutes

        return {
            block: event.name,
            startTime,
            duration
        };
    }

    // Iterate over events and assign to the correct day
    events.forEach(event => {
        const dayOfWeek = event.startDateTime.toLocaleString('en-US', { weekday: 'long' });
        if (weekSchedule[dayOfWeek]) {
            weekSchedule[dayOfWeek].push(formatEvent(event));
        }
    });
    
    console.log(weekSchedule)
    return weekSchedule;
}



export const classDefaults = {
    'A': { block: 'A', name: 'Block A', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'B': { block: 'B', name: 'Block B', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'C': { block: 'C', name: 'Block C', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'D': { block: 'D', name: 'Block D', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'E': { block: 'E', name: 'Block E', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'F': { block: 'F', name: 'Block F', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },


    'Humflex': { block: 'Humflex', name: '', color: '#4080FF', duration: 25 },
    'House Meetings': { block: 'House Meetings', name: '', color: '#4080FF', duration: 25 },
    'Lunch': { block: 'Lunch', name: '', color: '#20EE75', duration: 45 },
    'Chapel': { block: 'Chapel', name: '', color: '#7520EE', duration: 25 },
};

export async function getClassList() {
    const blocks = ['A', 'B', 'C', 'D', 'E', 'F'];
    let classes = [];

    for(let i = 0; i < blocks.length; i++){
        classes.push(await getClassDetails(blocks[i]));
    }
    
    return classes;
}

export const weekSchedule = createWeekSchedule();/*{
    Monday: [
        {block: 'Chapel', startTime: '8:30 AM', duration: 25},
        {block: 'A', startTime: '9:05 AM', duration: 45},
        {block: 'Humflex', startTime: '9:55 AM', duration: 25},
        {block: 'B', startTime: '10:25 AM', duration: 45},
        {block: 'C', startTime: '11:15 AM', duration: 45, isLunch: true},
        {block: 'D', startTime: '12:50 PM', duration: 80},
        {block: 'E', startTime: '2:15 PM', duration: 45},
    ],
    Tuesday: [
        {block: 'Chapel', startTime: '8:30 AM', duration: 25},
        {block: 'F', startTime: '9:05 AM', duration: 45},
        {block: 'Humflex', startTime: '9:55 AM', duration: 25},
        {block: 'E', startTime: '10:25 AM', duration: 45},
        {block: 'A', startTime: '11:15 AM', duration: 45, isLunch: true},
        {block: 'B', startTime: '12:50 PM', duration: 80},
    ],
    Wednesday: [
        {block: 'F', startTime: '8:50 AM', duration: 80},
        {block: 'C', startTime: '10:15 AM', duration: 45},
        {block: 'Humflex', startTime: '11:05 AM', duration: 25},
        {block: 'D', startTime: '11:35 AM', duration: 45},
        {block: 'Lunch', startTime: '12:25 PM', duration: 65},
    ],
    Thursday: [
        {block: 'Chapel', startTime: '8:50 AM', duration: 25},
        {block: 'B', startTime: '9:25 AM', duration: 45},
        {block: 'Humflex', startTime: '10:15 AM', duration: 25},
        {block: 'A', startTime: '10:45 AM', duration: 45},
        {block: 'D', startTime: '11:35 AM', duration: 45, isLunch: true},
        {block: 'C', startTime: '1:10 PM', duration: 80},
        {block: 'House Meetings', startTime: '2:35 PM', duration: 40},
    ],
    Friday: [
        {block: 'Chapel', startTime: '8:30 AM', duration: 25},
        {block: 'D', startTime: '9:05 AM', duration: 45},
        {block: 'Humflex', startTime: '9:55 AM', duration: 25},
        {block: 'C', startTime: '10:25 AM', duration: 45},
        {block: 'B', startTime: '11:15 AM', duration: 45, isLunch: true},
        {block: 'E', startTime: '12:50 PM', duration: 80},
        {block: 'F', startTime: '2:15 PM', duration: 45},
    ],
    Saturday: [
        {block: 'A', startTime: '8:30 AM', duration: 80},
        {block: 'E', startTime: '9:55 AM', duration: 45},
        {block: 'Humflex', startTime: '10:45 AM', duration: 25},
        {block: 'F', startTime: '11:15 AM', duration: 45},
        {block: 'Lunch', startTime: '12:00 PM', duration: 90},
    ],
    Sunday: [],
}; */

export async function getScheduleForWeek() {
    const scheduleForWeek = [];

    for (const day in weekSchedule) {
        scheduleForWeek.push(await calculateScheduleForDay(day));
    }

    return scheduleForWeek;
}

export function isPast(dayOfWeek, time) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (days.indexOf(dayOfWeek) === -1) return false;

    const currentDate = new Date();
    const targetDate = new Date(); // Using the current date as a starting point.

    // Setting the day:
    targetDate.setDate(currentDate.getDate() + ((days.indexOf(dayOfWeek) - currentDate.getDay()) % 7));

    // Setting the time:
    const withoutAMPM = time.replace(/( AM| PM)/, '');
    const [hours, minutes] = withoutAMPM.split(':').map(Number);
    targetDate.setHours(hours, minutes, 0, 0); // Set seconds and milliseconds to 0.

    // If PM, add 12 hours to the time:
    if(time.includes('PM') && targetDate.getHours() !== 12) targetDate.setHours(targetDate.getHours() + 12);


    return currentDate > targetDate;
}


export async function calculateScheduleForDay(day) {
    const scheduleForDay = weekSchedule[day];
    const classTimes = [];

    const getClassBlock = async (blockInfo, currentIndex) => {
        const block = await getClassDetails(blockInfo.block);
        let startTime = blockInfo.startTime;
        let duration = blockInfo.duration;
        let endTime = addMinutesToTime(startTime, blockInfo.duration);

        let skipNext = false;
        let skipThis = false;
        if (block.isHumanities) {
            // If the current block is humanities and is preceded by a Humflex
            if (scheduleForDay[currentIndex - 1]?.block === 'Humflex') {
                startTime = subtractMinutesFromTime(startTime, 30);
                duration += 30;
            }
            // If the current block is humanities and is followed by a Humflex
            else if (scheduleForDay[currentIndex + 1]?.block === 'Humflex') {
                skipNext = true;
                duration += 30;
                endTime = addMinutesToTime(endTime, 30);
            }
        }

        // If the current block is Humflex and the next is a humanities block
        else if (block.block === 'Humflex' && scheduleForDay.length > currentIndex + 1){
            skipThis = (await getClassDetails(scheduleForDay[currentIndex + 1].block)).isHumanities;
        }

        return {
            skipNext,
            skipThis,
            classBlock: {
                block: block.block,
                name: block.name,
                color: block.color,
                duration: duration,
                startTime: removeAMPM(startTime),
                endTime
            }
        };
    };

    const addLunchBlocks = async (block, startTime) => {
        const lunch = await getClassDetails('Lunch');
        const firstLunchEndTime = addMinutesToTime(startTime, lunch.duration);
        const secondLunchStartTime = addMinutesToTime(firstLunchEndTime, block.duration - lunch.duration);

        if (block.isFirstLunch) {
            classTimes.push({
                block: block.block + '1',
                name: lunch.block,
                color: lunch.color,
                duration: lunch.duration,
                startTime: removeAMPM(startTime),
                endTime: firstLunchEndTime
            }, {
                block: block.block + '2',
                name: block.name,
                color: block.color,
                duration: lunch.duration,
                startTime: removeAMPM(secondLunchStartTime),
                endTime: addMinutesToTime(secondLunchStartTime, block.duration - lunch.duration)
            });
        } else {
            classTimes.push({
                block: block.block + '1',
                name: block.name,
                color: block.color,
                duration: lunch.duration,
                startTime: removeAMPM(startTime),
                endTime: secondLunchStartTime
            }, {
                block: block.block + '2',
                name: lunch.block,
                color: lunch.color,
                duration: lunch.duration,
                startTime: removeAMPM(secondLunchStartTime),
                endTime: addMinutesToTime(secondLunchStartTime, lunch.duration)
            });
        }
    };

    for (let i = 0; i < scheduleForDay.length; i++) {
        const blockInfo = scheduleForDay[i];
        if (blockInfo.isLunch) {
            const block = await getClassDetails(blockInfo.block);
            await addLunchBlocks(block, blockInfo.startTime);
        } else {
            const { classBlock, skipNext, skipThis } = await getClassBlock(blockInfo, i);

            if (!skipThis) classTimes.push(classBlock);

            if (skipNext) i++;
        }
    }

    return {
        classTimes,
        day
    };
}

export function removeAMPM(time) {
    return time.replace(/( AM| PM)/, '');
}

export default async function getClassDetails(block) {
    try {
        // Attempt to fetch user's custom data from AsyncStorage
        const userData = localStorage.getItem(block);

        // If custom data exists, parse and return it
        if (userData !== null) {
            return JSON.parse(userData);
        }

        // If no custom data exists, return the default
        return classDefaults[block];
    } catch (error) {
        console.error('Error retrieving class details:', error);

        // In case of any errors, return the default as well
        return classDefaults[block];
    }
}

export function addMinutesToTime(time, minutes) {
    const timeParts = time.split(':');
    const date = new Date();
    let isAm = timeParts[1].includes('AM');

    date.setHours(parseInt(timeParts[0], 10));
    date.setMinutes(parseInt(timeParts[1], 10) + minutes);

    if (date.getHours() === 12){
        isAm = !isAm;
    }else
    if(date.getHours() > 12){
        date.setHours(date.getHours() - 12);
    }

    // const updatedHours = String(date.getHours()).padStart(2, '0')
    const updatedMinutes = String(date.getMinutes()).padStart(2, '0');
    const updatedHours = String(date.getHours());
    // const updatedMinutes = String(date.getMinutes());

    return `${updatedHours}:${updatedMinutes}` + (isAm ? ' AM' : ' PM');
}

export function subtractMinutesFromTime(time, minutes) {
    const timeParts = time.split(':');
    const date = new Date();
    let isAm = timeParts[1].includes('AM');

    date.setHours(parseInt(timeParts[0], 10));
    date.setMinutes(parseInt(timeParts[1], 10) - minutes);

    // Adjust the hour if minutes went below zero
    while (date.getMinutes() < 0) {
        date.setMinutes(60 + date.getMinutes());
        date.setHours(date.getHours() - 1);
    }

    // Convert to 12-hour format and toggle AM/PM as necessary
    if(date.getHours() >= 12){
        if (date.getHours() > 12) {
            date.setHours(date.getHours() - 12);
        }
        isAm = false;
    } else if (date.getHours() === 0) {
        date.setHours(12);
        isAm = true;
    } else if(date.getHours() < 0) {
        date.setHours(12 + date.getHours()); // Convert negative hour to positive
        isAm = !isAm;
    }

    const updatedMinutes = String(date.getMinutes()).padStart(2, '0');
    const updatedHours = String(date.getHours());

    return `${updatedHours}:${updatedMinutes}` + (isAm ? ' AM' : ' PM');
}
