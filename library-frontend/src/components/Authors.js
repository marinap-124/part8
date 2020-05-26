  
import React from 'react'
import { ALL_AUTHORS } from '../queries'
import { useQuery } from '@apollo/client'
import Birthday from './Birthday'

const Authors = (props) => {


  const result = useQuery(ALL_AUTHORS, {
    //pollInterval: 200000
  })

  if (!props.show) {
    return null
  }

  if ( result.loading ) {
    return <div>loading authors...</div>
  }

  let authors = []
  if(result && result.data)
      authors = result.data.allAuthors

      //console.log('token', props.token)

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th>name</th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map(a =>
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div>
        {props.token &&
          <Birthday authors={authors}/>
        }
        

      </div>

    </div>
  )
}

export default Authors
