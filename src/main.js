"use strict";

import Snake from './snake'
import styles from '../style.scss'

let useAI = false

const toggleAI = () => {
	useAI = !useAI

	if(useAI){
		document.getElementById('aiBtn').innerText = "AI On"
		document.getElementById('aiBtn').classList.add('js-active')
	}else{
		document.getElementById('aiBtn').innerText = "AI Off"
		document.getElementById('aiBtn').classList.remove('js-active')
	}
}

window.addEventListener("DOMContentLoaded", ()=>{
	const game = new Snake()

	game.init({
		sounds: false,
		startFPS: 12
	})

	const gW = (game.gameWidth * game.scaleFactor) - game.scaleFactor
	const gH = (game.gameHeight * game.scaleFactor) - game.scaleFactor

	const moves = game.moves
	// const moveHistory = game.moveHistory
	// const moveHistorySize = moves.length

	const moveVector = (dir) => {

		switch (dir) {
			case 'up' : {
				return [0, -1]
			}
			case 'down' : {
				return [0, 1]
			}
			case 'left' : {
				return [-1, 0]
			}
			case 'right' : {
				return [1, 0]
			}
		}
	}


	const AI = () => {

		if(!game.dead && useAI) {

			document.getElementById('snakePosition').innerText = game.snakePosition
			// document.getElementById('pipPosition').innerText = game.pipPosition


			const withinBounds = (arr) =>{
				return (arr[0] <= gW && arr[0] >= 0) && (arr[1] <= gH && arr[1] >= 0)
			}

			const nextVector = (move) => {
				return [
					game.snakePosition[0] + (moveVector(move)[0] * game.scaleFactor),
					game.snakePosition[1] + (moveVector(move)[1] * game.scaleFactor)
				]

			}

			const validDirection = (direction) => {

				switch (game.getCurrentDirection()) {
					case 'up' : {
						return direction !== 'down'
					}
					case 'down' : {
						return direction !== 'up'
					}
					case 'left' : {
						return direction !== 'right'
					}
					case 'right' : {
						return direction !== 'left'
					}

				}
			}

			const closestVector = (vA, vB) => {
				if(vA[0] + vA[1] <= vB[0] + vB[1]){
					return vA
				}
				return vB
			}

			const isValidMove = (vector, direction) =>{

				//ToDo: Avoid dead ends...

				return (validDirection(direction) && withinBounds(vector) && !game.isSnakeBody(vector))
			}

			const calcD = (vector1, vector2) => {
				return Math.abs(vector1[0] + vector1[1])-(vector2[0] + vector2[1])
				// return [
				//     Math.abs(vector1[0] - vector2[0]),
				//     Math.abs(vector1[1] - vector2[1])
				// ]
			}

			const calcD2T = (snakePosition) => {
				if(game.powerUpActive){

					return closestVector([
						Math.abs(snakePosition[0] - game.pipPosition[0]),
						Math.abs(snakePosition[1] - game.pipPosition[1])
					], [
						Math.abs(snakePosition[0] - game.powerUpPosition[0]),
						Math.abs(snakePosition[1] - game.powerUpPosition[1])
					])

				}else {
					return [
						Math.abs(snakePosition[0] - game.pipPosition[0]),
						Math.abs(snakePosition[1] - game.pipPosition[1])
					]
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

			let currentMove = [
				game.snakePosition[0] + (moveVector(game.getCurrentDirection())[0] * game.scaleFactor), // Width
				game.snakePosition[1] + (moveVector(game.getCurrentDirection())[1] * game.scaleFactor)  // Height
			]

			let validMoves = []

			const isSquareMove = (moveDirection) => {

				let mH = [...game.moveHistory]
				let mVs = [...moves]
				let totalDistance = 0

				mH.unshift([[0,0], moveDirection])

				const ism = () =>{

					mH.map(mV =>{
						mVs = mVs.filter(m => m !== mV[1])
					})

					totalDistance = mH.reduce((total, mH, index) => {
						return calcD(total, mH[0])
					}, 0)

					totalDistance = calcD(mH[mH.length - 1][0], mH[0][0])

					console.log(Math.abs(totalDistance[0] - totalDistance [1]), game.snakeLength)
					return mVs.length === 0 && game.snakeLength > Math.abs(totalDistance[0] - totalDistance [1])
				}


				if(mH.length === moves.length){
					return ism()
				}else {
					if(mH.length > moves.length){
						mH.pop()
						return ism()
					}
					else return false
				}
			}

			const handleMove = () => {

				if (validMoves.length > 0){
					validMoves.map(move => {

						if(move[1] !== game.getCurrentDirection()) {
							// console.log(move[1], game.getCurrentDirection())
							if (!isSquareMove(move[1])) {
								// console.log(move)
								document.getElementById('move').innerText = move[1]
								// recordMove(move)
								game.toggleDirection(move[1])
								// console.log(game.moveHistory.length)
							}
						}
					})
				}


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
			}


			const hunt = () => {

				validMoves = []
				const d2T = calcD2T(game.snakePosition)
				document.getElementById('distance').innerText = d2T


				moves.map(direction => {
					const nV = nextVector(direction)

					if(isValidMove(nV, direction)){

						if(calcD2T(nV)[0] < d2T[0] || calcD2T(nV)[1] < d2T[1]){
							validMoves.push([nV, direction])

						}
					}
				})

				handleMove()

			}

			const FindValidMove = () => {

				moves.map(direction => {

					if(isValidMove(nextVector(direction), direction)){
						validMoves.push([nextVector(direction), direction])

					}

				})
			}


			if(!isValidMove(currentMove, game.getCurrentDirection())){

				FindValidMove()
				handleMove()

			}else{
				hunt()

			}

			// hunt()

		}



		setTimeout(()=>{
			AI()
		}, 1000 / game.fps)

	}

	requestAnimationFrame(AI)
})
