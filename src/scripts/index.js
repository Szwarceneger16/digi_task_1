import storage from './dependencies/storage.js';

window.addEventListener('DOMContentLoaded', (event) => {
    // dodanie obslugi formualrza dla rpzycisku submit
    document.getElementById('personBirthDayAddFormSubmitButton').addEventListener(
        'click', 
        valdiateForm
    );

    document.getElementById('toogleViewButton').addEventListener(
        'click', 
        async () => {
           await toggleViews();
        }, false
    );


});

// funkcja sprawdzajaca poprawnosc formualrza
function valdiateForm() {
    const form = document.forms[personBirthDayAddForm];
    const formElements = form.elements;

    for (let index = 0; index < form.length; index++) {
        const element = formElements[index];
        
        if (!element.checkValidity()) {
            element.nextElementSibling.innerHTML = element.validationMessage;
        } else {
            element.nextElementSibling.innerHTML = "";
        } 
    }

    if (  !form.checkValidity() ) {
        return false;
    }

    document.getElementById('toogleViewButton').removeAttribute('disabled');

    const newDataObject = {
        "name": formElements['name'].value,
        "birthDate": formElements['birthDate'].valueAsDate,
        "photo" : formElements['photo'].files[0],
        "email": formElements['email'].value,
        "phoneNumber": formElements['phoneNumber'].value
    }

    form.reset();
    toggleViews()
    
    getDataFromAPODApi(newDataObject.birthDate)
    .then( res => {
        delete res.date;
        delete res.media_type;
        delete res.service_version;
        newDataObject.apodImage = res;
        newDataObject.id = storage.addBirth(newDataObject);
        setCalendarView(newDataObject.birthDate);
        //
        
    })
    
}

// funkcja pobierajaca obrazy z apod api
// argument date: obiekt Date z data dla szukanego obrazu
async function getDataFromAPODApi(date) {
    return fetch(`https://api.nasa.gov/planetary/apod?api_key=${keyApiAPOD}&date=${date.toISOString().split("T")[0]}`,
    {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
    })
    .then( res =>  res.json() )
    .catch( err => {
        console.error(err);
    })
}
window.getAPOD = getDataFromAPODApi;

// animacja przejscia pomiedzy formualrzem a kalendarzem
async function toggleViews() {
    return new Promise(function(resolve, reject) {
        const createViewElement = document.getElementById('createView'),
        showViewElement = document.getElementById('showView');
    
        if (  window.getComputedStyle(createViewElement, null).display === 'block' ) {
            createViewElement.style.animation = 'toggleViewAniamtion 1s 1';

            setTimeout( () => {
                createViewElement.style.display = 'none';
                showViewElement.style.display = 'block';
                showViewElement.style.animation = 'toggleViewAniamtion 1s 1 reverse';
                setTimeout( () => {
                    createViewElement.style.animation = '';
                    showViewElement.style.animation = '';
                    resolve()
                }, 1000);
                
            },1000)
        } else {
            showViewElement.style.animation = 'toggleViewAniamtion 1s 1';
            
            setTimeout( () => {
                showViewElement.style.display = 'none';
                createViewElement.style.display = 'block';
                createViewElement.style.animation = 'toggleViewAniamtion 1s 1 reverse';
                setTimeout( () => {
                    showViewElement.style.animation = '';
                    createViewElement.style.animation = '';
                    resolve()
                }, 1000);
            },1000)
        }
    });
}

