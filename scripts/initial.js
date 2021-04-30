'use strict';

// obsluga modala
{
    const modal = document.getElementById("apod-data-modal");
    modal.getElementsByClassName('modal-close')[0].addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = "none";
    },false)

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = "none";
    },false)
}

// ustawienie pola z wyborem aktualnej daty urodzin maksymalnie na dzis
document.forms[personBirthDayAddForm].elements['birth-date'].setAttribute(
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
                <div class="day-img"><img class="zoomOut"></div>
                <p></p>
                <p></p>
            </div>`
            )
    }
}