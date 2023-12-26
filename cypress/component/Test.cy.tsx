import React from 'react'
import { TestComponent } from './TestComponent'

describe('Test.cy.tsx', () => {
  it('playground', () => {
    cy.mount(<TestComponent title="TitleText" text="BodyText" />)
    cy.contains('h1', 'TitleText').should('be.visible')
    cy.contains('p', 'BodyText').should('be.visible')
  })
})
