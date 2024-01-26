
/*
var a = {
    Monday: [
        {block: 'Chapel', startTime: '8:30 AM', duration: 25},
        {block: 'A', startTime: '9:05 AM', duration: 45},
        {block: 'FLEX', startTime: '9:55 AM', duration: 25},
        {block: 'B', startTime: '10:25 AM', duration: 45},
        {block: 'C', startTime: '11:15 AM', duration: 45},
        {block: 'D', startTime: '12:50 PM', duration: 80},
        {block: 'E', startTime: '02:15 PM', duration: 45},
    ],
    Tuesday: [
        {block: 'Chapel', startTime: '08:30 AM', duration: 25},
        {block: 'F', startTime: '09:05 AM', duration: 45},
        {block: 'Humflex', startTime: '9:55 AM', duration: 25},
        {block: 'E', startTime: '010:25 AM', duration: 45},
        {block: 'A', startTime: '011:15 AM', duration: 45},
        {block: 'B', startTime: '012:50 PM', duration: 80},
    ],
    Wednesday: [
        {block: 'F', startTime: '08:50 AM', duration: 80},
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
        {block: 'D', startTime: '11:35 AM', duration: 45},
        {block: 'C', startTime: '1:10 PM', duration: 80},
        {block: 'House Meetings', startTime: '2:35 PM', duration: 40},
    ],
    Friday: [
        {block: 'Chapel', startTime: '8:30 AM', duration: 25},
        {block: 'D', startTime: '9:05 AM', duration: 45},
        {block: 'Humflex', startTime: '9:55 AM', duration: 25},
        {block: 'C', startTime: '10:25 AM', duration: 45},
        {block: 'B', startTime: '11:15 AM', duration: 45},
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
}; 
*/

export async function getScheduleForWeek() {
    const scheduleForWeek = [];

    for (const day in weekSchedule) {
        scheduleForWeek.push(await calculateScheduleForDay(day));
    }

    return scheduleForWeek;
}
async function getCalendarEvents(dateFrom, dateTo) {
    const formatDate = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const url = `https://www.googleapis.com/calendar/v3/calendars/spsacademiccal%40gmail.com/events?key=AIzaSyBxoBIAkPxbC1hZNtFOmpHFv_z2ya9I838&timeMin=${formatDate(dateFrom)}T00%3A00%3A00-05%3A00&timeMax=${formatDate(dateTo)}T00%3A00%3A00-05%3A00&singleEvents=true&maxResults=9999`;

    
        const response = await fetch(url, { method: 'GET' });
    
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
      
    
}
// Usage example:
// getCalendarEvents(new Date('2024-01-01'), new Date('2024-12-31'))
// .then(events => //console.log(events));



