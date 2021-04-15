'use strict';
// document.forms[0][0].value = 'dfdffd'
// document.forms[0][1].valueAsDate = new Date()
// document.forms[0][3].value = 'sdasd@dasdad'
// document.forms[0][4].value = '555-555-555'
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

    // window.addEventListener('scroll', (e) => {
    //     if ( e.target == calendarElement) {
    //         e.preventDefault();
    //     }
    // },false);
    // calendarElement.addEventListener('wheel', (e) => {
    //     if (e.deltaY > 0) {
    //         if (calendarElement.parentElement.scrollLeft < calendarElement.parentElement.scrollWidth - document.body.scrollWidth) {
    //             calendarElement.parentElement.scrollLeft += 10;
    //         }
    //     } else if (calendarElement.parentElement.scrollLeft > 0) {
    //         calendarElement.parentElement.scrollLeft -= 10;
    //     }
    // },false);
    
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