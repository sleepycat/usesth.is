import turf from 'turf'
import {
  organizationByName,
  locationByID,
  locationsWithinBounds,
  addOrganization
} from './data/database'

import UrlType from './data/types/urlType'
import YearType from './data/types/yearType'
import Location from './data/types/location'
import Organization from './data/types/organization'

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull
} from 'graphql';

var query = new GraphQLObjectType({
  name: 'Root',
  fields: {
    location: {
      type: Location,
      args: {
        id: {
          description: 'id of the location',
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: (source, args, ast) => {
        return locationByID(args.id)
      },
    },
    organization: {
      type: Organization,
      args: {
        name: {
          description: 'the name of the organization',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: async (source, args, ast) => {
         return organizationByName(args.name)
      }
    },
    locations_within_bounds: {
      type: new GraphQLList(Location),
      args: {
        sw_lat: {
          type: GraphQLFloat,
          description: 'The latitude of the southwest corner of the bounding box.',
        },
        sw_lng: {
          type: GraphQLFloat,
          description: 'The longitude of the southwest corner of the bounding box.',
        },
        ne_lat: {
          type: GraphQLFloat,
          description: 'The latitude of the northeast corner of the bounding box.',
        },
        ne_lng: {
          type: GraphQLFloat,
          description: 'The longitude of the northeast corner of the bounding box.',
        },
      },
      resolve: (source, args, ast) => {

	// Check the incoming request bounds
        // If they are to big return an error.
	var bbox = [args.sw_lng, args.sw_lat, args.ne_lng, args.ne_lat];
	var poly = turf.bboxPolygon(bbox);
	var area = turf.area(poly);
	if(area > 12427311001.261375) throw new Error(`The requested area is too large.`)

        return locationsWithinBounds(args.sw_lat, args.sw_lng, args.ne_lat, args.ne_lng)
      }
    }
  }
})

var technologyInput = new GraphQLInputObjectType({
  name: 'technology',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    category: { type: GraphQLString }
  }
});

var locationInput = new GraphQLInputObjectType({
  name: 'location',
  fields: {
    lat: { type: new GraphQLNonNull(GraphQLFloat) },
    lng: { type: new GraphQLNonNull(GraphQLFloat) },
    address: { type: new GraphQLNonNull(GraphQLString) }
  }
});

const mutation = new GraphQLObjectType({
  name: "AddOrganization",
  description: "Add an organization",
  fields: () => ({
    createOrganization: {
      type: Organization,
      args: {
	name: { type: new GraphQLNonNull(GraphQLString) },
	founding_year: { type: YearType },
	url: { type: new GraphQLNonNull(UrlType) },
	locations: { type: new GraphQLList(locationInput) },
	technologies: { type: new GraphQLList(technologyInput) }
      },
      resolve: async (source, args) => {
        if(args.technologies.length === 0){
	  throw new Error('You must supply at least 1 technology.');
        }
        if(args.locations.length === 0){
	  throw new Error('You must supply at least 1 location.');
        }

        return  await addOrganization(args)
      }
    }
  })
});

module.exports.schema = new GraphQLSchema({ query, mutation});
