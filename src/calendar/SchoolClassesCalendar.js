const weekSchedule = await createWeekSchedule();

// Main function to retrieve the schedule for the week
export async function getScheduleForWeek() {
    const scheduleForWeek = [];

    for (const day in weekSchedule) {
        scheduleForWeek.push(await calculateScheduleForDay(day));
    }

    return scheduleForWeek;
}

// Load the Google API JavaScript on the client
async function getCalendarEvents(dateFrom, dateTo) {
    const formatDate = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    // Get the calendar events for the week from school's Google Calendar API
    const url = `https://www.googleapis.com/calendar/v3/calendars/spsacademiccal%40gmail.com/events?key=AIzaSyBxoBIAkPxbC1hZNtFOmpHFv_z2ya9I838&timeMin=${formatDate(dateFrom)}T00%3A00%3A00-05%3A00&timeMax=${formatDate(dateTo)}T00%3A00%3A00-05%3A00&singleEvents=true&maxResults=9999`;

    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();


    function formatEventFromAPI(event) {
        const startTime = event.startDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const day = event.startDateTime.toLocaleString('en-US', { weekday: 'long' });
        const duration = (event.endDateTime - event.startDateTime) / (1000 * 60); // Convert duration to minutes
        event.name = event.name.replace(/\s+/g, ''); // remove spaces as the data sometimes has a space like
        if (event.name === "FLEX") {
            event.name = "FLEX";
        }
        if (event.name === "HouseMeetings") {
            event.name = "House Meetings";
        }

        return {
            block: event.name,
            day,
            startTime,
            duration
        };
    }


    return data.items.filter(item => item.status === 'confirmed')
        .map(item => {
            return formatEventFromAPI({
                name: item.summary,
                startDateTime: new Date(item.start.dateTime),
                endDateTime: new Date(item.end.dateTime)
            });
        });
}

async function createWeekSchedule() {
    // Define the week range
    const {weekStart, weekEnd} = getUpcomingWeekDates();
    const events = await getCalendarEvents(weekStart, weekEnd);

    // Initialize week schedule
    const upcomingWeekSchedule = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
    };

    // Iterate over events and assign to the correct day
    events.forEach(event => {
        const dayOfWeek = event.day;
        if(upcomingWeekSchedule[dayOfWeek] !== undefined){
            upcomingWeekSchedule[dayOfWeek].push(event);
        }

        // if (dayOfWeek === "Monday" ||
        //     dayOfWeek === "Tuesday" ||
        //     dayOfWeek === "Wednesday" ||
        //     dayOfWeek === "Thursday" ||
        //     dayOfWeek === "Friday" ||
        //     dayOfWeek === "Saturday" ||
        //     dayOfWeek === "Sunday") {
        //     weekSchedule[dayOfWeek].push(formatEvent(event));
        // }

    });

    return upcomingWeekSchedule;
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

export const userPreferences = {
    // 'A': { name: 'Block A', color: '#FFBC00', isHumanities: false, isFirstLunch: true },
    // 'B': { name: 'Block B', color: '#FFBC00', isHumanities: false, isFirstLunch: true },
    // 'C': { name: 'Block C', color: '#FFBC00', isHumanities: false, isFirstLunch: true },
    // 'D': { name: 'Block D', color: '#FFBC00', isHumanities: false, isFirstLunch: true },
    // 'E': { name: 'Block E', color: '#FFBC00', isHumanities: false, isFirstLunch: true },
    // 'F': { name: 'Block F', color: '#FFBC00', isHumanities: false, isFirstLunch: true },
}

export function loadUserPreferences() {
    for (const block in classDefaults) {
        const userData = localStorage.getItem(`class-name-${block}`);
        if (userData !== null) {
            userPreferences[block] = JSON.parse(userData);
        }
    }
}

