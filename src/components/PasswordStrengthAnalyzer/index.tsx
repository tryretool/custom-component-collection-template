import React, { useEffect } from 'react'
import { type FC } from 'react'
import { Retool } from '@tryretool/custom-component-support'
import { calculateStrength } from './utils'

export const PasswordStrengthAnalyzer: FC = () => {
    const [password, _setPassword] = Retool.useStateString({
        name: 'password'
    })

    const [score, setScore] = Retool.useStateNumber({
        name: 'score',
        initialValue: 0,
        inspector: 'hidden'
    })

    useEffect(() => {
        const newScore = calculateStrength(password)
        if (newScore !== score) {
            setScore(newScore)
        }
    }, [password, score, setScore])

    return (
        <div>
            <h4>Password Strength Analyzer</h4>
            <p><i>
                This demo shows how to pass state back and forth between a retool app and a custom component.
                Please don't use this component in production.
            </i></p>
            <p>
                <div>Input Password: {'*'.repeat(password?.length || 0)}</div>
                <div>Strength Score: {score ?? 0}/4</div>
            </p>
        </div>
    )
}
