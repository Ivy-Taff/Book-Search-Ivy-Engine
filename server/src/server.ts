require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { json } = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// Import your models (adjust paths based on your project structure)
const { User, Book } = require('./models');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/booksearch', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define GraphQL type definitions
const typeDefs = `
  type Book {
    _id: ID!
    title: String!
    authors: [String]
    description: String
    image: String
    link: String
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    savedBooks: [Book]
  }

  type Query {
    getBooks: [Book]
    getUser(id: ID!): User
  }

  type Mutation {
    addBook(title: String!, authors: [String], description: String, image: String, link: String): Book
    removeBook(id: ID!): Book
  }
`;

// Define GraphQL resolvers
const resolvers = {
  Query: {
    getBooks: async () => await Book.find(),
    getUser: async (_, { id }) => await User.findById(id),
  },
  Mutation: {
    addBook: async (_, args) => {
      const book = new Book(args);
      await book.save();
      return book;
    },
    removeBook: async (_, { id }) => {
      return await Book.findByIdAndDelete(id);
    },
  },
};

// Initialize Express
const app = express();

// Initialize Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

async function startServer() {
  await server.start();
  
  app.use(cors());
  app.use(json());
  app.use('/graphql', expressMiddleware(server));

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
  });
}

startServer();
