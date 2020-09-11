import { squareMoveSequences } from './constants'

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

    return foundSquareSequence
  } else {
    return false
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

  const nextPosition = (move) => {
    return [
      game.getState().snakePosition[0] +
        moveVector(move)[0] * game.getState().scaleFactor,
      game.getState().snakePosition[1] +
        moveVector(move)[1] * game.getState().scaleFactor,
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

  const findValidMoves = () => {
    let valid = []
    moves.map((direction) => {
      if (
        isValidMove(nextPosition(direction), direction)
        // !isSquareMove(
        //   [nextPosition(direction), direction],
        //   game.getState().moveHistory,
        //   game.getState().snakeBody,
        //   squareMoveSequences
        // )
      ) {
        valid.push([nextPosition(direction), direction])
      }
    })
    return valid
  }

  const findFirstValidMove = () => {
    moves.map((dir) => {
      if (isValidMove(nextPosition(dir), dir)) {
        return game.toggleDirection(dir)
      }
    })
  }

  const findBestMove = (possible) => {
    const targetPos = game.getState().pipPosition
    const snakePos = game.getState().snakePosition
    const d2T = calcD(targetPos, snakePos)

    let best = null
    let hash = {}

    document.getElementById('distance').innerText = d2T

    possible.map((next, idx) => {
      hash[idx] = d2T - calcD(next[0], targetPos)
    })


    Object.keys(hash).map((k) => {
      if (hash[k] === 1) {
        best = possible[k]
      }
    })
    if (best === null) {
      Object.keys(hash).map((k) => {
        if (hash[k] === 0) {
          best = possible[k]
        }
      })
    }

    if (best === null) {
      Object.keys(hash).map((k) => {
        if (hash[k] === -1) {
          best = possible[k]
        }
      })
    }

    return best
  }
  const hunt = (moveHistory) => {
    let validMoves = findValidMoves()
    let currentDrirection = game.getCurrentDirection()

    // Avoid Bounds
    if (!isValidMove(nextPosition(currentDrirection), currentDrirection)) {
      // Corner
      if (validMoves.length === 1) {
        return game.toggleDirection(validMoves[0][1])
      }

      // Side
      if (validMoves.length === 2) {
        const secondLastMove = moveHistory[1]
        if (validMoves[0][1] === secondLastMove.direction) {
          document.getElementById('move').innerText = validMoves[0][1]
          return game.toggleDirection(validMoves[0][1])
        } else {
          document.getElementById('move').innerText = validMoves[1][1]
          return game.toggleDirection(validMoves[1][1])
        }
      }
    }

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

      hunt(game.getState().moveHistory)
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
