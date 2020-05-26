import React from 'react'
import { ALL_BOOKS,  ME } from '../queries'
import { useQuery } from '@apollo/client'

const Recommend = ({show}) => {

  const meResult = useQuery(ME, {skip: !show})

  let genre = ''
  if(! ((meResult.data === undefined ) || meResult.data.me === null)){     
    genre = meResult.data.me.favoriteGenre
  }

  const  result = useQuery(ALL_BOOKS, {
    skip: !{genre} || !show ,
    pollInterval: 200000,
    variables: {genre}
  })
      

  if (!show) {
    return null
  }
  
  if ( result.loading ) {
    return <div>loading books ...</div>
  }


  let books = (result.data === undefined)?[]:result.data.allBooks

  return (
    <div>
      <h2>recommendations</h2>
      <span>books in your favourite genre {genre}</span>
      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map(b =>
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          )}
        </tbody>
      </table>


    </div>
  )
}

export default Recommend