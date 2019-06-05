// ToDo: Prefer composition / inheritance

const Snake = props => {
	const gameCanvas = document.getElementById('snake'),
	  pipCanvas = document.getElementById('pip'),
	  powerUpCanvas = document.getElementById('powerup'),
	  snake = gameCanvas.getContext('2d'),
	  pip = pipCanvas.getContext('2d'),
	  powerUp = powerUpCanvas.getContext('2d'),
	  reservedColors = [backgroundColor, pipColor],
	  moves = ['up', 'down', 'left', 'right']
  
	let snakePosition = [0, 0],
	  pipPosition = [0, 0],
	  powerUpPosition = [0, 0],
	  newLevel = false,
	  HIGH_SCORE = 0,
	  startFPS = 12,
	  scaleFactor = 15,
	  gameHeight = 35,
	  gameWidth = 80,
	  snakeBody = [],
	  snakeLength = 7,
	  sounds = false,
	  level = 0,
	  fps = startFPS,
	  dead = true,
	  up = false,
	  down = true,
	  left = false,
	  right = false,
	  powerUpTimer = null,
	  powerUpActive = false,
	  colorSwitch = null,
	  keysActive = true,
	  snakeColor = '#f2f2f2',
	  backgroundColor = '#232323',
	  pipColor = '#d93e46',
	  moveHistory = []
  
	gameCanvas.width = gameWidth * scaleFactor
	gameCanvas.height = gameHeight * scaleFactor
	pipCanvas.width = gameWidth * scaleFactor
	pipCanvas.height = gameHeight * scaleFactor
	powerUpCanvas.width = gameWidth * scaleFactor
	powerUpCanvas.height = gameHeight * scaleFactor
  
	const init = props => {
	  sounds = props.sounds || true
	  startFPS = props.startFPS || 12
	  scaleFactor = props.scaleFactor || 15
  
	  gameCanvas.style.backgroundColor = backgroundColor
  
	  if (localStorage.getItem('SNAKE_HIGH_SCORE')) {
		HIGH_SCORE = localStorage.getItem('SNAKE_HIGH_SCORE')
	  } else {
		HIGH_SCORE = 0
	  }
  
	  document.querySelector('.view').style.height = `${gameHeight *
		scaleFactor}px`
	  document.getElementById('highScore').innerText = `${HIGH_SCORE}`
	  document.querySelector('.splash .highscore').classList.remove('js-active')
  
	  bindEventListeners()
	  toggleDirection('down')
	  requestAnimationFrame(gameLoop.bind(this))
  
	  // localStorage.removeItem("SNAKE_HIGH_SCORE")
	}
  
	const stop = () => {
	  dead = true
	  document.querySelector('.splash').classList.toggle('js-active')
	  document.querySelector('.splash .highscore').classList.remove('js-active')
  
	  if (HIGH_SCORE < level - 1) {
		HIGH_SCORE = level - 1
		document.querySelector('.splash .highscore').classList.toggle('js-active')
		localStorage.setItem('SNAKE_HIGH_SCORE', level - 1)
		document.getElementById('highScore').innerText = `${HIGH_SCORE}`
	  }
	}
  
	const isMultiple = (x, multiple) => {
	  return x % multiple === 1
	}
  
	const isSnakeBody = coords => {
	  return (
		snakeBody.filter(part => {
		  return part[0] === coords[0] && part[1] === coords[1]
		}).length > 0
	  )
	}
  
	const areKeysActive = () => {
	  return keysActive
	}
  
	const bindEventListeners = () => {
	  document.addEventListener('keydown', e => {
		const toggleKeysActive = () => {
		  keysActive = false
		  setTimeout(() => {
			keysActive = true
		  }, 600 / fps)
		}
  
		if (areKeysActive()) {
		  switch (e.code) {
			case 'ArrowUp': {
			  e.preventDefault()
			  toggleKeysActive()
			  toggleDirection('up')
			  break
			}
			case 'ArrowDown': {
			  e.preventDefault()
			  toggleKeysActive()
			  toggleDirection('down')
			  break
			}
			case 'ArrowLeft': {
			  e.preventDefault()
			  toggleKeysActive()
			  toggleDirection('left')
			  break
			}
			case 'ArrowRight': {
			  e.preventDefault()
			  toggleKeysActive()
			  toggleDirection('right')
			  break
			}
			case 'KeyW': {
			  toggleKeysActive()
			  toggleDirection('up')
			  break
			}
			case 'KeyS': {
			  toggleKeysActive()
			  toggleDirection('down')
			  break
			}
			case 'KeyA': {
			  toggleKeysActive()
			  toggleDirection('left')
			  break
			}
			case 'KeyD': {
			  toggleKeysActive()
			  toggleDirection('right')
			  break
			}
			case 'Enter': {
			  e.preventDefault()
			  if (dead) {
				resetGame()
				document.querySelector('.splash').classList.toggle('js-active')
				toggleKeysActive()
				break
			  } else {
				break
			  }
			}
		  }
		}
	  })
	}
  
	const logMove = dir => {
	  moveHistory.unshift([snakePosition, dir])
  
	  if (moveHistory.length > moves.length) {
		moveHistory.pop()
	  }
	}
  
	const getCurrentDirection = () => {
	  if (up) {
		return 'up'
	  }
	  if (down) {
		return 'down'
	  }
	  if (left) {
		return 'left'
	  }
	  if (right) {
		return 'right'
	  }
	}
  
	const setDir = dir => {
	  if (dir === 'up') {
		up = true
	  }
  
	  if (dir === 'down') {
		down = true
	  }
  
	  if (dir === 'left') {
		left = true
	  }
  
	  if (dir === 'right') {
		right = true
	  }
  
	  logMove(dir)
	}
  
	const toggleDirection = dir => {
	  if (dir === getCurrentDirection()) {
		return
	  }
  
	  const resetDir = () => {
		up = false
		down = false
		left = false
		right = false
	  }
  
	  if ((up && dir !== 'down') || (down && dir !== 'up')) {
		resetDir()
		setDir(dir)
	  } else {
		if ((left && dir !== 'right') || (right && dir !== 'left')) {
		  resetDir()
		  setDir(dir)
		}
	  }
	}
  
	const move = () => {
	  if (right) {
		return [1, 0]
	  }
  
	  if (down) {
		return [0, 1]
	  }
  
	  if (up) {
		return [0, -1]
	  }
  
	  if (left) {
		return [-1, 0]
	  }
	}
  
	const randomPixel = () => {
	  return [
		Math.floor(Math.random() * Math.floor(gameWidth)) * scaleFactor,
		Math.floor(Math.random() * Math.floor(gameHeight)) * scaleFactor
	  ]
	}
  
	const randomColor = () => {
	  let rc = '#' + Math.floor(Math.random() * 16777215).toString(16)
  
	  while (reservedColors.filter(color => color === rc).length > 0) {
		rc = '#' + Math.floor(Math.random() * 16777215).toString(16)
	  }
  
	  return rc
	}
  
	const doPowerUp = (value, type, color, seconds) => {
	  const dropPowerUp = () => {
		powerUpPosition = randomPixel()
		powerUp.value = value
		powerUp.type = type
		powerUpActive = true
  
		while (isSnakeBody(powerUpPosition)) {
		  powerUpPosition = randomPixel()
		}
  
		powerUp.fillStyle = backgroundColor
		powerUp.fillRect(
		  powerUpPosition[0],
		  powerUpPosition[1],
		  scaleFactor,
		  scaleFactor
		)
  
		let flash = true
		colorSwitch = setInterval(() => {
		  if (flash) {
			powerUp.fillStyle = color
			powerUp.fillRect(
			  powerUpPosition[0],
			  powerUpPosition[1],
			  scaleFactor,
			  scaleFactor
			)
		  } else {
			powerUp.fillStyle = backgroundColor
			powerUp.fillRect(
			  powerUpPosition[0],
			  powerUpPosition[1],
			  scaleFactor,
			  scaleFactor
			)
		  }
  
		  flash = !flash
		}, 100)
  
		powerUpTimer = setTimeout(() => {
		  powerUp.clearRect(
			0,
			0,
			gameWidth * scaleFactor,
			gameHeight * scaleFactor
		  )
		  powerUpPosition = [0, 0]
		  clearInterval(colorSwitch)
		  clearTimeout(powerUpTimer)
		  powerUpActive = false
		}, seconds * 1000)
	  }
  
	  if (powerUpPosition === [0, 0]) {
		dropPowerUp()
	  } else {
		powerUp.clearRect(0, 0, gameWidth * scaleFactor, gameHeight * scaleFactor)
		powerUpPosition = [0, 0]
		powerUpActive = false
		clearInterval(colorSwitch)
		clearTimeout(powerUpTimer)
		dropPowerUp()
	  }
	}
  
	const resetGame = () => {
	  level = 0
	  fps = startFPS
	  dead = false
	  newLevel = true
	  snakePosition = [0, 0]
	  snakeBody = []
	  snakeLength = 7
	  down = true
	  snakeColor = '#f2f2f2'
	  moveHistory = []
  
	  snake.clearRect(0, 0, gameWidth * scaleFactor, gameHeight * scaleFactor)
	  pip.clearRect(0, 0, gameWidth * scaleFactor, gameHeight * scaleFactor)
	  powerUp.clearRect(0, 0, gameWidth * scaleFactor, gameHeight * scaleFactor)
	  clearInterval(colorSwitch)
	  toggleDirection('down')
  
	  document.getElementById('highScore').innerText = `${HIGH_SCORE}`
	}
  
	const buildLevel = () => {
	  level++
	  pip.fillStyle = pipColor
	  pipPosition = randomPixel()
  
	  while (isSnakeBody(pipPosition)) {
		pipPosition = randomPixel()
	  }
  
	  pip.fillRect(pipPosition[0], pipPosition[1], scaleFactor, scaleFactor)
	  newLevel = false
  
	  snakeLength += 2
	  fps += 0.5
  
	  if (level > 10) {
		//Speed Reduction
		if (fps >= 25) {
		  if (isMultiple(level, Math.floor(Math.random() * Math.floor(10)))) {
			doPowerUp(0.3, 'speed', randomColor(), 5)
		  }
		}
  
		//Length Reduction
		if (snakeLength > 40) {
		  if (isMultiple(level, Math.floor(Math.random() * Math.floor(20)))) {
			doPowerUp(0.2, 'length', randomColor(), 8)
		  }
		}
  
		//Change Color
		if (isMultiple(level, Math.floor(Math.random() * Math.floor(20)))) {
		  const c = randomColor()
		  doPowerUp(c, 'color', c, 10)
		}
	  }
	}
  
	const handleCollisions = () => {
	  //Detect Pip Collision
	  if (
		pipPosition[0] === snakePosition[0] &&
		pipPosition[1] === snakePosition[1]
	  ) {
		if (sounds) {
		  // ding.play()
		}
		newLevel = true
		pip.clearRect(pipPosition[0], pipPosition[1], scaleFactor, scaleFactor)
	  }
  
	  //Detect PowerUp Collision
	  if (powerUpActive) {
		if (
		  powerUpPosition[0] === snakePosition[0] &&
		  powerUpPosition[1] === snakePosition[1]
		) {
		  powerUpActive = false
  
		  if (powerUp.type !== 'color' && sounds) {
			// beep.play()
		  }
  
		  powerUp.clearRect(
			0,
			0,
			gameWidth * scaleFactor,
			gameHeight * scaleFactor
		  )
  
		  if (powerUp.type === 'color') {
			snakeColor = powerUp.value
		  }
  
		  if (powerUp.type === 'speed') {
			const reduction = Math.round(fps * powerUp.value)
			if (fps - reduction > startFPS) {
			  fps = fps - reduction
			} else {
			  fps = startFPS
			}
		  }
  
		  if (powerUp.type === 'length') {
			const partsToRemove = Math.round(snakeLength * powerUp.value)
  
			for (let i = 0; i < partsToRemove; i++) {
			  snake.clearRect(
				snakeBody[snakeLength - 1][0],
				snakeBody[snakeLength - 1][1],
				scaleFactor,
				scaleFactor
			  )
			  snakeBody.pop()
			  snakeLength--
			}
		  }
  
		  //Clear
		  clearInterval(powerUpTimer)
		  clearTimeout(colorSwitch)
		  powerUpPosition = [0, 0]
		}
	  }
  
	  //Detect Bounds Collision
	  if (
		snakePosition[0] < 0 ||
		snakePosition[0] === gameWidth * scaleFactor ||
		(snakePosition[1] < 0 || snakePosition[1] === gameHeight * scaleFactor)
	  ) {
		stop()
	  }
  
	  //Detect Self Collision
	  const hitSelf = () => {
		return snakeBody
		  .map((part, index) => {
			if (index > 0) {
			  return part[0] === snakePosition[0] && part[1] === snakePosition[1]
			}
		  })
		  .filter(res => res === true)
	  }
  
	  if (hitSelf().length > 0) {
		stop()
	  }
	}
  
	const gameLoop = () => {
	  if (!dead) {
		if (newLevel) {
		  buildLevel()
		}
  
		snake.fillStyle = snakeColor
  
		//Update Snake Coords [TIP]
		snakePosition[0] += move()[0] * scaleFactor
		snakePosition[1] += move()[1] * scaleFactor
  
		if (snakeBody.length < snakeLength) {
		  snakeBody.unshift([...snakePosition])
		} else {
		  const filtered = snakeBody.filter((item, index) => {
			return index !== snakeLength - 1
		  })
		  filtered.unshift([...snakePosition])
		  snakeBody = [...filtered]
		}
  
		snake.fillRect(
		  snakePosition[0],
		  snakePosition[1],
		  scaleFactor,
		  scaleFactor
		)
  
		//Collisions
		handleCollisions()
	  }
  
	  //Loop
	  setTimeout(() => {
		if (snakeBody.length === snakeLength) {
		  snake.clearRect(
			snakeBody[snakeLength - 1][0],
			snakeBody[snakeLength - 1][1],
			scaleFactor,
			scaleFactor
		  )
		}
  
		//Output
		// document.getElementById('frames').innerText = `${Math.floor(fps)}`
		// document.getElementById('length').innerText = snakeLength
		document.getElementById('level').innerText = `${level}`
  
		gameLoop()
	  }, 1000 / fps)
	}
  
	init(props)
  }
  
  export default Snake