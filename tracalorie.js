/*jslint es6: true*/

// Data Controller
const DataController = (function () {
    'use strict';

    const localStorageKey = 'DATA';

    const item = function (itemName, calories) {
        this.itemName = itemName;
        this.calories = calories;
    };

    let dataStruct = {
        items: [],
        totalCalories: 0
    };

    let itemToEdit = {};

    // save the newItem to local storage
    const saveItem = function (newItem) {
        let data = null;
        // check if there's something already stored in localstorage
        let jsonString = localStorage.getItem(localStorageKey);

        // there's some data already saved in localstorage
        if (jsonString !== null) {
            data = JSON.parse(localStorage.getItem(localStorageKey));
        }

        if (data !== null) {
            // copy the data object in to dataStruct
            dataStruct = Object.assign({}, data);
        }

        // add the new item to dataStruct
        dataStruct.items.push(newItem);
        dataStruct.totalCalories = parseInt(dataStruct.totalCalories) + parseInt(newItem.calories);

        // convert to JSON string
        jsonString = JSON.stringify(dataStruct);

        // save to local storage
        localStorage.setItem(localStorageKey, jsonString);
    };

    const saveData = function (data) {
        const jsonString = JSON.stringify(data);
        localStorage.setItem(localStorageKey, jsonString);
    };

    const readData = function () {
        const data = JSON.parse(localStorage.getItem(localStorageKey));
        return data;
    };

    const removeAllData = function () {
        const data = readData();

        if (data !== null) {
            localStorage.clear();
        }
    };

    return {
        item: item,
        data: dataStruct,
        saveItem: saveItem,
        saveData: saveData,
        storageKey: localStorageKey,
        itemToEdit: itemToEdit,
        readData: readData,
        removeAllData: removeAllData
    };
})();

// UI Controller
const UIController = (function () {
    'use strict';
    const UISelectors = {
        mealField: 'meal-field',
        calorieField: 'calorie-field',
        addButton: 'add-btn',
        mealList: 'meal-collection',
        totalCalories: 'total-calories',
        deleteButton: 'delete-btn',
        updateButton: 'update-btn',
        backButton: 'back-btn',
        clearButton: 'clear-btn'
    };

    const getAddButton = function () {
        return document.getElementById(UISelectors.addButton);
    };

    const getDeleteButton = function () {
        return document.getElementById(UISelectors.deleteButton);
    };

    const getUpdateButton = function () {
        return document.getElementById(UISelectors.updateButton);
    };

    const getBackbutton = function () {
        return document.getElementById(UISelectors.backButton);
    };

    const getClearButton = function () {
        return document.getElementById(UISelectors.clearButton);
    };

    const getMealField = function () {
        return document.getElementById(UISelectors.mealField);
    };

    const getCalorieField = function () {
        return document.getElementById(UISelectors.calorieField);
    };

    const getMealsList = function () {
        return document.querySelector(`.${UISelectors.mealList}`);
    };

    const getTotalCaloriesText = function () {
        return document.getElementById(UISelectors.totalCalories);
    };

    const clearFields = function () {
        getMealField().value = '';
        getCalorieField().value = '';
    };

    // hide back, update and back button and show add button
    const setAddItemState = function () {
        getAddButton().style.display = 'inline-block';
        getUpdateButton().style.display = 'none';
        getDeleteButton().style.display = 'none';
        getBackbutton().style.display = 'none';
    };

    // show back, update and back button and hide add button
    const setEditItemState = function () {
        getAddButton().style.display = 'none';
        getUpdateButton().style.display = 'inline-block';
        getDeleteButton().style.display = 'inline-block';
        getBackbutton().style.display = 'inline-block';
    };

    const showData = function () {
        // clear mealList so that if there are meal items alread shown, they are not duplcated
        const mealList = getMealsList();
        mealList.innerHTML = '';
        // read data from localstorage
        const data = DataController.readData();

        if (data == null) {
            return;
        }

        data.items.forEach(item => {
             // create a list item
            const li = document.createElement('li');
            li.classList.add('collection-item');

            // create strong tag and item name to it
            const mealName = document.createElement('strong');
            mealName.textContent = item.itemName;

            // create em tag and add item's calories to it
            const mealCalories = document.createElement('em');
            mealCalories.textContent = item.calories + ' calories';

            // create a span tag and append strong, em tags to it
            const span = document.createElement('span');
            span.appendChild(mealName);
            span.appendChild(document.createTextNode(': '));
            span.appendChild(mealCalories);

            // create i tag for material icon
            const editIcon = document.createElement('i');
            // add meterialize css classes
            editIcon.classList.add('material-icons');
            editIcon.classList.add('right');
            editIcon.classList.add('edit-icon');
            // add material icon name
            editIcon.textContent = 'edit';

            // append span tag and icon to list item
            li.appendChild(span);
            li.appendChild(editIcon);

            // append list item to meal list
            mealList.appendChild(li);
        });

        // show total calories
        const totalCalories = getTotalCaloriesText();
        totalCalories.textContent = `Total Calories = ${data.totalCalories}`;
    };

    return {
        getAddButton: getAddButton,
        getMealField: getMealField,
        getCalorieField: getCalorieField,
        clearFields: clearFields,
        showData: showData,
        setAddItemState: setAddItemState,
        setEditItemState: setEditItemState,
        getMealsList: getMealsList,
        getBackbutton: getBackbutton,
        getDeleteButton: getDeleteButton,
        getUpdateButton: getUpdateButton,
        getClearButton: getClearButton,
        getTotalCaloriesText: getTotalCaloriesText
    };
})();