async function createWeekSchedule() {

    function getWeek() {
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
    
    // Define the week range
    const {weekStart, weekEnd} = getWeek();
    //const weekStart = new Date('2024-01-21');const weekEnd = new Date('2024-01-27');   

    var events = await getCalendarEvents(weekStart, weekEnd);
    
    // Initialize week schedule
    const weekSchedule1 = {
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
        event.name = event.name.replace(/\s+/g, ''); // remove spaces as the data sometimes has a space like 
        if (event.name == "FLEX") {
            event.name = "FLEX";
        }
        if (event.name == "HouseMeetings") {
            event.name = "House Meetings";
        }
        
        return {
            block: event.name,
            startTime,
            duration
        };
    }

    // Iterate over events and assign to the correct day
    events.forEach(event => {
        const dayOfWeek = event.startDateTime.toLocaleString('en-US', { weekday: 'long' });
        
        if (dayOfWeek == "Monday") {
            weekSchedule1.Monday.push(formatEvent(event));
        } else if (dayOfWeek == "Tuesday") {
            weekSchedule1.Tuesday.push(formatEvent(event));
        } else if (dayOfWeek == "Wednesday") {
            weekSchedule1.Wednesday.push(formatEvent(event));
        } else if (dayOfWeek == "Thursday") {
            weekSchedule1.Thursday.push(formatEvent(event));
        } else if (dayOfWeek == "Friday") {
            weekSchedule1.Friday.push(formatEvent(event));
        } else if (dayOfWeek == "Saturday") {
            weekSchedule1.Saturday.push(formatEvent(event));
        } else if (dayOfWeek == "Sunday") {
            weekSchedule1.Sunday.push(formatEvent(event));
        }

        
    });
    
    console.log(weekSchedule1);
    //console.log("weekSchedule1");
    //console.log(a);


    
    return weekSchedule1;
}
var week = await createWeekSchedule();
export var weekSchedule = week;


function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

//downloadObjectAsJson(week , "data")

export const classDefaults = {
    'A': { block: 'A', name: 'Block A', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'A1': { block: 'A', name: 'Block A', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'A2': { block: 'A', name: 'Block A', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },

    'B': { block: 'B', name: 'Block B', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'B1': { block: 'B', name: 'Block B', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'B2': { block: 'B', name: 'Block B', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },

    'C': { block: 'C', name: 'Block C', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'C1': { block: 'C', name: 'Block C', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'C2': { block: 'C', name: 'Block C', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },

    'D': { block: 'D', name: 'Block D', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'D1': { block: 'D', name: 'Block D', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'D2': { block: 'D', name: 'Block D', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },

    'E': { block: 'E', name: 'Block E', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'E1': { block: 'E', name: 'Block E', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'E2': { block: 'E', name: 'Block E', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },

    'F': { block: 'F', name: 'Block F', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'F1': { block: 'F', name: 'Block F', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },
    'F2': { block: 'F', name: 'Block F', color: '#FFBC00', duration: 45, isHumanities: false, isFirstLunch: true },

    'Humflex': { block: 'Humflex', name: '', color: '#4080FF', duration: 25 },
    'House Meetings': { block: 'House Meetings', name: '', color: '#4080FF', duration: 25 },
    'Lunch': { block: 'Lunch', name: '', color: '#20EE75', duration: 45 },
    'Chapel': { block: 'Chapel', name: '', color: '#7520EE', duration: 25 },
};

export const blockTocolor = {
    'A': '#FFBC00',
    'A1': '#FFBC00',
    'A2': '#FFBC00',

    'B': '#FFBC00', // some reason needs a space
    'B1': '#FFBC00',
    'B2': '#FFBC00',

    'C': '#FFBC00',
    'C1': '#FFBC00',
    'C2': '#FFBC00',

    'D': '#FFBC00',
    'D1': '#FFBC00',
    'D2': '#FFBC00',


    'E': '#FFBC00',
    'E1': '#FFBC00',
    'E2': '#FFBC00',

    'F': '#FFBC00',
    'F1': '#FFBC00',
    'F2': '#FFBC00',

    'FLEX': '#4080FF',
    'House Meetings': '#4080FF',
    'Lunch': '#20EE75',
    'Chapel': '#7520EE',
};

// this would be someones classes and they would add there classes here
/*
const scheduleBlocks = { // make isHumanites thing or is 
    'A': 'Free',
    'B': 'Math',
    'C': 'Art',
    'D': 'Science',
    'E': 'Humanities',
    'F': 'Language',
}
*/
const scheduleBlocks = {
    'A': {name: '', isHum: false, isFirstLunch: false},
    'B': {name: '', isHum: false, isFirstLunch: false},
    'C': {name: '', isHum: false, isFirstLunch: false},
    'D': {name: '', isHum: false, isFirstLunch: false},
    'E': {name: '', isHum: true, isFirstLunch: true},
    'F': {name: '', isHum: false, isFirstLunch: false},
}

const possilbe_class_blocks = ["Free", "Math", "Art", "Science", "Humanities", "Language"]



var blockToName = {
    'A': '',
    'A1': '',
    'A2': '',

    'B': '', // some reason needs a space
    'B1': '',
    'B2': '',

    'C': '',
    'C1': '',
    'C2': '',

    'D': '',
    'D1': '',
    'D2': '',


    'E': '',
    'E1': '',
    'E2': '',

    'F': '',
    'F1': '',
    'F2': '',

    'FLEX': '',
    'House Meetings': '',
    'Lunch': '',
    'Chapel': '',
};


function calcuateBlocks() {
    // A

    var letters= ["A", "B", "C", "D", "E", "F"];

    
    letters.forEach((letter, index) => {
        var block_name = scheduleBlocks[letter].name; 
        if (block_name != '') {
            if (scheduleBlocks[letter].isFirstLunch) {
                blockToName[letter] = block_name;
                blockToName[letter + "1"] = block_name;
                blockToName[letter + "2"] = "Lunch";
            } else {
                blockToName[letter] = block_name;
                blockToName[letter + "2"] = block_name;
                blockToName[letter + "1"] = "Lunch";
            }
        }
    });

} 

calcuateBlocks();
export async function getClassList() {
    const blocks = ['A', 'B', 'C', 'D', 'E', 'F','A1', 'B1', 'C1', 'D1', 'E1', 'F1','A2', 'B2', 'C2', 'D2', 'E2', 'F2'];
    let classes = [];

    for(let i = 0; i < blocks.length; i++){
        classes.push(await getClassDetails(blocks[i]));
    }
    
    return classes;
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
    //console.log("day:") console.log(day);
    const classTimes = [];

    const getClassBlock = async (blockInfo, currentIndex) => {
        //        const block = await getClassDetails(blockInfo.block);

        let startTime = blockInfo.startTime;
        let duration = blockInfo.duration; // can just make blockinfo have end time instead
        let endTime = addMinutesToTime(startTime, blockInfo.duration);

        let skipThis1 = false;
        /*
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
        */

        try {
            var bloc_color = blockTocolor[blockInfo.block];
        } catch (error) {
            var bloc_color = '#FFBC00';
        }




        try {
            var block_name = blockToName[blockInfo.block];
            if (block_name == undefined) {
                block_name = ''
            }

            if (scheduleBlocks[blockInfo.block].isHum) {
                
                // If the current block is humanities and is preceded by a Humflex
                //console.log(scheduleForDay[currentIndex - 1].block)
                if (scheduleForDay[currentIndex - 1]?.block == 'FLEX') {
                    startTime = subtractMinutesFromTime(startTime, 30);
                    duration += 30;
                }
                // If the current block is humanities and is followed by a Humflex
                else if (scheduleForDay[currentIndex + 1]?.block == 'FLEX') {
                    duration += 30;
                    endTime = addMinutesToTime(endTime, 30);
                }
                
                
            } // maybe else
            if (blockInfo.block == 'FLEX'){
                skipThis1 = (scheduleBlocks[scheduleForDay[currentIndex - 1].block].isHum) || (scheduleBlocks[scheduleForDay[currentIndex + 1].block].isHum);
                //skipThis1 = scheduleForDay[currentIndex + 1].block == 'Humanities';

            }
        } catch (error) {
            var block_name = '';
        }

        return {
            skipNext: false,
            skipThis: skipThis1,
            classBlock: {
                block: blockInfo.block,
                name: block_name,
                color: bloc_color, // find block
                duration: duration,
                startTime: removeAMPM(startTime),
                endTime
            }
        };
    };

    /*
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
    */

    for (let i = 0; i < scheduleForDay.length; i++) {
        const blockInfo = scheduleForDay[i];
 
        
        //console.log("blockinfo", blockInfo);
      
            const { classBlock, skipNext, skipThis } = await getClassBlock(blockInfo, i);
            //console.log(skipThis)
            if (!skipThis) classTimes.push(classBlock);

       
            
        
        
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
        //console.log("get class block:", block);
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
