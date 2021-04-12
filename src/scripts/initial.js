const personBirthDayAddForm = 'personBirthDayAddForm',
    keyApiAPOD = 'NpRGSKyi5LzJO3uckC1UabCrScL8MJjWVgQehtBz';

    document.forms[0].elements[0].value = 'abcd';
    document.forms[0].elements[1].valueAsDate = new Date(2021,3,11);
    document.forms[0].elements[3].value = "asdsa@dssad";
    document.forms[0].elements[4].value = '555-555-555';

// obsluga modala
{
    const modal = document.getElementById("myModal");
    modal.getElementsByClassName('modal-close')[0].addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = "none";
    },false)

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = "none";
    },false)
}

// dodanie venetow dla przyciskow do obslugi kalendarza
{
    const calendarHeaderButtons = document.querySelectorAll('#calendarHeader button');
    // prev button
    calendarHeaderButtons[0].addEventListener( 'click' , () => {
        setCalendarView(-1);
    })
    //next button
    calendarHeaderButtons[1].addEventListener( 'click' , () => {
        setCalendarView(1);
    })
}

// ustawienie pola z wyborem aktualnej daty urodzin maksymalnie na dzis
document.forms[personBirthDayAddForm].elements.birthDate.setAttribute(
    'max',
    new Date().toISOString().split("T")[0]
);

// przypisanie nazw dni tygodnia w widoku kalendarza
{
    const weekDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const calendarElement = document.getElementById('calendar');
    
    weekDays.forEach(element => {
        calendarElement.insertAdjacentHTML('beforeend', `<div class="week-name">${element}</div>`)
    });

}

//utworzenie pustej siatki dni w kalendarzu
{
    const calendarElement = document.getElementById('calendar');
    for (let index = 1; index <= 31 ; index++) {
        calendarElement.insertAdjacentHTML('beforeend', 
            `<div class='day'>
                <p>${index}</p>
                <p></p>
                <p></p>
                <p></p>
            </div>`
            )
    }
}