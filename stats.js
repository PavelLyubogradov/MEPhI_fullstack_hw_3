const PASSING_PERCENTAGE = 67

function isArray(value) {
  return Array.isArray(value)
}

// Объект, но не null и не массив.
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !isArray(value)
}

function isNonEmptyArray(value) {
  return isArray(value) && value.length > 0
}

function isValidAttempt(attempt, questionCount) {
  return (
    isPlainObject(attempt) &&
    typeof attempt.name === 'string' &&
    attempt.name.trim() !== '' &&
    isArray(attempt.answers) &&
    attempt.answers.length === questionCount
  )
}

export function validateQuizData(data) {
  if (!isPlainObject(data)) {
    return false
  }

  if (typeof data.quizTitle !== 'string' || data.quizTitle === '') {
    return false
  }

  if (!isNonEmptyArray(data.correctAnswers) || !isNonEmptyArray(data.attempts)) {
    return false
  }

  const questionCount = data.correctAnswers.length

  return data.attempts.every((attempt) => isValidAttempt(attempt, questionCount))
}

export function calculateAttempt(attempt, correctAnswers) {
  let score = 0

  correctAnswers.forEach((correctAnswer, index) => {
    if (attempt.answers[index] === correctAnswer) {
      score += 1
    }
  })

  // Сначала умножаем, потом делим: так точные половины (например, 14.5)
  // не превращаются в 14.499999… из-за двоичной арифметики.
  const percentage = Math.round((score * 100) / correctAnswers.length)

  return {
    name: attempt.name.trim(),
    score,
    percentage,
    passed: percentage >= PASSING_PERCENTAGE,
  }
}

export function calculateReport(data) {
  const attempts = data.attempts.map((attempt) => calculateAttempt(attempt, data.correctAnswers))

  let percentageSum = 0
  let passedCount = 0
  let best = attempts[0]

  attempts.forEach((attempt) => {
    percentageSum += attempt.percentage

    if (attempt.passed) {
      passedCount += 1
    }

    // Строгое «больше»: при равном score остаётся первый участник.
    if (attempt.score > best.score) {
      best = attempt
    }
  })

  return {
    quizTitle: data.quizTitle.trim(),
    questionCount: data.correctAnswers.length,
    participantCount: attempts.length,
    averagePercentage: Math.round(percentageSum / attempts.length),
    passedCount,
    threshold: PASSING_PERCENTAGE,
    best,
    attempts,
  }
}
