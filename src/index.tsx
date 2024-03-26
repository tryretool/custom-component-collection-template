import React from 'react'
import { type FC } from 'react'

import { Retool } from '@tryretool/custom-component-support'

export const HelloWorld: FC = () => {
  const [name, _setName] = Retool.useStateString({
    name: 'name'
  })

  return (
    <div>
      <div>Hello {name}!</div>
    </div>
  )
}
