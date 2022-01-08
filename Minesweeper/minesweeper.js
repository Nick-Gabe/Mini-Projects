let info = {
    getBoardSize() {
        let board = info[difficulty]
        return board.width * board.heigth
    },
    easy: {
        bombs: 10,
        width: 9,
        heigth: 9,
        imgSize: 33
    },
    medium: {
        bombs: 40,
        width: 16,
        heigth: 16,
        imgSize: 20
    },
    hard: {
        bombs: 99,
        width: 30,
        heigth: 16,
        imgSize: 20
    }
}

document.addEventListener('keypress', (event) => {
    if(event.key === 'r') generateWorld() 
})

let bombTilesGlobal = [], tilesGlobal = [], flaggedTiles = [],
    restingBombs = document.getElementById('lastBombs'),
    timerTxt = document.getElementById('timer'),
    ponteiro = document.getElementById('ponteiro'),
    victory = document.getElementById('resultScreen'),
    difficulty = 'easy',
    gameIsOver = false, timer, unix,
    tileColorer = (tile, min = info[difficulty].width) => {
        if (min % 2) {
            // width * height = ímpar
            return tile.id % 2 ? 0 : 1
        } else {
            // width * height = par
            return Math.floor(tile.id / min) % 2 ? // caso esteja numa coluna par
                tile.id % 2 ? 0 : 1 :
                tile.id % 2 ? 1 : 0
        }
    }

generateWorld()

openedColor = ['rgb(208, 220, 237)', 'rgb(237, 221, 191)']
const numColor = {
    0: openedColor,
    1: 'rgb(23, 112, 221)',
    2: 'rgb(25, 216, 25)',
    3: 'rgb(209, 18, 18)',
    4: 'rgb(158, 25, 230)',
    5: 'rgb(123, 4, 44)',
    6: 'rgb(172, 161, 4)',
}

function generateBombs(quantity = info[difficulty].bombs, tileQuantity = info.getBoardSize()) {
    let bombTiles = []
    restingBombs.innerText = quantity
    while (bombTiles.length < quantity) {
        let tile = Math.floor(Math.random() * tileQuantity)
        if (!bombTiles.includes(tile)) bombTiles.push(tile)
    }
    bombTilesGlobal = bombTiles.sort((a, b) => a > b ? 1 : -1)
    return bombTiles
}

function gameOver() {
    let bombs = document.querySelectorAll('[bomb]')
    for (let bomb of bombs) {
        bomb.classList.add(bomb.classList.contains('flagged') ? 'correct' : 'bomb')
        bomb.classList.remove('clickable')
        bomb.classList.remove('closed')
        bomb.style.backgroundImage = 'none'
        bomb.innerHTML = `<img src="./bomba.png" alt="bomba" width="${info[difficulty].imgSize}px">`
    }
    let tiles = document.getElementsByClassName('closed')
    for (let tile of tiles) {
        tile.classList.remove('clickable')
    }
    countTime('stop')
    gameIsOver = true
    let restart = document.getElementById('restart')
    restart.classList.add('expanding')
}

function gameWon() {
    let tiles = document.querySelectorAll('.clickable')
    for (let tile of tiles) {
        let tileNumber = tilesGlobal[Number(tile.id)]
        if (tileNumber > 0) {
            tile.innerText = tileNumber
            tile.classList.remove('clickable')
            tile.classList.remove('closed')
            tile.style.backgroundImage = 'none'
            tile.style.backgroundColor = openedColor[tileColorer(tile)]
            tile.style.color = `${numColor[tile.innerText]}`
        } else {
            tile.classList.remove('clickable')
            tile.style.transitionProperty = 'transform, background-color'
            tile.style.backgroundImage = 'none'
            tile.style.backgroundColor = openedColor[tileColorer(tile)]
            tile.style.color = openedColor[tileColorer(tile)]
        }
    }

    let dif = document.getElementById('difficulty')
    let time = document.getElementById('timeSpent')
    let dif_options = {
        easy: 'Fácil',
        medium: 'Médio',
        hard: 'Difícil'
    }
    dif.innerText = `Dificuldade: ${dif_options[difficulty]}`
    time.innerText = `Tempo gasto: ${timerTxt.innerText}`
    victory.style.display = 'block'
    setTimeout(() => {
        victory.classList.add('idle')
    }, 1000)
    countTime('stop')
    gameIsOver = true
    let restart = document.getElementById('restart')
    restart.classList.add('expanding')
}