// App Controller
const AppController = (function () {
    'use strict';
    const attachEventListeners = function () {
        addBtnListner();
        itemEditBtnListener();
        backButtonListener();
        deleteButtonListener();
        updateButtonListener();
        clearButtonListener();
    };

    const addBtnListner = function () {
        const addButton = UIController.getAddButton();
        addButton.addEventListener('click', addItem);
    };

    // set click listener on edit button using event delegation
    // event listener is attached to meals list
    const itemEditBtnListener = function () {
        const mealList = UIController.getMealsList();
        mealList.addEventListener('click', editItem);
    };

    // set the app state back to add item
    const backButtonListener = function () {
        const backButton = UIController.getBackbutton();
        backButton.addEventListener('click', UIController.setAddItemState);
        backButton.addEventListener('click', UIController.clearFields);
    };

    const deleteButtonListener = function () {
        const deleteButton = UIController.getDeleteButton();
        deleteButton.addEventListener('click', deleteItem);
    };

    const updateButtonListener = function () {
        const updateButton = UIController.getUpdateButton();
        updateButton.addEventListener('click', updateItem);
    };

    const clearButtonListener = function () {
        const clearButton = UIController.getClearButton();
        clearButton.addEventListener('click', resetApp);
    };

    const addItem = function () {
        const mealField = UIController.getMealField();
        const calorieField = UIController.getCalorieField();

        // get field values
        const meal = mealField.value;
        const calories = calorieField.value;

        if (meal.length > 0 && calories.length > 0) {
            // create new item
            const newItem = new DataController.item(meal, calories);
            DataController.saveItem(newItem);
            UIController.clearFields();
            UIController.showData();
        }
    };

    const editItem = function (event) {
        if(event.target.classList.contains('edit-icon')) {
            // get the edit button
            const editButton = event.target;
            // get the span element containing item information
            const spanElement = editButton.previousElementSibling;
            // get the item name and item calories from span element
            const itemName = spanElement.firstElementChild.textContent;
            let itemCalories = spanElement.lastElementChild.textContent;
            // split item calories on first non-digit character
            // and extract the calories digit
            itemCalories = itemCalories.split(/\D/g);

            // set item valies in the respective fields
            UIController.getMealField().value = itemName;
            UIController.getCalorieField().value = itemCalories[0];
            UIController.setEditItemState();

            // set the itemToEdit object in DataController
            const itemToEdit = new DataController.item(itemName, itemCalories[0]);
            DataController.itemToEdit = itemToEdit;
        }
    };

    const deleteItem = function () {
        // get the item to be edited
        const itemToEdit = DataController.itemToEdit;
        // get the data from localstorage and delete this item from there
        const data = DataController.readData();

        // find the first occurence of the item to delete in the items list
        const firstIndexOf = data.items.findIndex(item => {
            return item.itemName === itemToEdit.itemName && item.calories === itemToEdit.calories;
        });

        // filter the items list, removing the item to be deleted
        const filteredData = data.items.filter((item, index) => {
            // if current index === firstIndexOf, don't include that item
            if(index !== firstIndexOf) {
                return item;
            }
        });

        // set the filtered items array to dataStruct
        DataController.data.items = filteredData;
        // subtract the deleted item calories from total calories
        DataController.data.totalCalories = parseInt(data.totalCalories) - parseInt(itemToEdit.calories);

        // save data
        DataController.saveData(DataController.data);

        // set the Add Item state
        UIController.setAddItemState();

        // read the data again from localstorage
        UIController.showData();

        // clear the fields
        UIController.clearFields();
    };

    const updateItem = function () {
        const itemToEdit = DataController.itemToEdit;
        const mealField = UIController.getMealField();
        const calorieField = UIController.getCalorieField();
        const updatedItemName = mealField.value;
        const updatedItemCalories = calorieField.value;

        if ( (updatedItemName.length > 0 && updatedItemCalories.length > 0)
              && (updatedItemName !== itemToEdit.itemName
              || updatedItemCalories !== itemToEdit.calories)
        ) {

            // read the data from localstorage
            const data = DataController.readData();

            const updatedData = data.items.map(item => {
                if (item.itemName === itemToEdit.itemName && item.calories === itemToEdit.calories) {
                    item.itemName = updatedItemName;
                    item.calories = updatedItemCalories;
                }

                return item;
            });

            // set the updated data array to dataStruct
            DataController.data.items = updatedData;
            // update the total calories count
            // first subtract the itemToEdit's calories from total calories
            // then add the updatedItemCalories to the total calories
            data.totalCalories = parseInt(data.totalCalories) - parseInt(itemToEdit.calories);
            DataController.data.totalCalories = parseInt(data.totalCalories) + parseInt(updatedItemCalories);

            // save updated data to localstorage
            DataController.saveData(DataController.data);

            // set the Add Item state
            UIController.setAddItemState();

            // read the data again from localstorage
            UIController.showData();

            // clear the fields
            UIController.clearFields();
        }
    };

    const resetApp = function () {
        DataController.removeAllData();
        UIController.getTotalCaloriesText().textContent = 'Total Calories = 0';
        UIController.showData();
    };

    const init = function () {
        // attach event listeners
        attachEventListeners();
        // read data from localstorage and show it on UI
        UIController.showData();
        // set initial state
        UIController.setAddItemState();
    };

    return {
        init: init
    };
})();

// initialize app
AppController.init();
