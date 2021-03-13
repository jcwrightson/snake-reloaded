'use strict'

import Snake from './snake'
import { ai } from './ai'
import '../style.scss'

const calcWidth = () => {
  const w = Math.floor(window.innerWidth / 20 - window.innerWidth * 0.01)
  return w
}

const calcHeight = () => {
  const h = Math.floor(window.innerHeight / 25 - window.innerHeight * 0.01)
  return h
}

window.addEventListener('DOMContentLoaded', () => {
  let useAI = false
  const game = Snake()
  let controller

  game.init({
    sounds: false,
    startFPS: 10,
    scaleFactor: 15,
    gameHeight: calcHeight(),
    gameWidth: calcWidth() > 60 ? 60 : calcWidth(),
    writeData: true,
  })

  controller = ai(game)

  let gamePixWidth = document.getElementById('snake').clientWidth
  document.querySelector('main.game').style.width = gamePixWidth + 'px'

  const switchOnAi = (controller) => {
    document.getElementById('aiBtn').innerText = 'AI On'
    document.getElementById('aiBtn').classList.add('js-active')
    for (const elem of document.getElementsByClassName('ai-elem')) {
      elem.classList.add('js-active')
    }

    controller.setEnabled(true)
  }

  const switchOffAi = (controller) => {
    document.getElementById('aiBtn').innerText = 'AI Off'
    document.getElementById('aiBtn').classList.remove('js-active')
    for (const elem of document.getElementsByClassName('ai-elem')) {
      elem.classList.remove('js-active')
    }
    controller.setEnabled(false)
  }

  const toggleAI = (controller) => {
    useAI = !useAI

    if (useAI) {
      switchOnAi(controller)
    } else {
      switchOffAi(controller)
    }
  }

  let turbo = 0
  const toggleTurbo = () => {
    document.querySelector('.turbo').classList.add('js-active')
    turbo++
    document.querySelector('.turbo').innerText = `Turbo X ${turbo}`
    game.turbo(20)
  }

  const handleReset = () => {
    turbo = 0
    document.querySelector('.turbo').classList.remove('js-active')
    document.querySelector('.turbo').innerText = `Turbo`
    game.resetGame()
  }

  document
    .getElementById('aiBtn')
    .addEventListener('click', () => toggleAI(controller))
  document.getElementById('reset').addEventListener('click', handleReset)
  document.getElementById('turbo').addEventListener('click', toggleTurbo)
  if (useAI) {
    switchOnAi(controller)
  }
})
