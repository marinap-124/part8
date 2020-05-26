import { gql  } from '@apollo/client'

const BOOK_DETAILS = gql`
fragment BookDetails on Book {
  title
  author{
    name
    born
    id
  }
  published
  id
  genres
}
`

export const ALL_AUTHORS = gql`
  query {
    allAuthors  {
      name
      born
      bookCount
      id
    }
  }
`

export const ALL_BOOKS = gql`
  query ($genre: String){
    allBooks(genre: $genre)  {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $published: Int!, $author: String!,  $genres: [String!]!) {
    addBook(
      title: $title,
      published: $published,
      author: $author,
      genres: $genres
    ) {
      title
      published
      author{
        name
        born
      }      
      genres
    }
  }
`



export const UPDATE_YEAR = gql`
  mutation updateYear($name: String!, $year: Int!) {
    editAuthor(
      name: $name,
      setBornTo: $year
    ) {
      name
      born
      bookCount      
      id
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const ALL_GENRES = gql`
  query {
    allGenres 
  }
`

export const ME = gql`
  query {
    me  {
      username,
      favoriteGenre,
      id
    }
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  
${BOOK_DETAILS}
`

