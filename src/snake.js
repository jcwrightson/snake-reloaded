/*
    JS Snake
    jcwrightson@gmail.com
    https://jcwrightson.com

    USAGE:

    const game = new Snake()
    game.init()

*/

export default class Snake {
  constructor() {
    this.gameCanvas = document.getElementById('snake')
    this.pipCanvas = document.getElementById('pip')
    this.powerUpCanvas = document.getElementById('powerup')

    this.snake = this.gameCanvas.getContext('2d')
    this.pip = this.pipCanvas.getContext('2d')
    this.powerUp = this.powerUpCanvas.getContext('2d')

    this.snakePosition = [0, 0]
    this.pipPosition = [0, 0]
    this.powerUpPosition = [0, 0]

    this.newLevel = false
    this.HIGH_SCORE = 0
    this.startFPS = 12
    this.scaleFactor = 15
    this.gameHeight = 40
    this.gameWidth = 90
    this.snakeBody = []
    this.snakeLength = 7
    this.level = 0
    this.fps = this.startFPS
    this.dead = true
    this.up = false
    this.down = true
    this.left = false
    this.right = false
    this.powerUpTimer = null
    this.powerUpActive = false
    this.colorSwitch = null
    this.keysActive = true

    this.moveHistory = []
    this.moves = ['up', 'down', 'left', 'right']

    this.gameCanvas.width = this.gameWidth * this.scaleFactor
    this.gameCanvas.height = this.gameHeight * this.scaleFactor
    this.pipCanvas.width = this.gameWidth * this.scaleFactor
    this.pipCanvas.height = this.gameHeight * this.scaleFactor
    this.powerUpCanvas.width = this.gameWidth * this.scaleFactor
    this.powerUpCanvas.height = this.gameHeight * this.scaleFactor

    this.snakeColor = '#f2f2f2'

    this.backgroundColor = '#232323'

    this.pipColor = '#d93e46'

    this.reservedColors = [this.backgroundColor, this.pipColor]
  }

  init(options) {
    this.sounds = options.sounds || true
    this.startFPS = options.startFPS || 12

    this.gameCanvas.style.backgroundColor = this.backgroundColor

    if (localStorage.getItem('SNAKE_HIGH_SCORE')) {
      this.HIGH_SCORE = localStorage.getItem('SNAKE_HIGH_SCORE')
    } else {
      this.HIGH_SCORE = 0
    }

    document.querySelector('.view').style.height = `${this.gameHeight *
      this.scaleFactor}px`
    document.getElementById('highScore').innerText = `${this.HIGH_SCORE}`
    document.querySelector('.splash .highscore').classList.remove('js-active')

    this.bindEventListeners()
    this.toggleDirection('down')
    requestAnimationFrame(this.gameLoop.bind(this))

    // localStorage.removeItem("SNAKE_HIGH_SCORE")
  }

  stop() {
    this.dead = true
    document.querySelector('.splash').classList.toggle('js-active')
    document.querySelector('.splash .highscore').classList.remove('js-active')

    if (this.HIGH_SCORE < this.level - 1) {
      this.HIGH_SCORE = this.level - 1
      document.querySelector('.splash .highscore').classList.toggle('js-active')
      localStorage.setItem('SNAKE_HIGH_SCORE', this.level - 1)
      document.getElementById('highScore').innerText = `${this.HIGH_SCORE}`
    }
  }

  isMultiple(x, multiple) {
    return x % multiple === 1
  }

  isSnakeBody(coords) {
    return (
      this.snakeBody.filter(part => {
        return part[0] === coords[0] && part[1] === coords[1]
      }).length > 0
    )
  }

  areKeysActive() {
    return this.keysActive
  }

