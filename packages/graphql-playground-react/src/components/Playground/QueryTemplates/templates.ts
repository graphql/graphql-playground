import { allPropsMarker, formatQuery, IQueryTemplate } from './templateUtils'

export const queryTemplates: IQueryTemplate[] = [
  {
    title: 'All videos',
    description: 'Get all videos',
    query: `query {
      videos { ${allPropsMarker}  }
    }`
  }, {
    title: 'One Video',
    description: 'Get all videos',
    query: `query {
      videos(where: { id_eq: 1 }) {
        id
      }
    }`
  }
].map(formatQuery)
