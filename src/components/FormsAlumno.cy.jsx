import React from 'react'
import FormsAlumno from './FormsAlumno'

describe('<FormsAlumno />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<FormsAlumno />)
  })
})