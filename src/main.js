'use strict'

import Snake from './snake'
import ai from './ai'
import '../style.scss'

window.addEventListener('DOMContentLoaded', () => {
  let useAI = false
  const game = Snake()
  let controller

  game.init({
    sounds: false,
    startFPS: 10,
    scaleFactor: 15,
    gameHeight: 30,
    gameWidth: 60,
  })

  controller = ai(game)

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

  document
    .getElementById('aiBtn')
    .addEventListener('click', () => toggleAI(controller))

  if (useAI) {
    switchOnAi(controller)
  }
})