const setCalendarView = function() {
    let calendarDateReference = new Date();
    // nazwy meisiecy do kalendarza
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

    const calendarHeaderElementChilds = document.getElementById('calendarHeader').children;
    // funkcja zmianiajaca date referencyjna dla kalendarz o miesiac w przod/w tyl
    const moveCalendarViewByMonth = (direction) => {
        const actualMonth = calendarDateReference.getMonth();
        if (direction < 0) {
            if( actualMonth === 0 ) {
                calendarDateReference.setMonth( 11);
                calendarDateReference.setFullYear(calendarDateReference.getFullYear() - 1)
                // ustawienie roku dla kalendarza
                calendarHeaderElementChilds[0].innerHTML = calendarDateReference.getFullYear();
            }else{
                calendarDateReference.setMonth( actualMonth - 1);
            }
            // ustawienie miesiaca dla kalendarza
            calendarHeaderElementChilds[1].innerHTML =  monthNames[calendarDateReference.getMonth()];

        } else if (direction > 0) {
            if( actualMonth === 11 ) {
                calendarDateReference.setMonth( 0);
                calendarDateReference.setFullYear(calendarDateReference.getFullYear() + 1)
                // ustawienie roku dla kalendarza
                calendarHeaderElementChilds[0].innerHTML = calendarDateReference.getFullYear();
            }else{
                calendarDateReference.setMonth( actualMonth + 1);
            }
            // ustawienie miesiaca dla kalendarza
            calendarHeaderElementChilds[1].innerHTML =  monthNames[calendarDateReference.getMonth()];
        }
    }
    // funkcja oblcizajaca liczbe dni w danym miesiacu
    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth()+1 , 0).getDate();
    }

    // funkcja dodajaca nowe urodziny do kalendarza
    function addBirthInCalendar(data, element) {
        //const calendarElementChildreen = document.getElementById('calendar').children[6+data.birthDate.getDate()];
        element.style.backgroundImage = `url(${data.apodImage.url})`;
        element.style.cursor = "pointer";

        // jesli modal byl dotychczas nie uzyty, natychmaistowe przypisanie danych
        const modalChildren = myModal.getElementsByClassName('modal-body')[0].children;
        if ( modalChildren[5].firstElementChild.src === '') {
            modalChildren[1].innerText = data.apodImage.title;
            modalChildren[3].innerText = data.apodImage.explanation;
            modalChildren[5].firstElementChild.src = data.apodImage.hdurl;
        }
        // event po klikniecu dnia na kalendarzu
        element.children[0].addEventListener('click', (e) => {
            const modalChildren = myModal.getElementsByClassName('modal-body')[0].children;

            if ( modalChildren[5].firstElementChild.src !== data.apodImage.hdurl ) {
                modalChildren[1].innerText = data.apodImage.title;
                modalChildren[3].innerText = data.apodImage.explanation;
                modalChildren[5].firstElementChild.style.display = 'none';
                modalChildren[5].firstElementChild.src = data.apodImage.hdurl;
                modalChildren[5].firstElementChild.onload = (e) => {
                    e.target.style.display = 'block';
                } 
            }  
            myModal.style.display = "block";  

        }, false )
        
        element.children[1].innerHTML = data.name;
        element.children[2].innerHTML = new Date().getFullYear() - data.birthDate.getFullYear() + " births";
        element.children[3].innerHTML = data.email;
    }

    // funkcja usuwajaca urodziny z widoku kalendarza
    function clearBirthInCalendar(element) {
        element.children[1].innerHTML = "";
        element.children[2].innerHTML = "";
        element.children[3].innerHTML = "";
        element.style.backgroundImage = '';
        element.style.cursor = "";
    }

    const calendarElement = document.getElementById('calendar');
    
    return function (dateNow) {
        
        if ( typeof dateNow === 'undefined' ) return false;
        // przypisanie daty do kalendarza jesli nie jest zadna przypisana
        if ( dateNow instanceof Date ) {
            calendarDateReference = new Date(dateNow.getTime());
            calendarDateReference.setDate(1);
            calendarHeaderElementChilds[0].innerHTML = calendarDateReference.getFullYear();
            calendarHeaderElementChilds[1].innerHTML =  monthNames[calendarDateReference.getMonth()];
            setListView(calendarDateReference);
            
        } else if ( typeof dateNow === "number") {
            moveCalendarViewByMonth(dateNow);

        }else {
            return false;
        }
    
        const calendarElementChildreen =calendarElement.children;
        const numberOfDaysInMonth = daysInMonth(calendarDateReference);

        // ustawienie wszytskich urodzin w danym miesiacu z bazy danych
        const birthsInThisMonth = storage.getBirthsByMonth(calendarDateReference);
        // indeks do przebiegania tablicy birthsInThisMonth
        let birthsInThisMonthIndex = 0;
        const setCalendarDayCard = (el,index) => {
            if ( birthsInThisMonth[birthsInThisMonthIndex] && index === birthsInThisMonth[birthsInThisMonthIndex].birthDate.getDate() ) {
                addBirthInCalendar(birthsInThisMonth[birthsInThisMonthIndex], el);
                birthsInThisMonthIndex++;
            } else {
                clearBirthInCalendar(el);
            }
        }

        // dni 1 -- 26
        Array.from(calendarElementChildreen).slice(7,33).forEach( (el,index) => {
            // dodanie urodzin dla danego dnia w widoku kalendarza lub wyczyszczeie pol
            setCalendarDayCard(el,index);
        })
        // dni 27 - 31
        Array.from(calendarElementChildreen).slice(33).forEach( (el,index) => {
            // ustawianie widocznych dni kalendarza, w zalzenosci od meisiaca 27,28,30,31 oraz przypisanie urodzin
            if ( 26 + index < numberOfDaysInMonth) {
                // dodanie urodzin dla danego dnia w widoku kalendarza lub wyczyszczeie pol
                setCalendarDayCard(el,index);
                el.style.display = 'grid';
            } else {
                el.style.display = 'none';
            }
        })

        //ustawienie odpowiedniego dnia tygodnia dla peirwszego dnia miesiaca
        calendarElementChildreen[7].style.gridColumnStart = calendarDateReference.getDay() + 1;
        return true;
    }
}();

