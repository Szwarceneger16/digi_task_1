
const dataBase = [];
let id = 0;

/* let isStale = false, blockAdd = false;
const asyncStorage =  {
    // name,photo,birthDate,eMail,phoneNumber
    addBirth: async function(data) {
        isStale = true;


        try {
            await new Promise(function(resolve, reject) {
                let intervalFuncionHandler,counter = 0;
                const res = () => {
                    counter++;
                    if (coutner > 100) reject();
                    if (!isStale) {
                        clearInterval(intervalFuncionHandler);
                        resolve();
                    }
                }
                intervalFuncionHandler = setInterval(res, 100);
            })
        } catch (error) {
            return undefined;
        }
        
        data.name = "jan";

        // const newDataObject = {
        //     "name": name,
        //     "birthDate": birthDate,
        //     "image" : {
        //     },
        //     "email": eMail,
        //     "phoneNumber": phoneNumber
        // }
        getDataFromAPODApi(data.birthDate)
        .then(res => {

            isStale = false;
        })

    },
    deleteBirth: function(birthDate) {

    },
    getBirths: async function () {
        blockAdd = true;
        if (!isStale) {
            const ret = Object.assign( {}, dataBase);
            blockAdd = false;
            return ret;
        }

        try {
            await new Promise(function(resolve, reject) {
                let intervalFuncionHandler,counter = 0;
                const res = () => {
                    counter++;
                    if (coutner > 100) reject();
                    if (!isStale) {
                        clearInterval(intervalFuncionHandler);
                        resolve();
                    }
                }
                intervalFuncionHandler = setInterval(res, 100);
            })
        } catch (error) {
            return undefined;
        }

        const ret = Object.assign( {}, dataBase);
        blockAdd = false;
        return ret;
    }
} */

const getBirthIdFromDataBase = (dataToFind) => {
    const index = dataBase.findIndex( (el) => {
        
        for (const [key, value] of Object.entries(dataToFind)) {
            if ( el[key] !== value) return false;
        }
        return true;
    });
    return [ dataBase[index].id , index];
}

const getBirthObjectIndexFromDataBase = (id) => {
    return dataBase.findIndex( (el) => {
        if ( el["id"] === id) return true;
        return false;
    })
}

const getBirthObjectFromDataBase = (id) => {
    return dataBase.find( (el) => {
        if ( el["id"] === id) return true;
        return false;
    })
}

// wrapper dla funkcji obslogujacych baze danych
const storage = {
    addBirth: function(dataToAppend/* name,photo,birthDate,eMail,phoneNumber */) {
        const dataCopy = Object.assign({}, dataToAppend)
        dataCopy.id = id.valueOf();
        id++;
        dataBase.push(dataCopy);
        return dataCopy.id;
    },
    deleteBirth: function(id) {
        const index = getBirthObjectIndexFromDataBase(id);
        dataBase.splice(index,1);
        return true;
    },    
    editBirth: function(id,dataToEdit) {
        const object = getBirthObjectFromDataBase(id);
        
        for (const [key, value] of Object.entries(dataToEdit)) {
            object[key] = value;
          }

        return true;
    },
    getBirthsById: function (id = undefined) {
        if (typeof id === 'undefined') {
            const dataBaseCopy = Object.assign( {}, dataBase);
            return dataBaseCopy;
        }

        const dataBaseElementCopy = Object.assign( {}, dataBase[ getBirthObjectIndexFromDataBase(id) ]);
        return dataBaseElementCopy;
        
    },
    getBirthsByMonth: function (date) {
        let matchedBirths = dataBase.filter( (el) => {
            if ( el['birthDate'].getMonth() === date.getMonth()) return true;
            return false;
        })

        matchedBirths = matchedBirths.map( el => Object.assign( {}, el) )
        return matchedBirths;
    },
    getBirthsByYear: function (date) {
        let matchedBirths = dataBase.filter( (el) => {
            if ( el['birthDate'].getFullYear() === date.getFullYear()) return true;
            return false;
        })

        matchedBirths = matchedBirths.map( el => Object.assign( {}, el) )
        return matchedBirths;
    }
}
window.storage = storage;
export default storage;