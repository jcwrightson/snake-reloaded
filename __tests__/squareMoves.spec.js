import { isSquareMove } from '../src/ai'
import { squareMoveSequences } from '../src/constants'

describe('AI: [isSquareMove]', () => {
  const moveHistory = [
    { direction: 'up', position: [5, 2] },
    { direction: 'left', position: [5, 5] },
    { direction: 'down', position: [1, 5] },
  ]

  const snakeBody = [
    [1, 2],
    [5, 2],
    [5, 5],
    [1, 5],
  ]

  it('is a square move', () => {
    expect(
      isSquareMove(
        [[1, 2], 'right'],
        moveHistory,
        snakeBody,
        squareMoveSequences
      )
    ).toBe(true)
  })
  it('is not a square move', () => {
    expect(
      isSquareMove(
        [[1, 2], 'left'],
        moveHistory,
        snakeBody,
        squareMoveSequences
      )
    ).toBe(false)
    expect(
      isSquareMove([[1, 2], 'up'], moveHistory, snakeBody, squareMoveSequences)
    ).toBe(false)
  })
})
