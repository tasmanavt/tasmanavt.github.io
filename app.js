"use strict";

import data from "./data.js";
///глобальные переменные///
let randomNumber;
let cellNow;
let editorMod = false;

///DOM элементы///
const wrapper = document.querySelector(".wrapper");
const startScreen = document.querySelector(".start-screen");
const startClose = document.querySelector(".start-close");
const trans = document.querySelector(".trans");
const walk = document.querySelector(".walk");
const player = document.querySelector(".player");
const diceImg = document.querySelector(".dice-image");
const rollBtn = document.querySelector(".roll");
const cellAll = document.querySelectorAll(".cell");
const modalOverlay = document.querySelector(".modal-overlay");
const closeModalButton = document.querySelector(".close-button");

function teleport(idCell) {
  let cellID = getCurrentCell();

  const cell = document.getElementById(`${idCell}`);
  const cell1 = document.getElementById(`${cellID}`);
  let rect1;

  if (cell1) {
    rect1 = cell1.getBoundingClientRect();
  } else {
    rect1 = player.getBoundingClientRect();
  }

  const rect2 = cell.getBoundingClientRect();

  const x1 = rect1.left + rect1.width / 2;
  const y1 = rect1.top + rect1.height / 2;
  const x2 = rect2.left + rect2.width / 2;
  const y2 = rect2.top + rect2.height / 2;

  const distX = x2 - x1;
  const distY = y2 - y1;

  TweenMax.set(player, {
    x: `+=${distX}`,
    y: `+=${distY}`,
  });

  cellNow = idCell;
}

function oneStep() {
  let numberOfSteps = randomNumber;

  let cellID = getCurrentCell();

  let stepsRemaining = numberOfSteps;

  if (Number(stepsRemaining) + Number(cellID) > 72) {
    alert("нельзя ходить дальше чем клетка 72");
  } else {
    function movePlayer() {
      const cell1 = document.getElementById(cellID) ?? {
        getBoundingClientRect: () => ({}),
      };
      const cell2 = document.getElementById(Number(cellID) + 1) ?? {
        getBoundingClientRect: () => ({}),
      };

      const rect1 = cell1.getBoundingClientRect();
      const rect2 = cell2.getBoundingClientRect();

      const x1 = rect1.left + rect1.width / 2;
      const y1 = rect1.top + rect1.height / 2;
      const x2 = rect2.left + rect2.width / 2;
      const y2 = rect2.top + rect2.height / 2;

      const distX = x2 - x1;
      const distY = y2 - y1;

      gsap.to(player, {
        x: `+=${distX}`,
        y: `+=${distY}`,
        duration: `1`,
        onComplete: () => {
          stepsRemaining--;
          if (stepsRemaining > 0) {
            const newCellID = getCurrentCell();
            cellID = newCellID;
            movePlayer();
          } else {
            cellNow = getCurrentCell();
            openModal();
          }
        },
      });
    }

    movePlayer();
  }
}

function startGame() {
  teleport(1);
  openModal();
}

window.addEventListener("resize", function () {
  teleport(cellNow);
});

function getCurrentCell() {
  const playerRect = player.getBoundingClientRect();
  const cells = document.querySelectorAll(".cell");

  for (let i = 0; i < cells.length; i++) {
    const cellRect = cells[i].getBoundingClientRect();
    const cellWidth = cells[i].offsetWidth;
    const cellHeight = cells[i].offsetHeight;

    if (
      playerRect.left + playerRect.width / 2 >= cellRect.left &&
      playerRect.left + playerRect.width / 2 <= cellRect.left + cellWidth &&
      playerRect.top + playerRect.height / 2 >= cellRect.top &&
      playerRect.top + playerRect.height / 2 <= cellRect.top + cellHeight
    ) {
      return cells[i].id;
    }
  }

  return null;
}

function random() {
  return Math.floor(Math.random() * 6) + 1;
}
function rollDice() {
  randomNumber = random();

  diceImg.src = `dice${randomNumber}.png`;
}

rollBtn.addEventListener("click", rollDice);

trans.addEventListener("click", function () {
  editorMod = true;
  for (let cell of cellAll) {
    cell.style.opacity = 0.5;
  }
});

walk.addEventListener("click", function (e) {
  oneStep();
});

function goToCell(cellIDNext) {
  let cellID = getCurrentCell();
  const cell1 = document.getElementById(`${cellID}`);
  const cell2 = document.getElementById(`${cellIDNext}`);

  const rect1 = cell1.getBoundingClientRect();
  const rect2 = cell2.getBoundingClientRect();

  const x1 = rect1.left + rect1.width / 2;
  const y1 = rect1.top + rect1.height / 2;
  const x2 = rect2.left + rect2.width / 2;
  const y2 = rect2.top + rect2.height / 2;

  const distX = x2 - x1;
  const distY = y2 - y1;

  gsap.to(player, {
    x: `+=${distX}`,
    y: `+=${distY}`,
    duration: `2`,
    onComplete: () => {
      cellNow = cellIDNext;
      openModal();
    },
  });
}

function chekSpecial() {
  const finalCellID = getCurrentCell();
  const indexCell = finalCellID - 1;

  if (data[indexCell].isSpecial) {
    goToCell(data[indexCell].goToCell);
  }
}

closeModalButton.addEventListener("click", closeModal);

function openModal() {
  const h2Element = document.querySelector(".modal h2");
  const pElement = document.querySelector(".modal p");

  const finalCellID = getCurrentCell();
  const indexCell = finalCellID - 1;

  h2Element.textContent = `${data[indexCell].id} ${data[indexCell].name}`;
  pElement.textContent = `${data[indexCell].description}`;
  modalOverlay.style.display = "flex";
}

function closeModal() {
  modalOverlay.style.display = "none";
  chekSpecial();
}

for (let cell of cellAll) {
  cell.addEventListener("mouseover", () => {
    cell.classList.add("highlight");
    if (editorMod) {
      cell.style.opacity = 1;
    }
  });
  cell.addEventListener("mouseout", () => {
    cell.classList.remove("highlight");
    if (editorMod) {
      cell.style.opacity = 0.5;
    }
  });
}

for (let i = 0; i < cellAll.length; i++) {
  cellAll[i].addEventListener("click", (event) => {
    const clickedCellId = event.target.id;
    if (editorMod) {
      editorMod = false;
      for (let cell of cellAll) {
        cell.style.opacity = 1;
      }
      teleport(clickedCellId);
      console.log(clickedCellId + "клик");
    }
  });
}

cellAll.forEach((cell) => {
  cell.textContent = data[Number(cell.id) - 1].name;

  if (data[Number(cell.id) - 1].isSpecial) {
    cell.dataset.info = data[Number(cell.id) - 1].goToCell;
    if (data[Number(cell.id) - 1].id > data[Number(cell.id) - 1].goToCell) {
      cell.dataset.infoStyle = "color: red";
    } else {
      cell.dataset.infoStyle = "color: green";
    }
  } else {
    cell.dataset.info = "";
  }

  cell.style.color = "black";
});

startClose.addEventListener("click", closeStartScreen);

function closeStartScreen() {
  startScreen.style.display = "none";
  wrapper.style.display = "flex";
  startGame();
}
