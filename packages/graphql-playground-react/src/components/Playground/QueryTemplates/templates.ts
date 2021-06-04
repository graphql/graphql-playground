import {
  allPropsMarker,
  descriptionMarker,
  formatQuery,
  genericTemplates,
  IQueryTemplate,
} from './templateUtils'

export const queryTemplates: IQueryTemplate[] = [
  {
    title: 'All videos',
    description: 'Get all existing videos.',
    query: genericTemplates.getAll('videos'),
  }, {
    title: 'One video',
    description: ''
      + "Get one specific video. \n"
      + "Change `id_eq` value to select a video by id or set a different lookup parameter.",
    query: genericTemplates.getOne('videos'),
  }, {
    title: 'Featured videos',
    description: 'Get all featured videos.',
    query: `query {
      ${descriptionMarker}
      videos(where: { isFeatured_eq: true }) { ${allPropsMarker} }
    }`,
  },
].map(formatQuery)