async function openFields(field, bombs = bombTilesGlobal, min = info[difficulty].width) {
    if (gameIsOver === true) return
    let tile = document.getElementById(`${field}`),
        tileNumber = tilesGlobal[Number(tile.id)],
        board = info[difficulty]

    console.log(window.event.button)
    if (window.event?.button == 2) {
        if (!tile?.classList.contains('closed')) return
        if (tile.classList.contains('flagged')) {
            flaggedTiles.splice(flaggedTiles.indexOf(Number(tile.id)), 1)
            tile.classList.remove('flagged')
            tile.classList.add('questioning')
            tile.innerHTML = `<img src="./indecidido.png" alt="undecided" width="${board.imgSize}px">`
            restingBombs.innerText++
        }
        else if (tile.classList.contains('questioning')) {
            tile.classList.remove('questioning')
            tile.classList.add('clickable')
            tile.innerHTML = ''
        }
        else {
            if (restingBombs.innerText > 0) {
                tile.classList.add('flagged')
                tile.classList.remove('clickable')
                tile.innerHTML = `<img src="./bandeira.png" alt="flag" width="${board.imgSize}px">`
                restingBombs.innerText--
                flaggedTiles.push(Number(tile.id))
                flaggedTiles.sort((a, b) => a > b ? 1 : -1)
                console.log(restingBombs.innerText, flaggedTiles)
                if (bombTilesGlobal.every((x, i) => x === flaggedTiles[i])) gameWon()
            }
        }
        return
    }
    else if (window.event?.button !== 2 && tile?.classList.contains('flagged')) return

    if (bombs.includes(Number(field))) {
        alert('Você clicou numa bomba!')
        return gameOver()
    }
    else if (tileNumber > 0 && openedColor.includes(tile?.style?.backgroundColor)) return

    if (tileNumber > 0) {
        tile.innerText = tileNumber
        tile.classList.remove('clickable')
        tile.classList.remove('closed')
        tile.style.backgroundImage = 'none'
        tile.style.backgroundColor = openedColor[tileColorer(tile)]
        tile.style.color = `${numColor[tile.innerText]}`
    } else {
        let i = Number(field)
        tile.classList.remove('clickable')
        tile.style.backgroundImage = 'none'
        tile.style.backgroundColor = openedColor[tileColorer(tile)]
        tile.style.color = openedColor[tileColorer(tile)]
        tile.innerHTML = ''
        let zeroTiles = []
        if (i % min) {
            !bombs.includes(i - min - 1) && zeroTiles.push(i - min - 1)
            !bombs.includes(i - 1) && zeroTiles.push(i - 1)
            !bombs.includes(i + min - 1) && zeroTiles.push(i + min - 1)
        }
        if (i % min != min - 1) {
            !bombs.includes(i - min + 1) && zeroTiles.push(i - min + 1)
            !bombs.includes(i + 1) && zeroTiles.push(i + 1)
            !bombs.includes(i + min + 1) && zeroTiles.push(i + min + 1)
        }
        !bombs.includes(i - min) && zeroTiles.push(i - min)
        !bombs.includes(i + min) && zeroTiles.push(i + min)

        zeroTiles.forEach(x => {
            let tile = document.getElementById(`${x}`)

            if (!tile || !tile.classList.contains('clickable')) return
            let tileNumber = tilesGlobal[Number(tile.id)]

            if (tileNumber == 0 && !openedColor.includes(tile?.style?.backgroundColor)) {
                tile.innerHTML = ''
                tile.style.backgroundImage = 'none'
                tile.style.backgroundColor = openedColor[tileColorer(tile)]
                tile.style.color = openedColor[tileColorer(tile)]
                tile.classList.remove('clickable')
                tile.classList.remove('closed')
                openFields(Number(tile.id))
            }
            else if (tileNumber > 0 && !openedColor.includes(tile?.style?.backgroundColor)) {
                tile.innerText = tileNumber
                tile.style.backgroundImage = 'none'
                tile.style.color = `${numColor[tileNumber]}`
                tile.style.backgroundColor = openedColor[tileColorer(tile)]
                tile.classList.remove('clickable')
                tile.classList.remove('closed')
            }
        })
    }
}

async function generateNumbers(bombs = bombTilesGlobal, board = info[difficulty]) {
    let tiles = [], width = board.width
    for (x = 0; x < info.getBoardSize(); x++) {
        tiles.push(0)
    }

    for (let i in tiles) {
        i = Number(i)
        let num = 0
        if (i % width) {
            bombs.includes(i - width - 1) && num++
            bombs.includes(i - 1) && num++
            bombs.includes(i + width - 1) && num++
        }
        if (i % width != width - 1) {
            bombs.includes(i - width + 1) && num++
            bombs.includes(i + 1) && num++
            bombs.includes(i + width + 1) && num++
        }
        bombs.includes(i - width) && num++
        bombs.includes(i + width) && num++
        tiles[i] = num
    }
    tilesGlobal = tiles
    return tiles
}

async function generateWorld(board = info[difficulty]) {
    countTime('stop')
    gameIsOver = false
    flaggedTiles = []
    victory.style.display = 'none'
    let restart = document.getElementById('restart')
    restart.classList.remove('expanding')

    const campo = document.querySelector('#campo')
    const fields = []
    const bombs = generateBombs()
    await generateNumbers()

    for (let x = 0; x < info.getBoardSize(); x++) {
        fields.push(`${!(x % board.width) ? '<br>' : ''} <button id="${x}" onmousedown="verifyTile(this)" class="field clickable closed ${difficulty} animate" ${bombs.includes(x) ? 'bomb' : ''}></button>`)
    }

    campo.innerHTML = fields.join(' ')

    setTimeout(() => {
        for (let x = 0; x < fields.length; x++) {
            let item = document.getElementById(x)
            item.classList.remove('animate')
        }
    }, 100)

    countTime('start')
}

function verifyTile(tile) {
    openFields(Number(tile.id))
}

function countTime(order) {
    switch (order) {
        case 'start':
            timerTxt.style.color = '#fff'
            unix = 0
            timer = setInterval(() => {
                unix++
                [mm, ss] = [Math.floor(unix / 60) || '00', unix % 60 || '00']

                if (mm < 10 && !mm.toString().startsWith('0')) mm = '0' + mm
                if (ss < 10 && !ss.toString().startsWith('0')) ss = '0' + ss
                timerTxt.innerText = `${mm}:${ss}`
            }, 1000)
            break;
        case 'stop':
                timerTxt.style.color = 'rgb(255, 182, 182)'
                clearInterval(timer)
            break;
    }
}

function changeDifficulty() {
    difficulty =
        difficulty === 'easy' ? 'medium' :
            difficulty === 'medium' ? 'hard' : 'easy'

    ponteiro.className = difficulty + 'Rotate'

    generateWorld()
}