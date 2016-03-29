import {
  technologiesForOrganization,
} from '../database'

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull
} from 'graphql';

import Technology from './technology'

// {"founding_year":2004,"type":"organization","name":"Shopify","url":"http://www.shopify.com"}
var Organization = new GraphQLObjectType({
  name: 'Organization',
  description: 'An organization of some kind: a company, NGO, etc.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The unique identifier of the organization.',
      resolve: (organization) => { return organization._key }
    },
    founding_year: {
      type: GraphQLInt,
      description: 'The year the organization was founded',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the organization.',
    },
    url: {
      type: GraphQLString,
      description: 'The URL of the organization.',
    },
    technologies: {
      type: new GraphQLList(Technology),
      description: 'An array of the technologies at use by this organization.',
      resolve: (source, args, ast) => {
        // Technologies may have been added in a single query in the
        // resolve function under location.organizations.
        if(typeof source.technologies === 'undefined'){
        return technologiesForOrganization(source._id)
        } else {
          return source.technologies
        }
      }
    }
  }),
});

export default Organization
