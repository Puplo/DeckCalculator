document.addEventListener('DOMContentLoaded', function() {
    const cardSelects = document.querySelectorAll('.card-select');
    const totalDisplay = document.getElementById('total');
    const fanPointsDisplay = document.getElementById('fanpoints');
    const errorDisplay = document.getElementById('error');
    const calculatorType = document.getElementById('calculator-type');
    const resetButton = document.getElementById('reset-button');
    const usernameLabels = [
        document.getElementById('username1'),
        document.getElementById('username2'),
        document.getElementById('username3'),
        document.getElementById('username4'),
        document.getElementById('username5')
    ];
    let maxTotal = 18;
    let allData = [];
    let lastSelectedCardIndex = -1; 
    let selectedUsernames = ["", "", "", "", ""]; 

    const cardValues = [7, 6, 5, 4, 3, 2];
    const remainingDisplays = document.querySelectorAll('.remaining-options');

    function setInitialValues() {
        cardSelects.forEach(select => {
            select.value = '2';
        });
        updateRemainingOptions(0);
        updateFanPoints();
        cardSelects[0].focus(); 
        lastSelectedCardIndex = 0;
    }

    function updateMaxTotal() {
        const calculatorValue = calculatorType.value;
        if (calculatorValue === '18') {
            maxTotal = 18;
        } else if (calculatorValue === '22') {
            maxTotal = 22;
        } else if (calculatorValue === '26') {
            maxTotal = 26;
        }
        totalDisplay.textContent = `Total: 0/${maxTotal}`;
        totalDisplay.classList.remove('green', 'red');
    }

    function updateTotal() {
        let total = 0;
        cardSelects.forEach(select => {
            total += parseInt(select.value, 10) || 0;
        });
        totalDisplay.textContent = `Total: ${total}/${maxTotal}`;

        if (total > maxTotal) {
            errorDisplay.textContent = `Total cannot exceed ${maxTotal} points.`;
            totalDisplay.classList.remove('green');
            totalDisplay.classList.add('red');
        } else {
            errorDisplay.textContent = '';
            totalDisplay.classList.remove('red');
            if (total === maxTotal) {
                totalDisplay.classList.add('green');
            } else {
                totalDisplay.classList.remove('green');
            }
        }
        updateRemainingOptions(total);
        updateFanPoints();
    }

    function updateRemainingOptions(currentTotal = 0) {
        cardSelects.forEach((select, index) => {
            let selectedValue = parseInt(select.value, 10) || 0;
            let possibleCombinations = [];

            cardValues.forEach(value => {
                let newTotal = currentTotal - selectedValue + value;
                if (newTotal <= maxTotal) {
                    possibleCombinations.push(value);
                }
            });

            if (currentTotal === maxTotal) {
                remainingDisplays.forEach(display => display.textContent = '');
            } else {
                remainingDisplays[index].textContent = `Remaining \ud83c\udf1f: ${possibleCombinations.join(', ')}`;
            }
        });
    }

    function updateFanPoints() {
        let fanPoints = 0;
        selectedUsernames.forEach(username => {
            const user = allData.find(user => user.username === username);
            if (user) {
                fanPoints += parseInt(user.score, 10) || 0;
            }
        });
        fanPointsDisplay.textContent = `Fan Score: ${fanPoints}`;
    }

    function fetchDataAndUpdateTable() {
        console.log("Fetching data from server...");
        fetch('https://apiparse.ru/api/data')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("Data received:", data);
                allData = data;
                updateTable(allData, cardSelects[0].value);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function updateTable(data, selectedStars) {
        const tableBody = document.querySelector('#player-table tbody');
        tableBody.innerHTML = '';

        const filteredData = data.filter(item => parseInt(item.stars) == selectedStars);
        const sortedData = filteredData.sort((a, b) => b.score - a.score);

        sortedData.forEach((item, index) => {
            console.log(`Rank: ${item.rank}, Username: ${item.username}, Score: ${item.score}, Stars: ${item.stars}`);
            const row = document.createElement('tr');
            row.innerHTML = 
                `<td>${item.rank}</td>
                <td><a href="${item.link}" target="_blank" class="username-link">${item.username}</a></td>
                <td>${item.score}</td>
                <td>${item.stars}</td>`;
            row.addEventListener('click', (event) => {
                if (!event.target.classList.contains('username-link') && lastSelectedCardIndex >= 0) {
                    displayUsername(lastSelectedCardIndex, item.username);
                }
            });
            tableBody.appendChild(row);
        });
    }

    function displayUsername(index, username) {
        usernameLabels[index].textContent = username;
        selectedUsernames[index] = username;
        updateFanPoints();
    }

    calculatorType.addEventListener('change', function() {
        updateMaxTotal();
        updateTotal();
    });

    cardSelects.forEach((select, index) => {
        select.addEventListener('change', function() {
            lastSelectedCardIndex = index; 
            updateTotal();
            remainingDisplays[index].textContent = '';
            remainingDisplays[index].style.visibility = 'hidden';
            remainingDisplays[index].style.height = '0';
            updateTable(allData, select.value);
        });

        select.addEventListener('focus', function() {
            lastSelectedCardIndex = index;
        });
    });

    resetButton.addEventListener('click', function() {
        setInitialValues();
        updateTotal();
        updateTable(allData, cardSelects[0].value);
        remainingDisplays.forEach(display => {
            display.style.visibility = 'visible';
            display.style.height = 'auto';
        });
        usernameLabels.forEach(label => {
            label.textContent = '';
        });
        selectedUsernames = ["", "", "", "", ""];
        lastSelectedCardIndex = 0;
    });

    setInitialValues();
    updateMaxTotal();
    updateTotal();
    fetchDataAndUpdateTable();
});
