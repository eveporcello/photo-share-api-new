const { ApolloServer, gql } = require('apollo-server')
const { v4 } = require('uuid')
const photos = require('./data/photos.json')
const users = require('./data/users.json')
const user = {
  id: 'd',
  name: 'John Smith'
}

const typeDefs = gql`
  type User {
    id: ID!
    name: String
    postedPhotos: [Photo!]!
  }

  type Photo {
    id: ID!
    name: String
    url: String
    description: String
    category: PhotoCategory
    postedBy: User!
  }

  enum PhotoCategory {
    PORTRAIT
    ACTION
    LANDSCAPE
    SELFIE
    GRAPHIC
  }

  input PostPhotoInput {
    name: String!
    description: String
    category: PhotoCategory = PORTRAIT
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
    Photo(id: ID!): Photo
    totalUsers: Int!
    allUsers: [User!]!
    User(id: ID!): User
  }

  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos,
    Photo: (root, args) => photos.find(({ id }) => id === args.id),
    totalUsers: () => users.length,
    allUsers: () => users,
    User: (root, args) => users.find(user => user.id === args.id)
  },
  Mutation: {
    postPhoto: (root, args) => {
      if (!user) {
        throw new Error('only an authorized user can post a photo')
      }

      const newPhoto = {
        id: v4(),
        ...args.input,
        userID: user.id
      }

      photos.push(newPhoto)

      return newPhoto
    }
  },
  Photo: {
    url: root => `/img/photos/${root.id}.jpg`,
    postedBy: root => users.find(user => root.userID === user.id)
  },
  User: {
    postedPhotos: ({ id }) => photos.filter(p => p.userID === id)
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ port }) => {
  console.log(`GraphQL Server running on localhost:${port}`)
})