  bindEventListeners() {
    document.addEventListener('keydown', e => {
      const toggleKeysActive = () => {
        this.keysActive = false
        setTimeout(() => {
          this.keysActive = true
        }, 600 / this.fps)
      }

      if (this.areKeysActive()) {
        switch (e.code) {
          case 'ArrowUp': {
            e.preventDefault()
            toggleKeysActive()
            this.toggleDirection('up')
            break
          }
          case 'ArrowDown': {
            e.preventDefault()
            toggleKeysActive()
            this.toggleDirection('down')
            break
          }
          case 'ArrowLeft': {
            e.preventDefault()
            toggleKeysActive()
            this.toggleDirection('left')
            break
          }
          case 'ArrowRight': {
            e.preventDefault()
            toggleKeysActive()
            this.toggleDirection('right')
            break
          }
          case 'KeyW': {
            toggleKeysActive()
            this.toggleDirection('up')
            break
          }
          case 'KeyS': {
            toggleKeysActive()
            this.toggleDirection('down')
            break
          }
          case 'KeyA': {
            toggleKeysActive()
            this.toggleDirection('left')
            break
          }
          case 'KeyD': {
            toggleKeysActive()
            this.toggleDirection('right')
            break
          }
          case 'Enter': {
            e.preventDefault()
            if (this.dead) {
              this.resetGame()
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

  logMove(dir) {
    this.moveHistory.unshift([this.snakePosition, dir])

    if (this.moveHistory.length > this.moves.length) {
      this.moveHistory.pop()
    }
  }

  getCurrentDirection() {
    if (this.up) {
      return 'up'
    }
    if (this.down) {
      return 'down'
    }
    if (this.left) {
      return 'left'
    }
    if (this.right) {
      return 'right'
    }
  }

  setDir(dir) {
    if (dir === 'up') {
      this.up = true
    }

    if (dir === 'down') {
      this.down = true
    }

    if (dir === 'left') {
      this.left = true
    }

    if (dir === 'right') {
      this.right = true
    }

    this.logMove(dir)
  }

  toggleDirection(dir) {
    if (dir === this.getCurrentDirection()) {
      return
    }

    const resetDir = () => {
      this.up = false
      this.down = false
      this.left = false
      this.right = false
    }

    if ((this.up && dir !== 'down') || (this.down && dir !== 'up')) {
      resetDir()
      this.setDir(dir)
    } else {
      if ((this.left && dir !== 'right') || (this.right && dir !== 'left')) {
        resetDir()
        this.setDir(dir)
      }
    }
  }

  move() {
    if (this.right) {
      return [1, 0]
    }

    if (this.down) {
      return [0, 1]
    }

    if (this.up) {
      return [0, -1]
    }

    if (this.left) {
      return [-1, 0]
    }
  }

  randomPixel() {
    return [
      Math.floor(Math.random() * Math.floor(this.gameWidth)) * this.scaleFactor,
      Math.floor(Math.random() * Math.floor(this.gameHeight)) * this.scaleFactor
    ]
  }

  randomColor() {
    let rc = '#' + Math.floor(Math.random() * 16777215).toString(16)

    while (this.reservedColors.filter(color => color === rc).length > 0) {
      rc = '#' + Math.floor(Math.random() * 16777215).toString(16)
    }

    return rc
  }

  doPowerUp(value, type, color, seconds) {
    const dropPowerUp = () => {
      this.powerUpPosition = this.randomPixel()
      this.powerUp.value = value
      this.powerUp.type = type
      this.powerUpActive = true

      while (this.isSnakeBody(this.powerUpPosition)) {
        this.powerUpPosition = this.randomPixel()
      }

      this.powerUp.fillStyle = this.backgroundColor
      this.powerUp.fillRect(
        this.powerUpPosition[0],
        this.powerUpPosition[1],
        this.scaleFactor,
        this.scaleFactor
      )

      let flash = true
      this.colorSwitch = setInterval(() => {
        if (flash) {
          this.powerUp.fillStyle = color
          this.powerUp.fillRect(
            this.powerUpPosition[0],
            this.powerUpPosition[1],
            this.scaleFactor,
            this.scaleFactor
          )
        } else {
          this.powerUp.fillStyle = this.backgroundColor
          this.powerUp.fillRect(
            this.powerUpPosition[0],
            this.powerUpPosition[1],
            this.scaleFactor,
            this.scaleFactor
          )
        }

        flash = !flash
      }, 100)

      this.powerUpTimer = setTimeout(() => {
        this.powerUp.clearRect(
          0,
          0,
          this.gameWidth * this.scaleFactor,
          this.gameHeight * this.scaleFactor
        )
        this.powerUpPosition = [0, 0]
        clearInterval(this.colorSwitch)
        clearTimeout(this.powerUpTimer)
        this.powerUpActive = false
      }, seconds * 1000)
    }

    if (this.powerUpPosition === [0, 0]) {
      dropPowerUp()
    } else {
      this.powerUp.clearRect(
        0,
        0,
        this.gameWidth * this.scaleFactor,
        this.gameHeight * this.scaleFactor
      )
      this.powerUpPosition = [0, 0]
      this.powerUpActive = false
      clearInterval(this.colorSwitch)
      clearTimeout(this.powerUpTimer)
      dropPowerUp()
    }
  }

  resetGame() {
    this.level = 0
    this.fps = this.startFPS
    this.dead = false
    this.newLevel = true
    this.snakePosition = [0, 0]
    this.snakeBody = []
    this.snakeLength = 7
    this.down = true
    this.snakeColor = '#f2f2f2'
    this.moveHistory = []

    this.snake.clearRect(
      0,
      0,
      this.gameWidth * this.scaleFactor,
      this.gameHeight * this.scaleFactor
    )
    this.pip.clearRect(
      0,
      0,
      this.gameWidth * this.scaleFactor,
      this.gameHeight * this.scaleFactor
    )
    this.powerUp.clearRect(
      0,
      0,
      this.gameWidth * this.scaleFactor,
      this.gameHeight * this.scaleFactor
    )
    clearInterval(this.colorSwitch)
    this.toggleDirection('down')

    document.getElementById('highScore').innerText = `${this.HIGH_SCORE}`
  }

  buildLevel() {
    this.level++
    this.pip.fillStyle = this.pipColor
    this.pipPosition = this.randomPixel()

    while (this.isSnakeBody(this.pipPosition)) {
      this.pipPosition = this.randomPixel()
    }

    this.pip.fillRect(
      this.pipPosition[0],
      this.pipPosition[1],
      this.scaleFactor,
      this.scaleFactor
    )
    this.newLevel = false

    this.snakeLength += 2
    this.fps += 0.5

    if (this.level > 10) {
      //Speed Reduction
      if (this.fps >= 25) {
        if (
          this.isMultiple(
            this.level,
            Math.floor(Math.random() * Math.floor(10))
          )
        ) {
          this.doPowerUp(0.3, 'speed', this.randomColor(), 5)
        }
      }

      //Length Reduction
      if (this.snakeLength > 40) {
        if (
          this.isMultiple(
            this.level,
            Math.floor(Math.random() * Math.floor(20))
          )
        ) {
          this.doPowerUp(0.2, 'length', this.randomColor(), 8)
        }
      }

      //Change Color
      if (
        this.isMultiple(this.level, Math.floor(Math.random() * Math.floor(20)))
      ) {
        const c = this.randomColor()
        this.doPowerUp(c, 'color', c, 10)
      }
    }
  }

  handleCollisions() {
    //Detect Pip Collision
    if (
      this.pipPosition[0] === this.snakePosition[0] &&
      this.pipPosition[1] === this.snakePosition[1]
    ) {
      if (this.sounds) {
        // this.ding.play()
      }
      this.newLevel = true
      this.pip.clearRect(
        this.pipPosition[0],
        this.pipPosition[1],
        this.scaleFactor,
        this.scaleFactor
      )
    }

    //Detect PowerUp Collision
    if (this.powerUpActive) {
      if (
        this.powerUpPosition[0] === this.snakePosition[0] &&
        this.powerUpPosition[1] === this.snakePosition[1]
      ) {
        this.powerUpActive = false

        if (this.powerUp.type !== 'color' && this.sounds) {
          // this.beep.play()
        }

        this.powerUp.clearRect(
          0,
          0,
          this.gameWidth * this.scaleFactor,
          this.gameHeight * this.scaleFactor
        )

        if (this.powerUp.type === 'color') {
          this.snakeColor = this.powerUp.value
        }

        if (this.powerUp.type === 'speed') {
          const reduction = Math.round(this.fps * this.powerUp.value)
          if (this.fps - reduction > this.startFPS) {
            this.fps = this.fps - reduction
          } else {
            this.fps = this.startFPS
          }
        }

        if (this.powerUp.type === 'length') {
          const partsToRemove = Math.round(
            this.snakeLength * this.powerUp.value
          )

          for (let i = 0; i < partsToRemove; i++) {
            this.snake.clearRect(
              this.snakeBody[this.snakeLength - 1][0],
              this.snakeBody[this.snakeLength - 1][1],
              this.scaleFactor,
              this.scaleFactor
            )
            this.snakeBody.pop()
            this.snakeLength--
          }
        }

        //Clear
        clearInterval(this.powerUpTimer)
        clearTimeout(this.colorSwitch)
        this.powerUpPosition = [0, 0]
      }
    }

    //Detect Bounds Collision
    if (
      this.snakePosition[0] < 0 ||
      this.snakePosition[0] === this.gameWidth * this.scaleFactor ||
      (this.snakePosition[1] < 0 ||
        this.snakePosition[1] === this.gameHeight * this.scaleFactor)
    ) {
      this.stop()
    }

    //Detect Self Collision
    const hitSelf = () => {
      return this.snakeBody
        .map((part, index) => {
          if (index > 0) {
            return (
              part[0] === this.snakePosition[0] &&
              part[1] === this.snakePosition[1]
            )
          }
        })
        .filter(res => res === true)
    }

    if (hitSelf().length > 0) {
      this.stop()
    }
  }

  gameLoop() {
    if (!this.dead) {
      if (this.newLevel) {
        this.buildLevel()
      }

      this.snake.fillStyle = this.snakeColor

      //Update Snake Coords [TIP]
      this.snakePosition[0] += this.move()[0] * this.scaleFactor
      this.snakePosition[1] += this.move()[1] * this.scaleFactor

      if (this.snakeBody.length < this.snakeLength) {
        this.snakeBody.unshift([...this.snakePosition])
      } else {
        const filtered = this.snakeBody.filter((item, index) => {
          return index !== this.snakeLength - 1
        })
        filtered.unshift([...this.snakePosition])
        this.snakeBody = [...filtered]
      }

      this.snake.fillRect(
        this.snakePosition[0],
        this.snakePosition[1],
        this.scaleFactor,
        this.scaleFactor
      )

      //Collisions
      this.handleCollisions()
    }

    //Loop
    setTimeout(() => {
      if (this.snakeBody.length === this.snakeLength) {
        this.snake.clearRect(
          this.snakeBody[this.snakeLength - 1][0],
          this.snakeBody[this.snakeLength - 1][1],
          this.scaleFactor,
          this.scaleFactor
        )
      }

      //Output
      document.getElementById('frames').innerText = `${Math.floor(this.fps)}`
      document.getElementById('length').innerText = this.snakeLength
      document.getElementById('level').innerText = `${this.level}`

      this.gameLoop()
    }, 1000 / this.fps)
  }
}
