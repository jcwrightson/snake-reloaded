const ai = (game) => {
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

  const withinBounds = (arr) => {
    return arr[0] <= gW && arr[0] >= 0 && arr[1] <= gH && arr[1] >= 0
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

  const closestVector = (vA, vB) => {
    if (vA[0] + vA[1] <= vB[0] + vB[1]) {
      return vA
    }
    return vB
  }

  const isValidMove = (vector, direction) => {
    //ToDo: Avoid dead ends...

    return (
      validDirection(direction) &&
      withinBounds(vector) &&
      !game.isSnakeBody(vector)
    )
  }

  const calcD = (vector1, vector2) => {
    const x2 = (vector2[0] - vector1[0]) * (vector2[0] - vector1[0]) // x2-x1 squared
    const y2 = (vector2[1] - vector1[1]) * (vector2[1] - vector1[1])
    return Math.round(
      Math.floor(Math.sqrt(x2 + y2)) / game.getState().scaleFactor
    )
  }

  let squareMoves = [
    ['up', 'right', 'down', 'left'],
    ['down', 'right', 'up', 'left'],
    ['up', 'left', 'down', 'right'],
    ['down', 'left', 'up', 'right'],
    ['left', 'up', 'right', 'down'],
    ['left', 'down', 'right', 'up'],
    ['right', 'up', 'left', 'down'],
    ['right', 'down', 'left', 'up'],
  ]

  const isSquareMove = (nextMove) => {
    if (game.getState().moveHistory.length > 2) {
      let mH = []
      let sB = game.getState().snakeBody

      // Append last 3 moves from history
      for (let i = 0; i < 3; i++) {
        const elem = game.getState().moveHistory[i]
        mH.push([elem.position, elem.direction])
      }

      let hashSquares = {}
      squareMoves.map((m, i) => {
        hashSquares[squareMoves[i]] = i
      })

      let directions = [nextMove[1]]
      mH.map((m) => directions.push(m[1]))

      let foundSquareSequence = false

      if (hashSquares.hasOwnProperty(directions)) {
        foundSquareSequence = true
      }

      if (foundSquareSequence) {
        let hashSB = {}
        for (var i = 0; i < sB.length; i += 1) {
          hashSB[sB[i]] = i
        }

        mH = mH.filter((m) => hashSB.hasOwnProperty(m[0]))

        // Add prosed move
        // mH.unshift(nextMove)

        console.log(mH.length)
      }

      return mH.length === 3 && foundSquareSequence
    } else {
      return false
    }
  }

  const findValidMoves = () => {
    let valid = []
    moves.map((direction) => {
      if (
        isValidMove(nextPosition(direction), direction) &&
        !isSquareMove([nextPosition(direction), direction])
      ) {
        valid.push([nextPosition(direction), direction])
      }
    })
    return valid
  }

  const findBestMove = (possible, d2T, target) => {
    let best = null
    let hash = {}
    // console.log(possible)
    possible.map((next, idx) => {
      hash[idx] = d2T - calcD(next[0], target)
    })
    // console.log(hash)

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
  const hunt = () => {
    const targetPos = game.getState().pipPosition
    const snakePos = game.getState().snakePosition

    const d2T = calcD(targetPos, snakePos)

    document.getElementById('distance').innerText = d2T

    let validMoves = findValidMoves()

    if (validMoves.length > 0) {
      // console.log(validMoves)
      const bestMove = findBestMove(validMoves, d2T, targetPos)

      let dir
      if (bestMove) {
        dir = bestMove[1]
        game.toggleDirection(dir)
      } else {
        // dir = validMoves[0][1]
      }

      

      document.getElementById('move').innerText = dir
    }
  }

  const gameLoop = (game) => {
    if (!game.getState().dead && enabled) {
      document.getElementById(
        'snakePosition'
      ).innerText = game.getState().snakePosition

      hunt()
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

export default ai