function editBirth(id,element) {
    const submitEdit = () => {
        const newLiChildren = newLiElement.children;
        if ( !Array.from(newLiChildren).slice(0,4).every( element => {
            return element.checkValidity();
        })) {
            return;
        }

        element.children[0].innerHTML = newLiChildren[0].valueAsDate.toDateString();
        element.children[1].src =  URL.createObjectURL(newLiChildren[1].files[0]);
        element.children[1].onload = function() {
            URL.revokeObjectURL(this.src);
        }
        element.children[2].innerHTML = newLiChildren[2].value;
        element.children[3].innerHTML = newLiChildren[3].value;

        const newData = {
            "dateBirth": newLiChildren[0].valueAsDate,
            "photo": newLiChildren[1].files[0],
            "name": newLiChildren[2].value,
            "email": newLiChildren[3].value
        }
        storage.editBirth(id,newData);
        setCalendarView(0);

        element.parentElement.removeChild(newLiElement);
        element.style.display = 'grid';

    }
    const elementChildren = element.children;

    const newLiElement = document.createElement('li');
    newLiElement.insertAdjacentHTML('beforeend',`
    <input type='date' class='input-field' required value='${ new Date(elementChildren[0].innerHTML).toISOString().split("T")[0]}'>
    <input type='file' accept="image/png, image/jpeg" style='width:90%' required>
    <input type='text' class='input-field' value='${elementChildren[2].innerHTML}' required>
    <input type='email' class='input-field' value='${elementChildren[3].innerHTML}' required>
    <button>
        <img author='bqlqn' title="bqlqn" from="https://www.flaticon.com/authors/bqlqn" src="./../img/pencil.svg">
    </button>
    <button>
        <img author='bqlqn' title="bqlqn" from="https://www.flaticon.com/authors/bqlqn" src="./../img/trash.svg">
    </button>
    `)
    newLiElement.children[4].onclick = submitEdit;
    newLiElement.children[5].onclick = elementChildren[5].onclick;
    element.parentElement.insertBefore(newLiElement,element);

    element.style.display = 'none';
}

function deleteBirth(id,element) {
    storage.deleteBirth(id);
    element.parentElement.removeChild(element);
    setCalendarView(0);
}

function setListView(date) {

    const listOfBirthdaysElement = document.getElementById('listOfBirthdays');
    const listOfBirthdaysChildren = listOfBirthdaysElement.children;

    // dodanie do listy wszytskich urodzin w danym roku
    const birthsInThisYear = storage.getBirthsByYear(date);
    // indeks do przebiegania tablicy birthsInThisYear
    let birthsInThisYearIndex = 0;

    Array.from(listOfBirthdaysChildren).slice(1).forEach( (el) => {
        if ( birthsInThisYearIndex < birthsInThisYear.length ) {
            const birthday = birthsInThisYear[birthsInThisYearIndex]; 
            const id = birthday.id.valueOf();
            const element = el;
            el.children[0].innerHTML = birthday.birthDate.toDateString();
            el.children[1].src = URL.createObjectURL(birthday.photo);
            el.children[1].onload = function() {
                URL.revokeObjectURL(this.src);
            }
            el.children[2].innerHTML = birthday.name;
            el.children[3].innerHTML = birthday.email;
            el.children[4].onclick = function() { editBirth(id,element) } ;
            el.children[5].onclick = function() { deleteBirth(id,element) };
            birthsInThisYearIndex++;
        } else {
            el.parentElement.removeChild(el);
        }
        
    });
    birthsInThisYear.slice(birthsInThisYearIndex).forEach( birthday => {
        listOfBirthdaysElement.insertAdjacentHTML('beforeend', 
            `<li>
                <p>${birthday.birthDate.toDateString()}</p>
                <img src=${birthday.apodImage.url}>
                <p>${birthday.name}</p>
                <p>${birthday.email}</p>
                <button>
                    <img author='bqlqn' title="bqlqn" from="https://www.flaticon.com/authors/bqlqn" src="./../img/pencil.svg">
                </button>
                <button>
                    <img author='bqlqn' title="bqlqn" from="https://www.flaticon.com/authors/bqlqn" src="./../img/trash.svg">
                </button>
            </li>`
            )
    })
    
}