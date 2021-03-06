'use strict';
import storage from './dependencies/storage.js';

window.addEventListener('DOMContentLoaded', (event) => {
    // dodanie obslugi formualrza dla przycisku submit
    document.getElementById('person-birth-day-add-form-submit-button').addEventListener(
        'click', 
        valdiateForm
    );

    // dodanie eventu onclick dla przycisku do zmiany widoków
    document.getElementById('toogle-view-button').addEventListener(
        'click', 
        async (e) => {
            e.target.setAttribute('disabled',"");
            toggleViews()
            .then( () => e.target.removeAttribute('disabled') );
        }, false
    );

    // dodanie evnetow dla przyciskow do obslugi kalendarza
    {
        const calendarHeaderButtons = document.querySelectorAll('#calendar-header button');
        // prev button
        calendarHeaderButtons[0].addEventListener( 'click' , () => {
            setCalendarView(-1);
        })
        //next button
        calendarHeaderButtons[1].addEventListener( 'click' , () => {
            setCalendarView(1);
        })
    }

    //ustawienie poczatkowego widoku kalendarza na dzis
    setCalendarView(0);
});

// funkcja sprawdzajaca poprawnosc formualrza
function valdiateForm() {
    const form = document.forms[personBirthDayAddForm];
    const formElements = form.elements;
    const formErrorFields = document.forms[personBirthDayAddForm].getElementsByClassName('error-message');

    for (let index = 0; index < form.length; index++) {
        const element = formElements[index];
        
        if (!element.checkValidity()) {
            formErrorFields[index].innerHTML = element.validationMessage;
        } else {
            formErrorFields[index].innerHTML = "";
        } 
    }

    if (  !form.checkValidity() ) {
        return false;
    }

    const newDataObject = {
        "name": formElements['name'].value,
        "birthDate": formElements['birth-date'].valueAsDate,
        "photo" : formElements['photo'].files[0],
        "email": formElements['e-mail'].value,
        "phoneNumber": formElements['phone-number'].value
    }

    
    toggleViews().then( () => form.reset() )
    
    // przetworzenie podanych danych w formularzu
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
    return fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${keyApiAPOD}&date=${date.
        toISOString().split("T")[0]}`,
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
//window.getAPOD = getDataFromAPODApi;

// powiekszanie/oddalanie obrazu dodanego przez uzytkownika
const zoomOutImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.remove('zoomIn');
    e.target.onclick = zoomInImage;
}
const zoomInImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target;
    target.classList.add('zoomIn');
    target.onclick = zoomOutImage;
}

// animacja przejscia pomiedzy formualrzem a kalendarzem
async function toggleViews() {
    return new Promise(function(resolve, reject) {
        const createQueryViewElement = document.getElementById('create-query-view'),
        showViewElement = document.getElementById('show-calendar-view');
    
        if (  window.getComputedStyle(createQueryViewElement, null).display === 'block' ) {
            // aniamcja wyjsciowa
            createQueryViewElement.style.animation = `toggleViewAniamtion ${togglePageAniamtionDuration}s 1 normal both`;    
            
            //aniamcja wejsciowa
            createQueryViewElement.onanimationend = () => {
                createQueryViewElement.style.display = 'none';
                createQueryViewElement.onanimationend = null;
                showViewElement.style.display = 'block';
                showViewElement.style.animation = `toggleViewAniamtion ${togglePageAniamtionDuration}s 1 reverse both`;
                
                showViewElement.onanimationend = () => {
                    createQueryViewElement.style.animation = '';
                    showViewElement.style.animation = '';
                    showViewElement.onanimationend = null;
                    resolve();
                };
                
            };
        } else {
            // aniamcja wyjsciowa
            showViewElement.style.animation = `toggleViewAniamtion ${togglePageAniamtionDuration}s 1 both`;
            
            //aniamcja wejsciowa
            showViewElement.onanimationend = () => {
                showViewElement.onanimationend = null;
                showViewElement.style.display = 'none';
                createQueryViewElement.style.display = 'block';
                createQueryViewElement.style.animation = `toggleViewAniamtion ${togglePageAniamtionDuration}s 1 reverse both`;
                
                createQueryViewElement.onanimationend = () => {
                    showViewElement.style.animation = '';
                    createQueryViewElement.style.animation = '';
                    createQueryViewElement.onanimationend = null;
                    resolve();
                };
            };
        }
    });
}

const setCalendarView = function() {
    let calendarDateReference = undefined;
    const apodDataModal = document.getElementById('apod-data-modal');

    // nazwy miesiecy do kalendarza
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

    const calendarHeaderElementChilds = document.getElementById('calendar-header').children;
    // funkcja widok kalendarza o miesiac w przod/w tyl
    const moveCalendarViewByMonth = (direction) => {
        if ( typeof direction !== 'number') return;
        const actualMonth = calendarDateReference.getMonth();
        direction = direction > 0 ? 1 : (direction < 0 ? -1 : 0);
        calendarDateReference.setMonth( actualMonth + direction);

        // ustawienie miesiaca dla kalendarza
        calendarHeaderElementChilds[1].innerHTML =  monthNames[calendarDateReference.getMonth()];
        // ustawienie roku dla naglowka kalendarza i przeladowanie listy
        if (actualMonth === 0 || actualMonth === 11) {
            calendarHeaderElementChilds[0].innerHTML = calendarDateReference.getFullYear();
            setListView(new Date(calendarDateReference.getTime()));
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

        // jesli modal byl dotychczas nie uzyty, natychmaistowe przypisanie danych
        const modalChildren = apodDataModal.getElementsByClassName('modal-body')[0].children;
        if ( modalChildren[5].firstElementChild.src === '') {
            modalChildren[1].innerText = data.apodImage.title;
            modalChildren[3].innerText = data.apodImage.explanation;
            modalChildren[5].firstElementChild.src = data.apodImage.hdurl;
        }
        // event po klikniecu dnia na kalendarzu
        element.addEventListener('click', (e) => {
            //if ( e.target != element) return;
            const modalChildren = apodDataModal.getElementsByClassName('modal-body')[0].children;

            if ( modalChildren[5].firstElementChild.src !== data.apodImage.hdurl ) {
                modalChildren[1].innerText = data.apodImage.title;
                modalChildren[3].innerText = data.apodImage.explanation;
                modalChildren[5].firstElementChild.style.display = 'none';
                modalChildren[5].firstElementChild.src = data.apodImage.hdurl;
                modalChildren[5].firstElementChild.onload = (e) => {
                    e.target.style.display = 'block';
                } 
            }  
            apodDataModal.style.display = "block";  

        }, false )
        element.style.cursor = "pointer";
        
        // wpisanie danych dla danego dnia w kalendarzu
        element.children[1].innerHTML = data.name;
        element.children[2].firstElementChild.onload = function() {
            URL.revokeObjectURL(this.src);
        }
        element.children[2].onclick = zoomInImage;
        element.children[2].firstElementChild.src = URL.createObjectURL(data.photo);
        element.children[2].firstElementChild.style.display = 'block';
        element.children[3].innerHTML = new Date().getFullYear() - data.birthDate.getFullYear() + " births";
        element.children[4].innerHTML = data.email;
    }

    // funkcja usuwajaca urodziny z widoku kalendarza
    function clearBirthInCalendar(element) {
        element.children[1].innerHTML = "";
        element.children[2].src = "";
        element.children[2].firstElementChild.style.display = "none";
        element.children[3].innerHTML = "";
        element.children[4].innerHTML = "";
        element.style.backgroundImage = '';
        element.style.cursor = "";
    }

    // poczatkowa inicjalizacja kalendarza
    const initCalendarDateReference = (inputdate) => {
        calendarDateReference = new Date(inputdate.getTime());
        calendarDateReference.setDate(1);
        calendarHeaderElementChilds[0].innerHTML = calendarDateReference.getFullYear();
        calendarHeaderElementChilds[1].innerHTML =  monthNames[calendarDateReference.getMonth()];
    }
    initCalendarDateReference(new Date());
    const calendarElement = document.getElementById('calendar');
    
    return function (dateNow) {
        
        if ( typeof dateNow === 'undefined' ) return false;
        // przypisanie daty do kalendarza jesli nie jest zadna przypisana
        if ( dateNow instanceof Date ) {
            
            initCalendarDateReference(dateNow);
            setListView(calendarDateReference);
            
        } else if ( typeof dateNow === "number") {
            // zmiana widoku kalendarza o miesiac w przod lub w tyl
            if (dateNow !== 0) moveCalendarViewByMonth(dateNow);
            setListView(calendarDateReference);
        }else {
            return false;
        }
    
        const calendarElementChildreen =calendarElement.children;
        const numberOfDaysInMonth = daysInMonth(calendarDateReference);

        // pobranie wszystkich urodzin w danym miesiacu z bazy danych
        const birthsInThisMonth = storage.getBirthsByMonth(calendarDateReference);
        birthsInThisMonth.sort( (firstElement,secondElement) => {
            return firstElement.birthDate.getDate() - secondElement.birthDate.getDate();
        })
        // indeks do przebiegania tablicy birthsInThisMonth
        let birthsInThisMonthIndex = 0;
        const setCalendarDayCard = (el,index) => {
            if ( birthsInThisMonth[birthsInThisMonthIndex] && index === 
                birthsInThisMonth[birthsInThisMonthIndex].birthDate.getDate() - 1 ) {

                addBirthInCalendar(birthsInThisMonth[birthsInThisMonthIndex], el);
                birthsInThisMonthIndex++;
                while ( birthsInThisMonth[birthsInThisMonthIndex] && index === 
                    birthsInThisMonth[birthsInThisMonthIndex].birthDate.getDate() - 1 ) {
                    addBirthInCalendar(birthsInThisMonth[birthsInThisMonthIndex], el);
                    birthsInThisMonthIndex++;  
                }
            } else {
                clearBirthInCalendar(el);
            }
        }

        // przejscie po wszytskich dniach w kalendarzu, usuniecie starych danych i dodanie nowych
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

        //ustawienie odpowiedniego dnia tygodnia dla pierwszego dnia miesiaca
        calendarElementChildreen[7].style.gridColumnStart = calendarDateReference.getDay() + 1;
        return true;
    }
}();

function editBirth(id,element) {
    // funkcja przetwarzajaca edycje
    const submitEdit = () => {
        const newLiChildren = newLiElement.children;
        let newLiChildreenArray = Array.from(newLiChildren);
        // pola ktore sa wymagane
        newLiChildreenArray = [newLiChildreenArray[0],newLiChildreenArray[2],newLiChildreenArray[3]]
        if ( !newLiChildreenArray.slice(0,4).every( element => {
            return element.checkValidity();
        })) {
            return;
        }

        element.children[0].innerHTML = newLiChildren[0].valueAsDate.toDateString();
        // jesli nowy plik zostal załadowany
        if (newLiChildren[1].firstElementChild.files[0]) {
            element.children[1].src = URL.createObjectURL(
                newLiChildren[1].firstElementChild.files[0]
            );
            element.children[1].onload = function() {
                URL.revokeObjectURL(this.src);
            }
        }   
        element.children[2].innerHTML = newLiChildren[2].value;
        element.children[3].innerHTML = newLiChildren[3].value;

        const newData = {
            "dateBirth": newLiChildren[0].valueAsDate,
            "name": newLiChildren[2].value,
            "email": newLiChildren[3].value
        }
        // jesli nowy plik zostal załadowany
        if (newLiChildren[1].firstElementChild.files[0]) {
            newData.photo = newLiChildren[1].firstElementChild.files[0];
        }
        // zaktualziowanie widokow, bazy danych
        storage.editBirth(id,newData);
        element.parentElement.removeChild(newLiElement);
        setCalendarView(0);
        element.style.display = 'grid';

    }
    const elementChildren = element.children;

    // dodanie wiersza do edycji i ukrycie aktualnego
    const newLiElement = document.createElement('li');
    newLiElement.insertAdjacentHTML('beforeend',`
    <input type='date' class='input-field' required value='${ 
        new Date(elementChildren[0].innerHTML).toISOString().split("T")[0]}'>
        <p class="input-field-file">
          <input name="photo" type="file" accept="image/png, image/jpeg" required="">
          <label for="photo">
            Photo upload
          </label>
        </p>
    <input type='text' class='input-field' value='${elementChildren[2].innerHTML}' required>
    <input type='email' class='input-field' value='${elementChildren[3].innerHTML}' required>
    <button>
        <img author='bqlqn' title="bqlqn" 
        from="https://www.flaticon.com/authors/bqlqn" src="./../img/pencil.svg">
    </button>
    <button>
        <img author='bqlqn' title="bqlqn" 
        from="https://www.flaticon.com/authors/bqlqn" src="./../img/trash.svg">
    </button>
    `)
    newLiElement.children[4].onclick = submitEdit;
    newLiElement.children[5].onclick = (e) => {
        elementChildren[5].onclick();
        const editLiElement = e.target.parentElement.parentElement;
        editLiElement.parentElement.removeChild(editLiElement);
    } 
    element.parentElement.insertBefore(newLiElement,element);

    element.style.display = 'none';
}

//usuniecie wiersza (li) z listy
function deleteBirth(id,element) {
    storage.deleteBirth(id);
    element.parentElement.removeChild(element);
    setCalendarView(0);
}

// funkcja aktualizujaca wyswieltanie listy
function setListView(date) {

    const listOfBirthdaysElement = document.getElementById('list-of-birthdays');
    const listOfBirthdaysChildren = listOfBirthdaysElement.children;

    // dodanie do listy wszytskich urodzin w danym roku
    const birthsInThisYear = storage.getBirthsByYear(date);
    // indeks do przebiegania tablicy birthsInThisYear
    let birthsInThisYearIndex = 0;

    
    Array.from(listOfBirthdaysChildren).slice(1).forEach( (el) => {
        // dla aktualnie istneijacych wierszy li edycja zawartosci
        if ( birthsInThisYearIndex < birthsInThisYear.length ) {
            const birthday = birthsInThisYear[birthsInThisYearIndex]; 
            const id = birthday.id.valueOf();
            const element = el;
            el.children[0].innerHTML = birthday.birthDate.toDateString();

            el.children[1].firstElementChild.onload = function() {
                URL.revokeObjectURL(this.src);
            }
            el.children[1].firstElementChild.src = URL.createObjectURL(birthday.photo);

            el.children[2].innerHTML = birthday.name;
            el.children[3].innerHTML = birthday.email;
            el.children[4].onclick = function(e) { editBirth(id,e.currentTarget.parentElement) } ;
            el.children[5].onclick = function(e) { deleteBirth(id,e.currentTarget.parentElement) };
            birthsInThisYearIndex++;
        } // usuniecie nadmairowych wierszy
        else {
            el.parentElement.removeChild(el);
        }
        
    });
    //dodanie nowych wierszy jesli wyamgane
    birthsInThisYear.slice(birthsInThisYearIndex).forEach( birthday => {
        const liElement = document.createElement('li');
        liElement.insertAdjacentHTML('beforeend', 
            `<p>${birthday.birthDate.toDateString()}</p>
            <div><img class="zoomOut"></div>
            <p>${birthday.name}</p>
            <p>${birthday.email}</p>
            <button>
                <img author='bqlqn' title="bqlqn" 
                from="https://www.flaticon.com/authors/bqlqn" src="./../img/pencil.svg">
            </button>
            <button>
                <img author='bqlqn' title="bqlqn" 
                from="https://www.flaticon.com/authors/bqlqn" src="./../img/trash.svg">
            </button>`
        )
        liElement.children[1].firstElementChild.onload = function() {
            URL.revokeObjectURL(this.src);
        }
        liElement.children[1].firstElementChild.src = URL.createObjectURL(birthday.photo);
        liElement.children[1].firstElementChild.onclick = zoomInImage;
        liElement.children[4].onclick = (e) => editBirth(birthday.id, e.currentTarget.parentElement);
        liElement.children[5].onclick = (e) => deleteBirth(birthday.id, e.currentTarget.parentElement);
        listOfBirthdaysElement.appendChild(liElement);
    })


}