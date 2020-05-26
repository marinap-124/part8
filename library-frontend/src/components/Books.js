import React, {useState} from 'react'
import { ALL_BOOKS, ALL_GENRES, ALL_AUTHORS } from '../queries'
import { useQuery } from '@apollo/client'
import { useSubscription, useApolloClient } from '@apollo/client'
import { BOOK_ADDED } from '../queries'

const Books = ({show}) => {

  const [genre, setGenre] = useState('')

  const result = useQuery(ALL_BOOKS, {
    variables: {genre}
  })

  const client = useApolloClient()
 
  const updateCacheWith = (addedBook) => {
    
    const includedIn = (set, object) => 
      set.map(p => p.id).includes(object.id)  

    const dataInStore = client.readQuery({ query: ALL_BOOKS,  variables: {genre} })

    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        variables: {genre},
        data: { allBooks : dataInStore.allBooks.concat(addedBook) }
      })

      const genresInStore = client.readQuery({ query: ALL_GENRES })
      client.writeQuery({
        query: ALL_GENRES,
        data: { allGenres : genresInStore.allGenres
          .concat(addedBook.genres.filter((item) => genresInStore.allGenres.indexOf(item) < 0)) }
      })

      const updatedAuthors = (allAuthors, addedBook) => {
        let authorsUpdates = []

        const authorExists = allAuthors.find((author) => {
          return author.id === addedBook.author.id
        })

        if(allAuthors  && allAuthors.length){
          allAuthors.forEach((author, index) => {
            if(authorExists)
            {
              if(author.id === addedBook.author.id){
                authorsUpdates[index] =  {...allAuthors[index], bookCount: allAuthors[index].bookCount + 1}
              }
              else{
                authorsUpdates[index] = author
              }
            }
            else{
              const newAuthor = {...addedBook.author, bookCount: 1}
              authorsUpdates = allAuthors.concat(newAuthor)
            }
          })
        }
        else{
          const newAuthor = {...addedBook.author, bookCount: 1}
          authorsUpdates = authorsUpdates.concat(newAuthor)          
        }         
        return authorsUpdates
      }

      const authorsInStore = client.readQuery({ query: ALL_AUTHORS })
      client.writeQuery({
        query: ALL_AUTHORS,
        data: { allAuthors : updatedAuthors(authorsInStore.allAuthors, addedBook)
        }
      })
     }
     
     setTimeout(() => {
      window.alert(`${addedBook.title} added`)
    }, 500);
 
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      updateCacheWith(addedBook)  
    }
  })

  const genresResult = useQuery(ALL_GENRES)

  let genres = []
  if(genresResult && genresResult.data)
      genres = genresResult.data.allGenres

  if (!show) {
    return null
  }
  
  if ( result.loading ) {
    return <div>loading books ...</div>
  }

  let books = []
  if(result && result.data)
      books = result.data.allBooks

  const getGenreBooks = async (event) => {
    event.preventDefault()
    setGenre(event.target.value)
  }

  return (
    <div>
      <h2>books</h2>

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

      <div>
        {genres.map(genre => <button value={genre}  key={genre} onClick={getGenreBooks} type='button'>{genre}</button>)}
        <button value=''  key='all' onClick={getGenreBooks} type='button'>all genres</button>
      </div>

    </div>
  )
}

export default Books