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

  let validMoves = []

  const withinBounds = (arr) => {
    return arr[0] <= gW && arr[0] >= 0 && arr[1] <= gH && arr[1] >= 0
  }

  const nextVector = (move) => {
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
    return Math.abs(vector1[0] + vector1[1]) - (vector2[0] + vector2[1])
    // return [
    //     Math.abs(vector1[0] - vector2[0]),
    //     Math.abs(vector1[1] - vector2[1])
    // ]
  }

  const calcD2T = (snakePosition) => {
    if (game.getState().powerUpActive) {
      return closestVector(
        [
          Math.abs(snakePosition[0] - game.getState().pipPosition[0]),
          Math.abs(snakePosition[1] - game.getState().pipPosition[1]),
        ],
        [
          Math.abs(snakePosition[0] - game.getState().powerUpPosition[0]),
          Math.abs(snakePosition[1] - game.getState().powerUpPosition[1]),
        ]
      )
    } else {
      return [
        Math.abs(snakePosition[0] - game.getState().pipPosition[0]),
        Math.abs(snakePosition[1] - game.getState().pipPosition[1]),
      ]
    }
  }

  const isSquareMove = (moveDirection) => {
    let mH = [...game.getState().moveHistory]
    let mVs = [...moves]
    let totalDistance = 0

    mH.unshift([[0, 0], moveDirection])

    const ism = () => {
      mH.map((mV) => {
        mVs = mVs.filter((m) => m !== mV[1])
      })

      totalDistance = mH.reduce((total, mH) => {
        return calcD(total, mH[0])
      }, 0)

      totalDistance = calcD(mH[mH.length - 1][0], mH[0][0])

      //   console.log(
      //     Math.abs(totalDistance[0] - totalDistance[1]),
      //     game.getState().snakeLength
      //   )
      return (
        mVs.length === 0 &&
        game.getState().snakeLength >
          Math.abs(totalDistance[0] - totalDistance[1])
      )
    }

    if (mH.length === moves.length) {
      return ism()
    } else {
      if (mH.length > moves.length) {
        mH.pop()
        return ism()
      } else return false
    }
  }

  const handleMove = () => {
    if (validMoves.length > 0) {
      validMoves.map((move) => {
        if (move[1] !== game.getCurrentDirection()) {
          if (!isSquareMove(move[1])) {
            document.getElementById('move').innerText = move[1]
            // recordMove(move)
            game.toggleDirection(move[1])
            // console.log(game.moveHistory.length)
          }
        }
      })
    }
  }

  const FindValidMove = () => {
    moves.map((direction) => {
      if (isValidMove(nextVector(direction), direction)) {
        validMoves.push([nextVector(direction), direction])
      }
    })
  }
  const hunt = () => {
    validMoves = []
    const d2T = calcD2T(game.getState().snakePosition)
    document.getElementById('distance').innerText = d2T

    moves.map((direction) => {
      const nV = nextVector(direction)

      if (isValidMove(nV, direction)) {
        if (calcD2T(nV)[0] < d2T[0] || calcD2T(nV)[1] < d2T[1]) {
          validMoves.push([nV, direction])
        }
      }
    })

    handleMove()
  }

  const gameLoop = (game) => {
    if (!game.getState().dead && enabled) {
      document.getElementById(
        'snakePosition'
      ).innerText = game.getState().snakePosition

      let currentMove = [
        game.getState().snakePosition[0] +
          moveVector(game.getCurrentDirection())[0] *
            game.getState().scaleFactor, // Width
        game.getState().snakePosition[1] +
          moveVector(game.getCurrentDirection())[1] *
            game.getState().scaleFactor, // Height
      ]

      if (!isValidMove(currentMove, game.getCurrentDirection())) {
        FindValidMove()
        handleMove()
      } else {
        hunt()
      }
    }

    // const recordMove = (moveArr) => {
    //     if(moveHistory.length < moveHistorySize){
    //         moveHistory.unshift(moveArr)
    //     }else{
    //         moveHistory.unshift(moveArr)
    //         moveHistory.pop()
    //     }
    // }

    // if (validMoves.length > 0) {
    //
    //     if(validMoves[0][1] !== game.getCurrentDirection()) {
    //         document.getElementById('move').innerText = validMoves[0][1]
    //
    //         const defaultMove = () => {
    //             recordMove([validMoves[0][0], validMoves[0][1]])
    //             game.toggleDirection(validMoves[0][1])
    //         }
    //
    //         if(validMoves.length > 1){
    //             if(!isSquareMove(validMoves[0][1])){
    //                 defaultMove()
    //             }else {
    //                 recordMove([validMoves[1][0], validMoves[1][1]])
    //                 game.toggleDirection(validMoves[1][1])
    //             }
    //         }else{
    //            defaultMove()
    //         }
    //
    //     }
    //
    // }

    // hunt()
    setTimeout(() => {
      gameLoop(game)
    }, 1000 / game.fps)
  }

  requestAnimationFrame(() => gameLoop(game))

  return {
    setEnabled: (val) => {
      enabled = val
    },
  }
}

export default ai
