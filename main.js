const NUM_CUPS = 7;
const MAX_TRIES = 3;
let tries = 0;
let game = {"route": "", "instructions": []};
let flag = {"success": false};
const correctIndex = 3; // always the middle cup (0–6)

const cupsContainer = document.getElementById("cups");
const msg = document.getElementById("message");

// create cups
for (let i = 0; i < NUM_CUPS; i++) {
    const c = document.createElement("div");
    c.className = "cup";
    c.dataset.index = i;
    c.addEventListener("click", onGuess);
    cupsContainer.appendChild(c);
}



async function onGuess(e) {
    const idx = +e.currentTarget.dataset.index;
    game.route += idx;
    tries++;

    if (tries == 3) {
        await checkRoute(game);
    }
    
    if (tries == 3 && flag.success) {
        revealFlag(e.target);
    } else {
        const leftCount = getLeftCount(idx);
        const rightCount = getRightCount(idx);
        const dir = getDir(leftCount, rightCount);
        const remaining = MAX_TRIES - tries;
        if (remaining > 0) {
            msg.textContent = `Nope! The flag is to the ${dir}. ${remaining} ${remaining === 1 ? "try" : "tries"} remaining.`;
        } else {
            msg.textContent = `Game over!`;
            document.getElementById("next").innerHTML = "<button onClick='window.location.reload();'>Play Again</button>"
            disableAll();
        }
        e.target.classList.add("disabled");
    }
}



function getLeftCount(idx) {
    let closestLeft = -1;
    game.route.split("").forEach(cupId => {
        if (cupId < idx && cupId > closestLeft) {
            closestLeft = cupId;
        }
    });
    
    return idx - closestLeft - 1;
}

function getRightCount(idx) {
    let closestRight = 7;
    game.route.split("").forEach(cupId => {
        if (cupId > idx && cupId < closestRight) {
            closestRight = cupId;
        }
    });

    return closestRight - idx - 1;
}

function getDir(lc, rc) {
    let dir = "";
    if (lc > rc) {
        dir = "left";
    } else if (rc > lc) {
        dir = "right";
    } else {
        availDir = ["left", "right"]
        dir = availDir[Math.floor(Math.random() * 2)];
    }

    game.instructions.push(dir);
    return dir;
}



function revealFlag(cupEl) {
    msg.textContent = `You found it!`;
    disableAll();
    const flag = document.createElement("div");
    flag.className = "flag-icon";
    flag.textContent = "🚩";
    cupEl.appendChild(flag);
    document.getElementById("next").innerHTML = "<button onClick='showFlag();'>Claim Flag!</button>"
}

function showFlag() {
    msg.textContent = `🎉 Your flag is: ${flag.flag}`;
    document.getElementById("next").innerHTML = "<button onClick='window.location.reload();'>Play Again</button>"
}

function disableAll() {
    document.querySelectorAll(".cup").forEach((c) => c.classList.add("disabled"));
}



async function checkRoute(game) {
    try {
        // const response = await fetch(('http://josephiancodex.me:5002/checkRoute'), {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({"game": game}),
        // });

        // if (!response.ok) {
        //     throw new Error('Network response was not ok');
        // }

        // const result = await response.json();

        const response = await fetch('https://josephiancodex.me/bsgame/checkRoute.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game })
        });

        if (!response.ok) {
        throw new Error(`Network response was not ok (status ${response.status})`);
        }

        const result = await response.json();

        flag = result;
        console.log(flag);
    
    } catch (error) {
        console.error('Error fetching data from backend:', error);
    }

    return false;
}
