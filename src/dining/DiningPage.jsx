import React, { useState, useEffect } from 'react';
import sendAPICall from "../auth/APIs";
import './DiningPage.css';
import { ReactComponent as SectionClosedIcon } from '../icons/caret-right-solid.svg';
import { ReactComponent as SectionOpenIcon } from '../icons/caret-down-solid.svg';

const DiningPage = () => {
    const [mealsData, setMealsData] = useState({});
    const [openSections, setOpenSections] = useState({});

    useEffect(() => {
        sendAPICall('/menu', 'GET', {}, null, false)
            .then(data => {
                console.log(data);
                setMealsData(data);
                initializeOpenSections(data);
            });
    }, []);

    useEffect(() => {
        // Get the current date and time
        const now = new Date();
        const today = now.getDate().toString().padStart(2, '0');
        const currentHour = now.getHours();

        // Determine the most relevant meal based on the current time
        let relevantMeal;
        if (currentHour >= 14) {
            relevantMeal = 'dinner';
        } else if (currentHour >= 10) {
            relevantMeal = 'lunch';
        }
        console.log(relevantMeal)

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
                for (let section of meal.sections) {
                    if (section.foods && section.foods.length > 0) {
                        if (!initialOpenSections[mealType]) {
                            initialOpenSections[mealType] = {};
                        }
                        if (!initialOpenSections[mealType][meal.date]) {
                            initialOpenSections[mealType][meal.date] = {};
                        }
                        initialOpenSections[mealType][meal.date][section.sectionTitle] = section.sectionTitle === 'Entree';
                    }
                }
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
                    ...prevState[mealType][date],
                    [sectionTitle]: !prevState[mealType][date][sectionTitle]
                }
            }
        }));
    };

    const isSectionOpen = (mealType, date, sectionTitle) => {
        return openSections[mealType]?.[date]?.[sectionTitle];
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
            if (a.sectionTitle === 'Entree') return -1;
            if (b.sectionTitle === 'Entree') return 1;
            return 0;
        });
    };

    return (
        <div className="diningPage">
            {getUniqueDates().map(date => (
                <div key={date} id={`mealContainer-${date}`} className="dayContainer">
                    <h2>
                        {(() => {
                        const todayDate = new Date();
                            todayDate.setDate(date);
                        return todayDate.toLocaleString('default', { weekday: "long", month: "long", day: "numeric" });
                    })()}
                    </h2>
                    {Object.keys(mealsData).map(mealName => {
                        const mealForTheDate = mealsData[mealName].find(meal => meal.date === date);
                        return (
                            mealForTheDate && hasNonEmptySections(mealForTheDate) && (
                                <div key={mealName} id={`mealContainer-${date}-${mealName}`} className="mealContainer">
                                    <h3>{mealName.charAt(0).toUpperCase() +
                                        mealName.slice(1)}</h3>
                                    {sortSections(mealForTheDate.sections).map((section, sectionIndex) => (
                                        section.foods && section.foods.length > 0 && (
                                            <div key={sectionIndex} className="sectionContainer">
                                                <h4 onClick={() => toggleSection(mealName, date, section.sectionTitle)}
                                                    style={{position: 'relative', cursor: 'pointer'}}>
                                                    <span style={{position: 'absolute', left: 20}}>
                                                        {isSectionOpen(mealName, date, section.sectionTitle) ? (
                                                            <SectionOpenIcon color={"#aaa"} width={20} height={20}/>
                                                        ) : (
                                                         <SectionClosedIcon color={"#aaa"} width={20} height={20}/>
                                                        )}
                                                    </span>
                                                    <span style={{width: "90%"}}>
                                                        {section.sectionTitle === "sMOOthie" ? ("Center Bar") : (section.sectionTitle || "")}
                                                    </span>
                                                </h4>
                                                {isSectionOpen(mealName, date, section.sectionTitle) && (
                                                    <ul>
                                                        {section.foods.map(food => (
                                                            <li key={food} style={section.sectionTitle === "Entree" ? {color: "#fff", fontWeight: "800"} : {}}>{food}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )
                                    ))}
                                </div>
                            )
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default DiningPage;
