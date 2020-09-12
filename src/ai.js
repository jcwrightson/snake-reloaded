import { squareMoveSequences } from './constants'

export const getMoveHIstoryFromSnakeBody = (history, snake) => {
  let hashSnake = {}

  snake.map((part, idx) => {
    hashSnake[part] = idx
  })

  return [...history.filter((m) => hashSnake.hasOwnProperty(m.position))]
}

export const isSquareMove = (nextMove, history, snake, squareMoves) => {
  if (history.length > 2) {
    let mH = []
    let sB = snake

    // Append last 3 moves from history
    // [[0,1], "left"]
    for (let i = 0; i < 3; i++) {
      const elem = history[i]
      mH.push([elem.position, elem.direction])
    }

    let hashSB = {}

    sB.map((part, idx) => {
      hashSB[part] = idx
    })

    // Filter out moves that have expired i.e snake body is no longer there
    mH = mH.filter((m) => hashSB.hasOwnProperty(m[0]))

    let foundSquareSequence = false

    if (mH.length === 3) {
      let hashSquares = {}
      squareMoves.map((m, i) => {
        hashSquares[m] = i
      })

      let directions = [nextMove[1]]
      mH.map((m) => directions.push(m[1]))

      if (hashSquares.hasOwnProperty(directions)) {
        foundSquareSequence = true
      } else {
        foundSquareSequence = false
      }
    }

    return mH.length
  } else {
    return 0
  }
}

const movesToCheck = (dir) => {
  switch (dir) {
    case 'up':
    case 'down': {
      return ['left', 'right']
    }
    case 'left':
    case 'right': {
      return ['up', 'down']
    }
  }
}

