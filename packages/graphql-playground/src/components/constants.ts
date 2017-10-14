export const serviceInformationQuery = `query ($id: ID!) {
  viewer {
    project(id: $id) {
      id
      name
      models {
        edges {
          node {
            id
            name
            create: permissionQueryArguments(operation: CREATE) {
              name
              typeName
              group
            }
            read: permissionQueryArguments(operation: READ) {
              name
              typeName
              group
            }
            update: permissionQueryArguments(operation: UPDATE) {
              name
              typeName
              group
            }
            delete: permissionQueryArguments(operation: DELETE) {
              name
              typeName
              group
            }
          }
        }
      }
      relations {
        edges {
          node {
            id
            name
            permissionQueryArguments {
              name
              typeName
              group
            }
					}
        }
      }
    }
  }
}`
