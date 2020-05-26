import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Notify from './components/Notify'
import Recommend from './components/Recommend'
import { useApolloClient } from '@apollo/client'

const App = () => {
  const [token, setToken] = useState(null)
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)
  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    if(page === 'add' || page === 'recommend')
      setPage('books')
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  return (
    <div>
      <div>
        
        <Notify errorMessage={errorMessage} />

        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>

        {token &&
          <span>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommend')}>recommend</button>
            <button onClick={logout} >logout</button>
          </span>
        }

        {!token &&
          <button onClick={() => setPage('login')}>login</button>
        }

        
      </div>

      <Authors
        show={page === 'authors'} token={token}
      />

      <Books
        show={page === 'books'} 
      />

      <NewBook
        show={page === 'add'} setPage={setPage}
      />

      <Recommend
        show={page === 'recommend'}
      />

      <LoginForm
        show={page === 'login'}  setToken={setToken} setError={notify} setPage={setPage}
      />

    </div>
  )
}

export default App