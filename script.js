window.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");
    document.getElementById("joinButton").addEventListener("click", joinRoom);
    document.getElementById("createButton").addEventListener("click", createRoom);
    document.getElementById("copyCode").addEventListener("click", copyCode);
    document.getElementById("quit").addEventListener("click", quit);
    document.getElementById("start-game").addEventListener("click", hostStart);
    document.getElementById("send-turn").addEventListener("click", sendTurn);
    document.getElementById("send-open").addEventListener("click", sendOpen);
    document.getElementById("next-round").addEventListener("click", nextRound);
    document.getElementById("rules-button").addEventListener("click", showRules);

    const cards = document.querySelectorAll('.card');
    let cardArray = Array.from(cards);
    cardArray.forEach(card => {
        card.addEventListener('click', selectCard);
    })
})

/*
    Variables
*/

class Player {
    constructor(nickname) {
        this.nickname = nickname;
        this.cards = 0;
    }
}

class Room {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.players = [];
        this.cards = 0;
    }
}

let me = new Player("");
let room = new Room("");
let token = ""
let isHost = false;
let socket;
let selectedCards = [];
let myCards = [];

/*
    UI Rendering
*/

function showRules() {
        if (document.getElementById("rules-info").style.display === "block") {
            document.getElementById("rules-info").style.display = "none";
            document.getElementById("rules-button").textContent = "Show Rules";
        } else {
            document.getElementById("rules-info").style.display = "block";
            document.getElementById("rules-button").textContent = "Close Rules";
        }
}

function renderRivalTurn(playerName, playerMove) {
    const rivalCardsContainer = document.getElementById('rival-turn');
    rivalCardsContainer.innerHTML = ''; // Clear previous card elements

    for (let i = 0; i < playerMove.length; i++) {
        let card = playerMove[i];
        const cardElement = document.createElement('img');
        cardElement.classList.add(`card`);
        cardElement.src = `reg-cards/${card}.svg`;
        rivalCardsContainer.appendChild(cardElement);
    }

    const nameContainer = document.getElementById('rival-name');
    nameContainer.innerHTML = ''; // Clear previous name element

    const nameElement = document.createElement('h3');
    nameElement.textContent = `${playerName}'s Move:`;
    nameContainer.appendChild(nameElement);

    document.getElementById('player-rival-container').style.display = "block";
}

function renderOpenPage(openMessage, cards) {
    const openPageContainer = document.getElementById('all-cards');
    openPageContainer.innerHTML = '';

    for (let i = 0; i < cards.length; i++) {
        let card = cards[i];
        const cardElement = document.createElement('img');
        cardElement.classList.add(`card`);
        cardElement.src = `cards/${card}.svg`;
        openPageContainer.appendChild(cardElement);
    }

    const msgContainer = document.getElementById('open-message');
    msgContainer.innerHTML = '';
    const msgElement = document.createElement('h3');
    msgElement.textContent = openMessage;
    msgContainer.appendChild(msgElement);
    document.getElementById('third-page').style.display = "none";
    document.getElementById('fourth-page').style.display = "block";
}

function renderPlayers() {
    const playersContainer = document.getElementById("playersContainer");
    playersContainer.innerHTML = ""; // Clear existing players

    room.players.forEach(player => {
        const playerRow = document.createElement("div");
        playerRow.classList.add("row");

        const playerCol = document.createElement("div");
        playerCol.classList.add("col", "center-block", "text-center", "players");

        const playerNickname = document.createElement("h2");
        playerNickname.textContent = player.nickname;

        playerCol.appendChild(playerNickname);
        playerRow.appendChild(playerCol);
        playersContainer.appendChild(playerRow);
    });
}

function renderMyCards() {
    const myCardsContainer = document.getElementById('my-cards-container');
    myCardsContainer.innerHTML = '';
    for (let i = 0; i < myCards.length; i++) {
        let card = myCards[i];
        console.log(card + "  " + JSON.stringify(card))
        const myCardElement = document.createElement('img');
        myCardElement.classList.add(`card`);
        myCardElement.src = `cards/${card}.svg`;
        myCardsContainer.appendChild(myCardElement);
    }
}

function setPlayers(players) {
    room.players = [];
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        let player1 = new Player(player.nickname);
        room.players.push(player1);
    }
}

function nextRound() {
    document.getElementById('fourth-page').style.display = "none";
    document.getElementById('third-page').style.display = "block";
}

function startRound() {
    const selectedCardsContainer = document.getElementById('selected-cards-container');
    selectedCardsContainer.innerHTML = '';
    selectedCards = [];

    document.getElementById("second-page").style.display = "none";
    document.getElementById("third-page").style.display = "block";

    waitForMyTurn();
}