export async function calculateScheduleForDay(day) {
    const scheduleForDay = weekSchedule[day];
    const classTimes = [];

    const getClassBlock = async (blockInfo, currentIndex) => {
        // Convert either 'A', 'A1', 'A2' to just 'A'
        const block = blockInfo.block.replace(/[0-9]/g, '');

        // Check any name "*1" contains a 1 or 2
        const isAFirstLunchBlock  = blockInfo.block.includes('1');
        const isASecondLunchBlock = blockInfo.block.includes('2');

        let startTime = blockInfo.startTime;
        let duration = blockInfo.duration;
        let endTime = addMinutesToTime(startTime, blockInfo.duration);

        const isFlex = blockInfo.block === 'FLEX';

        // Cannot read properties of undefined (reading 'isHumanities')
        const isHum = userPreferences[block]?.isHumanities || classDefaults[block].isHumanities;
        const isFirstLunch = userPreferences[block]?.isFirstLunch || classDefaults[block].isFirstLunch;
        let blockName = userPreferences[blockInfo.block]?.name || classDefaults[block].name;
        let blockColor = userPreferences[block]?.color || classDefaults[block].color;

        let skipThis = false;

        if (isHum) {
            if (scheduleForDay[currentIndex - 1]?.block === 'FLEX') {
                startTime = subtractMinutesFromTime(startTime, 30);
                duration += 30;
            }
            // If the current block is humanities and is followed by a Humflex
            else if (scheduleForDay[currentIndex + 1]?.block === 'FLEX') {
                duration += 30;
                endTime = addMinutesToTime(endTime, 30);
            }
        }

        if (isFlex){
            const previousBlock = scheduleForDay[currentIndex - 1]?.block.replace(/[0-9]/g, '');
            const nextBlock = scheduleForDay[currentIndex + 1]?.block.replace(/[0-9]/g, '');

            const isPreviousBlockHum = userPreferences[previousBlock]?.isHumanities || classDefaults[previousBlock].isHumanities;
            const isNextBlockHum = userPreferences[nextBlock]?.isHumanities || classDefaults[nextBlock].isHumanities;

            if (isPreviousBlockHum || isNextBlockHum) {
                skipThis = true;
            }
        }

        if(isAFirstLunchBlock){
            if(isFirstLunch){
                blockName = "Lunch";
                blockColor = userPreferences['Lunch']?.color || classDefaults['Lunch'].color;
            }
        }else if(isASecondLunchBlock) {
            if(!isFirstLunch){
                blockName = "Lunch";
                blockColor = userPreferences['Lunch']?.color || classDefaults['Lunch'].color;
            }
        }


        return {
            skipThis: skipThis,
            classBlock: {
                block: blockInfo.block,
                name: blockName,
                color: blockColor,
                duration: duration,
                startTime: removeAMPM(startTime),
                endTime: endTime
            }
        };
    };


    for (let i = 0; i < scheduleForDay.length; i++) {
        const blockInfo = scheduleForDay[i];
            const { classBlock, skipThis } = await getClassBlock(blockInfo, i);
            if (!skipThis)
                classTimes.push(classBlock);
    }

    if (classTimes.length === 0) {
        classTimes.push({
            block: 'NO CLASSES!',
            name: '',
            color: '#bfffd9',
            duration: 1440,
            startTime: '',
            endTime: ''
        });
    }

    return {
        classTimes,
        day
    };
}

export function removeAMPM(time) {
    return time.replace(/( AM| PM)/, '');
}

export async function getClassDetails(block) {
    return userPreferences[block] || classDefaults[block];
}

export function saveClassDetails(block, details) {
    userPreferences[block] = details;
    try {
        // Attempt to save user's custom data to AsyncStorage
        localStorage.setItem(`class-name-${block}`, JSON.stringify(details));
    } catch (error) {
        console.error('Error saving class details:', error);
    }
}

function getUpcomingWeekDates() {
    // Get the current date
    const currentDate = new Date();

    // Calculate the day number with Monday as the start of the week
    let day = currentDate.getDay();
    let diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday

    // Calculate the first day of the week (Monday)
    const weekStart = new Date(currentDate.setDate(diff));

    // Reset the date to the current date
    currentDate.setDate(new Date().getDate());

    // Calculate the last day of the week (Sunday)
    day = currentDate.getDay();
    diff = currentDate.getDate() - day + (day === 0 ? 0 : 7);
    const weekEnd = new Date(currentDate.setDate(diff));

    console.log(weekStart.toDateString()); // Start of the week (Monday)
    console.log(weekEnd.toDateString());   // End of the week (Sunday)

    return {weekStart, weekEnd};
}

// Helper functions
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
