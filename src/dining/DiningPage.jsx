import React, { useState, useEffect, useContext } from 'react';
import sendAPICall from "../APIs";
import './DiningPage.css';
import { ReactComponent as SectionClosedIcon } from '../icons/caret-right-solid.svg';
import { ReactComponent as SectionOpenIcon } from '../icons/caret-down-solid.svg';
import { ReactComponent as LeftArrowIcon } from '../icons/arrow-left-solid.svg';
import { ReactComponent as RightArrowIcon } from '../icons/arrow-right-solid.svg';
import { ReactComponent as WeeklyCalendarIcon } from '../icons/calendar-week-solid.svg';
import { ReactComponent as DaylyCalendarIcon } from '../icons/calendar-day-solid.svg';

const DiningPage = () => {
    const [mealsData, setMealsData] = useState({});
    const [openSections, setOpenSections] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isWeeklyView, setIsWeeklyView] = useState(false);


    useEffect(() => {
        sendAPICall('/menu', 'GET', {}, null, false)
            .then(data => {
                setMealsData(data);
                initializeOpenSections(data);
            });
    }, []);

    useEffect(() => {
        // Get the current date and time
        const now = new Date();
        const today = now.getDate().toString(); // .padStart(2, '0');
        const currentHour = now.getHours();

        // Determine the most relevant meal based on the current time
        let relevantMeal;
        if (currentHour >= 14) {
            relevantMeal = 'dinner';
        } else if (currentHour >= 10) {
            relevantMeal = 'lunch';
        }
        //console.log(relevantMeal)

        // Create the id of the meal container for today
        const dayContainerId = `mealContainer-${today}`;
        // const mealContainerId = `mealContainer-${today}-${relevantMeal}`;

        // Find the elements with those ids
        const dayContainerElement = document.getElementById(dayContainerId);
        // const mealContainerElement = document.getElementById(mealContainerId);

        // If the day container element exists, scroll to it
        if (dayContainerElement) {
            dayContainerElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'start'});

            // Wait for the scrolling to finish (approximately 300ms)
            // setTimeout(() => {
            //     // If the meal container element exists, scroll to it
            //     if (mealContainerElement) {
            //         mealContainerElement.scrollIntoView({ behavior: 'smooth',  });
            //     }
            // }, 1000);
        }
        // if (mealContainerElement) {
        //     mealContainerElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'start'});
        // }
    }, [mealsData]);


    const initializeOpenSections = (data) => {
        const initialOpenSections = {};
        for (let mealType in data) {
            for (let meal of data[mealType]) {
                if (!initialOpenSections[mealType]) {
                    initialOpenSections[mealType] = {};
                }
                if (!initialOpenSections[mealType][meal.date]) {
                    initialOpenSections[mealType][meal.date] = {};
                }

                toggleSection(mealType, meal.date, 'Entree');
                toggleSection(mealType, meal.date, 'Grab n\' Go Sandwiches');
                // initialOpenSections[mealType][meal.date]['Entree'] = true; // Assuming 'Entree' is the section title for entrees
                // initialOpenSections[mealType][meal.date]['Grab n\' Go Sandwiches'] = true; // Do the same for any other entree sections
            }
        }
        setOpenSections(initialOpenSections);
    };

    const toggleSection = (mealType, date, sectionTitle) => {
        setOpenSections(prevState => ({
            ...prevState,
            [mealType]: {
                ...prevState[mealType],
                [date]: {
                    ...prevState[mealType]?.[date],
                    [sectionTitle]: !prevState[mealType]?.[date]?.[sectionTitle]
                }
            }
        }));
    };

    const isSectionOpen = (mealType, date, sectionTitle) => {
        return openSections[mealType]?.[date]?.[sectionTitle] ?? false; // Default to false if undefined
    };

    // Extract unique dates from the meals data
    const getUniqueDates = () => {
        const allDates = new Set();
        for (let mealType in mealsData) {
            for (let meal of mealsData[mealType]) {
                allDates.add(meal.date);
            }
        }
        return Array.from(allDates).sort((a, b) => parseInt(a) - parseInt(b));
    };

    const hasNonEmptySections = (meal) => {
        return meal.sections.some(section => section.foods && section.foods.length > 0);
    };

    const sortSections = (sections) => {
        return sections.sort((a, b) => {
            if (a.sectionTitle === 'Entree' || a.sectionTitle === 'Grab n\' Go Sandwiches') return -1;
            if (b.sectionTitle === 'Entree' || b.sectionTitle === 'Grab n\' Go Sandwiches') return 1;
            return 0;
        });
    };

    const navigateDay = (direction) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(prevDate.getDate() + direction);
            return newDate;
        });
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                navigateDate('prev')
            } else if (event.key === 'ArrowRight') {
                navigateDate('next')
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    });

    let tapTimer = false

    // Tapping (not swiping) on left/right of screen should also navigate
    useEffect(() => {
        // only activate if it was a quick tap: less then 200 ms
        const handleTouchStart = (event) => {
            tapTimer = true;
            setTimeout(() => {
                tapTimer = false;
            }, 150);
        }
        const handleTouchEnd = (event) => {
            if (tapTimer) {
                if (event.changedTouches[0].clientX < 100) {
                    // navigateDate('prev');
                } else if(event.changedTouches[0].clientX > window.innerWidth - 100) {
                    // navigateDate('next');
                }
            }
        }
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);

        // Check if page resizes under 1000px
        const handleResize = (event) => {
            if (window.innerWidth < 1000) {
                setIsWeeklyView(false);
            }
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('resize', handleResize);
        };
    });



    const navigateDate = (direction) => {
        if (direction === 'prev') {
            navigateDay(isWeeklyView ? -7 : -1);
        } else if (direction === 'next') {
            navigateDay(isWeeklyView ? 7 : 1);
        }
    };

    const toggleWeekView = () => {
        // only toggle if the screen width is more than 1000px
        if (window.innerWidth > 1000 || isWeeklyView) {
            setIsWeeklyView(prevState => !prevState);
        }
    };

    const formattedDate = currentDate.toLocaleString('default', { weekday: "long", month: "long", day: "numeric" });

    const renderDayView = () => {
        // Format the current date to match the date format in mealsData
        const dayOfMonth = currentDate.getDate().toString(); // This will give you a number between 1 and 31
        return (
            <div className="dayContainer">
                {Object.keys(mealsData).map(mealType => {
                    const mealForTheDate = mealsData[mealType].find(meal => meal.date === dayOfMonth);
                    return (
                        mealForTheDate && hasNonEmptySections(mealForTheDate) && (
                            <div key={mealType} className="mealContainer">
                                <h3>{mealType === 'grabngo' ? 'Grab n\' Go' : mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h3>
                                {sortSections(mealForTheDate.sections).map((section, sectionIndex) => (
                                    <React.Fragment key={sectionIndex}>
                                        {section.foods && section.foods.length > 0 && (
                                            (section.sectionTitle === "Entree" || section.sectionTitle === 'Grab n\' Go Sandwiches') ? (
                                                // Render entree sections directly
                                                <div className="sectionContainer">
                                                    <h4 onClick={() => toggleSection(mealType, formattedDate, section.sectionTitle)}
                                                        style={{ cursor: 'pointer' }}>
                                                        {section.sectionTitle}
                                                        {!isSectionOpen(mealType, formattedDate, section.sectionTitle) ? (
                                                            <SectionOpenIcon color={"#aaa"} width={20} height={20} />
                                                        ) : (
                                                            <SectionClosedIcon color={"#aaa"} width={20} height={20} />
                                                        )}
                                                    </h4>
                                                    {!isSectionOpen(mealType, formattedDate, section.sectionTitle) && (
                                                        <ul>
                                                            {section.foods.map(food => (
                                                                <li key={food}>{food}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ) : null // Do not render non-entree sections here
                                        )}
                                    </React.Fragment>
                                ))}
                                {/* Dropdown toggle button */}
                                <div className={'sectionContainer'} style={{ cursor: 'pointer' }} onClick={() => toggleSection(mealType, formattedDate, 'nonEntreeDropdown')}>
                                    {isSectionOpen(mealType, formattedDate, 'nonEntreeDropdown') ? (
                                        <p>Sides & Details <SectionOpenIcon color={"#aaa"} width={20} height={20} /></p>
                                    ) : (
                                        <p>Sides & Details <SectionClosedIcon color={"#aaa"} width={20} height={20} /></p>
                                    )}
                                </div>
                                {/* Render non-entree sections inside the dropdown */}
                                {sortSections(mealForTheDate.sections).map((section, sectionIndex) => (
                                    <React.Fragment key={sectionIndex}>
                                        {section.foods && section.foods.length > 0 && (
                                            !(section.sectionTitle === "Entree" || section.sectionTitle === 'Grab n\' Go Sandwiches') && isSectionOpen(mealType, formattedDate, 'nonEntreeDropdown') && (
                                                <div className="sectionContainer">
                                                    <h4>{section.sectionTitle}</h4>
                                                    <ul>
                                                        {section.foods.map(food => (
                                                            <li key={food}>{food}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        )
                    );
                })}
            </div>
        );
    };

    const weekRangeString = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Adjust to start of the week (Sunday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6); // Adjust to end of the week (Saturday)
        return `${startOfWeek.toLocaleString('default', { month: "long", day: "numeric" })} - ${endOfWeek.toLocaleString('default', { month: "long", day: "numeric" })}`;
    };

    const renderWeekView = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Adjust to start of the week (Sunday)

        const weekDays = Array.from({ length: 7 }).map((_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            return day;
        });

        const mealTypes = ['breakfast', 'lunch', 'grabngo', 'dinner'];

        return (
            <div className="dining-week-container">
                <div className="dining-week-row dining-week-header">
                    {weekDays.map((day, index) => (
                        <div key={index} className="dining-day-header">
                            {day.toLocaleString('default', { weekday: "long", month: "long", day: "numeric" })}
                        </div>
                    ))}
                </div>
                {mealTypes.map(mealType => (
                    <div key={mealType} className="dining-week-row">
                        {weekDays.map((day, dayIndex) => {
                            if(mealsData[mealType] === undefined) {
                                return (
                                    <div key={dayIndex} className="dining-day-column"></div>
                                );
                            }
                            const formattedDate = day.getDate().toString();
                            let mealForTheDate = mealsData[mealType].find(meal => meal.date === formattedDate);
                            let mealTitle = mealType.at(0).toUpperCase() + mealType.slice(1);

                            if(mealType === 'breakfast' && mealForTheDate !== undefined && mealForTheDate.sections.length === 1) {
                                if(!mealForTheDate.sections[0].sectionTitle) {
                                    console.log(mealType)
                                    mealForTheDate = mealsData['brunch'].find(meal => meal.date === formattedDate);
                                    mealTitle = 'Brunch';
                                }
                            }

                            return (
                                <div key={dayIndex} className="dining-day-column">
                                    <h4 className="dining-meal-type-header">{mealTitle}</h4>
                                    {mealForTheDate && (
                                        <React.Fragment>
                                            {mealForTheDate.sections.map((section, sectionIndex) => (
                                                section.foods && section.foods.length > 0 && (
                                                    (section.sectionTitle === "Entree" || section.sectionTitle === 'Grab n\' Go Sandwiches') && (
                                                        <div key={sectionIndex} className="sectionContainer">
                                                            {section.foods.map(food => (
                                                                <div key={food} className="mealItem">{food}</div>
                                                            ))}
                                                        </div>
                                                    )
                                                )
                                            ))}
                                        </React.Fragment>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };



    return (
        <div className="diningPage">
            <header className="dining-header">
                <span className={'dining-left-arrow'} onClick={() => navigateDate('prev')}>
                    <LeftArrowIcon width={40} height={20}/>
                </span>
                <span className={'dining-date-title'}>{
                        isWeeklyView ? (
                            <span>{weekRangeString()}</span>
                        ) : (
                            <span>{currentDate.toLocaleString('default', {weekday: "long", month: "long", day: "numeric"})}</span>
                        )
                }</span>
                <span className={'dining-date-week-toggle'} onClick={toggleWeekView}>{
                    isWeeklyView ? (
                        <DaylyCalendarIcon width={20} height={20}/>
                    ) : (
                        <WeeklyCalendarIcon width={20} height={20}/>
                    )
                }</span>
                <span className={'dining-right-arrow'} onClick={() => navigateDate('next')}>
                    <RightArrowIcon width={40} height={20}/>
                </span>
            </header>

            {isWeeklyView ? renderWeekView() : renderDayView()}
        </div>
    );
};

export default DiningPage;