function startNewRound() {
    const selectedCardsContainer = document.getElementById('selected-cards-container');
    document.getElementById("rival-move-text").style.display = "block";
    selectedCardsContainer.innerHTML = '';
    selectedCards = [];
    waitForMyTurn();
}

function playTurn() {
    const selectedCardsContainer = document.getElementById('selected-cards-container');
    selectedCardsContainer.innerHTML = '';
    selectedCards = [];

    document.getElementById("rival-move-text").style.display = "none";
    document.getElementById("my-move-text").style.display = "block";
    document.getElementById("my-move").style.display = "block";
    document.getElementById("send-buttons").style.display = "block";
}

function copyCode() {
    navigator.clipboard.writeText(room.roomCode)
        .then(function () {
            document.getElementById("copyCode").textContent = "\u2705 Copied!";
        })
}

function selectCard(event) {
    const card = event.target;
    const cardId = card.id;
    const isSelected = cardId.startsWith("selected-");

    if (isSelected) {
        // If the card is already selected, remove only one occurrence from the selectedCards array
        const index = selectedCards.indexOf(cardId.slice(-1));
        selectedCards.splice(index, 1);
        // Remove the card from the display
        const selectedCardElement = document.getElementById(cardId);
        selectedCardElement.remove();
        console.log("unchose: " + cardId);
    } else {
        if (selectedCards.length === 5) {
            alert("Can't choose more than 5 cards");
            return;
        }
        // If the card is not selected, add it to the selectedCards array
        selectedCards.push(cardId);
        console.log("chose: " + cardId);

        // Create a new element to display the selected card
        const selectedCardElement = document.createElement('img');
        selectedCardElement.id = `selected-${cardId}`;
        selectedCardElement.classList.add(`card`);
        selectedCardElement.src = `reg-cards/${cardId}.svg`;
        selectedCardElement.addEventListener('click', selectCard);
        // Append the selected card element to the selected cards container
        const selectedCardsContainer = document.getElementById('selected-cards-container');
        selectedCardsContainer.appendChild(selectedCardElement);
    }

    console.log('Selected Cards:', selectedCards);
}

function createRoom() {
    me.nickname = document.getElementById('nickname-input').value;

    if (me.nickname === "") {
        alert("Please enter a valid nickname");
        return;
    }

    room.cards = document.getElementById('cardsNum').value;
    if (room.cards === 0 || room.cards === "Select cards") {
        alert("Please enter a valid number of cards");
        return;
    }

    socket = new WebSocket('wss://13.49.246.178:443/ws');

    // Handle WebSocket connection established event
    socket.onopen = function (event) {
        // Send a creation room message to the server
        const message = {
            action: "createRoom",
            nickname: me.nickname,
            cards_num: room.cards
        };
        socket.send(JSON.stringify(message));
    };

    // Handle incoming messages from the server
    socket.onmessage = function (event) {
        const payload = JSON.parse(event.data);
        if (payload.allowed) {
            room.roomCode = payload.message;
            token = payload.token;
            room.players.push(me);
            isHost = true;
            waitingRoom();
        }
    }

    // Handle WebSocket connection closed event
    socket.onclose = function (event) {
        // Handle connection closed event
        window.location.reload();
    };
}

function joinRoom() {
    me.nickname = document.getElementById('nickname-input').value;

    if (me.nickname === "") {
        alert("Please enter a valid nickname");
        return;
    }
    room.roomCode = document.getElementById('room-code-input').value;
    if (room.roomCode === "") {
        alert("Please enter a valid room code");
        return;
    }

    // Establish a WebSocket connection
    socket = new WebSocket('wss://13.49.246.178:443/ws');

    // Handle WebSocket connection established event
    socket.onopen = function (event) {
        // Send a join room message to the server
        const message = {
            action: "joinRoom",
            nickname: me.nickname,
            room: room.roomCode,
        };
        socket.send(JSON.stringify(message));
    };

    // Handle incoming messages from the server
    socket.onmessage = function (event) {
        const message = JSON.parse(event.data);
        if (message.allowed) {
            // Save the API key for future messages
            token = message.token;
            room.cards = message.cards_num;
            setPlayers(message.players);
            waitingRoom();
        } else {
            alert(message.message);
        }
    };

    // Handle WebSocket connection closed event
    socket.onclose = function (event) {
        // Handle connection closed event
        window.location.reload();
    };
}


function waitingRoom() {
    // Handle incoming messages from the server
    if (isHost) {
        document.getElementById("host-button").style.display = "block";
    } else {
        document.getElementById("waiting").style.display = "block";
    }
    document.getElementById("first-page").style.display = "none";
    document.getElementById("second-page").style.display = "block";
    document.getElementById("roomCode").textContent = "<" + room.roomCode + ">";
    document.getElementById("cardsCount").textContent = "Number of Cards To Start Is " + room.cards;
    renderPlayers();
    waitForStartRoundMessage()
        .then(() => {
            startRound();
        })
}

