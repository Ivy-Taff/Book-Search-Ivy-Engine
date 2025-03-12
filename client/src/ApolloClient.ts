import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:3001/graphql', // Replace with your GraphQL server URI
  cache: new InMemoryCache(),
});

export default client;