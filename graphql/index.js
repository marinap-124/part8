
const { ApolloServer, UserInputError, gql, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const { PubSub } = require('apollo-server')
const pubsub = new PubSub()

mongoose.set('useFindAndModify', false)

const MONGODB_URI = 'mongodb+srv://fullstack:ufo68000@cluster0-8cyl7.mongodb.net/graphql?retryWrites=true'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })


const typeDefs = gql`

  type User {
    username: String!
    favoriteGenre: String
    id: ID!
  }

  type Token {
    value: String!
  }

  type Author {
    name: String!
    id: ID
    born: String
    bookCount: Int
  }
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }
  type Query {
    authorCount: Int!
    bookCount: Int!
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author!]!
    me: User
    allGenres: [String]
  }

  type Subscription {
    bookAdded: Book!
  } 

  type Mutation {
    addBook(
      title: String!
      published: Int
      author: String!
      genres: [String!]!
    ): Book

    editAuthor(
      name: String!
      setBornTo: Int
    ): Author

    createUser(
      username: String!
      favoriteGenre: String
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }

`


const jwt = require('jsonwebtoken')

const JWT_SECRET = 'secret'


const resolvers = {
  Query: {
    authorCount: () => Author.collection.countDocuments(),
    bookCount: () => Book.collection.countDocuments(),
    allAuthors: (root, args) => {return Author.find({}).populate('books')},
    allBooks: async (root,args) => {

      if(args.genre)
        return await Book.find({genres:args.genre}).populate('author', { name: 1, born: 1, id: 1 })

      return await Book.find({}).populate('author', { name: 1, born: 1, id: 1 })
    
    },
    me: (root, args, context) => {
      return context.currentUser
    },

    allGenres: (root, args) => { return Book.distinct('genres')},
  },

  Author: {
    bookCount: async (author) => {

      let count = 0
      if(author.books)
        count = author.books.length

      return count
    }
  },



  Mutation: {
    addBook: async  (root, args, context) => {
      console.log("starting adding book1", args)

      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      let author = await Author.findOne({name: args.author})

      if (!author) {
        const a = {
          name: args.author
        }
        const authorToDb = new Author({ ...a })

        try {
          author = await authorToDb.save()

        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }

      }

      const bookToDb = new Book({ ...args, author: author } )

      let saved 
      try {
        saved = await bookToDb.save()
        author.books = author.books.concat(saved)
        await  author.save()

      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: bookToDb })
      return  bookToDb
    },


    editAuthor: async  (root, args, context) => {

      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      const author = await Author.findOne({name: args.name})

      if (!author) {
        return null
      }
  
      author.born = args.setBornTo

      try {
        await  author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return author
    },

    createUser: (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
  
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    },
  },
}



const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id)//.populate('friends')
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})

