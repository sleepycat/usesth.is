require("babel-polyfill");

import expect from 'expect'
import {
  graphql,
  GraphQLSchema,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';

import YearType from '../../data/types/yearType'

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      year: {
        type: YearType,
	resolve: () => 1993
      }
    })
  }),
  mutation: new GraphQLObjectType({
    name: 'mutation',
    fields: () => ({
      add_year: {
	type: YearType,
	args: {
	  year: { type: new GraphQLInputObjectType({
            name: 'YearInput',
            fields: { year: { type: new GraphQLNonNull(YearType) } }
          })}
        },
	resolve: (source, args) => {
	  return args.year
	},
      }
    })
  })
});


describe('The YearType', () => {

  it('can be used in a schema', async () => {

    let query = `
      query fooQuery {
        year
      }
    `;

    let result = await graphql(schema, query);
    expect(result.data.year).toEqual(1993);
  })

  it('can be used as an input type', async () => {

    let query = `
      mutation foo {
        add_year(
	  year: {year: 1993}
	)
      }
    `;

    let result = await graphql(schema, query);
    //Year gets stringifed on the way out.
    expect(result.data.add_year.year).toEqual("1993");
  })

  it('rejects non-numeric values', async () => {

    let query = `
      mutation foo {
        add_year(
	  year: {year: "1993"}
	)
      }
    `;

    let result = await graphql(schema, query);
    //Year gets stringifed on the way out.
    expect(result.errors).toExist();
    expect(result.errors[0].message).toInclude('Can only be an integer.');
  })

  it('rejects non-integer values', async () => {

    let query = `
      mutation foo {
        add_year(
	  year: {year: 1993.01}
	)
      }
    `;

    let result = await graphql(schema, query);
    //Year gets stringifed on the way out.
    expect(result.errors).toExist();
    expect(result.errors[0].message).toInclude('Can only be an integer.');
  })

  it('rejects years beyond the current year', async () => {

    let query = `
      mutation foo {
        add_year(
	  year: {year: 2100}
	)
      }
    `;

    let result = await graphql(schema, query);
    //Year gets stringifed on the way out.
    expect(result.errors).toExist('A year in the future was accepted when it should not have been.');
    expect(result.errors[0].message).toInclude('between 1600 and the current year');
  })

  it('rejects years earlier than 1600', async () => {

    let query = `
      mutation foo {
        add_year(
	  year: {year: 1559}
	)
      }
    `;

    let result = await graphql(schema, query);
    //Year gets stringifed on the way out.
    expect(result.errors).toExist('A year in the distant past was accepted when it should not have been.');
    expect(result.errors[0].message).toInclude('between 1600 and the current year');
  })

})