export const ai = (game) => {
  const moves = game.moves
  let enabled = false
  const moveVector = (dir) => {
    switch (dir) {
      case 'up': {
        return [0, -1]
      }
      case 'down': {
        return [0, 1]
      }
      case 'left': {
        return [-1, 0]
      }
      case 'right': {
        return [1, 0]
      }
    }
  }

  const gW =
    game.getState().gameWidth * game.getState().scaleFactor -
    game.getState().scaleFactor
  const gH =
    game.getState().gameHeight * game.getState().scaleFactor -
    game.getState().scaleFactor

  const withinBounds = (vector) => {
    return (
      vector[0] <= gW && vector[0] >= 0 && vector[1] <= gH && vector[1] >= 0
    )
  }

  const nextPosition = (direction, currentPosition) => {
    return [
      currentPosition[0] +
        moveVector(direction)[0] * game.getState().scaleFactor,
      currentPosition[1] +
        moveVector(direction)[1] * game.getState().scaleFactor,
    ]
  }

  const validDirection = (direction) => {
    switch (game.getCurrentDirection()) {
      case 'up': {
        return direction !== 'down'
      }
      case 'down': {
        return direction !== 'up'
      }
      case 'left': {
        return direction !== 'right'
      }
      case 'right': {
        return direction !== 'left'
      }
    }
  }

  // const closestVector = (vA, vB) => {
  //   if (vA[0] + vA[1] <= vB[0] + vB[1]) {
  //     return vA
  //   }
  //   return vB
  // }

  const isValidMove = (vector, direction) => {
    return (
      validDirection(direction) &&
      withinBounds(vector) &&
      !game.isSnakeBody(vector)
    )
  }

  const calcD = (vector1, vector2) => {
    const x2 = (vector2[0] - vector1[0]) * (vector2[0] - vector1[0])
    const y2 = (vector2[1] - vector1[1]) * (vector2[1] - vector1[1])
    return Math.round(Math.sqrt(x2 + y2) / game.getState().scaleFactor)
  }

  const findValidMoves = (currentPosition) => {
    let valid = []
    moves.map((direction) => {
      if (isValidMove(nextPosition(direction, currentPosition), direction)) {
        valid.push([nextPosition(direction, currentPosition), direction])
      }
      const l = isSquareMove(
        [nextPosition(direction, currentPosition), direction],
        game.getState().moveHistory,
        game.getState().snakeBody,
        squareMoveSequences
      )

      const probability = (l / 4) * 100
      document.getElementById('square').innerText = Math.round(probability) + "%"
    })
    return valid
  }

  const findFirstValidMove = () => {
    moves.map((dir) => {
      if (isValidMove(nextPosition(dir, game.getState().snakePosition), dir)) {
        return game.toggleDirection(dir)
      }
    })
  }

  const findBestMove = (possible) => {
    let targetPos = game.getState().pipPosition
    const snakePos = game.getState().snakePosition

    if (game.getState().powerUpActive) {
      if (
        calcD(targetPos, snakePos) <
        calcD(game.getState().powerUpPosition, snakePos)
      ) {
        targetPos = game.getState().pipPosition
      } else {
        targetPos = game.getState().powerUpPosition
      }
    }

    const d2T = calcD(targetPos, snakePos)

    let best = null
    let hash = {}

    document.getElementById('distance').innerText = d2T

    possible.map((next, idx) => {
      hash[idx] = d2T - calcD(next[0], targetPos)
    })

    Object.keys(hash).map((k) => {
      if (hash[k] === 1) {
        best = isDeadEnd(possible[k][1], snakePos) ? null : possible[k]
      }
    })
    if (!best) {
      Object.keys(hash).map((k) => {
        if (hash[k] === 0) {
          best = isDeadEnd(possible[k][1], snakePos) ? null : possible[k]
        }
      })
    }

    if (!best) {
      Object.keys(hash).map((k) => {
        if (hash[k] === -1) {
          best = isDeadEnd(possible[k][1], snakePos) ? null : possible[k]
        }
      })
    }

    // console.log(best)
    if (!best) {
      console.log('No Best Move: ', possible, hash)
    }
    return best || possible[0]
  }

  const isDeadEnd = (nextDirection, currentPosition) => {
    const searchArea = movesToCheck(nextDirection)

    const searched = [
      ...searchArea.filter(
        (s) =>
          game.isSnakeBody(
            nextPosition(s, nextPosition(nextDirection, currentPosition))
          ) ||
          !withinBounds(
            nextPosition(s, nextPosition(nextDirection, currentPosition))
          )
      ),
    ]

    // console.log(searched)
    return searched.length === 2
  }
  const hunt = (moveHistory, snakeBody) => {
    let currentDirection = game.getCurrentDirection()
    let currentPosition = game.getState().snakePosition
    let validMoves = findValidMoves(currentPosition)

    // // Avoid Bounds
    // if (
    //   !isValidMove(
    //     nextPosition(currentDirection, currentPosition),
    //     currentDirection
    //   )
    // ) {
    //   // Corner
    //   if (validMoves.length === 1) {
    //     return game.toggleDirection(validMoves[0][1])
    //   }

    //   // Side
    //   if (validMoves.length === 2) {
    //     const secondLastMove = moveHistory[1]
    //     if (validMoves[0][1] === secondLastMove.direction) {
    //       document.getElementById('move').innerText = validMoves[0][1]
    //       return game.toggleDirection(validMoves[0][1])
    //     } else {
    //       document.getElementById('move').innerText = validMoves[1][1]
    //       return game.toggleDirection(validMoves[1][1])
    //     }
    //   }
    // }
    let possibleDirections = []
    validMoves.map((m) => possibleDirections.push(m[1]))
    document.getElementById('moves').innerText = possibleDirections.join(', ')
    const bestMove = findBestMove(validMoves)

    if (bestMove) {
      game.toggleDirection(bestMove[1])
      document.getElementById('move').innerText = bestMove[1]
    }
  }

  const gameLoop = (game) => {
    if (!game.getState().dead && enabled) {
      document.getElementById(
        'snakePosition'
      ).innerText = game.getState().snakePosition

      hunt(game.getState().moveHistory, game.getState().snakeBody)
    }

    setTimeout(() => {
      gameLoop(game)
    }, 1000 / game.getState().fps)
  }

  requestAnimationFrame(() => gameLoop(game))

  return {
    setEnabled: (val) => {
      enabled = val
    },
  }
}