function waitForStartRoundMessage() {
    return new Promise((resolve, reject) => {
        socket.onmessage = function (event) {
            const message = JSON.parse(event.data);
            if (message.message_type === "startRound") {
                console.log("startRound message received");
                myCards = message.hand;
                renderMyCards();
                resolve(); // Resolve the promise when "startRound" message is received
            }
            else if (message.message_type === "NewPlayer" || message.message_type === "PlayerQuit") {
                setPlayers(message.players);
                renderPlayers();
            }
        };
    });
}

function waitForNewStartRoundMessage() {
    const nameContainer = document.getElementById('rival-name');
    document.getElementById("my-move").style.display = "none";
    document.getElementById("my-move-text").style.display = "none";
    nameContainer.innerHTML = ''; // Clear previous name element
    const rivalCardsContainer = document.getElementById('rival-turn');
    rivalCardsContainer.innerHTML = ''; // Clear previous card elements
    return new Promise((resolve, reject) => {
        socket.onmessage = function (event) {
            const message = JSON.parse(event.data);
            if (message.message_type === "startRound") {
                console.log("startRound message received");
                myCards = [];
                myCards = message.hand;
                renderMyCards();
                resolve(); // Resolve the promise when "startRound" message is received
            }
            else if (message.message_type === "playerLost") {
                const msgContainer = document.getElementById('lost-message');
                msgContainer.innerHTML = "";
                const msgElement = document.createElement('h3');
                msgElement.textContent = message.message;
                msgContainer.appendChild(msgElement);
            }
            else if (message.message_type === "gameOver" || message.message_type === "youLost") {
                gameOverFunc(message)
            }
        }
    })
}

function waitForMyTurn() {
    socket.onmessage = function (event) {
        const message = JSON.parse(event.data);
        if (message.message_type === "playTurn") {
            playTurn();
            waitForMyTurn();
        }
        else if (message.message_type === "suddenQuit") {
            document.getElementById('sudden-quit-text').textContent = message.message;
            setTimeout(() => {
                document.getElementById('sudden-quit-text').innerHTML = "";
            }, 5000);
            waitForMyTurn();
        }
        else if (message.message_type === "badMove") {
            alert("Your hand isn't better then the last!");
            playTurn();
            waitForMyTurn();
        }
        else if (message.message_type === "playedMove") {
            let playerName = message.from;
            let playerMove = message.move;
            renderRivalTurn(playerName, playerMove);
        }
        else if (message.message_type === "openPlayer") {
            let openMessage = message.message;
            let cards = message.all_cards;
            document.getElementById('lost-message').innerHTML = "";
            renderOpenPage(openMessage, cards);
            waitForNewStartRoundMessage()
                .then(() => {
                    startNewRound();
                })
        }
        else if (message.message_type === "gameOver" || message.message_type === "youLost") {
            document.getElementById("third-page").style.display = "none";
            document.getElementById("fourth-page").style.display = "block";
            document.getElementById("open-message").textContent = "";

            gameOverFunc(message)
        }
    }
}

function sendTurn() {
    const message = {
        action: "playTurn",
        room: room.roomCode,
        nickname: me.nickname,
        token: token,
        move_type: "hand",
        move: selectedCards,
    };
    socket.send(JSON.stringify(message));
    document.getElementById("send-buttons").style.display = "none";
    document.getElementById("my-move").style.display = "none";
    document.getElementById("rival-move-text").style.display = "block";

}

function sendOpen() {
    const message = {
        action: "playTurn",
        room: room.roomCode,
        token: token,
        move_type: "open",
        nickname: me.nickname,
    };
    socket.send(JSON.stringify(message));
    document.getElementById("send-buttons").style.display = "none";
}


function hostStart() {
    if (room.players.length < 2) {
        alert("Not enough players, waiting for more players to join");
        return;
    }
    const message = {
        action: "startRound",
        token: token,
        nickname: me.nickname,
        room: room.roomCode,
    };
    socket.send(JSON.stringify(message));
}

function quit() {
    const message = {
        action: "quitRoom",
        token: token,
        room: room.roomCode,
        nickname: me.nickname
    };
    socket.send(JSON.stringify(message));
    token = "";
    window.location.reload();
}

function gameOverFunc(message) {
    const msgContainer = document.getElementById('lost-message');
    msgContainer.innerHTML = "";
    const msgElement = document.createElement('h3');
    msgElement.textContent = message.message;
    msgContainer.appendChild(msgElement);
    document.getElementById('all-player-cards').style.display = "none";
    document.getElementById('next-round').style.display = "none";
    setTimeout(() => {
        window.location.reload();
    }, 10000);
}