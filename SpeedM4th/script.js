async function start() {
    const languages = await (await fetch('./languages.json')).json()
    google.charts.load('current', { packages: ['corechart'] });

    const
        header = {
            navigation: document.getElementById('header-navigation')
        },
        question = {
            container: document.getElementById('question-container'),
            title: document.getElementById('question-title'),
            calc: document.getElementById('question-calc'),
            input: document.getElementById('question-input'),
            timer: document.getElementById('timer'),
            end: document.getElementById('question-finishGame')
        },
        results = {
            container: document.getElementById('results-container'),
            timer: document.getElementById('results-timer'),
            quote: document.getElementById('results-quote'),
            questions: document.getElementById('results-questions'),
            average: document.getElementById('results-average'),
            percentage: document.getElementById('results-percentage'),
            restart: document.getElementById('results-restart'),
        },
        menu = {
            container: document.getElementById('menu'),
            counter: document.getElementById('menu-counter'),
            endless: document.getElementById('menu-endless'),
            difficulty: document.getElementById('menu-difficulty'),
            language: document.getElementById('menu-language')
        },
        baseContainer = document.getElementById('container')

    let calcHistory = [], answerHistory = [], timestamps = [], unix = 0,
        baseMenu = menu.container.innerHTML, lang = languages[menu.language?.value || 'en']

    question.input.onkeyup = (e) => {
        e.key === "Enter" && validateAnswer(calcHistory.at(-1), question.input.value)
    }

    menu.counter.addEventListener('touchstart', (e) => {
        startGame()
        menu.counter.classList.remove('clickable')
        menu.endless.classList.remove('clickable')
    })
    menu.endless.addEventListener('touchstart', (e = PointerEvent, x = menu.endless) => {
        x.value = x.value === 'false' ? true : false
        startGame()
        menu.endless.classList.remove('clickable')
        menu.counter.classList.remove('clickable')
    })
    // menu.language.addEventListener('touchstart', (e, x = menu.language) => {
    //     const langs = [
    //         {
    //             abbr: 'en',
    //             full: 'English',
    //         }, {
    //             abbr: 'br',
    //             full: 'Brazilian',
    //         }],

    //         index = langs.findIndex(e => e.abbr === x.value),
    //         nextLang = langs[index + 1] || langs[index - 1]

    //     lang = languages[nextLang.abbr]
    //     x.value = nextLang.abbr
    //     menu.container.innerHTML = baseMenu
    //     .replace(`"${menu.difficulty.value}"`, `"${menu.difficulty.value}" selected="selected"`)
    //     .replace(/fade in/g, '')
    //     menu.counter.style.animation = ''
    //     menu.language.style.animation = ''
    //     menu.container = document.getElementById('menu')
    //     menu.endless = document.getElementById('menu-endless')
    //     menu.counter = document.getElementById('menu-counter')
    //     menu.difficulty = document.getElementById('menu-difficulty')

    //     menu.language.innerHTML = `<img src="./language_${nextLang.abbr}.png" alt="Language: ${nextLang.full}" width="65"></img>`

    //     header.navigation.innerHTML = header.navigation.innerHTML.replace(/play|leaderboards|about us/g, e => lang[e])
    //     menu.difficulty.innerHTML = menu.difficulty.innerHTML.replace(/super easy|easy|medium|hard|impossible/g, e => lang[e])
    // }

    question.end.addEventListener('touchstart', (e) => {
        timestamps.push([
            calcHistory.length, // question number
            unix, // - timestamps === [] ? timestamps.at(-1)[1] : 0 // time on this question
            `${calcHistory.length}. ${calc.num1} ${calc.type} ${calc.num2}`, // question number
        ])
        generateResults()
    })

    results.restart.addEventListener('touchstart', (e) => {
        results.container.classList.add('fade-out')
        setTimeout(() => {
            results.container.style.display = 'none'
        }, 500)

        menu.container.style.opacity = 0
        menu.container.style.display = 'flex'
        menu.container.classList.add('fade-in')

        menu.container.innerHTML = baseMenu.replace(`"${menu.difficulty.value}"`, `"${menu.difficulty.value}" selected="selected"`)

        menu.container = document.getElementById('menu')
        menu.endless = document.getElementById('menu-endless')
        menu.counter = document.getElementById('menu-counter')
        menu.difficulty = document.getElementById('menu-difficulty')

        menu.counter.addEventListener('touchstart', (e) => {
            startGame()
            menu.counter.classList.remove('clickable')
        })
        menu.endless.addEventListener('touchstart', (e = PointerEvent, x = menu.endless) => {
            x.value = x.value === 'false' ? true : false
            startGame()
            menu.endless.classList.remove('clickable')
            menu.counter.classList.remove('clickable')
        })
    })

    function generateCalc(dom = question.calc, title = question.title) {
        const difficulty = menu.difficulty.value
        let operations = {
            0() {
                let difOpts = {
                    baby: 5,
                    easy: 10,
                    medium: 15,
                    hard: 30,
                    impossible: 50,
                }
                let max = difOpts[difficulty]

                let obj = {
                    num1: Math.round(Math.random() * max),
                    num2: Math.round(Math.random() * max),
                    type: '*'
                }
                return obj
            },
            1() {
                let difOpts = {
                    baby: 25,
                    easy: 50,
                    medium: 100,
                    hard: 200,
                    impossible: 500,
                }
                let max = difOpts[difficulty]

                let obj = {
                    num1: Math.round(Math.random() * max),
                    num2: Math.round(Math.random() * max),
                    type: '+'
                }
                return obj
            },
            2() {
                let difOpts = {
                    baby: 25,
                    easy: 50,
                    medium: 100,
                    hard: 200,
                    impossible: 500,
                }
                let max = difOpts[difficulty]

                let obj = {
                    num1: Math.round(Math.random() * max),
                    num2: Math.round(Math.random() * max),
                    type: '-'
                }
                return obj
            },
            3() {
                let difOpts = {
                    baby: 5,
                    easy: 10,
                    medium: 15,
                    hard: 30,
                    impossible: 50,
                }
                let max = difOpts[difficulty]

                let num2 = Math.floor(Math.random() * max) + 1
                let obj = {
                    num1: num2 * Math.round(Math.random() * (max - 1) + 1),
                    num2: num2,
                    type: '/'
                }
                return obj
            }
        }
        calc = operations[Math.round(Math.random() * 3)]()
        calcHistory.push(calc)
        dom.innerHTML = `${calc.num1} <span class="operator">${calc.type}</span> ${calc.num2} = ?`
        title.textContent = `${lang['question']} ${calcHistory.length}${menu.endless.value === 'false' ? '/20' : ''}`
    }

    function validateAnswer(calc = {}, answer = '') {
        if (answer === '') return
        let typeVerifier = {
            '*': (x, y) => x * y,
            '+': (x, y) => x + y,
            '-': (x, y) => x - y,
            '/': (x, y) => x / y,
        }
        let correct = typeVerifier[calc.type](calc.num1, calc.num2)
        question.input.value = ""
        timestamps.push([
            calcHistory.length, // question number
            unix, // - timestamps === [] ? timestamps.at(-1)[1] : 0 // time on this question
            `${calcHistory.length}. ${calc.num1} ${calc.type} ${calc.num2}`, // question number
        ])

        answerHistory.push({
            status: answer == correct ? 'correct' : 'wrong',
            html: `<span class="CLASSNAME">${calc.num1} ${calc.type} ${calc.num2} = ${answer}</span>
            ${answer != correct ? `<span class="correction">(${correct})</span>` : ''}
        <p>${lang['time spent']}: ${timestamps.at(-1)[1] - (timestamps.length >= 2 ? timestamps.at(-2)[1] : 0)}s</p>`
        })

        menu.endless.value === 'false' && answerHistory.length >= 20 ? generateResults() : generateCalc()
    }

    function countTime(order = '') {
        switch (order) {
            case 'timerStart':
                unix = 0
                timer = setInterval(() => {
                    unix++
                    [mm, ss] = [Math.floor(unix / 60) || '00', unix % 60 || '00']

                    if (mm < 10 && !mm.toString().startsWith('0')) mm = '0' + mm
                    if (ss < 10 && !ss.toString().startsWith('0')) ss = '0' + ss
                    question.timer.textContent = `${mm}:${ss}`
                }, 1000)
                break;
            case 'timerStop':
                clearInterval(timer)
                break;
            case 'countdownStart':
                const colors = {
                    '5': '#05386B',
                    '4': '#379683',
                    '3': '#5CDB95',
                    '2': '#8EE4AF',
                    '1': '#EDF5E1'
                }
                menu.counter.textContent = '5'
                countdown = setInterval(() => {
                    menu.counter.style.backgroundColor = colors[menu.counter.textContent]
                    menu.counter.textContent--
                    if (menu.counter.textContent === '1') {
                        question.container.style.display = 'flex'
                        menu.difficulty.classList.add('fade-out')
                        menu.difficulty.setAttribute('disabled', 'true')
                        question.container.classList.remove('fade-out')
                        question.container.classList.add('fade-in')
                    }
                    if (menu.counter.textContent === '0') {
                        clearInterval(countdown)
                        countTime('timerStart')
                        menu.counter.classList.add('expand-out')
                        setTimeout(() => {
                            menu.container.style.display = 'none'
                        }, 500)
                        question.input.focus()
                    }
                }, 1000)
                break;
        }
    }

    function drawChart() {
        // Set Data
        // var data = google.visualization.arrayToDataTable([
        //     ['Question', 'Seconds'],
        //     [0, 0], ...timestamps.map((x, i) => [x[0], x[1] - (timestamps[i - 1]?.[1] || 0)])
        // ]);
        var dataTable = new google.visualization.DataTable()
        dataTable.addColumn('number', `${lang['question']}`);
        dataTable.addColumn('number', `${lang['seconds']}`);
        dataTable.addColumn({ type: 'string', role: 'tooltip' })
        dataTable.addRows([
            [0, 0, lang['game started']], ...timestamps.map((x, i) => {
                let questionSeconds = x[1] - (timestamps[i - 1]?.[1] || 0)
                return [x[0], questionSeconds, `${x[2]}\n${questionSeconds} ${lang['seconds']}`]
            })
        ]);
        // Set Options
        var options = {
            title: lang['time spent per question'],
            hAxis: {
                title: lang['questions'],
                textStyle: {
                    color: '#05386B',
                },
                gridlines: {
                    color: '#5CDB95'
                },
                minorGridlines: {
                    color: '#5CDB95'
                }
            },
            vAxis: {
                title: lang['time'],
                textStyle: {
                    color: '#05386B',
                },
                gridlines: {
                    color: '#5CDB95'
                },
                minorGridlines: {
                    color: '#5CDB95'
                }
            },
            backgroundColor: { fill: 'transparent' },
            colors: ['#05386B'],
            legend: {
                position: 'top',
                textStyle: {
                    color: '#000'
                }
            },
            height: 170,
            pointSize: 5,
            fontName: 'sans-serif',
        };
        // Draw
        var chart = new google.visualization.LineChart(document.getElementById('timeChart'));
        chart.draw(dataTable, options);
    }

    function generateResults() {
        menu.counter.style.display = 'none'
        const phrases = lang.phrases
        const percentage = Math.round((answerHistory.filter(e => e.status === "correct").length / answerHistory.length) * 100) || 0
        const validPhrases = phrases[Object.keys(phrases).reverse().find(x => x <= percentage)]
        const randomPhrase = validPhrases[Math.floor(Math.random() * validPhrases.length)]
        results.quote.textContent = randomPhrase

        function formatTime(seconds) {
            [h, m, s] = [
                Math.floor(seconds / 3600),
                Math.floor(seconds % 3600 / 60),
                seconds % 3600 % 60,
            ]
            h > 0 ?
                h = h > 1 ?
                    `${h} ${lang['hours']}, ` : `${h} ${lang['hour']}, ` :
                h = ''

            m > 0 ?
                m = m > 1 ?
                    `${m} ${lang['minutes']}, ` : `${m} ${lang['minute']}, ` :
                m = ''

            s = s > 1 ? `${s} ${lang['seconds']}` : `${s} ${lang['second']}`

            return `${h}${m}${s}`
        }
        results.timer.innerHTML = `${lang['final time']}: <span class="correct">${formatTime(timestamps.at(-1)?.[1])}</span>`
        results.percentage.textContent = `${lang['percentage']}: ${percentage}%`
        results.average.textContent = `${lang['average']}: ${(timestamps.at(-1)[1] / timestamps.length).toFixed(1) || 0}s`
        results.questions.innerHTML = answerHistory.map(x => x = '<li>' + x.html.replace('CLASSNAME', x.status) + '</li>').join(' ')

        countTime('timerStop')

        question.container.classList.add('fade-out')
        setTimeout(() => {
            question.container.style.display = 'none'
            results.container.style.display = 'flex'
            google.charts.setOnLoadCallback(drawChart);
        }, 500)
        results.container.classList.remove('fade-out')
        results.container.classList.add('fade-in')
        baseContainer.style.transform = 'rotateY(360deg)'

    }

    function startGame() {
        menu.endless.style.animation = 'roll-out-left 1s ease-in 0s 1 forwards'
        calcHistory = [], answerHistory = [], timestamps = [], unix = 0
        generateCalc()
        countTime('countdownStart')
    }
}
start()
